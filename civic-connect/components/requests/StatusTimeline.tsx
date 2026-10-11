import type { Status } from "@/lib/dto";
import { STATUSES, STATUS_HELP, STATUS_LABEL } from "@/lib/dto";
import { formatDateTime } from "@/lib/format";

export function StatusTimeline({ history }: { history: { status: Status; at: string }[] }) {
  const reached = new Map(history.map((h) => [h.status, h.at]));
  const current = history[history.length - 1]?.status;
  return (
    <ol className="flex flex-col">
      {STATUSES.map((s, i) => {
        const at = reached.get(s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0" aria-current={s === current ? "step" : undefined}>
            {i < STATUSES.length - 1 && (
              <span aria-hidden className={`absolute left-[0.8rem] top-7 h-full w-0.5 ${reached.has(STATUSES[i + 1]) ? "bg-primary" : "bg-line"}`} />
            )}
            <span
              aria-hidden
              className={`relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                at ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted"
              }`}
            >
              {at ? "✓" : ""}
            </span>
            <div>
              <p className={`font-medium ${at ? "" : "text-muted"}`}>
                {STATUS_LABEL[s]}
                {s === current && <span className="ml-2 text-sm text-primary">Current step</span>}
                {!at && <span className="sr-only"> (not reached yet)</span>}
              </p>
              <p className="text-sm text-muted">{at ? formatDateTime(at) : STATUS_HELP[s]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
