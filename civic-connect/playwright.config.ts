import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

if (process.env.E2E_CONFIRM_TEST_DATABASE !== "yes") {
  throw new Error(
    "The end-to-end tests create requests and one test account in the database in DATABASE_URL. Point DATABASE_URL at a test database or a Neon branch, then set E2E_CONFIRM_TEST_DATABASE=yes.",
  );
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: [["list"], ["junit", { outputFile: "e2e-results/junit.xml" }], ["html", { outputFolder: "e2e-results/report", open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
