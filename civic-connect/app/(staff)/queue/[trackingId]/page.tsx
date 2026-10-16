import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guard";
import { getRequestByTrackingId } from "@/lib/db/queries/requests";
import { listAssignableStaff } from "@/lib/db/queries/staff";
import { isStaffRole, STAFF_ROLES } from "@/lib/requests/staffRoles";
import { RoleGate } from "@/components/layout/RoleGate";
import { RequestWorkspace } from "@/components/staff/RequestWorkspace";

export const metadata: Metadata = { title: "Manage request" };

export default async function QueueItemPage({ params }: PageProps<"/queue/[trackingId]">) {
  const { trackingId } = await params;
  const user = await getCurrentUser();

 
  if (!user || !isStaffRole(user.role)) {
    return <RoleGate allow={[...STAFF_ROLES]}>{null}</RoleGate>;
  }

  const [r, staff] = await Promise.all([getRequestByTrackingId(trackingId), listAssignableStaff()]);
  if (!r) notFound();

  return (
    <RoleGate allow={[...STAFF_ROLES]}>
      <div className="flex flex-col gap-6">
        <Link href="/queue" className="w-fit font-medium text-primary underline underline-offset-2">
          Back to the queue
        </Link>
        <RequestWorkspace initial={r} staff={staff} me={user.role === "staff" ? { id: user.id, name: user.name } : null} role={user.role} />
      </div>
    </RoleGate>
  );
}
