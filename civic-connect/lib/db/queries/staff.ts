import { db } from "@/lib/db";
import { serviceRequests } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getStaffRequestQueue(){
    const queue = await db
    .select()
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt));

    return queue;
}