import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceRequests, users, type RequestStatus } from "@/lib/db/schema";
import { stateFor } from "@/lib/states";
import { logAuditAction } from "@/lib/decorators/auditDecorator";

export type RequestActionCode = "NOT_FOUND" | "VERSION_CONFLICT" | "ILLEGAL_TRANSITION" | "INVALID_ASSIGNEE" | "FORBIDDEN";

export class RequestActionError extends Error {
  constructor(
    public readonly code: RequestActionCode,
    message: string,
  ) {
    super(message);
    this.name = "RequestActionError";
  }
}

const ASSIGNABLE_ROLES = ["staff"] as const;
const CONFLICT = "Someone else changed this request. Reload and try again.";

export async function assignRequest(trackingId: string, assigneeId: number, actorUserId: number, currentVersion: number) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(serviceRequests).where(eq(serviceRequests.trackingId, trackingId)).limit(1);
    if (!request) throw new RequestActionError("NOT_FOUND", "Request not found.");
    if (request.version !== currentVersion) throw new RequestActionError("VERSION_CONFLICT", CONFLICT);

    if (!stateFor(request.status).canAssign) {
      throw new RequestActionError("ILLEGAL_TRANSITION", "Resolved and closed requests cannot be reassigned.");
    }

    const [assignee] = await tx
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(eq(users.id, assigneeId))
      .limit(1);
    if (!assignee || !(ASSIGNABLE_ROLES as readonly string[]).includes(assignee.role)) {
      throw new RequestActionError("INVALID_ASSIGNEE", "Choose a staff member to assign this request to.");
    }

    if (request.assignedStaffId === assignee.id) {
      throw new RequestActionError("ILLEGAL_TRANSITION", `This request is already assigned to ${assignee.name}.`);
    }

    const nextStatus: RequestStatus = request.status === "submitted" ? "assigned" : request.status;
    const [updated] = await tx
      .update(serviceRequests)
      .set({ assignedStaffId: assignee.id, status: nextStatus, version: request.version + 1, updatedAt: new Date() })
      .where(and(eq(serviceRequests.id, request.id), eq(serviceRequests.version, currentVersion)))
      .returning({ id: serviceRequests.id });
    if (!updated) throw new RequestActionError("VERSION_CONFLICT", CONFLICT);

    const action = nextStatus !== request.status ? nextStatus : "transferred";
    await logAuditAction(tx, request.id, actorUserId, action, `Assigned to ${assignee.name}`);
  });
}

export async function unassignRequest(
  trackingId: string,
  actor: { id: number; role: string },
  currentVersion: number,
) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(serviceRequests).where(eq(serviceRequests.trackingId, trackingId)).limit(1);
    if (!request) throw new RequestActionError("NOT_FOUND", "Request not found.");
    if (request.version !== currentVersion) throw new RequestActionError("VERSION_CONFLICT", CONFLICT);

    if (request.assignedStaffId === null || (request.status !== "assigned" && request.status !== "in_progress")) {
      throw new RequestActionError("ILLEGAL_TRANSITION", "Only an assigned request that is still open can be unassigned.");
    }
    if (actor.role === "staff" && request.assignedStaffId !== actor.id) {
      throw new RequestActionError("FORBIDDEN", "You can only unassign requests that are assigned to you.");
    }

    const [assignee] = await tx
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, request.assignedStaffId))
      .limit(1);

    const [updated] = await tx
      .update(serviceRequests)
      .set({ assignedStaffId: null, status: "submitted", version: request.version + 1, updatedAt: new Date() })
      .where(and(eq(serviceRequests.id, request.id), eq(serviceRequests.version, currentVersion)))
      .returning({ id: serviceRequests.id });
    if (!updated) throw new RequestActionError("VERSION_CONFLICT", CONFLICT);

    await logAuditAction(tx, request.id, actor.id, "unassigned", `Unassigned from ${assignee?.name ?? "a staff member"}`);
  });
}

export async function advanceRequest(
  trackingId: string,
  nextStatus: RequestStatus,
  notes: string | undefined,
  actorUserId: number,
  currentVersion: number,
) {
  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(serviceRequests).where(eq(serviceRequests.trackingId, trackingId)).limit(1);
    if (!request) throw new RequestActionError("NOT_FOUND", "Request not found.");
    if (request.version !== currentVersion) throw new RequestActionError("VERSION_CONFLICT", CONFLICT);

    const validation = stateFor(request.status).validateTransition(nextStatus, notes);
    if (!validation.valid) throw new RequestActionError("ILLEGAL_TRANSITION", validation.error);

    const [updated] = await tx
      .update(serviceRequests)
      .set({
        status: nextStatus,
        resolutionNotes: nextStatus === "resolved" ? notes?.trim() : request.resolutionNotes,
        version: request.version + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(serviceRequests.id, request.id), eq(serviceRequests.version, currentVersion)))
      .returning({ id: serviceRequests.id });
    if (!updated) throw new RequestActionError("VERSION_CONFLICT", CONFLICT);

    await logAuditAction(tx, request.id, actorUserId, nextStatus, notes);
  });
}
