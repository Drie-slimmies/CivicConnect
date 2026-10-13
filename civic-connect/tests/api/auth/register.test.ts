import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  existing: [] as unknown[],
  inserted: undefined as Record<string, unknown> | undefined,
  insertError: undefined as unknown,
  setCookie: undefined as unknown,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => state.existing }) }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => {
        state.inserted = values;
        return {
          returning: async () => {
            if (state.insertError) throw state.insertError;
            return [
              {
                id: 7,
                name: values.name,
                email: values.email,
                role: values.role,
              },
            ];
          },
        };
      },
    }),
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: state.setCookie,
    delete: vi.fn(),
    get: vi.fn(),
  }),
}));

import { POST } from "@/app/api/auth/register/route";

const send = (body: unknown) =>
  POST(
    new Request("http://test/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

const valid = {
  name: "Thandi",
  email: "Thandi@Example.com",
  password: "longenough1",
};

beforeEach(() => {
  state.existing = [];
  state.inserted = undefined;
  state.insertError = undefined;
  state.setCookie = vi.fn();
});

describe("POST /api/auth/register", () => {
  it("rejects a password shorter than 8 characters", async () => {
    const res = await send({ ...valid, password: "short" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.password).toMatch(/at least 8/);
    expect(state.inserted).toBeUndefined();
  });

  it("returns 409 when the email is already registered", async () => {
    state.existing = [{ id: 1 }];
    const res = await send(valid);
    expect(res.status).toBe(409);
    expect((await res.json()).errors.email).toMatch(/already exists/);
  });

  it("returns 409 when a concurrent sign-up hits the unique index", async () => {
    state.insertError = { code: "23505" };
    const res = await send(valid);
    expect(res.status).toBe(409);
  });

  it("ignores a role sent by the client and always creates a requester", async () => {
    const res = await send({ ...valid, role: "manager" });
    expect(res.status).toBe(201);
    expect(state.inserted?.role).toBe("requester");
    expect((await res.json()).user.role).toBe("requester");
  });

  it("stores a hash, lowercases the email and starts a session", async () => {
    const res = await send(valid);
    expect(res.status).toBe(201);
    expect(state.inserted?.email).toBe("thandi@example.com");
    expect(state.inserted?.passwordHash).toMatch(/^scrypt\$/);
    expect(JSON.stringify(await res.json())).not.toContain("scrypt");
    expect(state.setCookie).toHaveBeenCalledWith(
      "civicconnect_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });
});
