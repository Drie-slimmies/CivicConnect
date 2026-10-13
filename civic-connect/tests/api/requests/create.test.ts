import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: null as { id: number; role: string } | null,
  createRequest: vi.fn(),
}));

vi.mock("@/lib/auth/guard", () => ({
  requireRole: async () =>
    state.user
      ? { ok: true, user: state.user }
      : { ok: false, response: Response.json({ error: "Sign in to continue." }, { status: 401 }) },
}));
vi.mock("@/lib/db/queries/requests", () => ({ createRequest: state.createRequest }));

import { POST } from "@/app/api/requests/route";

const send = (body: unknown) =>
  POST(new Request("http://test/api/requests", { method: "POST", body: JSON.stringify(body) }));

const valid = {
  title: "  Pothole outside the school ",
  category: "Roads and potholes",
  location: "Protea Road",
  description: "A deep pothole at the school gate.",
};

beforeEach(() => {
  state.user = { id: 3, role: "requester" };
  state.createRequest.mockReset().mockResolvedValue("CC-7H3K9P");
});

describe("POST /api/requests", () => {
  it("returns 401 when nobody is signed in and saves nothing", async () => {
    state.user = null;
    const res = await send(valid);
    expect(res.status).toBe(401);
    expect(state.createRequest).not.toHaveBeenCalled();
  });

  it("returns 400 when the category is missing and saves nothing", async () => {
    const res = await send({ ...valid, category: "" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.category).toMatch(/Choose a category/);
    expect(state.createRequest).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not JSON", async () => {
    const res = await POST(new Request("http://test/api/requests", { method: "POST", body: "not json" }));
    expect(res.status).toBe(400);
  });

  it("saves the request for the signed-in user and returns the tracking ID", async () => {
    const res = await send(valid);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ trackingId: "CC-7H3K9P" });
    expect(state.createRequest).toHaveBeenCalledWith(3, { ...valid, title: "Pothole outside the school" });
  });

  it("returns 500 with a safe message when saving fails", async () => {
    state.createRequest.mockRejectedValue(new Error("connection lost"));
    const res = await send(valid);
    expect(res.status).toBe(500);
    expect((await res.json()).errors.form).toBe("Something went wrong. Please try again.");
  });
});
