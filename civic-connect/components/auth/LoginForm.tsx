"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ROLE_HOME } from "@/lib/dto";
import { signIn } from "@/lib/mock/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";

type Errors = Partial<Record<"email" | "password" | "form", string>>;

export function LoginForm() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (busy) return;
    const data = new FormData(ev.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const found: Errors = {};
    if (!email) found.email = "Enter the email you signed up with.";
    if (!password) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    const result = await signIn(email);
    if (result.ok) {
      router.push(ROLE_HOME[result.role]);
      return;
    }
    setBusy(false);
    setErrors({ form: result.error });
  }

  return (
    <AuthCard
      title="Sign in"
      intro="Sign in to report an issue or follow your requests."
      switchText="New here?"
      switchLabel="Create an account"
      switchHref="/register"
    >
      <form ref={form} onSubmit={onSubmit} noValidate aria-busy={busy} className="flex flex-col gap-5">
        {errors.form && <Notice kind="error" title={errors.form} />}
        <TextField label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextField label="Password" name="password" type="password" required autoComplete="current-password" error={errors.password} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-6">
        <Notice kind="info" title="Prototype sign-in">
          Use any password with a demo email: thandi.mokoena@civicconnect.test (staff), sipho.dlamini@civicconnect.test (manager) or
          demo.requester@civicconnect.test (requester). Real password checks come with the API.
        </Notice>
      </div>
    </AuthCard>
  );
}
