import { assignRequest } from "@/lib/requests/service";
import { fail, handleRequestAction } from "@/lib/requests/actionRoute";

export async function POST(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;

  return handleRequestAction(request, trackingId, async (body, user) => {
    if (!Number.isInteger(body.assigneeId)) return fail("Choose who to assign this request to.", 400);
    await assignRequest(trackingId, body.assigneeId as number, user.id, body.version as number);
  });
}