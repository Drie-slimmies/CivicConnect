import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("produces a scrypt hash in the seed-script format", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });

  it("salts every hash differently", async () => {
    const a = await hashPassword("same password");
    const b = await hashPassword("same password");
    expect(a).not.toBe(b);
  });

  it("accepts the correct password", async () => {
    const hash = await hashPassword("correct horse");
    expect(await verifyPassword("correct horse", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse");
    expect(await verifyPassword("wrong horse", hash)).toBe(false);
  });

  it("returns false for malformed stored hashes instead of throwing", async () => {
    for (const bad of [
      "",
      "plaintext",
      "scrypt$x$y$z$aa$bb",
      "bcrypt$1$2$3$aa$bb",
    ]) {
      expect(await verifyPassword("anything", bad)).toBe(false);
    }
  });
});
