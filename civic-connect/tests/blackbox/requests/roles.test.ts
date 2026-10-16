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

import { assignRequest, unassignRequest } from "@/lib/requests/service";

type Holder = "self" | "other" | "nobody";
type ActorRole = "staff" | "manager" | "admin";
type AssigneeRole = ActorRole | "requester" | "missing";

const ACTOR_IDS: Record<ActorRole, number> = { staff: 7, manager: 9, admin: 10 };
const HOLDER_IDS: Record<Holder, number | null> = { self: 7, other: 8, nobody: null };

const request = (status: string, holder: Holder) => ({
  id: 1,
  status,
  version: 1,
  resolutionNotes: null,
  assignedStaffId: HOLDER_IDS[holder],
});

beforeEach(() => {
  fake.selects = [];
  fake.updated = [{ id: 1 }];
  fake.updates = [];
  fake.inserts = [];
});

const unassignTable: [ActorRole, string, Holder, "unassigned" | "FORBIDDEN" | "ILLEGAL_TRANSITION"][] = [
  ["staff", "assigned", "self", "unassigned"],
  ["staff", "in_progress", "self", "unassigned"],
  ["staff", "assigned", "other", "FORBIDDEN"],
  ["staff", "in_progress", "other", "FORBIDDEN"],
  ["staff", "submitted", "nobody", "ILLEGAL_TRANSITION"],
  ["staff", "resolved", "self", "ILLEGAL_TRANSITION"],
  ["staff", "closed", "self", "ILLEGAL_TRANSITION"],
  ["manager", "assigned", "other", "unassigned"],
  ["manager", "in_progress", "other", "unassigned"],
  ["manager", "submitted", "nobody", "ILLEGAL_TRANSITION"],
  ["manager", "resolved", "other", "ILLEGAL_TRANSITION"],
  ["manager", "closed", "other", "ILLEGAL_TRANSITION"],
  ["admin", "assigned", "other", "unassigned"],
  ["admin", "in_progress", "other", "unassigned"],
  ["admin", "submitted", "nobody", "ILLEGAL_TRANSITION"],
  ["admin", "resolved", "other", "ILLEGAL_TRANSITION"],
  ["admin", "closed", "other", "ILLEGAL_TRANSITION"],
];

describe("unassign: actor role x holder x status (FR-005, CR-012)", () => {
  it.each(unassignTable)("[Q1][B1] %s, %s request held by %s: %s", async (role, status, holder, outcome) => {
    fake.selects = [[request(status, holder)], [{ name: "Sipho Dlamini" }]];
    const result = unassignRequest("CC-7H3K9P", { id: ACTOR_IDS[role], role }, 1);
    if (outcome === "unassigned") {
      await result;
      expect(fake.updates[0]).toMatchObject({ assignedStaffId: null, status: "submitted", version: 2 });
      expect(fake.inserts[0]).toMatchObject({ action: "unassigned", userId: ACTOR_IDS[role] });
      return;
    }
    await expect(result).rejects.toMatchObject({ code: outcome });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });
});

const assignTable: [AssigneeRole, string, Holder, "assigned" | "transferred" | "INVALID_ASSIGNEE" | "ILLEGAL_TRANSITION"][] = [
  ["staff", "submitted", "nobody", "assigned"],
  ["staff", "assigned", "other", "transferred"],
  ["staff", "in_progress", "other", "transferred"],
  ["staff", "resolved", "other", "ILLEGAL_TRANSITION"],
  ["staff", "closed", "other", "ILLEGAL_TRANSITION"],
  ["manager", "submitted", "nobody", "INVALID_ASSIGNEE"],
  ["manager", "assigned", "other", "INVALID_ASSIGNEE"],
  ["manager", "in_progress", "other", "INVALID_ASSIGNEE"],
  ["manager", "resolved", "other", "ILLEGAL_TRANSITION"],
  ["admin", "submitted", "nobody", "INVALID_ASSIGNEE"],
  ["admin", "assigned", "other", "INVALID_ASSIGNEE"],
  ["requester", "submitted", "nobody", "INVALID_ASSIGNEE"],
  ["missing", "submitted", "nobody", "INVALID_ASSIGNEE"],
];

describe("assign: assignee role x status (FR-005, CR-012: only staff can hold a request)", () => {
  it.each(assignTable)("[Q1][B2] assignee %s, %s request held by %s: %s", async (assignee, status, holder, outcome) => {
    fake.selects = [
      [request(status, holder)],
      assignee === "missing" ? [] : [{ id: 7, name: "Sipho Dlamini", role: assignee }],
    ];
    const result = assignRequest("CC-7H3K9P", 7, 4, 1);
    if (outcome === "assigned" || outcome === "transferred") {
      await result;
      expect(fake.updates[0]).toMatchObject({ assignedStaffId: 7, status: status === "submitted" ? "assigned" : status });
      expect(fake.inserts[0]).toMatchObject({ action: outcome });
      return;
    }
    await expect(result).rejects.toMatchObject({ code: outcome });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });
});
