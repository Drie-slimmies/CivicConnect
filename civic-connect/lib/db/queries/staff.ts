import { asc, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceRequests, users } from "@/lib/db/schema";

export async function getStaffRequestQueue() {
  return db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
}

export type StaffOption = { id: number; name: string };

export async function listAssignableStaff(): Promise<StaffOption[]> {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(inArray(users.role, ["staff", "manager", "admin"]))
    .orderBy(asc(users.name));
}