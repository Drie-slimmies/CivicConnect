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

const PRIVATE_VALUES = [
  "Pothole outside the school",
  "Deep pothole near the gate",
  "Protea Road 12",
  "Filled the pothole",
  "Thandi Mokoena",
];
const PRIVATE_KEYS = ["title", "description", "location", "assignedTo", "resolutionNotes", "requesterId", "version"];

describe("public lookup: what an anonymous visitor receives (FR-003, NFR-004)", () => {
  it("[Q2][A2] returns only the whitelisted fields", async () => {
    fake.selects = [[privateRow], logs];
    const result = await getPublicRequest("CC-7H3K9P");
    expect(Object.keys(result ?? {}).sort()).toEqual(["category", "createdAt", "history", "status", "trackingId", "updatedAt"]);
    for (const key of PRIVATE_KEYS) expect(result).not.toHaveProperty(key);
  });

  it("[Q2][A2] contains none of the private values anywhere in the response", async () => {
    fake.selects = [[privateRow], logs];
    const text = JSON.stringify(await getPublicRequest("CC-7H3K9P"));
    for (const value of PRIVATE_VALUES) expect(text).not.toContain(value);
  });

  it("[Q2][A2] shows the status history as status and time only", async () => {
    fake.selects = [[privateRow], logs];
    const result = await getPublicRequest("CC-7H3K9P");
    expect(result?.history).toEqual([
      { status: "submitted", at: "2026-10-13T08:00:00.000Z" },
      { status: "assigned", at: "2026-10-13T09:00:00.000Z" },
    ]);
  });
});
