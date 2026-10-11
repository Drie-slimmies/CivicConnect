// Sample data so the screens work before the API exists. Replace with fetch calls later.
import type { AuditEntry, PublicRequest, RequestDetail, Status } from "@/lib/dto";

function make(
  trackingId: string,
  title: string,
  category: RequestDetail["category"],
  status: Status,
  created: string,
  extra: Partial<RequestDetail> & Pick<RequestDetail, "description" | "location" | "urgency">,
): RequestDetail {
  const order: Status[] = ["submitted", "assigned", "in_progress", "resolved", "closed"];
  const upto = order.indexOf(status);
  const start = new Date(created).getTime();
  const history = order.slice(0, upto + 1).map((s, i) => ({
    status: s,
    at: new Date(start + i * 1000 * 60 * 60 * 20).toISOString(),
  }));
  return {
    trackingId,
    title,
    category,
    status,
    createdAt: created,
    updatedAt: history[history.length - 1].at,
    history,
    assignedTo: upto >= 1 ? "Thandi Mokoena" : null,
    resolutionNotes: upto >= 3 ? "Repaired and tested on site." : null,
    version: upto + 1,
    ...extra,
  };
}

export const REQUESTS: RequestDetail[] = [
  make("CC-7H3K9P", "Burst water pipe on Church Street", "Water and sanitation", "in_progress", "2026-10-05T07:40:00Z", {
    description: "Water is flowing across the pavement outside number 14 and the road is getting slippery.",
    location: "Church Street, near number 14",
    urgency: 5,
  }),
  make("CC-2M8QXD", "Large pothole near the school gate", "Roads and potholes", "submitted", "2026-10-09T09:10:00Z", {
    description: "A deep pothole at the school entrance. Cars swerve around it when children are crossing.",
    location: "Protea Road, outside Laerskool Protea",
    urgency: 4,
  }),
  make("CC-5TR4WA", "Streetlight out for two weeks", "Electricity and streetlights", "assigned", "2026-10-02T18:25:00Z", {
    description: "The streetlight on the corner has not worked for two weeks. The block is very dark at night.",
    location: "Corner of Jacaranda Avenue and Mimosa Street",
    urgency: 3,
  }),
  make("CC-9BN6LC", "Bins not collected this week", "Waste removal", "resolved", "2026-09-28T06:55:00Z", {
    description: "Collection was skipped on Tuesday and the bins are overflowing.",
    location: "Willow Close, all houses",
    urgency: 2,
    resolutionNotes: "Collection rescheduled and completed. Route sheet corrected.",
  }),
  make("CC-4DK2VE", "Broken swing at the park", "Parks and public spaces", "closed", "2026-09-20T11:00:00Z", {
    description: "One of the swings has a snapped chain and is a hazard for children.",
    location: "Memorial Park, playground area",
    urgency: 3,
    resolutionNotes: "Chain replaced and swing inspected.",
  }),
  make("CC-8WQ3ZT", "Blocked storm drain", "Water and sanitation", "assigned", "2026-10-08T13:30:00Z", {
    description: "Leaves and rubbish are blocking the drain. It floods when it rains.",
    location: "Kerk Street, opposite the pharmacy",
    urgency: 2,
  }),
  make("CC-3FJ7YN", "Faded stop sign at intersection", "Roads and potholes", "submitted", "2026-10-10T08:05:00Z", {
    description: "The stop sign is so faded that drivers do not see it.",
    location: "Oak Avenue and Sixth Street",
    urgency: 3,
  }),
  make("CC-6PV5HR", "Illegal dumping beside the river path", "Waste removal", "in_progress", "2026-10-03T15:45:00Z", {
    description: "Building rubble and old furniture have been dumped beside the walking path.",
    location: "River path, near the second footbridge",
    urgency: 2,
  }),
];

// The demo requester owns these.
const MINE = new Set(["CC-7H3K9P", "CC-2M8QXD", "CC-9BN6LC"]);

export const listRequests = () => REQUESTS;
export const listMyRequests = () => REQUESTS.filter((r) => MINE.has(r.trackingId));
export const getRequest = (id: string) => REQUESTS.find((r) => r.trackingId === id);

export function getPublicRequest(id: string): PublicRequest | undefined {
  const r = getRequest(id);
  if (!r) return undefined;
  const { trackingId, title, category, status, createdAt, updatedAt, history } = r;
  return { trackingId, title, category, status, createdAt, updatedAt, history };
}

export const AUDIT: AuditEntry[] = [
  { id: "a8", at: "2026-10-10T08:05:00Z", action: "Request submitted", trackingId: "CC-3FJ7YN", by: "Demo Requester", byRole: "requester", notes: null },
  { id: "a7", at: "2026-10-09T09:10:00Z", action: "Request submitted", trackingId: "CC-2M8QXD", by: "Demo Requester", byRole: "requester", notes: null },
  { id: "a6", at: "2026-10-08T15:20:00Z", action: "Assigned to Thandi Mokoena", trackingId: "CC-8WQ3ZT", by: "Thandi Mokoena", byRole: "staff", notes: null },
  { id: "a5", at: "2026-10-07T10:02:00Z", action: "Status changed to In progress", trackingId: "CC-7H3K9P", by: "Thandi Mokoena", byRole: "staff", notes: "Crew on site, water shut off at the main valve." },
  { id: "a4", at: "2026-10-05T07:40:00Z", action: "Request submitted", trackingId: "CC-7H3K9P", by: "Demo Requester", byRole: "requester", notes: null },
  { id: "a3", at: "2026-09-30T14:12:00Z", action: "Status changed to Resolved", trackingId: "CC-9BN6LC", by: "Thandi Mokoena", byRole: "staff", notes: "Collection rescheduled and completed. Route sheet corrected." },
  { id: "a2", at: "2026-09-22T09:30:00Z", action: "Status changed to Closed", trackingId: "CC-4DK2VE", by: "Sipho Dlamini", byRole: "manager", notes: "Inspection passed." },
  { id: "a1", at: "2026-09-21T16:48:00Z", action: "Status changed to Resolved", trackingId: "CC-4DK2VE", by: "Thandi Mokoena", byRole: "staff", notes: "Chain replaced and swing inspected." },
];
