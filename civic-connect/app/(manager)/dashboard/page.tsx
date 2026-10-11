import type { Metadata } from "next";
import { CATEGORIES, STATUSES } from "@/lib/dto";
import { listRequests } from "@/lib/mock/data";
import { RoleGate } from "@/components/layout/RoleGate";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { StatTile } from "@/components/dashboard/StatTile";
import { PageTitle } from "@/components/ui/PageTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const all = listRequests();
  const done = (s: string) => s === "resolved" || s === "closed";
  const resolved = all.filter((r) => done(r.status)).length;
  const rows = CATEGORIES.map((category) => ({
    category,
    open: all.filter((r) => r.category === category && !done(r.status)).length,
    resolved: all.filter((r) => r.category === category && done(r.status)).length,
  })).filter((r) => r.open + r.resolved > 0);

  return (
    <RoleGate allow={["manager", "admin"]}>
      <PageTitle title="Dashboard">Where requests stand across all categories.</PageTitle>
      <div className="flex flex-col gap-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Total requests" value={all.length} note="Everything received so far" />
          <StatTile label="Open" value={all.length - resolved} note="Submitted, assigned or in progress" />
          <StatTile label="Resolved" value={resolved} note="Resolved or closed" />
        </div>

        <section aria-labelledby="by-status">
          <h2 id="by-status" className="mb-4 font-display text-xl font-semibold">
            By status
          </h2>
          <ul className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-4">
                <StatusBadge status={s} />
                <span className="font-display font-bold">{all.filter((r) => r.status === s).length}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="by-category">
          <h2 id="by-category" className="mb-4 font-display text-xl font-semibold">
            By category
          </h2>
          <CategoryBreakdown rows={rows} />
        </section>
      </div>
    </RoleGate>
  );
}
