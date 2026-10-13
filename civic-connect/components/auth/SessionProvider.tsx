"use client";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/lib/auth/guard";
import type { Role } from "@/lib/dto";

const SessionContext = createContext<CurrentUser | null>(null);

export function SessionProvider({ user, children }: { user: CurrentUser | null; children: ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export const useUser = (): CurrentUser | null => useContext(SessionContext);

export const useRole = (): Role | null => useUser()?.role ?? null;
