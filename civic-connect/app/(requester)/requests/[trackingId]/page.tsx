import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/guard";
import { getMyRequest } from "@/lib/db/queries/requests";
import { StatusTimeline } from "@/components/requests/StatusTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TicketStub } from "@/components/ui/TicketStub";

export const metadata: Metadata = { title: "Request details" };

export default async function RequestPage({ params }: PageProps<"/requests/[trackingId]">) {
  const { trackingId } = await params;
  const user = await getCurrentUser();
  const r = user ? await getMyRequest(user.id, trackingId) : undefined;
  if (!r) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Link href="/requests" className="w-fit font-medium text-primary underline underline-offset-2">
        Back to my requests
      </Link>
      <TicketStub id={r.trackingId}>
        <p className="text-muted">Status</p>
        <div className="mt-1">
          <StatusBadge status={r.status} />
        </div>
        <p className="mt-3 text-sm text-muted">Last updated {formatDate(r.updatedAt)}</p>
      </TicketStub>

      <section aria-labelledby="details" className="rounded-card border border-line bg-surface p-6">
        <h1 id="details" className="font-display text-2xl font-bold">
          {r.title}
        </h1>
        <p className="mt-1 text-muted">
          {r.category}, at {r.location}
        </p>
        <p className="mt-4 max-w-prose">{r.description}</p>
        {r.resolutionNotes && (
          <div className="mt-5 rounded-2xl bg-success-soft px-5 py-4">
            <p className="font-medium">What was done</p>
            <p className="text-sm text-muted">{r.resolutionNotes}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="progress" className="rounded-card border border-line bg-surface p-6">
        <h2 id="progress" className="mb-6 font-display text-xl font-semibold">
          Progress
        </h2>
        <StatusTimeline history={r.history} />
      </section>
    </div>
  );
}
