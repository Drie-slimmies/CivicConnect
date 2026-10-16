import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { summarise } from "@/lib/db/queries/dashboard";

const rows = [
  { category: "Roads and potholes", status: "submitted" as const, count: 3 },
  { category: "Roads and potholes", status: "in_progress" as const, count: 2 },
  { category: "Roads and potholes", status: "closed" as const, count: 4 },
  { category: "Waste removal", status: "assigned" as const, count: 1 },
  { category: "Waste removal", status: "resolved" as const, count: 5 },
];

describe("manager dashboard summary", () => {
  it("adds up the total of every request", () => {
    expect(summarise(rows).total).toBe(15);
  });

  it("counts submitted, assigned and in progress as open", () => {
    expect(summarise(rows).open).toBe(6);
  });

  it("counts each status, including ones with no requests", () => {
    expect(summarise(rows).byStatus).toEqual({
      submitted: 3,
      assigned: 1,
      in_progress: 2,
      resolved: 5,
      closed: 4,
    });
  });

  it("groups by category and leaves out empty categories", () => {
    expect(summarise(rows).byCategory).toEqual([
      { category: "Roads and potholes", open: 5, resolved: 0, closed: 4 },
      { category: "Waste removal", open: 1, resolved: 5, closed: 0 },
    ]);
  });

  it("shows zeros when there are no requests yet", () => {
    const empty = summarise([]);
    expect(empty.total).toBe(0);
    expect(empty.open).toBe(0);
    expect(empty.byCategory).toEqual([]);
  });
});
