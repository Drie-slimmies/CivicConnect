import { RequestState } from "./types";
import { RequestStatus } from "@/lib/db/schema";

export const resolvedState: RequestState = {
    status: "resolved",
    canAssign: false,
    nextStates: ["closed"],
    validateTransition(action:string){
        if (action === "closed") {
            return {valid: true};
        }
        return { valid: false, error: "Resolved requests can only be closed."};
    },
};