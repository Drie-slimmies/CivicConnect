"use client";
// Prototype only: stands in for a real session. The real check must also happen on the server.
import { useSyncExternalStore } from "react";
import type { Role } from "@/lib/dto";
import { ROLES } from "@/lib/dto";

const KEY = "civicconnect.previewRole";
const EVENT = "civicconnect:role";

function read(): Role | null {
  try {
    const v = localStorage.getItem(KEY);
    return ROLES.find((r) => r === v) ?? null;
  } catch {
    return null;
  }
}

export function setRole(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* storage unavailable: stays signed out */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearRole() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// null means signed out.
export const useRole = (): Role | null => useSyncExternalStore(subscribe, read, () => null);

// False during server rendering and hydration, so screens do not flash the wrong state.
export const useReady = (): boolean =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
