import { RequestState } from "./types";
import { RequestStatus } from "@/lib/db/schema";

export const inProgressState: RequestState = {
    status: "in_progress",
    canAssign: true,
    nextStates: ["resolved"],
    validateTransition(action: string, notes?: string | null){
        if (action === "resolved"){
            if(!notes || notes.trim().length === 0){
                return { valid: false, error: "Resolution notes are required to resolve a request."};
            }
            return { valid: true };
        }
        return { valid: false, error: "Invalid transition from in_progress state."};
    },
};