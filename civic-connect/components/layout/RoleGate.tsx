"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@/lib/dto";
import { ROLE_LABEL } from "@/lib/dto";
import { useRole } from "@/components/auth/SessionProvider";
import { buttonClass } from "@/components/ui/Button";

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useRole();
  if (role && allow.includes(role)) return <>{children}</>;

  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-line bg-surface px-6 py-10">
      {role ? (
        <>
          <h1 className="font-display text-2xl font-bold">You don&apos;t have access to this page</h1>
          <p className="max-w-prose text-muted">
            This page is for {allow.map((r) => ROLE_LABEL[r].toLowerCase()).join(" and ")} accounts. You are signed in as{" "}
            {ROLE_LABEL[role].toLowerCase()}.
          </p>
          <Link href="/login" className={buttonClass("ghost")}>
            Sign in as someone else
          </Link>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold">Sign in to continue</h1>
          <p className="max-w-prose text-muted">You need an account to see this page.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={buttonClass("primary")}>
              Sign in
            </Link>
            <Link href="/register" className={buttonClass("ghost")}>
              Create an account
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
