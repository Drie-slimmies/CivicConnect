import { describe, expect, it } from "vitest";
import type { RequestDetail } from "@/lib/dto";
import { readFields, toPublic, validateRequest } from "@/lib/requests/rules";

const valid = {
  title: "Pothole outside the school",
  category: "Roads and potholes",
  location: "Protea Road",
  description: "A deep pothole at the school gate.",
};

describe("validateRequest", () => {
  it("accepts a complete request", () => {
    expect(validateRequest(valid)).toEqual({});
  });

  it("rejects a request with no category", () => {
    expect(validateRequest({ ...valid, category: "" }).category).toMatch(/Choose a category/);
  });

  it("rejects a category that is not on the list", () => {
    expect(validateRequest({ ...valid, category: "Aliens" }).category).toMatch(/Choose a category/);
  });

  it("allows a title of exactly 120 characters but not 121", () => {
    expect(validateRequest({ ...valid, title: "a".repeat(120) }).title).toBeUndefined();
    expect(validateRequest({ ...valid, title: "a".repeat(121) }).title).toMatch(/120 characters/);
  });

  it("needs a description of at least 10 characters", () => {
    expect(validateRequest({ ...valid, description: "a".repeat(9) }).description).toMatch(/at least 10/);
    expect(validateRequest({ ...valid, description: "a".repeat(10) }).description).toBeUndefined();
  });
});

describe("readFields", () => {
  it("trims text and treats anything that is not text as empty", () => {
    const body: Record<string, unknown> = { title: "  Pothole  ", category: 5, location: null };
    expect(readFields((key) => body[key])).toEqual({
      title: "Pothole",
      category: "",
      location: "",
      description: "",
    });
  });
});

describe("toPublic", () => {
  it("[Q2] never shows the title, description, location or staff name", () => {
    const detail: RequestDetail = {
      trackingId: "CC-7H3K9P",
      category: "Roads and potholes",
      status: "assigned",
      createdAt: "2026-10-13T08:00:00.000Z",
      updatedAt: "2026-10-13T09:00:00.000Z",
      history: [{ status: "submitted", at: "2026-10-13T08:00:00.000Z" }],
      title: "Pothole",
      description: "Deep pothole",
      location: "12 Protea Road",
      assignedTo: "Thandi Mokoena",
      resolutionNotes: null,
      version: 2,
    };
    expect(Object.keys(toPublic(detail)).sort()).toEqual(
      ["category", "createdAt", "history", "status", "trackingId", "updatedAt"],
    );
  });
});
