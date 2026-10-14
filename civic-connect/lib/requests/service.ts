import { db } from "@/lib/db";
import { serviceRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { stateFor } from "@/lib/states";
import { logAuditAction } from "@/lib/decorators/auditDecorator";

export async function assignRequest(
    trackingId: string,
    assigneeId: number,
    actorUserId: number,
    currentVersion: number
){
    return await db.transaction(async (tx) => {
        const [request] = await tx
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.trackingId, trackingId));

        if (!request) throw new Error("NOT_FOUND");

        const state = stateFor(request.status);
        if (!state.canAssign) throw new Error("ILLEGAL_TRANSITION");

        const [updated] = await tx
        .update(serviceRequests)
        .set({
            assignedStaffId: assigneeId,
            status: "assigned",
            version: request.version + 1,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(serviceRequests.trackingId, trackingId),
                eq(serviceRequests.version, currentVersion)
            )
        )
        .returning();

        if (!updated) throw new Error("VERSION_CONFLICT");

        await logAuditAction(request.id, actorUserId, "assigned", `Assigned to user ID ${assigneeId}`);
        return updated;
    });
}

export async function advanceRequest(
    trackingId: string,
    nextStatus: "in_progress" | "resolved" | "closed",
    notes: string | undefined,
    actorUserId: number,
    currentVersion: number
){
    return await db.transaction(async (tx) => {
        const [request] = await tx
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.trackingId, trackingId));

        if(!request) throw new Error("NOT_FOUND");

        const state = stateFor(request.status);
        const validation = state.validateTransition(nextStatus, notes);
        if(!validation.valid) throw new Error(validation.error || "ILLEGAL_TRANSITION");

        const [updated] = await tx
        .update(serviceRequests)
        .set({
            status: nextStatus,
            resolutionNotes: nextStatus === "resolved" ? notes: request.resolutionNotes,
            version: request.version + 1,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(serviceRequests.trackingId, trackingId),
                eq(serviceRequests.version, currentVersion)
            )
        )
        .returning();

        if (!updated) throw new Error("VERSION_CONFLICT");

        await logAuditAction(request.id, actorUserId, nextStatus, notes);
        return updated;
    });
}