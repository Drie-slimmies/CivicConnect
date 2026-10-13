import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { Role } from "@/lib/dto";
import { readSession } from "./session";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type AuthResult =
  { ok: true; user: CurrentUser } | { ok: false; response: Response };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await readSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export function authorize(
  user: CurrentUser | null,
  roles: readonly Role[],
): AuthResult {
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: "Sign in to continue." },
        { status: 401 },
      ),
    };
  }
  if (!roles.includes(user.role)) {
    return {
      ok: false,
      response: Response.json(
        { error: "You don't have access to this." },
        { status: 403 },
      ),
    };
  }
  return { ok: true, user };
}

export async function requireRole(...roles: Role[]): Promise<AuthResult> {
  return authorize(await getCurrentUser(), roles);
}
