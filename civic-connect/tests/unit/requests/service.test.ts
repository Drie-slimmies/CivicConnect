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
  it("moves a submitted request to Assigned and writes the audit row in the same transaction", async () => {
    fake.selects = [[row("submitted")], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    await assignRequest("CC-7H3K9P", 7, 4, 1);
    expect(fake.updates[0]).toMatchObject({ assignedStaffId: 7, status: "assigned", version: 2 });
    expect(fake.inserts).toEqual([{ serviceRequestId: 1, userId: 4, action: "assigned", notes: "Assigned to Sipho Dlamini" }]);
  });

  it("keeps an In progress request In progress when it is transferred", async () => {
    fake.selects = [[row("in_progress", 3)], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    await assignRequest("CC-7H3K9P", 7, 4, 3);
    expect(fake.updates[0]).toMatchObject({ status: "in_progress" });
    expect(fake.inserts[0]).toMatchObject({ action: "transferred" });
  });

  it("refuses a requester as the assignee and saves nothing", async () => {
    fake.selects = [[row("submitted")], [{ id: 3, name: "A Resident", role: "requester" }]];
    await expect(assignRequest("CC-7H3K9P", 3, 4, 1)).rejects.toMatchObject({ code: "INVALID_ASSIGNEE" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });

  it("refuses to assign a request to the person who already holds it", async () => {
    fake.selects = [[row("assigned", 2, 7)], [{ id: 7, name: "Sipho Dlamini", role: "staff" }]];
    await expect(assignRequest("CC-7H3K9P", 7, 4, 2)).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });

  it("refuses a stale version and saves nothing", async () => {
    fake.selects = [[row("submitted", 2)]];
    await expect(assignRequest("CC-7H3K9P", 7, 4, 1)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(fake.inserts).toEqual([]);
  });
});

describe("advanceRequest (FR-006)", () => {
  it("refuses to resolve without notes and saves nothing", async () => {
    fake.selects = [[row("in_progress")]];
    await expect(advanceRequest("CC-7H3K9P", "resolved", "  ", 4, 1)).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });

  it("saves trimmed resolution notes and the audit row", async () => {
    fake.selects = [[row("in_progress")]];
    await advanceRequest("CC-7H3K9P", "resolved", " Filled the pothole ", 4, 1);
    expect(fake.updates[0]).toMatchObject({ status: "resolved", resolutionNotes: "Filled the pothole", version: 2 });
    expect(fake.inserts[0]).toMatchObject({ action: "resolved", userId: 4 });
  });

  it("reports a conflict when another save wins between the read and the update", async () => {
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
  it("lets staff unassign their own request, returns it to Submitted and writes the audit row", async () => {
    fake.selects = [[row("assigned", 2, 7)], [{ name: "Sipho Dlamini" }]];
    await unassignRequest("CC-7H3K9P", { id: 7, role: "staff" }, 2);
    expect(fake.updates[0]).toMatchObject({ assignedStaffId: null, status: "submitted", version: 3 });
    expect(fake.inserts).toEqual([{ serviceRequestId: 1, userId: 7, action: "unassigned", notes: "Unassigned from Sipho Dlamini" }]);
  });

  it("lets a manager unassign anyone's request", async () => {
    fake.selects = [[row("in_progress", 2, 7)], [{ name: "Sipho Dlamini" }]];
    await unassignRequest("CC-7H3K9P", { id: 9, role: "manager" }, 2);
    expect(fake.updates[0]).toMatchObject({ assignedStaffId: null, status: "submitted" });
    expect(fake.inserts[0]).toMatchObject({ action: "unassigned", userId: 9 });
  });

  it("refuses staff who do not hold the request and saves nothing", async () => {
    fake.selects = [[row("assigned", 2, 7)]];
    await expect(unassignRequest("CC-7H3K9P", { id: 8, role: "staff" }, 2)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });

  it("refuses an unassigned or finished request", async () => {
    fake.selects = [[row("submitted", 1, null)]];
    await expect(unassignRequest("CC-7H3K9P", { id: 9, role: "manager" }, 1)).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    fake.selects = [[row("resolved", 4, 7)]];
    await expect(unassignRequest("CC-7H3K9P", { id: 9, role: "manager" }, 4)).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    expect(fake.inserts).toEqual([]);
  });

  it("refuses a stale version", async () => {
    fake.selects = [[row("assigned", 3, 7)]];
    await expect(unassignRequest("CC-7H3K9P", { id: 7, role: "staff" }, 2)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  });
});
