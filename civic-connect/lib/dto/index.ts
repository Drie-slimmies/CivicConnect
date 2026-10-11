// Shared UI/API contract types. Status and role values mirror the enums in lib/db/schema.ts.

export const STATUSES = ["submitted", "assigned", "in_progress", "resolved", "closed"] as const;
export type Status = (typeof STATUSES)[number];

export const ROLES = ["requester", "staff", "manager", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  submitted: "Submitted",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_HELP: Record<Status, string> = {
  submitted: "We have your request and it is waiting for a team member.",
  assigned: "A team member has taken it on.",
  in_progress: "Work on the issue has started.",
  resolved: "The work is done. Notes explain what was fixed.",
  closed: "The request is complete. It cannot be reopened.",
};

// FR-006: only the next step in the lifecycle is allowed. Closed is final (no reopen).
export const NEXT_STATUS: Record<Status, Status | null> = {
  submitted: "assigned",
  assigned: "in_progress",
  in_progress: "resolved",
  resolved: "closed",
  closed: null,
};

export const ROLE_LABEL: Record<Role, string> = {
  requester: "Requester",
  staff: "Staff",
  manager: "Manager",
  admin: "Administrator",
};

// FR-002: controlled list of categories.
export const CATEGORIES = [
  "Water and sanitation",
  "Roads and potholes",
  "Electricity and streetlights",
  "Waste removal",
  "Parks and public spaces",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const TRACKING_ID_PATTERN = /^CC-[A-Z0-9]{6}$/;

// What anyone with a tracking ID may see. No personal data (POPIA).
export interface PublicRequest {
  trackingId: string;
  title: string;
  category: Category;
  status: Status;
  createdAt: string;
  updatedAt: string;
  history: { status: Status; at: string }[];
}

// Signed-in views add the fields below.
export interface RequestDetail extends PublicRequest {
  description: string;
  location: string;
  urgency: 1 | 2 | 3 | 4 | 5;
  assignedTo: string | null;
  resolutionNotes: string | null;
  version: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  action: string;
  trackingId: string;
  by: string;
  byRole: Role;
  notes: string | null;
}
