import type { RequestState } from "./types";


export const submittedState: RequestState = {
    status: "submitted",
    canAssign: true,
    nextStates: [],
    validateTransition() {
        return { valid: false, error: "Assign this request before changing its status."};
    },
};