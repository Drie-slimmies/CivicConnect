import { randomBytes, scryptSync } from "node:crypto";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export async function go(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("a, button, form, input, select, textarea")].every((el) =>
      Object.keys(el).some((k) => k.startsWith("__reactProps")),
    ),
  );
}

export const HOME = { requester: "/requests", staff: "/queue", manager: "/dashboard" } as const;

export const ACCOUNTS = {
  requester: { email: "demo.requester@civicconnect.test", password: process.env.SEED_REQUESTER_PASSWORD ?? "", name: "Demo Requester" },
  staff: { email: "thandi.mokoena@civicconnect.test", password: process.env.SEED_STAFF_PASSWORD ?? "", name: "Thandi Mokoena" },
  manager: { email: "sipho.dlamini@civicconnect.test", password: process.env.SEED_MANAGER_PASSWORD ?? "", name: "Sipho Dlamini" },
  staffB: { email: "e2e.staff.b@civicconnect.test", password: process.env.E2E_STAFF_B_PASSWORD ?? "", name: "Lerato Khumalo" },
};

export async function ensureSecondStaff() {
  const { email, password, name } = ACCOUNTS.staffB;
  if (password.length < 8) throw new Error("Set E2E_STAFF_B_PASSWORD (at least 8 characters) in .env");
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  const hash = `scrypt$16384$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(
      "insert into users (name, email, password_hash, role) values ($1, $2, $3, 'staff') on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash, role = 'staff'",
      [name, email, hash],
    );
  } finally {
    await pool.end();
  }
}

export async function signIn(browser: Browser, who: keyof typeof ACCOUNTS): Promise<{ context: BrowserContext; page: Page }> {
  const { email, password } = ACCOUNTS[who];
  if (!password) throw new Error(`No password set for ${who}. Check .env`);
  const context = await browser.newContext();
  const page = await context.newPage();
  await go(page, "/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(who === "staffB" ? HOME.staff : HOME[who], { timeout: 20_000 });
  return { context, page };
}

export function newRequestFields(label: string) {
  const stamp = Date.now();
  return {
    title: `E2E ${label} ${stamp}`,
    category: "Roads and potholes",
    location: `E2E test street ${stamp}`,
    description: `Created by the end-to-end test ${label} at ${stamp}.`,
  };
}

export async function createRequestByApi(context: BrowserContext, fields: ReturnType<typeof newRequestFields>) {
  const res = await context.request.post("/api/requests", { data: fields });
  expect(res.status()).toBe(201);
  const body = await res.json();
  return body.trackingId as string;
}
