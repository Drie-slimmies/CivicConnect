export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Loading</span>
      <div className="h-9 w-2/3 animate-pulse rounded-xl bg-line" />
      <div className="h-4 w-1/2 animate-pulse rounded-xl bg-line" />
      <div className="h-32 animate-pulse rounded-card bg-line" />
      <div className="h-32 animate-pulse rounded-card bg-line" />
    </div>
  );
}
