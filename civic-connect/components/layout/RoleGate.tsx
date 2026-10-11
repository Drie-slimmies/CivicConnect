"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@/lib/dto";
import { ROLE_LABEL } from "@/lib/dto";
import { useRole } from "@/lib/mock/role";
import { buttonClass } from "@/components/ui/Button";

// Prototype gate. Real authorisation must also be enforced by the API, never by the UI alone.
export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useRole();
  if (allow.includes(role)) return <>{children}</>;
  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-line bg-surface px-6 py-10">
      <h1 className="font-display text-2xl font-bold">You don&apos;t have access to this page</h1>
      <p className="max-w-prose text-muted">
        This page is for {allow.map((r) => ROLE_LABEL[r].toLowerCase()).join(" and ")} accounts. You are signed in as{" "}
        {ROLE_LABEL[role].toLowerCase()}.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={buttonClass("primary")}>
          Go to the home page
        </Link>
        <Link href="/login" className={buttonClass("ghost")}>
          Switch role
        </Link>
      </div>
    </div>
  );
}
