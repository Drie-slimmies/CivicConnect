import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/guard";
import { listRequestsAssignedTo } from "@/lib/db/queries/requests";
import { RoleGate } from "@/components/layout/RoleGate";
import { QueueTabs } from "@/components/staff/QueueTabs";
import { QueueView } from "@/components/staff/QueueView";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "My requests" };

export default async function MyRequestsPage() {
  const user = await getCurrentUser();
  const requests = user?.role === "staff" ? await listRequestsAssignedTo(user.id) : [];

  return (
    <RoleGate allow={["staff"]}>
      <PageTitle title="My requests">Requests assigned to you. Open one to update its status or transfer it.</PageTitle>
      <QueueTabs active="mine" showMine />
      <QueueView requests={requests} defaultStatus="all" emptyHint="Nothing is assigned to you yet. Take one from the unassigned list." />
    </RoleGate>
  );
}
