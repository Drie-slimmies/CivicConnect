import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (process.env.PERF_CONFIRM_TEST_DATABASE !== "yes")
  throw new Error("This adds 200 test requests to the database in DATABASE_URL. Use a Neon test branch and set PERF_CONFIRM_TEST_DATABASE=yes.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set - see .env.example");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/queue/all";
const ROWS = 200;
const USERS = 20;
const SECONDS = 30;
const THINK_MS = 1000;
const WARMUP_EACH = 2;
const TARGET_P95_MS = 2000;
const STATUSES = ["submitted", "assigned", "in_progress", "resolved", "closed"];
const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const email = "thandi.mokoena@civicconnect.test";
const password = process.env.SEED_STAFF_PASSWORD;
if (!password) throw new Error("SEED_STAFF_PASSWORD is not set in .env");

const trackingId = () => "CC-" + Array.from({ length: 6 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join("");

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    const { rows: [{ count }] } = await client.query("select count(*)::int as count from service_requests where title like 'PERF test request %'");
    const { rows: [requester] } = await client.query("select id from users where email = 'demo.requester@civicconnect.test'");
    const { rows: [staff] } = await client.query("select id from users where email = $1", [email]);
    const { rows: categories } = await client.query("select id from categories order by id");
    if (!requester || !staff || !categories.length) throw new Error("Seed data is missing. Run npm run db:seed on this database first.");
    await client.query("begin");
    for (let n = count; n < ROWS; n++) {
      const status = STATUSES[n % STATUSES.length];
      const reached = STATUSES.indexOf(status);
      const done = reached >= 3 ? "Fixed during the performance test data load." : null;
      const { rows } = await client.query(
        "insert into service_requests (tracking_id, title, description, location, category_id, status, resolution_notes, requester_id, assigned_staff_id) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict (tracking_id) do nothing returning id",
        [trackingId(), `PERF test request ${n + 1}`, `Generated for the performance check, request number ${n + 1}, with a description of realistic length.`, `Test street ${n + 1}`, categories[n % categories.length].id, status, done, requester.id, reached > 0 ? staff.id : null],
      );
      if (!rows.length) { n--; continue; }
      for (let i = 0; i <= reached; i++) {
        const action = i === 0 ? "submitted" : STATUSES[i];
        await client.query("insert into audit_logs (service_request_id, user_id, action, notes) values ($1, $2, $3, $4)", [rows[0].id, i === 0 ? requester.id : staff.id, action, action === "resolved" ? done : null]);
      }
    }
    await client.query("commit");
    const { rows: [after] } = await client.query("select count(*)::int as count from service_requests");
    return { perf: ROWS, total: after.count };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function signIn() {
  const res = await fetch(BASE + "/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error(`Sign-in failed with ${res.status}. Is the app running on ${BASE}?`);
  return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

async function timed(cookie) {
  const start = performance.now();
  try {
    const res = await fetch(BASE + PATH, { headers: { cookie }, redirect: "manual" });
    const body = await res.text();
    return { ms: performance.now() - start, ok: res.status === 200 && body.includes("All requests"), bytes: body.length };
  } catch {
    return { ms: performance.now() - start, ok: false, bytes: 0 };
  }
}

const pct = (sorted, p) => sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const data = await seed();
console.log(`Database has ${data.total} requests, of which ${ROWS} are performance test requests.`);
const cookies = await Promise.all(Array.from({ length: USERS }, signIn));
const first = await timed(cookies[0]);
await Promise.all(cookies.map(async (c) => { for (let i = 0; i < WARMUP_EACH; i++) await timed(c); }));

const samples = [];
const end = performance.now() + SECONDS * 1000;
const startedAt = new Date().toISOString();
await Promise.all(cookies.map(async (c) => {
  while (performance.now() < end) {
    samples.push(await timed(c));
    await sleep(THINK_MS);
  }
}));

const ok = samples.filter((s) => s.ok);
const sorted = ok.map((s) => s.ms).sort((a, b) => a - b);
const errors = samples.length - ok.length;
const result = {
  case: "P1",
  startedAt,
  target: BASE + PATH,
  users: USERS,
  seconds: SECONDS,
  thinkMs: THINK_MS,
  requestRows: data.total,
  firstRequestMs: Math.round(first.ms),
  requests: samples.length,
  errors,
  requestsPerSecond: +(samples.length / SECONDS).toFixed(1),
  meanMs: Math.round(sorted.reduce((a, b) => a + b, 0) / (sorted.length || 1)),
  p50Ms: Math.round(pct(sorted, 0.5)),
  p95Ms: Math.round(pct(sorted, 0.95)),
  p99Ms: Math.round(pct(sorted, 0.99)),
  maxMs: Math.round(sorted[sorted.length - 1] ?? 0),
  responseKb: Math.round(ok.reduce((a, s) => a + s.bytes, 0) / (ok.length || 1) / 1024),
  targetP95Ms: TARGET_P95_MS,
};
result.verdict = errors === 0 && sorted.length > 0 && result.p95Ms < TARGET_P95_MS ? "PASS" : "FAIL";

mkdirSync("perf-results", { recursive: true });
writeFileSync(`perf-results/p1-${startedAt.replace(/[:.]/g, "-")}.json`, JSON.stringify(result, null, 2));
console.table(result);
process.exitCode = result.verdict === "PASS" ? 0 : 1;
