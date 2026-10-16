import type { ReactNode } from "react";
import { ROLES } from "@/lib/dto";
import { RoleGate } from "@/components/layout/RoleGate";

export default function RequesterLayout({ children }: { children: ReactNode }) {
  return <RoleGate allow={[...ROLES]}>{children}</RoleGate>;
}
