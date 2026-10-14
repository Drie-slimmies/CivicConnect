import { RequestState } from "./types";
import { requestStatus } from "@/lib/db/schema";

export const closedState: RequestState = {
    status:"closed",
    canAssign:false,
    nextStates:[],
    validateTransition(){
        return {valid: false, error: "Closed requests are final and cannot be modified."};
    },
};