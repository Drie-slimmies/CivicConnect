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

import { advanceRequest } from "@/lib/requests/service";
import type { RequestStatus } from "@/lib/db/schema";

const STATUSES: RequestStatus[] = ["submitted", "assigned", "in_progress", "resolved", "closed"];
const LEGAL = new Set(["assigned>in_progress", "in_progress>resolved", "resolved>closed"]);

type Outcome = "allowed" | "ILLEGAL_TRANSITION";
const pairs = STATUSES.flatMap((from): [RequestStatus, RequestStatus, Outcome][] =>
  STATUSES.map((to) => [from, to, LEGAL.has(`${from}>${to}`) ? "allowed" : "ILLEGAL_TRANSITION"]),
);

const request = (status: RequestStatus) => ({ id: 1, status, version: 1, resolutionNotes: null, assignedStaffId: 7 });

beforeEach(() => {
  fake.selects = [];
  fake.updated = [{ id: 1 }];
  fake.updates = [];
  fake.inserts = [];
});

describe("status change: every current status x next status (FR-006)", () => {
  it.each(pairs)("[Q3][B3] %s -> %s: %s", async (from, to, outcome) => {
    fake.selects = [[request(from)]];
    const result = advanceRequest("CC-7H3K9P", to, to === "resolved" ? "Fixed" : undefined, 4, 1);
    if (outcome === "allowed") {
      await result;
      expect(fake.updates[0]).toMatchObject({ status: to, version: 2 });
      expect(fake.inserts[0]).toMatchObject({ action: to, userId: 4 });
      return;
    }
    await expect(result).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
    expect(fake.updates).toEqual([]);
    expect(fake.inserts).toEqual([]);
  });
});

const notesTable: { label: string; notes: string | undefined; saved: string | null }[] = [
  { label: "omitted", notes: undefined, saved: null },
  { label: "empty", notes: "", saved: null },
  { label: "spaces only", notes: "   ", saved: null },
  { label: "tabs and new lines only", notes: "\t\n ", saved: null },
  { label: "one character", notes: "x", saved: "x" },
  { label: "text with spaces around it", notes: "  Filled the pothole  ", saved: "Filled the pothole" },
  { label: "long text (2000 characters)", notes: "a".repeat(2000), saved: "a".repeat(2000) },
];

describe("resolving a request: resolution notes (FR-006, AC-STF-03)", () => {
  it.each(notesTable)("[Q3][B4] notes $label", async ({ notes, saved }) => {
    fake.selects = [[request("in_progress")]];
    const result = advanceRequest("CC-7H3K9P", "resolved", notes, 4, 1);
    if (saved === null) {
      await expect(result).rejects.toMatchObject({ code: "ILLEGAL_TRANSITION" });
      expect(fake.updates).toEqual([]);
      expect(fake.inserts).toEqual([]);
      return;
    }
    await result;
    expect(fake.updates[0]).toMatchObject({ status: "resolved", resolutionNotes: saved });
  });
});
