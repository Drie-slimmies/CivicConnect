import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => {
  const f = { selects: [] as unknown[][], db: {} as Record<string, unknown> };
  const chain = (result: () => unknown) => {
    const c: Record<string, unknown> = {};
    for (const k of ["from", "leftJoin", "where", "orderBy"]) c[k] = () => c;
    c.then = (ok: (v: unknown) => unknown, bad: (e: unknown) => unknown) => Promise.resolve(result()).then(ok, bad);
    return c;
  };
  f.db = { select: () => chain(() => f.selects.shift() ?? []) };
  return f;
});

vi.mock("@/lib/db", () => ({ db: fake.db }));

import { TRACKING_ID_PATTERN } from "@/lib/dto";
import { getPublicRequest } from "@/lib/db/queries/requests";

const privateRow = {
  id: 1,
  trackingId: "CC-7H3K9P",
  title: "Pothole outside the school",
  description: "Deep pothole near the gate",
  location: "Protea Road 12",
  status: "assigned",
  resolutionNotes: "Filled the pothole",
  version: 2,
  createdAt: new Date("2026-10-13T08:00:00Z"),
  updatedAt: new Date("2026-10-13T09:00:00Z"),
  requesterId: 3,
  categoryName: "Roads and potholes",
  assignedStaffName: "Thandi Mokoena",
};
const logs = [
  { serviceRequestId: 1, action: "submitted", createdAt: new Date("2026-10-13T08:00:00Z") },
  { serviceRequestId: 1, action: "assigned", createdAt: new Date("2026-10-13T09:00:00Z") },
];

beforeEach(() => {
  fake.selects = [];
});

const idTable: [string, string, boolean][] = [
  ["well-formed", "CC-7H3K9P", true],
  ["wrong prefix", "XX-7H3K9P", false],
  ["too short", "CC-7H3K9", false],
  ["too long", "CC-7H3K9PX", false],
  ["symbol inside", "CC-7H3K9!", false],
  ["SQL characters", "CC-A';--B", false],
  ["empty", "", false],
];

describe("public tracking: lookup ID classes (FR-003, AC-REQ-02)", () => {
  it.each(idTable)("[Q2][B5] format check: %s (%j) accepted = %s", (_label, id, accepted) => {
    expect(TRACKING_ID_PATTERN.test(id)).toBe(accepted);
  });

  it("[Q2][B5] a well-formed ID that exists returns the public view", async () => {
    fake.selects = [[privateRow], logs];
    const result = await getPublicRequest("CC-7H3K9P");
    expect(result).toMatchObject({ trackingId: "CC-7H3K9P", status: "assigned", category: "Roads and potholes" });
  });

  it("[Q2][B5] a well-formed ID that does not exist returns nothing", async () => {
    fake.selects = [[]];
    expect(await getPublicRequest("CC-ZZZZZZ")).toBeUndefined();
  });
});
