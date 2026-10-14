import { db } from "@/lib/db";
import { auditLogs } from "../db/schema";

export async function logAuditAction(
    serviceRequestId: number,
    userId: number,
    action: string,
    notes?: string | null 
) {
    await db.insert(auditLogs).values({
        serviceRequestId,
        userId,
        action,
        notes: notes || null,
    });
}