import { RequestStatus } from "@/lib/db/schema";

export interface RequestState {
    status: RequestStatus;
    canAssign: boolean;
    nextStates: RequestStatus[];
    validateTransition(action: string, notes?: string | null): {valid: boolean; error?: string};
}