import { RequestStatus } from "@/lib/db/schema";
import { RequestState } from "./types";
import { submittedState } from "./submittedState";
import { assignedState } from "./assignedState";
import { inProgressState } from "./inProgressState";
import { resolvedState } from "./resolvedState";
import { closedState } from "./closedState";


export function stateFor(status: RequestStatus): RequestState{
    switch (status){
        case "submitted":
            return submittedState;
        case "assigned":
            return assignedState;
        case "in_progress":
            return inProgressState;
        case "resolved":
            return resolvedState;
        case "closed":
            return closedState;
            default:
                throw new Error(`Unknown requet status : ${status}`);
    }
}