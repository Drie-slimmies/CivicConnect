import { unassignRequest } from "@/lib/requests/service";
import { handleRequestAction } from "@/lib/requests/actionRoute";

export async function POST(request: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;

  return handleRequestAction(request, trackingId, async (body, user) => {
    await unassignRequest(trackingId, user, body.version as number);
  });
}
