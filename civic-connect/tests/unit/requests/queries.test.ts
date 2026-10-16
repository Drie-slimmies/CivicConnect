import { describe, expect, it, vi } from "vitest";
import { TRACKING_ID_PATTERN } from "@/lib/dto";

vi.mock("@/lib/db", () => ({ db: {} }));

import { newTrackingId, toDetail } from "@/lib/db/queries/requests";

describe("request queries", () => {
  it("makes tracking IDs that the tracking page accepts", () => {
    for (let i = 0; i < 50; i++) expect(newTrackingId()).toMatch(TRACKING_ID_PATTERN);
  });

  it("builds the status history from audit rows and skips other actions", () => {
    const row = {
      id: 1,
      trackingId: "CC-7H3K9P",
      title: "Pothole",
      description: "Deep pothole",
      location: "Protea Road",
      categoryName: "Roads and potholes",
      assignedStaffName: "Thandi Mokoena",
      categoryId: 2,
      status: "assigned" as const,
      resolutionNotes: null,
      requesterId: 3,
      assignedStaffId: 4,
      version: 2,
      createdAt: new Date("2026-10-13T08:00:00Z"),
      updatedAt: new Date("2026-10-13T09:00:00Z"),
      category: { name: "Roads and potholes" },
      assignedStaff: { name: "Thandi Mokoena" },
      auditLogs: [
        { action: "submitted", createdAt: new Date("2026-10-13T08:00:00Z") },
        { action: "note added", createdAt: new Date("2026-10-13T08:30:00Z") },
        { action: "assigned", createdAt: new Date("2026-10-13T09:00:00Z") },
      ],
    };
    const detail = toDetail(row);
    expect(detail.history).toEqual([
      { status: "submitted", at: "2026-10-13T08:00:00.000Z" },
      { status: "assigned", at: "2026-10-13T09:00:00.000Z" },
    ]);
    expect(detail.assignedTo).toBe("Thandi Mokoena");
  });
});
