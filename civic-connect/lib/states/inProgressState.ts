import type { RequestState } from "./types";

export const inProgressState: RequestState = {
    status: "in_progress",
    canAssign: true,
    nextStates: ["resolved"],
    validateTransition(next, notes){
        if (next === "resolved") return { valid: false, error: "A request in progress can only move to Resolvedl."};
            if(!notes || notes.trim().length === 0){
               return { valid: false, error: "Resolution notes are required to resolve a request."};
            } 
            return { valid: true };
        },
        
    };