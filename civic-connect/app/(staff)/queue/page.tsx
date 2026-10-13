import type { Metadata } from "next";
import { listRequests } from "@/lib/mock/data";
import { RoleGate } from "@/components/layout/RoleGate";
import { QueueView } from "@/components/staff/QueueView";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "Request queue" };

export default function QueuePage() {
  return (
    <RoleGate allow={["staff", "manager", "admin"]}>
      <PageTitle title="Request queue">Filter and sort the work, then open a request to assign it or update its status.</PageTitle>
      <QueueView requests={listRequests()} />
    </RoleGate>
  );
}
