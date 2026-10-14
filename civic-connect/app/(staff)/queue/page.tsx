import type { Metadata } from "next";

import { db } from "@/lib/db";
import { RoleGate } from "@/components/layout/RoleGate";
import { QueueView } from "@/components/staff/QueueView";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "Request queue" };



async function getLiveRequests() {
  const requests = await db.query.serviceRequests.findMany({
    orderBy: (serviceRequests, { desc }) => [desc(serviceRequests.createdAt)],
    with: {
      category: true,
      assignedTo: true,
      history: true,
    }
  });
  
  return requests;
}


export default async function QueuePage() {
  const requests = await getLiveRequests();

  return (
    <RoleGate allow={["staff", "manager", "admin"]}>
      <PageTitle title="Request queue">Filter and sort the work, then open a request to assign it or update its status.</PageTitle>
      <QueueView requests={requests} />
    </RoleGate>
  );
}