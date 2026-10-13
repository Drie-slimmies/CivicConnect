export function StatTile({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-soft">
      <p className="text-muted">{label}</p>
      <p className="font-display text-5xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted">{note}</p>
    </div>
  );
}
