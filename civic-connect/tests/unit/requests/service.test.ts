import { beforeEach, describe, expect, it, vi } from "vitest";


const fake = vi.hoisted(() => {
  const f = {
    selects: [] as unknown[][],
    updated: [{ id: 1 }] as unknown[],
    updates: [] as unknown[],
    inserts: [] as unknown[],
    tx: {} as Record<string, unknown>,
  };
  const chain = (result: () => unknown) => {
    const c: Record<string, unknown> = {};
    for (const k of ["from", "where", "limit", "returning"]) c[k] = () => c;
    c.then = (ok: (v: unknown) => unknown, bad: (e: unknown) => unknown) => Promise.resolve(result()).then(ok, bad);
    return c;
  };
  f.tx = {
    select: () => chain(() => f.selects.shift() ?? []),
    update: () => ({ set: (values: unknown) => (f.updates.push(values), chain(() => f.updated)) }),
    insert: () => ({ values: async (values: unknown) => void f.inserts.push(values) }),
  };
  return f;
});

vi.mock("@/lib/db", () => ({ db: { transaction: (run: (tx: unknown) => unknown) => run(fake.tx) } }));

import { advanceRequest, assignRequest, unassignRequest } from "@/lib/requests/service";

const row = (status: string, version = 1, assignedStaffId: number | null = null) => ({ id: 1, status, version, resolutionNotes: null, assignedStaffId });

beforeEach(() => {
  fake.selects = [];
  fake.updated = [{ id: 1 }];
  fake.updates = [];
  fake.inserts = [];
});

describe("assignRequest (FR-005)", () => {
  it("[Q4] moves a submitted request to Assigned and writes the audit row in the same transaction", async () => {
    fake.selects = [[row("submitted")], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    await assignRequest("CC-7H3K9P", 7, 4, 1);
    expect(fake.updates[0]).toMatchObject({ assignedStaffId: 7, status: "assigned", version: 2 });
    expect(fake.inserts).toEqual([{ serviceRequestId: 1, userId: 4, action: "assigned", notes: "Assigned to Sipho Dlamini" }]);
  });

  it("[Q4] keeps an In progress request In progress when it is transferred", async () => {
    fake.selects = [[row("in_progress", 3)], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    await assignRequest("CC-7H3K9P", 7, 4, 3);
    expect(fake.updates[0]).toMatchObject({ status: "in_progress" });
    expect(fake.inserts[0]).toMatchObject({ action: "transferred" });
  });

  it("[Q1] refuses to assign a request to the person who already holds it", async () => {
    fake.selects = [[row("assigned", 2, 7)], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    await expect(assignRequest("CC-7H3K9P", 7, 4, 2)).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });

  it("[Q5] refuses a stale version and saves nothing", async () => {
    fake.selects = [[row("submitted", 2)]];
    await expect(assignRequest("CC-7H3K9P", 7, 4, 1)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(fake.inserts).toEqual([]);
  });
});

describe("advanceRequest (FR-006)", () => {
  it("[Q3] refuses to resolve without notes and saves nothing", async () => {
    fake.selects = [[row("in_progress")]];
    await expect(advanceRequest("CC-7H3K9P", "resolved", "  ", 4, 1)).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });

  it("[Q3][Q4] saves trimmed resolution notes and the audit row", async () => {
    fake.selects = [[row("in_progress")]];
    await advanceRequest("CC-7H3K9P", "resolved", " Filled the pothole ", 4, 1);
    expect(fake.updates[0]).toMatchObject({ status: "resolved", resolutionNotes: "Filled the pothole", version: 2 });
    expect(fake.inserts[0]).toMatchObject({ action: "resolved", userId: 4 });
  });

  it("[Q5] reports a conflict when another save wins between the read and the update", async () => {
    fake.selects = [[row("assigned")]];
    fake.updated = [];
    await expect(advanceRequest("CC-7H3K9P", "in_progress", undefined, 4, 1)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(fake.inserts).toEqual([]);
  });

  it("returns 404-style NOT_FOUND for an unknown tracking ID", async () => {
    await expect(advanceRequest("CC-NOPE00", "in_progress", undefined, 4, 1)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
describe("unassignRequest", () => {
  it("[Q1][Q4] lets staff unassign their own request, returns it to Submitted and writes the audit row", async () => {
    fake.selects = [[row("assigned", 2, 7)], [{ name: "Sipho Dlamini" }]];
    await unassignRequest("CC-7H3K9P", { id: 7, role: "staff" }, 2);
    expect(fake.updates[0]).toMatchObject({ assignedStaffId: null, status: "submitted", version: 3 });
    expect(fake.inserts).toEqual([{ serviceRequestId: 1, userId: 7, action: "unassigned", notes: "Unassigned from Sipho Dlamini" }]);
  });

  it("[Q1] lets a manager unassign anyone's request", async () => {
    fake.selects = [[row("in_progress", 2, 7)], [{ name: "Sipho Dlamini" }]];
    await unassignRequest("CC-7H3K9P", { id: 9, role: "manager" }, 2);
    expect(fake.updates[0]).toMatchObject({ assignedStaffId: null, status: "submitted" });
    expect(fake.inserts[0]).toMatchObject({ action: "unassigned", userId: 9 });
  });

  it("[Q5] refuses a stale version", async () => {
    fake.selects = [[row("assigned", 3, 7)]];
    await expect(unassignRequest("CC-7H3K9P", { id: 7, role: "staff" }, 2)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  });
});

describe("every successful action writes exactly one audit row (FR-008)", () => {
  const cases = [
    { name: "assign", selects: () => [[row("submitted")], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]], run: () => assignRequest("CC-7H3K9P", 7, 4, 1), action: "assigned" },
    { name: "transfer", selects: () => [[row("assigned", 1, 8)], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]], run: () => assignRequest("CC-7H3K9P", 7, 4, 1), action: "transferred" },
    { name: "unassign", selects: () => [[row("assigned", 1, 7)], [{ name: "Sipho Dlamini" }]], run: () => unassignRequest("CC-7H3K9P", { id: 4, role: "manager" }, 1), action: "unassigned" },
    { name: "start work", selects: () => [[row("assigned")]], run: () => advanceRequest("CC-7H3K9P", "in_progress", undefined, 4, 1), action: "in_progress" },
    { name: "resolve", selects: () => [[row("in_progress")]], run: () => advanceRequest("CC-7H3K9P", "resolved", "Done", 4, 1), action: "resolved" },
    { name: "close", selects: () => [[row("resolved")]], run: () => advanceRequest("CC-7H3K9P", "closed", undefined, 4, 1), action: "closed" },
  ];

  it.each(cases)("[Q4][U3] $name writes one audit row by the actor", async ({ selects, run, action }) => {
    fake.selects = selects();
    await run();
    expect(fake.inserts).toHaveLength(1);
    expect(fake.inserts[0]).toMatchObject({ serviceRequestId: 1, userId: 4, action });
  });
});

describe("a save that loses the race changes nothing (R-10)", () => {
  it("[Q5] assign reports a conflict and writes no audit row", async () => {
    fake.selects = [[row("submitted")], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    fake.updated = [];
    await expect(assignRequest("CC-7H3K9P", 7, 4, 1)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(fake.inserts).toEqual([]);
  });

  it("[Q5] unassign reports a conflict and writes no audit row", async () => {
    fake.selects = [[row("assigned", 2, 7)], [{ name: "Sipho Dlamini" }]];
    fake.updated = [];
    await expect(unassignRequest("CC-7H3K9P", { id: 7, role: "staff" }, 2)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(fake.inserts).toEqual([]);
  });
});
