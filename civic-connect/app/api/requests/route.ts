import { requireRole } from "@/lib/auth/guard";
import { createRequest } from "@/lib/db/queries/requests";
import { ROLES } from "@/lib/dto";
import { readFields, validateRequest, type RequestErrors } from "@/lib/requests/rules";

function fail(errors: RequestErrors, status: number) {
  return Response.json({ errors }, { status });
}

export async function POST(request: Request) {
  const auth = await requireRole(...ROLES);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return fail({ form: "Send the request details as a JSON object." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return fail({ form: "Send the request details as JSON." }, 400);
  }

  const fields = readFields((key) => body[key]);
  const errors = validateRequest(fields);
  if (Object.keys(errors).length) return fail(errors, 400);

  try {
    const trackingId = await createRequest(auth.user.id, fields);
    return Response.json({ trackingId }, { status: 201 });
  } catch (error) {
    console.error("Create request failed:", error instanceof Error ? error.name : "unknown error");
    return fail({ form: "Something went wrong. Please try again." }, 500);
  }
}
