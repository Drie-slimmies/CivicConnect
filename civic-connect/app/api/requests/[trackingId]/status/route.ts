import { STATUSES, type Status } from "@/lib/dto";
import { advanceRequest } from "@/lib/requests/service";
import { fail, handleRequestAction } from "@/lib/requests/actionRoute";

const isStatus = (value: unknown): value is Status => STATUSES.includes(value as Status);

export async function POST(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;

  return handleRequestAction(request, trackingId, async (body, user) => {
    if (!isStatus(body.status)) return fail("Choose a valid status.", 400);
    if (body.notes !== undefined && typeof body.notes !== "string") return fail("Notes must be text.", 400);
    await advanceRequest(trackingId, body.status, body.notes, user.id, body.version as number);
  });
}