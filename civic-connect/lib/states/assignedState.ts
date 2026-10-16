import type { RequestState } from "./types";

export const assignedState: RequestState = {
    status: "assigned",
    canAssign: true,
    nextStates: ["in_progress"],
    validateTransition(next){
        if ( next === "in_progress") return { valid: true};
            
        return { valid: false, error: "An assigned request can only move to In progress."};
    },
};