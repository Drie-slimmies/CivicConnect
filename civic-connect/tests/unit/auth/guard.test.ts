import { describe, expect, it, vi } from "vitest";
import { authorize, type CurrentUser } from "@/lib/auth/guard";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const user = (role: CurrentUser["role"]): CurrentUser => ({
  id: 1,
  name: "Test",
  email: "test@example.com",
  role,
});

describe("authorize", () => {
  it("[Q1] returns 401 when nobody is signed in", async () => {
    const result = authorize(null, ["staff"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      expect(await result.response.json()).toEqual({
        error: "Sign in to continue.",
      });
    }
  });

  it("[Q1] returns 403 when the role is not allowed", async () => {
    const result = authorize(user("requester"), ["staff", "manager"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      expect(await result.response.json()).toEqual({
        error: "You don't have access to this.",
      });
    }
  });

  it("[Q1] returns the user when the role is allowed", () => {
    const result = authorize(user("manager"), ["staff", "manager"]);
    expect(result).toEqual({ ok: true, user: user("manager") });
  });
});
