import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, serviceRequests } from "@/lib/db/schema";
import { CATEGORIES, STATUSES, type Status } from "@/lib/dto";

export type CountRow = { category: string; status: Status; count: number };

const OPEN: Status[] = ["submitted", "assigned", "in_progress"];

export function summarise(rows: CountRow[]) {
  const sum = (match: (r: CountRow) => boolean) => rows.filter(match).reduce((n, r) => n + r.count, 0);
  return {
    total: sum(() => true),
    open: sum((r) => OPEN.includes(r.status)),
    byStatus: Object.fromEntries(STATUSES.map((s) => [s, sum((r) => r.status === s)])) as Record<Status, number>,
    byCategory: CATEGORIES.map((category) => ({
      category,
      open: sum((r) => r.category === category && OPEN.includes(r.status)),
      resolved: sum((r) => r.category === category && r.status === "resolved"),
      closed: sum((r) => r.category === category && r.status === "closed"),
    })).filter((r) => r.open + r.resolved + r.closed > 0),
  };
}

export async function getDashboard() {
  const rows = await db
    .select({ category: categories.name, status: serviceRequests.status, count: count() })
    .from(serviceRequests)
    .innerJoin(categories, eq(serviceRequests.categoryId, categories.id))
    .groupBy(categories.name, serviceRequests.status);
  return summarise(rows);
}
