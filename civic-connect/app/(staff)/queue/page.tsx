import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/guard";
import { listUnassignedRequests } from "@/lib/db/queries/requests";
import { RoleGate } from "@/components/layout/RoleGate";
import { QueueTabs } from "@/components/staff/QueueTabs";
import { QueueView } from "@/components/staff/QueueView";
import { PageTitle } from "@/components/ui/PageTitle";
import { STAFF_ROLES, isStaffRole } from "@/lib/requests/staffRoles";

export const metadata: Metadata = { title: "Unassigned requests" };

export default async function QueuePage() {

  const user = await getCurrentUser();
  const requests = user && isStaffRole(user.role) ? await listUnassignedRequests() : [];

  return (
    <RoleGate allow={[...STAFF_ROLES]}>
      <PageTitle title="Unassigned requests">New requests waiting for someone to take them. Open one to assign it.</PageTitle>
      <QueueTabs active="unassigned" showMine={user?.role === "staff"} />
      <QueueView requests={requests} showStatus={false} emptyHint="Every open request has been assigned." />
    </RoleGate>
  );
}