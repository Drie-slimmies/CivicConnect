import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: null as { id: number; role: string } | null,
  assignRequest: vi.fn(),
  advanceRequest: vi.fn(),
  unassignRequest: vi.fn(),
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
  return { ...real, assignRequest: state.assignRequest, advanceRequest: state.advanceRequest, unassignRequest: state.unassignRequest };
});

import { POST as assign } from "@/app/api/requests/[trackingId]/assign/route";
import { POST as unassign } from "@/app/api/requests/[trackingId]/unassign/route";
import { POST as status } from "@/app/api/requests/[trackingId]/status/route";
import { RequestActionError } from "@/lib/requests/service";

const ctx = { params: Promise.resolve({ trackingId: "CC-7H3K9P" }) };
const post = (body: unknown) =>
  new Request("http://test/api/requests/CC-7H3K9P/x", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  state.user = { id: 4, role: "staff" };
  state.assignRequest.mockReset().mockResolvedValue(undefined);
  state.advanceRequest.mockReset().mockResolvedValue(undefined);
  state.unassignRequest.mockReset().mockResolvedValue(undefined);
  state.getRequestByTrackingId.mockReset().mockResolvedValue({ trackingId: "CC-7H3K9P", status: "assigned", version: 2 });
});

describe("POST /api/requests/[trackingId]/assign (FR-005)", () => {
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

  it("[Q1] returns 422 when the assignee is not staff", async () => {
    state.assignRequest.mockRejectedValue(new RequestActionError("INVALID_ASSIGNEE", "Choose a staff member"));
    expect((await assign(post({ assigneeId: 3, version: 1 }), ctx)).status).toBe(422);
  });
});

describe("POST /api/requests/[trackingId]/status (FR-006)", () => {
  it("[Q3] returns 400 for an unknown status", async () => {
    expect((await status(post({ status: "done", version: 2 }), ctx)).status).toBe(400);
    expect(state.advanceRequest).not.toHaveBeenCalled();
  });

  it("[Q3] passes the status, notes and version to the service", async () => {
    const res = await status(post({ status: "resolved", notes: "Fixed", version: 3 }), ctx);
    expect(res.status).toBe(200);
    expect(state.advanceRequest).toHaveBeenCalledWith("CC-7H3K9P", "resolved", "Fixed", 4, 3);
  });

  it("[Q3] returns 422 with the rule's message for an illegal transition", async () => {
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
describe("POST /api/requests/[trackingId]/unassign", () => {
  it("returns 400 when the version is missing", async () => {
    expect((await unassign(post({}), ctx)).status).toBe(400);
  });

  it("[Q1] unassigns as the signed-in user and returns the updated request", async () => {
    const res = await unassign(post({ version: 2 }), ctx);
    expect(res.status).toBe(200);
    expect(state.unassignRequest).toHaveBeenCalledWith("CC-7H3K9P", state.user, 2);
  });

  it("[Q1] returns 403 when staff try to unassign someone else's request", async () => {
    state.unassignRequest.mockRejectedValue(new RequestActionError("FORBIDDEN", "You can only unassign requests that are assigned to you."));
    expect((await unassign(post({ version: 2 }), ctx)).status).toBe(403);
  });
});

describe("[Q1][A1] role access on every staff route", () => {
  const actors = [
    { who: "signed out", user: null, code: 401 },
    { who: "requester", user: { id: 3, role: "requester" }, code: 403 },
    { who: "staff", user: { id: 4, role: "staff" }, code: 200 },
    { who: "manager", user: { id: 9, role: "manager" }, code: 200 },
    { who: "admin", user: { id: 10, role: "admin" }, code: 200 },
  ];
  const routes = [
    ["assign", assign, { assigneeId: 7, version: 1 }, state.assignRequest],
    ["unassign", unassign, { version: 2 }, state.unassignRequest],
    ["status", status, { status: "in_progress", version: 2 }, state.advanceRequest],
  ] as const;

  for (const [name, handler, body, service] of routes) {
    it.each(actors)(`${name} route: $who gets $code`, async ({ user, code }) => {
      state.user = user;
      const res = await handler(post(body), ctx);
      expect(res.status).toBe(code);
      expect(service).toHaveBeenCalledTimes(code === 200 ? 1 : 0);
    });
  }
});

describe("[Q5][A3] a stale version is a 409 on every action", () => {
  const routes = [
    ["assign", assign, { assigneeId: 7, version: 1 }, state.assignRequest],
    ["unassign", unassign, { version: 2 }, state.unassignRequest],
    ["status", status, { status: "in_progress", version: 2 }, state.advanceRequest],
  ] as const;

  for (const [name, handler, body, service] of routes) {
    it(`${name} route answers 409 when someone else changed the request first`, async () => {
      service.mockRejectedValue(new RequestActionError("VERSION_CONFLICT", "Reload"));
      expect((await handler(post(body), ctx)).status).toBe(409);
    });
  }
});
