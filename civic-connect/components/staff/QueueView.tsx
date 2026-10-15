"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { RequestDetail } from "@/lib/dto";
import { CATEGORIES, STATUSES, STATUS_LABEL } from "@/lib/dto";
import { formatDate } from "@/lib/format";
import { SelectField, TextField } from "@/components/ui/Fields";
import { StatusBadge } from "@/components/ui/StatusBadge";

const SORTS = {
  oldest: "Oldest first",
  newest: "Newest first",
} as const;
type Sort = keyof typeof SORTS;

const [search, setSearch] = useState("");

export function QueueView({ requests }: { requests: RequestDetail[] }) {
  const [status, setStatus] = useState("open");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("oldest");

  const shown = useMemo(() => {
  
    const term = search.trim().toLowerCase();
    const list = requests.filter(
      (r) =>
        (term === "" || [r.trackingId, r.title, r.location].some((field) => field.toLowerCase().includes(term))) &&
        (status === "all" || (status === "open" ? r.status !== "resolved" && r.status !== "closed" : r.status === status)) &&
        (category === "all" || r.category === category),
    );
    
  }, [requests, status, category, sort, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Search"
          type="search"
          placeholder="Tracking ID, title or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open requests</option>
          <option value="all">All requests</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
        <SelectField label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </SelectField>
      </div>

      <p aria-live="polite" className="text-sm text-muted">
        Showing {shown.length} of {requests.length} requests.
      </p>

      {shown.length === 0 ? (
        <EmptyState title="No requests match these filters">Try a different status or category to see more of the queue.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => (
            <li key={r.trackingId}>
              <Link
                href={`/queue/${r.trackingId}`}
                className="grid gap-3 rounded-card border border-line bg-surface p-5 shadow-soft transition-colors hover:border-primary md:grid-cols-[1fr_auto] md:items-center md:gap-6"
              >
                <div className="min-w-0">
                  <p className="text-sm text-muted">
                    {r.trackingId}, sent {formatDate(r.createdAt)}
                  </p>
                  <p className="font-display text-lg font-semibold">{r.title}</p>
                  <p className="text-sm text-muted">
                    {r.category}. {r.assignedTo ? `Assigned to ${r.assignedTo}.` : "Not assigned yet."}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
