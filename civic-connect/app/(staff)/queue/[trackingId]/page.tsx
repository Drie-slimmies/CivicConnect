import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequest } from "@/lib/mock/data";
import { RoleGate } from "@/components/layout/RoleGate";
import { RequestWorkspace } from "@/components/staff/RequestWorkspace";

export const metadata: Metadata = { title: "Manage request" };

export default async function QueueItemPage({ params }: PageProps<"/queue/[trackingId]">) {
  const { trackingId } = await params;
  const r = getRequest(trackingId);
  if (!r) notFound();

  return (
    <RoleGate allow={["staff", "manager", "admin"]}>
      <div className="flex flex-col gap-6">
        <Link href="/queue" className="w-fit font-medium text-primary underline underline-offset-2">
          Back to the queue
        </Link>
        <RequestWorkspace initial={r} />
      </div>
    </RoleGate>
  );
}
