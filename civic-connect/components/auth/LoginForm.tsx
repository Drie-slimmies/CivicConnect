"use client";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ROLE_HOME } from "@/lib/dto";
import { postAuth } from "@/lib/auth/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { SuccessPopup } from "@/components/auth/SuccessPopup";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";

type Errors = Partial<Record<"email" | "password" | "form", string>>;

export function LoginForm() {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

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
    const result = await postAuth("login", { email, password });
    if (result.ok) {
      setDone(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.location.href = ROLE_HOME[result.role];
      return;
    }
    setBusy(false);
    setErrors(result.errors);
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
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
        {done && <SuccessPopup title="Signed in" text="Taking you to your page…" />}
        {errors.form && <Notice kind="error" title={errors.form} />}
        <TextField label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextField label="Password" name="password" type="password" required autoComplete="current-password" error={errors.password} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
