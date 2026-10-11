import type { ReactNode } from "react";

// The tracking ID as a ticket stub: the one memorable element in the design.
export function TicketStub({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-card border border-stub-line bg-stub shadow-soft sm:flex-row">
      <div className="px-6 py-5 sm:w-64 sm:shrink-0">
        <p className="text-sm text-muted">Tracking ID</p>
        <p className="break-all font-display text-2xl font-bold tracking-wider">{id}</p>
      </div>
      <div className="relative flex-1 border-t-2 border-dashed border-stub-line px-6 py-5 sm:border-l-2 sm:border-t-0">
        <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bg" />
        <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-bg sm:-bottom-3 sm:-left-3 sm:right-auto sm:top-auto" />
        {children}
      </div>
    </div>
  );
}
