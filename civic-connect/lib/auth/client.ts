import type { Role } from "@/lib/dto";

export type AuthErrors = Partial<Record<"name" | "email" | "password" | "form", string>>;

export type AuthResult = { ok: true; role: Role } | { ok: false; errors: AuthErrors };

export async function postAuth(path: "login" | "register", body: Record<string, string>): Promise<AuthResult> {
  try {
    const res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.user?.role) return { ok: true, role: data.user.role };
    return { ok: false, errors: data?.errors ?? { form: "Something went wrong. Please try again." } };
  } catch {
    return { ok: false, errors: { form: "Could not reach the server. Check your connection and try again." } };
  }
}
