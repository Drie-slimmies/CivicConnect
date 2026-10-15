import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/guard";
import { listRequests } from "@/lib/db/queries/requests";
import { RoleGate } from "@/components/layout/RoleGate";
import { QueueView } from "@/components/staff/QueueView";
import { PageTitle } from "@/components/ui/PageTitle";
import { STAFF_ROLES, isStaffRole } from "@/lib/requests/staffRoles";

export const metadata: Metadata = { title: "Request queue" };

export default async function QueuePage() {

  const user = await getCurrentUser();
  const requests = user && isStaffRole(user.role) ? await listRequests() : [];

  return (
    <RoleGate allow={[...STAFF_ROLES]}>
      <PageTitle title="Request queue">Filter and sort the work, then open a request to assign it or update its status.</PageTitle>
      <QueueView requests={requests} />
    </RoleGate>
  );
}