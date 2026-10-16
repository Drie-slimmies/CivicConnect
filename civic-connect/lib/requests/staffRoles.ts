import type { Role } from "@/lib/dto";

export const STAFF_ROLES = ["staff", "manager", "admin"] as const satisfies readonly Role[];

export function isStaffRole(role: Role): boolean {
  return (STAFF_ROLES as readonly Role[]).includes(role);
}