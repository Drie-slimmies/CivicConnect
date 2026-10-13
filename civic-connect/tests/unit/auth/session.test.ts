import { SignJWT } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET);

afterEach(() => vi.unstubAllEnvs());

describe("session tokens", () => {
  it("round-trips the user id and role", async () => {
    const token = await createSessionToken({ userId: 42, role: "staff" });
    expect(await verifySessionToken(token)).toEqual({
      userId: 42,
      role: "staff",
    });
  });

  it("returns null when there is no token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken({ userId: 1, role: "requester" });
    const [header, payload, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ sub: "1", role: "manager" }),
    ).toString("base64url");
    expect(
      await verifySessionToken(`${header}.${forged}.${signature}`),
    ).toBeNull();
    expect(
      await verifySessionToken(`${header}.${payload}.x${signature}`),
    ).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const other = new TextEncoder().encode(
      "another-secret-another-secret-1234567",
    );
    const token = await new SignJWT({ role: "manager" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setExpirationTime("1h")
      .sign(other);
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await new SignJWT({ role: "staff" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("1")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(key());
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects an unsigned alg:none token", async () => {
    const part = (o: object) =>
      Buffer.from(JSON.stringify(o)).toString("base64url");
    const token = `${part({ alg: "none", typ: "JWT" })}.${part({ sub: "1", role: "manager" })}.`;
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects an unknown role or non-numeric subject", async () => {
    const make = (sub: string, role: string) =>
      new SignJWT({ role })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(sub)
        .setExpirationTime("1h")
        .sign(key());
    expect(await verifySessionToken(await make("1", "superuser"))).toBeNull();
    expect(await verifySessionToken(await make("abc", "staff"))).toBeNull();
  });

  it("throws a clear error when SESSION_SECRET is missing or too short", async () => {
    vi.stubEnv("SESSION_SECRET", "too-short");
    await expect(
      createSessionToken({ userId: 1, role: "staff" }),
    ).rejects.toThrow(/SESSION_SECRET/);
    await expect(verifySessionToken("anything")).rejects.toThrow(
      /SESSION_SECRET/,
    );
  });
});
