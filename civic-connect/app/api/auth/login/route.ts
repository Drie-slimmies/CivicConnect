import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";

const BAD_CREDENTIALS = "The email or password is not correct.";
const DUMMY_HASH = `scrypt$16384$8$1$${"00".repeat(16)}$${"00".repeat(64)}`;

type Errors = Partial<Record<"email" | "password" | "form", string>>;

function fail(errors: Errors, status: number) {
  return Response.json({ errors }, { status });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return fail({ form: "Send the sign-in details as a JSON object." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return fail({ form: "Send the sign-in details as JSON." }, 400);
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const errors: Errors = {};
  if (!email) errors.email = "Enter your email address.";
  else if (email.length > 255) errors.email = BAD_CREDENTIALS;
  if (!password) errors.password = "Enter your password.";
  else if (password.length > 128) errors.password = BAD_CREDENTIALS;
  if (Object.keys(errors).length) return fail(errors, 400);

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const valid = await verifyPassword(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !valid) return fail({ form: BAD_CREDENTIALS }, 401);

    await startSession({ userId: user.id, role: user.role });
    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Login failed:",
      error instanceof Error ? error.name : "unknown error",
    );
    return fail({ form: "Something went wrong. Please try again." }, 500);
  }
}
