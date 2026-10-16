import { expect, test } from "@playwright/test";
import { go, createRequestByApi, ensureSecondStaff, newRequestFields, signIn } from "./support";

test("[Q1][Q3][E2] role rules hold in the browser: manager cannot take a request, another staff member cannot unassign it, the owner can", async ({ browser }) => {
  await ensureSecondStaff();

  const requester = await signIn(browser, "requester");
  const id = await createRequestByApi(requester.context, newRequestFields("E2"));

  const manager = await signIn(browser, "manager");
  await go(manager.page, `/queue/${id}`);
  await expect(manager.page.getByRole("button", { name: "Assign to me" })).toHaveCount(0);
  await manager.page.getByLabel("Assign to").selectOption({ label: "Thandi Mokoena" });
  await manager.page.getByRole("button", { name: "Assign", exact: true }).click();
  await expect(manager.page.getByText(/Assigned to Thandi Mokoena\. This is recorded/)).toBeVisible();

  const other = await signIn(browser, "staffB");
  await go(other.page, `/queue/${id}`);
  await expect(other.page.getByText("Thandi Mokoena").first()).toBeVisible();
  await expect(other.page.getByRole("button", { name: "Unassign" })).toHaveCount(0);
  const refused = await other.context.request.post(`/api/requests/${id}/unassign`, { data: { version: 2 } });
  expect(refused.status()).toBe(403);
  await other.page.reload();
  await expect(other.page.getByText("Thandi Mokoena").first()).toBeVisible();

  const owner = await signIn(browser, "staff");
  await go(owner.page, `/queue/${id}`);
  await expect(owner.page.locator('li[aria-current="step"]')).toContainText("Assigned");
  await owner.page.getByRole("button", { name: "Unassign" }).click();
  await expect(owner.page.getByText(/Request unassigned\./)).toBeVisible();
  await expect(owner.page.getByText("Nobody yet")).toBeVisible();
  await expect(owner.page.locator('li[aria-current="step"]')).toContainText("Submitted");
  await expect(owner.page.locator("ol li").filter({ hasText: "(not reached yet)" })).toHaveCount(4);

  for (const c of [requester.context, manager.context, other.context, owner.context]) await c.close();
});
