import { RequestState } from "./types";
import { RequesStatus } from "@/lib/db/schema";

export const submittedState: RequestState = {
    status: "submitted",
    canAssign: true,
    nextStates: ["assigned"],
    validateTransition(action: string) {
        if (action === "assign" || action === "in_progress"){
            return { valid: true};
        }
        return { valid: false, error: "Invalid transition from submitted state."};
    },
};