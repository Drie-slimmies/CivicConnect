import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const need = (name) => {
  const v = process.env[name];
  if (!v || v.length < 8)
    throw new Error(
      `${name} must be set in .env (at least 8 characters) - see .env.example`,
    );
  return v;
};
if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is not set - see .env.example");

function hash(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}

const MAP = [
  ["Water and sanitation", "Water and Sanitation Services"],
  ["Roads and potholes", "Roads and Transport"],
  ["Electricity and streetlights", "Electricity Services"],
  ["Waste removal", "Waste Management"],
  ["Parks and public spaces", "Parks and Recreation"],
  ["Other", "General Services"],
];
const USERS = [
  [
    "Thandi Mokoena",
    "thandi.mokoena@civicconnect.test",
    "staff",
    need("SEED_STAFF_PASSWORD"),
  ],
  [
    "Sipho Dlamini",
    "sipho.dlamini@civicconnect.test",
    "manager",
    need("SEED_MANAGER_PASSWORD"),
  ],
  [
    "Demo Requester",
    "demo.requester@civicconnect.test",
    "requester",
    need("SEED_REQUESTER_PASSWORD"),
  ],
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("begin");
  for (const [, dept] of MAP)
    await client.query(
      "insert into departments (name) values ($1) on conflict (name) do nothing",
      [dept],
    );
  for (const [cat, dept] of MAP) {
    await client.query(
      "insert into categories (name, department_id) values ($1, (select id from departments where name = $2)) on conflict (name) do update set department_id = excluded.department_id",
      [cat, dept],
    );
  }
  for (const [name, email, role, password] of USERS) {
    await client.query(
      "insert into users (name, email, password_hash, role) values ($1, $2, $3, $4) on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash, role = excluded.role",
      [name, email, hash(password), role],
    );
  }
  await client.query("commit");
  console.log(
    `Seeded ${MAP.length} departments and categories and ${USERS.length} accounts.`,
  );
} catch (e) {
  await client.query("rollback");
  throw e;
} finally {
  client.release();
  await pool.end();
}
