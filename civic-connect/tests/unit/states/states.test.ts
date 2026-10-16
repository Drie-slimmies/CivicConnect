import { describe, expect, it } from "vitest";
import { stateFor } from "@/lib/states";

describe("request states (FR-005, FR-006)", () => {
  it("[Q3] allows only the Submitted -> Assigned -> In progress -> Resolved -> Closed path", () => {
    expect(stateFor("assigned").validateTransition("in_progress")).toEqual({ valid: true });
    expect(stateFor("in_progress").validateTransition("resolved", "Filled the pothole")).toEqual({ valid: true });
    expect(stateFor("resolved").validateTransition("closed")).toEqual({ valid: true });
  });

  it("[Q3] does not let a submitted request skip assignment", () => {
    expect(stateFor("submitted").validateTransition("in_progress").valid).toBe(false);
    expect(stateFor("submitted").validateTransition("resolved", "notes").valid).toBe(false);
  });

  it("[Q3] rejects going backwards or skipping a step", () => {
    expect(stateFor("assigned").validateTransition("resolved", "notes").valid).toBe(false);
    expect(stateFor("in_progress").validateTransition("assigned").valid).toBe(false);
    expect(stateFor("resolved").validateTransition("in_progress").valid).toBe(false);
  });

  it.each([undefined, null, "", "   "])("[Q3] requires resolution notes to resolve (notes = %j)", (notes) => {
    const result = stateFor("in_progress").validateTransition("resolved", notes);
    expect(result).toEqual({ valid: false, error: expect.stringMatching(/Resolution notes are required/) });
  });

  it("[Q3] keeps a closed request final", () => {
    for (const next of ["submitted", "assigned", "in_progress", "resolved", "closed"] as const) {
      expect(stateFor("closed").validateTransition(next, "notes").valid).toBe(false);
    }
  });

  it("[Q3] allows assignment until the request is resolved", () => {
    expect(stateFor("submitted").canAssign).toBe(true);
    expect(stateFor("assigned").canAssign).toBe(true);
    expect(stateFor("in_progress").canAssign).toBe(true);
    expect(stateFor("resolved").canAssign).toBe(false);
    expect(stateFor("closed").canAssign).toBe(false);
  });
});