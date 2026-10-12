import type { Role } from "@/lib/dto";
import { setRole } from "./role";

// Prototype only. Replace both functions with POST /api/auth/login and /api/auth/register.
// The password is not checked here; the real API checks it and sets the role on the server.
const DEMO: Record<string, Role> = {
  "thandi.mokoena@civicconnect.test": "staff",
  "sipho.dlamini@civicconnect.test": "manager",
  "demo.requester@civicconnect.test": "requester",
};

export type AuthResult = { ok: true; role: Role } | { ok: false; error: string };

const pause = () => new Promise((r) => setTimeout(r, 500));

export async function signIn(email: string): Promise<AuthResult> {
  await pause();
  const role = DEMO[email.trim().toLowerCase()];
  if (!role) return { ok: false, error: "The email or password is not correct." };
  setRole(role);
  return { ok: true, role };
}

// Sign-up always creates a requester. The form never sends a role.
export async function signUp(email: string): Promise<AuthResult> {
  await pause();
  if (DEMO[email.trim().toLowerCase()]) return { ok: false, error: "An account with this email already exists. Try signing in instead." };
  setRole("requester");
  return { ok: true, role: "requester" };
}
