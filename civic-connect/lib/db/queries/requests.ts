import { randomInt } from "node:crypto";
import { and, eq, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, categories, serviceRequests } from "@/lib/db/schema";
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

function findRequests(where: SQL | undefined) {
  return db.query.serviceRequests.findMany({
    where,
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    with: {
      category: { columns: { name: true } },
      assignedStaff: { columns: { name: true } },
      auditLogs: {
        columns: { action: true, createdAt: true },
        orderBy: (a, { asc }) => [asc(a.createdAt)],
      },
    },
  });
}

type Row = Awaited<ReturnType<typeof findRequests>>[number];

export function toDetail(r: Row): RequestDetail {
  return {
    trackingId: r.trackingId,
    title: r.title,
    description: r.description,
    location: r.location,
    category: r.category.name as Category,
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
  return (await findRequests(eq(serviceRequests.requesterId, requesterId))).map(toDetail);
}

export async function getMyRequest(requesterId: number, trackingId: string): Promise<RequestDetail | undefined> {
  const [row] = await findRequests(
    and(eq(serviceRequests.requesterId, requesterId), eq(serviceRequests.trackingId, trackingId)),
  );
  return row && toDetail(row);
}

export async function getPublicRequest(trackingId: string): Promise<PublicRequest | undefined> {
  const [row] = await findRequests(eq(serviceRequests.trackingId, trackingId));
  return row && toPublic(toDetail(row));
}
