import { RequestState } from "./types";
import { RequestStatus } from "@/lib/db/schema";

export const assignedState: RequestState = {
    status: "assigned",
    canAssign: true,
    nextStates: ["in_progress", "assigned"],
    validateTransition(action: string){
        if ( action === "in_progress" || action === "assign") {
            return { valid: true };
        }
        return { valid: false, error: "Invalid transition from assigned state."};
    },
};