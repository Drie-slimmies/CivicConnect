export interface CategoryRow {
  category: string;
  open: number;
  resolved: number;
}

// Counts are written out next to each bar, so the chart never relies on colour alone.
export function CategoryBreakdown({ rows }: { rows: CategoryRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.open + r.resolved));
  return (
    <div className="rounded-card border border-line bg-surface p-6">
      <ul className="flex flex-col gap-5">
        {rows.map((r) => (
          <li key={r.category}>
            <div className="mb-1.5 flex flex-wrap justify-between gap-x-4 text-sm">
              <span className="font-medium">{r.category}</span>
              <span className="text-muted">
                {r.open} open, {r.resolved} resolved, {r.open + r.resolved} total
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-line" role="img" aria-label={`${r.open} open and ${r.resolved} resolved`}>
              <span className="bg-primary" style={{ width: `${(r.open / max) * 100}%` }} />
              <span className="bg-resolved-fg opacity-60" style={{ width: `${(r.resolved / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex gap-5 text-sm text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-full bg-primary" /> Open
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-full bg-resolved-fg opacity-60" /> Resolved or closed
        </span>
      </p>
    </div>
  );
}
