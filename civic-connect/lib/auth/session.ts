import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { ROLES, type Role } from "@/lib/dto";

export const SESSION_COOKIE = "civicconnect_session";
const SESSION_SECONDS = 60 * 60 * 8;

export type Session = { userId: number; role: Role };

export function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Set it in .env (see .env.example).",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  const key = getSecretKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    const role = payload.role;
    if (!Number.isInteger(userId) || !ROLES.includes(role as Role)) return null;
    return { userId, role: role as Role };
  } catch {
    return null;
  }
}

export async function startSession(session: Session): Promise<void> {
  const token = await createSessionToken(session);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession(): Promise<Session | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
