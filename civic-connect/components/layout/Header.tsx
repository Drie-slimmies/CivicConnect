"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/dto";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/dto";
import { useRole } from "@/components/auth/SessionProvider";
import { buttonClass } from "@/components/ui/Button";

type Item = { href: string; label: string; exact?: boolean };

const NAV: Record<Role, Item[]> = {
  requester: [
    { href: "/requests/new", label: "Report an issue" },
    { href: "/requests", label: "My requests", exact: true },
  ],
  staff: [
    { href: "/queue", label: "Queue" },
  ],
  manager: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/queue", label: "Queue" },
    { href: "/audit", label: "Audit log" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/queue", label: "Queue" },
    { href: "/audit", label: "Audit log" },
  ],
};

export function Header() {
  const role = useRole();
  const path = usePathname();
  const items = role ? NAV[role] : [];
  const active = (i: Item) => (i.exact ? path === i.href : path === i.href || path.startsWith(`${i.href}/`));

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Link href={role ? ROLE_HOME[role] : "/login"} className="flex items-center gap-2.5 font-display text-xl font-bold">
            <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary">
              <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="4" cy="8" r="1.8" />
                <circle cx="12" cy="4" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <path d="M5.7 7.2l4.6-2.4M5.7 8.8l4.6 2.4" />
              </svg>
            </span>
            CivicConnect
          </Link>
          {!role && path.startsWith("/track") && (
            <Link href="/login" className={buttonClass("primary")}>
              Sign in
            </Link>
          )}
          {role && (
            <p className="text-sm text-muted">
              Signed in as {ROLE_LABEL[role]}.{" "}
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload so the root layout re-reads the session cookie
                  window.location.href = "/login";
                }}
                className="font-medium text-primary underline underline-offset-2"
              >
                Sign out
              </button>
            </p>
          )}
        </div>
        {items.length > 0 && (
          <nav aria-label="Main" className="-mx-1 flex flex-wrap gap-1">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active(i) ? "page" : undefined}
                className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  active(i) ? "bg-primary-soft text-ink" : "text-muted hover:bg-primary-soft hover:text-ink"
                }`}
              >
                {i.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
