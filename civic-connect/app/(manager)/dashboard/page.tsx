import type { Metadata } from "next";
import { STATUSES } from "@/lib/dto";
import { authorize, getCurrentUser } from "@/lib/auth/guard";
import { getDashboard } from "@/lib/db/queries/dashboard";
import { RoleGate } from "@/components/layout/RoleGate";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { StatTile } from "@/components/dashboard/StatTile";
import { PageTitle } from "@/components/ui/PageTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const allowed = authorize(await getCurrentUser(), ["manager", "admin"]).ok;
  if (!allowed) return <RoleGate allow={["manager", "admin"]}>{null}</RoleGate>;
  const { total, open, byStatus, byCategory } = await getDashboard();

  return (
    <RoleGate allow={["manager", "admin"]}>
      <PageTitle title="Dashboard">Where requests stand across all categories.</PageTitle>
      <div className="flex flex-col gap-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total requests" value={total} note="Everything received so far" />
          <StatTile label="Open" value={open} note="Submitted, assigned or in progress" />
          <StatTile label="Resolved" value={byStatus.resolved} note="Work done, waiting to be closed" />
          <StatTile label="Closed" value={byStatus.closed} note="Finalised and read-only" />
        </div>

        <section aria-labelledby="by-status">
          <h2 id="by-status" className="mb-4 font-display text-xl font-semibold">
            By status
          </h2>
          <ul className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-4">
                <StatusBadge status={s} />
                <span className="font-display font-bold">{byStatus[s]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="by-category">
          <h2 id="by-category" className="mb-4 font-display text-xl font-semibold">
            By category
          </h2>
          <CategoryBreakdown rows={byCategory} />
        </section>
      </div>
    </RoleGate>
  );
}
