import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));

import { describeAction } from "@/lib/db/queries/audit";

describe("audit log wording", () => {
  it("describes a new request", () => {
    expect(describeAction("submitted")).toBe("Request submitted");
  });

  it("describes an assignment", () => {
    expect(describeAction("assigned")).toBe("Assigned");
  });

  it("describes status changes with their readable label", () => {
    expect(describeAction("in_progress")).toBe("Status changed to In progress");
    expect(describeAction("closed")).toBe("Status changed to Closed");
  });

  it("shows any other action as it was saved", () => {
    expect(describeAction("note added")).toBe("note added");
  });
});
