import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({ title, intro, children, switchText, switchLabel, switchHref }: {
  title: string;
  intro: string;
  children: ReactNode;
  switchText: string;
  switchLabel: string;
  switchHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{intro}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <p className="text-muted">
          {switchText}{" "}
          <Link href={switchHref} className="font-medium text-primary underline underline-offset-2">
            {switchLabel}
          </Link>
        </p>
        <p>
          <Link href="/track" className="text-sm font-medium text-primary underline underline-offset-2">
            Track a request without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
