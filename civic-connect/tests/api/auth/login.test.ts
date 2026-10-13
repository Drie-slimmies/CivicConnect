import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/auth/password";

const state = vi.hoisted(() => ({
  rows: [] as unknown[],
  setCookie: undefined as unknown,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: async () => state.rows }) }),
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

import { POST } from "@/app/api/auth/login/route";

const send = (body: unknown) =>
  POST(
    new Request("http://test/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

let passwordHash: string;
beforeAll(async () => {
  passwordHash = await hashPassword("right-password");
});

beforeEach(() => {
  state.rows = [
    {
      id: 3,
      name: "Sam",
      email: "sam@example.com",
      role: "staff",
      passwordHash,
    },
  ];
  state.setCookie = vi.fn();
});

describe("POST /api/auth/login", () => {
  it("rejects a wrong password with 401 and no session", async () => {
    const res = await send({
      email: "sam@example.com",
      password: "wrong-password",
    });
    expect(res.status).toBe(401);
    expect((await res.json()).errors.form).toBe(
      "The email or password is not correct.",
    );
    expect(state.setCookie).not.toHaveBeenCalled();
  });

  it("gives an unknown email the identical 401 as a wrong password", async () => {
    const wrong = await send({
      email: "sam@example.com",
      password: "wrong-password",
    });
    state.rows = [];
    const unknown = await send({
      email: "nobody@example.com",
      password: "wrong-password",
    });
    expect(unknown.status).toBe(401);
    expect(await unknown.json()).toEqual(await wrong.json());
  });

  it("signs in with the right password and sets the session cookie", async () => {
    const res = await send({
      email: " Sam@Example.com ",
      password: "right-password",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toEqual({
      id: 3,
      name: "Sam",
      email: "sam@example.com",
      role: "staff",
    });
    expect(JSON.stringify(body)).not.toContain("scrypt");
    expect(state.setCookie).toHaveBeenCalledWith(
      "civicconnect_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("returns 400 for missing fields", async () => {
    const res = await send({ email: "", password: "" });
    expect(res.status).toBe(400);
  });
});
