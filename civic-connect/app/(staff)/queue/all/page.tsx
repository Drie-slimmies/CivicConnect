import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/guard";
import { listAllRequests } from "@/lib/db/queries/requests";
import { RoleGate } from "@/components/layout/RoleGate";
import { QueueTabs } from "@/components/staff/QueueTabs";
import { QueueView } from "@/components/staff/QueueView";
import { PageTitle } from "@/components/ui/PageTitle";
import { STAFF_ROLES, isStaffRole } from "@/lib/requests/staffRoles";

export const metadata: Metadata = { title: "All requests" };

export default async function AllRequestsPage() {
  const user = await getCurrentUser();
  const requests = user && isStaffRole(user.role) ? await listAllRequests() : [];

  return (
    <RoleGate allow={[...STAFF_ROLES]}>
      <PageTitle title="All requests">Every request, whoever holds it. Search, filter and sort, then open one to see its full details.</PageTitle>
      <QueueTabs active="all" showMine={user?.role === "staff"} />
      <QueueView requests={requests} />
    </RoleGate>
  );
}
