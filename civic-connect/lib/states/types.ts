import { RequestStatus } from "@/lib/db/schema";

export type TransitionResult = { valid: true } | {valid: false; error: string};

export interface RequestState {
    status: RequestStatus;
    canAssign: boolean;
    nextStates: RequestStatus[];
    validateTransition(next: RequestStatus, notes?: string | null): TransitionResult;
}