"use client";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/dto";
import { ROLES, ROLE_LABEL } from "@/lib/dto";
import { setRole, useRole } from "@/lib/mock/role";
import { Notice } from "@/components/ui/Notice";
import { PageTitle } from "@/components/ui/PageTitle";

const ABOUT: Record<Role, string> = {
  requester: "Report issues and follow your own requests.",
  staff: "Work through the queue, assign requests and update their status.",
  manager: "See totals by category, the queue and the audit log.",
  admin: "Everything a manager sees, plus user and role management later.",
};
const HOME: Record<Role, string> = { requester: "/requests", staff: "/queue", manager: "/dashboard", admin: "/dashboard" };

export default function LoginPage() {
  const router = useRouter();
  const current = useRole();
  return (
    <div className="max-w-3xl">
      <PageTitle title="Sign in">Choose who you want to preview the app as.</PageTitle>
      <div className="mb-8">
        <Notice kind="info" title="Sign-in is not connected yet.">
          This screen only switches the preview. Real accounts and access checks come with the API.
        </Notice>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {ROLES.map((role) => (
          <li key={role}>
            <button
              type="button"
              onClick={() => {
                setRole(role);
                router.push(HOME[role]);
              }}
              className="flex h-full min-h-11 w-full flex-col items-start gap-1 rounded-card border border-line bg-surface p-5 text-left shadow-soft transition-colors hover:border-primary"
            >
              <span className="font-display text-lg font-semibold">
                {ROLE_LABEL[role]}
                {current === role && <span className="ml-2 text-sm font-normal text-primary">Current</span>}
              </span>
              <span className="text-muted">{ABOUT[role]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
