import { db } from "@/lib/db";
import { auditLogs } from "../db/schema";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function logAuditAction(
    tx: Tx,
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