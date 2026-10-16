import { requireRole } from "@/lib/auth/guard";
import type { CurrentUser } from "@/lib/auth/guard";
import { getRequestByTrackingId } from "@/lib/db/queries/requests";
import { RequestActionError, type RequestActionCode } from "@/lib/requests/service";
import { STAFF_ROLES } from "@/lib/requests/staffRoles";

const HTTP_STATUS: Record<RequestActionCode, number> = {
  NOT_FOUND: 404,
  VERSION_CONFLICT: 409,
  ILLEGAL_TRANSITION: 422,
  INVALID_ASSIGNEE: 422,
  FORBIDDEN: 403,
};

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function handleRequestAction(
  request: Request,
  trackingId: string,
  run: (body: Record<string, unknown>, user: CurrentUser) => Promise<void | Response>,
): Promise<Response> {
  const auth = await requireRole(...STAFF_ROLES);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return fail("Send a JSON object.", 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("Send the change as JSON.", 400);
  }

  if (!Number.isInteger(body.version)) return fail("The request version is missing.", 400);

  try {
    const early = await run(body, auth.user);
    if (early) return early;
  } catch (error) {
    if (error instanceof RequestActionError) return fail(error.message, HTTP_STATUS[error.code]);
    console.error("Request action failed:", error instanceof Error ? error.name : "unknown error");
    return fail("Something went wrong. Please try again.", 500);
  }

  const updated = await getRequestByTrackingId(trackingId);
  return Response.json({ request: updated });
}

export { fail };