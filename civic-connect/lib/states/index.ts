import type { RequestStatus } from "@/lib/db/schema";
import type { RequestState } from "./types";
import { submittedState } from "./submittedState";
import { assignedState } from "./assignedState";
import { inProgressState } from "./inProgressState";
import { resolvedState } from "./resolvedState";
import { closedState } from "./closedState";

const STATES: Record<RequestStatus, RequestState> = {
    submitted: submittedState,
    assigned: assignedState,
    in_progress: inProgressState,
    resolved: resolvedState,
    closed: closedState,
};

export function stateFor(status: RequestStatus): RequestState{
    return STATES[status];
}