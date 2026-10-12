import type { Metadata } from "next";
import { TRACKING_ID_PATTERN } from "@/lib/dto";
import { formatDate } from "@/lib/format";
import { getPublicRequest } from "@/lib/mock/data";
import { StatusTimeline } from "@/components/requests/StatusTimeline";
import { TrackForm } from "@/components/requests/TrackForm";
import { Notice } from "@/components/ui/Notice";
import { PageTitle } from "@/components/ui/PageTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TicketStub } from "@/components/ui/TicketStub";

export const metadata: Metadata = { title: "Track a request" };

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const raw = (await searchParams).id;
  const id = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase() ?? "";
  const badFormat = id !== "" && !TRACKING_ID_PATTERN.test(id);
  const request = id && !badFormat ? getPublicRequest(id) : undefined;

  return (
    <div className="max-w-3xl">
      <PageTitle title="Track a request">Enter your tracking ID to see where your request is. You do not need to sign in.</PageTitle>
      <div className="rounded-card border border-line bg-surface p-6 shadow-soft">
        <TrackForm
          defaultValue={id}
          error={badFormat ? "That does not look like a tracking ID. It starts with CC- and has 6 letters or numbers after it." : undefined}
        />
      </div>

      {id && !badFormat && !request && (
        <div className="mt-8">
          <Notice kind="error" title={`We could not find ${id}.`}>
            Check the ID for typing mistakes. If it still does not work, contact the service desk.
          </Notice>
        </div>
      )}

      {request && (
        <div className="mt-8 flex flex-col gap-8">
          <TicketStub id={request.trackingId}>
            <p className="text-muted">Status</p>
            <div className="mt-1">
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-3 text-sm text-muted">Last updated {formatDate(request.updatedAt)}</p>
          </TicketStub>
          <section aria-labelledby="progress" className="rounded-card border border-line bg-surface p-6">
            <h2 id="progress" className="font-display text-xl font-semibold">
              Progress
            </h2>
            <p className="mb-6 text-muted">{request.category}</p>
            <StatusTimeline history={request.history} />
          </section>
        </div>
      )}
    </div>
  );
}
