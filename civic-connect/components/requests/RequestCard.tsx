import Link from "next/link";
import type { PublicRequest } from "@/lib/dto";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function RequestCard({ request, href }: { request: PublicRequest; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-soft transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-sm text-muted">
            {request.trackingId}, sent {formatDate(request.createdAt)}
          </p>
          <p className="font-display text-lg font-semibold">{request.title}</p>
          <p className="text-sm text-muted">{request.category}</p>
        </div>
        <StatusBadge status={request.status} />
      </Link>
    </li>
  );
}
