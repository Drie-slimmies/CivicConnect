import { Button } from "@/components/ui/Button";

// Plain GET form: works without JavaScript and the result page has a shareable URL.
export function TrackForm({ defaultValue = "", error }: { defaultValue?: string; error?: string }) {
  return (
    <form action="/track" method="get" className="flex flex-col gap-3" role="search" aria-label="Track a request">
      <label htmlFor="track-id" className="font-medium">
        Tracking ID
      </label>
      <p id="track-hint" className="text-sm text-muted">
        You received it when you submitted the request. It looks like CC-7H3K9P.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="track-id"
          name="id"
          defaultValue={defaultValue}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-describedby={error ? "track-hint track-error" : "track-hint"}
          aria-invalid={error ? true : undefined}
          className={`min-h-11 flex-1 rounded-xl border bg-surface px-4 py-3 uppercase tracking-wider text-ink ${error ? "border-danger" : "border-line"}`}
        />
        <Button type="submit">Find request</Button>
      </div>
      {error && (
        <p id="track-error" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
