import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_EMAIL =
  "An account with this email already exists. Try signing in instead.";

type Field = "name" | "email" | "password";
type Errors = Partial<Record<Field | "form", string>>;

function fail(errors: Errors, status: number) {
  return Response.json({ errors }, { status });
}

function validate(name: string, email: string, password: string) {
  const errors: Errors = {};
  if (!name)
    errors.name = "Enter your name so staff know who the request is from.";
  else if (name.length > 150)
    errors.name = "Shorten your name to 150 characters or fewer.";
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email))
    errors.email =
      "That does not look like an email address. Check for typing mistakes.";
  else if (email.length > 255)
    errors.email = "Shorten the email to 255 characters or fewer.";
  if (password.length < MIN_PASSWORD)
    errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  else if (password.length > 128)
    errors.password = "Use 128 characters or fewer.";
  return errors;
}

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
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
      return fail({ form: "Send the sign-up details as a JSON object." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return fail({ form: "Send the sign-up details as JSON." }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const errors = validate(name, email, password);
  if (Object.keys(errors).length) return fail(errors, 400);

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing) return fail({ email: DUPLICATE_EMAIL }, 409);

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, role: "requester" })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    await startSession({ userId: user.id, role: user.role });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return fail({ email: DUPLICATE_EMAIL }, 409);
    console.error(
      "Register failed:",
      error instanceof Error ? error.name : "unknown error",
    );
    return fail({ form: "Something went wrong. Please try again." }, 500);
  }
}
