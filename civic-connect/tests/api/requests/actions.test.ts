import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: null as { id: number; role: string } | null,
  assignRequest: vi.fn(),
  advanceRequest: vi.fn(),
  getRequestByTrackingId: vi.fn(),
}));

vi.mock("@/lib/auth/guard", () => ({
  requireRole: async (...roles: string[]) => {
    if (!state.user) return { ok: false, response: Response.json({ error: "Sign in to continue." }, { status: 401 }) };
    if (!roles.includes(state.user.role)) {
      return { ok: false, response: Response.json({ error: "You don't have access to this." }, { status: 403 }) };
    }
    return { ok: true, user: state.user };
  },
}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/db/queries/requests", () => ({ getRequestByTrackingId: state.getRequestByTrackingId }));
vi.mock("@/lib/requests/service", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/requests/service")>();
  return { ...real, assignRequest: state.assignRequest, advanceRequest: state.advanceRequest };
});

import { POST as assign } from "@/app/api/requests/[trackingId]/assign/route";
import { POST as status } from "@/app/api/requests/[trackingId]/status/route";
import { RequestActionError } from "@/lib/requests/service";

const ctx = { params: Promise.resolve({ trackingId: "CC-7H3K9P" }) };
const post = (body: unknown) =>
  new Request("http://test/api/requests/CC-7H3K9P/x", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  state.user = { id: 4, role: "staff" };
  state.assignRequest.mockReset().mockResolvedValue(undefined);
  state.advanceRequest.mockReset().mockResolvedValue(undefined);
  state.getRequestByTrackingId.mockReset().mockResolvedValue({ trackingId: "CC-7H3K9P", status: "assigned", version: 2 });
});

describe("POST /api/requests/[trackingId]/assign (FR-005)", () => {
  it("returns 401 when signed out and 403 for a requester, and changes nothing", async () => {
    state.user = null;
    expect((await assign(post({ assigneeId: 4, version: 1 }), ctx)).status).toBe(401);
    state.user = { id: 3, role: "requester" };
    expect((await assign(post({ assigneeId: 4, version: 1 }), ctx)).status).toBe(403);
    expect(state.assignRequest).not.toHaveBeenCalled();
  });

  it("returns 400 when the assignee or version is missing", async () => {
    expect((await assign(post({ version: 1 }), ctx)).status).toBe(400);
    expect((await assign(post({ assigneeId: 4 }), ctx)).status).toBe(400);
    expect(state.assignRequest).not.toHaveBeenCalled();
  });

  it("assigns as the signed-in user and returns the updated request", async () => {
    const res = await assign(post({ assigneeId: 7, version: 1 }), ctx);
    expect(res.status).toBe(200);
    expect(state.assignRequest).toHaveBeenCalledWith("CC-7H3K9P", 7, 4, 1);
    expect((await res.json()).request.status).toBe("assigned");
  });

  it("returns 409 when someone else changed the request first", async () => {
    state.assignRequest.mockRejectedValue(new RequestActionError("VERSION_CONFLICT", "Reload"));
    expect((await assign(post({ assigneeId: 7, version: 1 }), ctx)).status).toBe(409);
  });

  it("returns 422 when the assignee is not staff", async () => {
    state.assignRequest.mockRejectedValue(new RequestActionError("INVALID_ASSIGNEE", "Choose a staff member"));
    expect((await assign(post({ assigneeId: 3, version: 1 }), ctx)).status).toBe(422);
  });
});

describe("POST /api/requests/[trackingId]/status (FR-006)", () => {
  it("returns 400 for an unknown status", async () => {
    expect((await status(post({ status: "done", version: 2 }), ctx)).status).toBe(400);
    expect(state.advanceRequest).not.toHaveBeenCalled();
  });

  it("passes the status, notes and version to the service", async () => {
    const res = await status(post({ status: "resolved", notes: "Fixed", version: 3 }), ctx);
    expect(res.status).toBe(200);
    expect(state.advanceRequest).toHaveBeenCalledWith("CC-7H3K9P", "resolved", "Fixed", 4, 3);
  });

  it("returns 422 with the rule's message for an illegal transition", async () => {
    state.advanceRequest.mockRejectedValue(new RequestActionError("ILLEGAL_TRANSITION", "Closed requests are final"));
    const res = await status(post({ status: "in_progress", version: 5 }), ctx);
    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/final/);
  });

  it("returns 500 with a safe message when saving fails unexpectedly", async () => {
    state.advanceRequest.mockRejectedValue(new Error("connection reset"));
    const res = await status(post({ status: "in_progress", version: 2 }), ctx);
    expect(res.status).toBe(500);
    expect((await res.json()).error).not.toMatch(/connection/);
  });
});