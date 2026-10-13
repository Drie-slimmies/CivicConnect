import type { ReactNode } from "react";
import { ROLES } from "@/lib/dto";
import { RoleGate } from "@/components/layout/RoleGate";

// Any signed-in user can report issues and see their own requests.
export default function RequesterLayout({ children }: { children: ReactNode }) {
  return <RoleGate allow={[...ROLES]}>{children}</RoleGate>;
}
