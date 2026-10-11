"use client";
// Prototype only: stands in for real sign-in. The real check must also happen on the server.
import { useSyncExternalStore } from "react";
import type { Role } from "@/lib/dto";
import { ROLES } from "@/lib/dto";

const KEY = "civicconnect.previewRole";
const EVENT = "civicconnect:role";

function read(): Role {
  try {
    const v = localStorage.getItem(KEY);
    return ROLES.find((r) => r === v) ?? "requester";
  } catch {
    return "requester";
  }
}

export function setRole(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* storage unavailable: role stays at default */
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

export const useRole = (): Role => useSyncExternalStore(subscribe, read, () => "requester");
