import type { ReactNode } from "react";
import type { Status } from "@/lib/dto";
import { STATUS_LABEL } from "@/lib/dto";

const tone: Record<Status, string> = {
  submitted: "bg-submitted-bg text-submitted-fg",
  assigned: "bg-assigned-bg text-assigned-fg",
  in_progress: "bg-in_progress-bg text-in_progress-fg",
  resolved: "bg-resolved-bg text-resolved-fg",
  closed: "bg-closed-bg text-closed-fg",
};

// Each status has its own icon and text, so colour is never the only signal.
const icon: Record<Status, ReactNode> = {
  submitted: <path d="M2.5 9.5h3l1 2h3l1-2h3M3.5 9.5l1.5-6h6l1.5 6v3h-9z" />,
  assigned: <path d="M8 8a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 8 8zM3 13.5c.5-2.6 2.5-4 5-4s4.5 1.4 5 4" />,
  in_progress: <path d="M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5v3.2l2.2 1.3" />,
  resolved: <path d="M3 8.5l3.2 3.2L13 4.8" />,
  closed: <path d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7M3.5 7h9v6.5h-9z" />,
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${tone[status]}`}>
      <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icon[status]}
      </svg>
      {STATUS_LABEL[status]}
    </span>
  );
}
