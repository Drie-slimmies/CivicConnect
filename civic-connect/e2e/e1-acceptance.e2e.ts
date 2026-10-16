import { expect, test } from "@playwright/test";
import { go, ACCOUNTS, newRequestFields, signIn } from "./support";

test("[Q1][Q2][Q3][Q4][E1] a request goes from submitted to closed and every role sees the right thing", async ({ browser }) => {
  const fields = newRequestFields("E1");
  const notes = `Filled and sealed the pothole (${Date.now()})`;

  const requester = await signIn(browser, "requester");
  await go(requester.page, "/requests/new");
  await requester.page.getByLabel("Title").fill(fields.title);
  await requester.page.getByLabel("Category").selectOption(fields.category);
  await requester.page.getByLabel("Location").fill(fields.location);
  await requester.page.getByLabel("What is happening?").fill(fields.description);
  await requester.page.getByRole("button", { name: "Send request" }).click();
  await expect(requester.page.getByText("We have your request.")).toBeVisible();
  const id = (await requester.page.getByText(/^CC-[A-Z0-9]{6}$/).textContent())?.trim() ?? "";
  expect(id).toMatch(/^CC-[A-Z0-9]{6}$/);

  const visitor = await browser.newContext();
  const track = await visitor.newPage();
  await go(track, `/track?id=${id}`);
  await expect(track.locator('li[aria-current="step"]')).toContainText("Submitted");
  await expect(track.locator("body")).not.toContainText(fields.title);
  await expect(track.locator("body")).not.toContainText(fields.location);
  await expect(track.locator("body")).not.toContainText(fields.description);
  await expect(track.locator("body")).not.toContainText(ACCOUNTS.requester.name);

  const staff = await signIn(browser, "staff");
  await go(staff.page, `/queue/${id}`);
  await staff.page.getByRole("button", { name: "Assign to me" }).click();
  await expect(staff.page.getByText(/Assigned to Thandi Mokoena\. This is recorded/)).toBeVisible();
  await staff.page.getByRole("button", { name: "Mark as in progress" }).click();
  await expect(staff.page.getByText(/Status changed to In progress\./)).toBeVisible();
  await staff.page.getByRole("button", { name: "Mark as resolved" }).click();
  await expect(staff.page.getByText(/Add resolution notes before marking/)).toBeVisible();
  await staff.page.getByLabel("Resolution notes").fill(notes);
  await staff.page.getByRole("button", { name: "Mark as resolved" }).click();
  await expect(staff.page.getByText(/Status changed to Resolved\./)).toBeVisible();

  await go(requester.page, `/requests/${id}`);
  await expect(requester.page.getByText("What was done")).toBeVisible();
  await expect(requester.page.getByText(notes)).toBeVisible();
  await expect(requester.page.locator('li[aria-current="step"]')).toContainText("Resolved");

  await go(track, `/track?id=${id}`);
  await expect(track.locator('li[aria-current="step"]')).toContainText("Resolved");
  await expect(track.locator("body")).not.toContainText(notes);

  const manager = await signIn(browser, "manager");
  await go(manager.page, `/queue/${id}`);
  await manager.page.getByRole("button", { name: "Mark as closed" }).click();
  await expect(manager.page.getByText(/Status changed to Closed\./)).toBeVisible();

  await go(manager.page, "/dashboard");
  await expect(manager.page.getByText("Finalised and read-only").locator("..")).toContainText(/Closed\s*[1-9]\d*/);

  await go(manager.page, "/audit");
  const rows = manager.page.getByRole("listitem").filter({ hasText: id });
  await expect(rows).toHaveCount(5);
  await expect(rows).toContainText([
    "Status changed to Closed",
    "Status changed to Resolved",
    "Status changed to In progress",
    "Assigned",
    "Request submitted",
  ]);
  await expect(rows.nth(1)).toContainText(notes);
  await expect(rows.nth(3)).toContainText("By Thandi Mokoena");

  await go(track, `/track?id=${id}`);
  await expect(track.locator('li[aria-current="step"]')).toContainText("Closed");

  for (const c of [requester.context, staff.context, manager.context, visitor]) await c.close();
});
