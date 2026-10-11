"use client";
import { Button } from "./Button";
import { Notice } from "./Notice";

export function RouteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Notice kind="error" title="This page could not load.">
        Your information is safe. Try again, and if it keeps happening, contact the service desk
        {error.digest ? ` and quote reference ${error.digest}` : ""}.
      </Notice>
      <Button onClick={retry}>Try again</Button>
    </div>
  );
}
