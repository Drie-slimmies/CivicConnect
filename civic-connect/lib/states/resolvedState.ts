import type { RequestState } from "./types";

export const resolvedState: RequestState = {
    status: "resolved",
    canAssign: false,
    nextStates: ["closed"],
    validateTransition(next){
        if (next === "closed") return { valid: true};
        return { valid: false, error: "Resolved requests can only be closed."};
    },
};