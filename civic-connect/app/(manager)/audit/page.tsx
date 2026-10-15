import type { Metadata } from "next";
import Link from "next/link";
import { ROLE_LABEL } from "@/lib/dto";
import { formatDateTime } from "@/lib/format";
import { authorize, getCurrentUser } from "@/lib/auth/guard";
import { listAudit } from "@/lib/db/queries/audit";
import { RoleGate } from "@/components/layout/RoleGate";
import { Notice } from "@/components/ui/Notice";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage() {
  const allowed = authorize(await getCurrentUser(), ["manager", "admin"]).ok;
  if (!allowed) return <RoleGate allow={["manager", "admin"]}>{null}</RoleGate>;
  const entries = await listAudit();

  return (
    <RoleGate allow={["manager", "admin"]}>
      <PageTitle title="Audit log">Every assignment and status change, newest first.</PageTitle>
      <div className="mb-8">
        <Notice kind="info" title="Entries are read-only.">
          Nobody can edit or delete them, so the history can be trusted.
        </Notice>
      </div>
      <ol className="flex flex-col gap-3">
        {entries.map((a) => (
          <li key={a.id} className="grid gap-1 rounded-card border border-line bg-surface p-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
            <time dateTime={a.at} className="text-sm text-muted">
              {formatDateTime(a.at)}
            </time>
            <div>
              <p className="font-medium">
                {a.action} on{" "}
                <Link href={`/queue/${a.trackingId}`} className="text-primary underline underline-offset-2">
                  {a.trackingId}
                </Link>
              </p>
              <p className="text-sm text-muted">
                By {a.by} ({ROLE_LABEL[a.byRole].toLowerCase()})
              </p>
              {a.notes && <p className="mt-1 text-sm">{a.notes}</p>}
            </div>
          </li>
        ))}
      </ol>
    </RoleGate>
  );
}
