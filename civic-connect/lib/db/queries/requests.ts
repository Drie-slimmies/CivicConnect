import { randomInt } from "node:crypto";
import { and, eq, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, categories, serviceRequests, users } from "@/lib/db/schema";
import { STATUSES, type Category, type PublicRequest, type RequestDetail, type Status } from "@/lib/dto";
import { toPublic, type RequestFields } from "@/lib/requests/rules";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const newTrackingId = () =>
  "CC-" + Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export async function createRequest(requesterId: number, fields: RequestFields): Promise<string> {
  return db.transaction(async (tx) => {
    const [category] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, fields.category))
      .limit(1);
    if (!category) throw new Error(`Category not seeded: ${fields.category}`);

    const trackingId = newTrackingId();
    const [row] = await tx
      .insert(serviceRequests)
      .values({
        trackingId,
        title: fields.title,
        description: fields.description,
        location: fields.location,
        categoryId: category.id,
        requesterId,
      })
      .returning({ id: serviceRequests.id });

    await tx.insert(auditLogs).values({ serviceRequestId: row.id, userId: requesterId, action: "submitted" });
    return trackingId;
  });
}

// Helper to fetch requests using standard joins instead of db.query
async function fetchRequestsWithRelations(whereCondition?: any) {
  const requests = await db
    .select({
      id: serviceRequests.id,
      trackingId: serviceRequests.trackingId,
      title: serviceRequests.title,
      description: serviceRequests.description,
      location: serviceRequests.location,
      status: serviceRequests.status,
      resolutionNotes: serviceRequests.resolutionNotes,
      version: serviceRequests.version,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      requesterId: serviceRequests.requesterId,
      categoryName: categories.name,
      assignedStaffName: users.name,
    })
    .from(serviceRequests)
    .leftJoin(categories, eq(serviceRequests.categoryId, categories.id))
    .leftJoin(users, eq(serviceRequests.assignedStaffId, users.id))
    .where(whereCondition)
    .orderBy(desc(serviceRequests.createdAt));

  // Fetch audit logs for all retrieved request IDs
  const requestIds = requests.map((r) => r.id);
  if (requestIds.length === 0) return [];

  const logs = await db
    .select({
      serviceRequestId: auditLogs.serviceRequestId,
      action: auditLogs.action,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .orderBy(asc(auditLogs.createdAt));

  const logsMap = new Map<number, { action: string; createdAt: Date }[]>();
  for (const log of logs) {
    const list = logsMap.get(log.serviceRequestId) || [];
    list.push({ action: log.action, createdAt: log.createdAt });
    logsMap.set(log.serviceRequestId, list);
  }

  return requests.map((r) => ({
    ...r,
    category: { name: r.categoryName },
    assignedStaff: r.assignedStaffName ? { name: r.assignedStaffName } : null,
    auditLogs: logsMap.get(r.id) || [],
  }));
}

type Row = Awaited<ReturnType<typeof fetchRequestsWithRelations>>[number];

export function toDetail(r: Row): RequestDetail {
  return {
    trackingId: r.trackingId,
    title: r.title,
    description: r.description,
    location: r.location,
    category: (r.category?.name ?? "General") as Category,
    status: r.status,
    assignedTo: r.assignedStaff?.name ?? null,
    resolutionNotes: r.resolutionNotes,
    version: r.version,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    history: r.auditLogs
      .filter((a) => STATUSES.includes(a.action as Status))
      .map((a) => ({ status: a.action as Status, at: a.createdAt.toISOString() })),
  };
}

export async function listMyRequests(requesterId: number): Promise<RequestDetail[]> {
  const rows = await fetchRequestsWithRelations(eq(serviceRequests.requesterId, requesterId));
  return rows.map(toDetail);
}

export async function getMyRequest(requesterId: number, trackingId: string): Promise<RequestDetail | undefined> {
  const rows = await fetchRequestsWithRelations(
    and(eq(serviceRequests.requesterId, requesterId), eq(serviceRequests.trackingId, trackingId)),
  );
  return rows[0] ? toDetail(rows[0]) : undefined;
}

export async function getPublicRequest(trackingId: string): Promise<PublicRequest | undefined> {
  const rows = await fetchRequestsWithRelations(eq(serviceRequests.trackingId, trackingId));
  return rows[0] ? toPublic(toDetail(rows[0])) : undefined;
}

export async function listRequests(): Promise<RequestDetail[]> {
  const rows = await fetchRequestsWithRelations(undefined);
  return rows.map(toDetail);
}

export async function getRequestByTrackingId(trackingId: string): Promise<RequestDetail | undefined> {
  const rows = await fetchRequestsWithRelations(eq(serviceRequests.trackingId, trackingId));
  return rows[0] ? toDetail(rows[0]) : undefined;
}