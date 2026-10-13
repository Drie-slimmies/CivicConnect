import type { Metadata } from "next";
import Link from "next/link";
import { listMyRequests } from "@/lib/mock/data";
import { RequestCard } from "@/components/requests/RequestCard";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "My requests" };

export default function MyRequestsPage() {
  const requests = listMyRequests();
  return (
    <div>
      <PageTitle
        title="My requests"
        action={
          <Link href="/requests/new" className={buttonClass()}>
            Report an issue
          </Link>
        }
      >
        Every request you have sent, with its latest status.
      </PageTitle>
      {requests.length === 0 ? (
        <EmptyState
          title="You have not reported anything yet"
          action={
            <Link href="/requests/new" className={buttonClass()}>
              Report an issue
            </Link>
          }
        >
          When you send a request it will show up here with its progress.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((r) => (
            <RequestCard key={r.trackingId} request={r} href={`/requests/${r.trackingId}`} />
          ))}
        </ul>
      )}
    </div>
  );
}
