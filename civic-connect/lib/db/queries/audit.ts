import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, serviceRequests, users } from "@/lib/db/schema";
import { STATUSES, STATUS_LABEL, type AuditEntry, type Status } from "@/lib/dto";

export function describeAction(action: string): string {
  if (action === "submitted") return "Request submitted";
  if (action === "assigned") return "Assigned";
  return STATUSES.includes(action as Status) ? `Status changed to ${STATUS_LABEL[action as Status]}` : action;
}

export async function listAudit(limit = 200): Promise<AuditEntry[]> {
  const rows = await db
    .select({
      id: auditLogs.id,
      at: auditLogs.createdAt,
      action: auditLogs.action,
      notes: auditLogs.notes,
      trackingId: serviceRequests.trackingId,
      by: users.name,
      byRole: users.role,
    })
    .from(auditLogs)
    .innerJoin(serviceRequests, eq(auditLogs.serviceRequestId, serviceRequests.id))
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(limit);
  return rows.map((r) => ({ ...r, id: String(r.id), at: r.at.toISOString(), action: describeAction(r.action) }));
}
