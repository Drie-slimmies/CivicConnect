import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { buildHistory } from "@/lib/db/queries/requests";

const log = (action: string, minute: number) => ({ action, createdAt: new Date(Date.UTC(2026, 9, 16, 8, minute)) });

describe("buildHistory", () => {
  it("lists each status the request reached", () => {
    const h = buildHistory([log("submitted", 0), log("assigned", 1), log("in_progress", 2)]);
    expect(h.map((x) => x.status)).toEqual(["submitted", "assigned", "in_progress"]);
  });

  it("steps the progress back to Submitted when a request is unassigned", () => {
    const h = buildHistory([log("submitted", 0), log("assigned", 1), log("in_progress", 2), log("unassigned", 3)]);
    expect(h.map((x) => x.status)).toEqual(["submitted"]);
  });

  it("shows the new date when a request is assigned again", () => {
    const h = buildHistory([log("submitted", 0), log("assigned", 1), log("unassigned", 2), log("assigned", 3)]);
    expect(h.map((x) => x.status)).toEqual(["submitted", "assigned"]);
    expect(h[1].at).toBe(new Date(Date.UTC(2026, 9, 16, 8, 3)).toISOString());
  });

  it("ignores transfers", () => {
    expect(buildHistory([log("submitted", 0), log("assigned", 1), log("transferred", 2)]).map((x) => x.status)).toEqual([
      "submitted",
      "assigned",
    ]);
  });
});
