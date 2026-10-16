import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set - see .env.example");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
const results = [];

try {
  await client.query("BEGIN");
  const {
    rows: [category],
  } = await client.query("SELECT id FROM categories LIMIT 1");
  const {
    rows: [user],
  } = await client.query("SELECT id FROM users LIMIT 1");
  if (!category || !user) throw new Error("No category or user found. Run npm run db:seed first.");

  const {
    rows: [request],
  } = await client.query(
    "INSERT INTO service_requests (tracking_id, title, description, location, category_id, requester_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    ["CC-AUDTST", "Audit check", "Audit immutability check", "None", category.id, user.id],
  );
  const {
    rows: [entry],
  } = await client.query(
    "INSERT INTO audit_logs (service_request_id, user_id, action) VALUES ($1, $2, $3) RETURNING id",
    [request.id, user.id, "submitted"],
  );

  const attempts = [
    ["UPDATE", "UPDATE audit_logs SET notes = 'changed' WHERE id = $1", [entry.id]],
    ["DELETE", "DELETE FROM audit_logs WHERE id = $1", [entry.id]],
    ["TRUNCATE", "TRUNCATE audit_logs", []],
  ];
  for (const [name, sql, params] of attempts) {
    await client.query("SAVEPOINT attempt");
    try {
      await client.query(sql, params);
      results.push({ statement: name, result: "NOT REJECTED" });
    } catch (error) {
      const rejected = /append-only/.test(error.message);
      results.push({ statement: name, result: rejected ? "rejected" : `failed for another reason: ${error.message}` });
    }
    await client.query("ROLLBACK TO SAVEPOINT attempt");
  }
} finally {
  await client.query("ROLLBACK");
  client.release();
  await pool.end();
}

console.table(results);
console.log("Everything above ran inside a transaction that was rolled back. Nothing was saved.");
process.exitCode = results.length === 3 && results.every((r) => r.result === "rejected") ? 0 : 1;
