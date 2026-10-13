"use client";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { postAuth } from "@/lib/auth/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { SuccessPopup } from "@/components/auth/SuccessPopup";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";

type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

export const MIN_PASSWORD = 8;

function validate(name: string, email: string, password: string): Errors {
  const e: Errors = {};
  if (!name) e.name = "Enter your name so staff know who the request is from.";
  else if (name.length > 150) e.name = "Shorten your name to 150 characters or fewer.";
  if (!email) e.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "That does not look like an email address. Check for typing mistakes.";
  else if (email.length > 255) e.email = "Shorten the email to 255 characters or fewer.";
  if (password.length < MIN_PASSWORD) e.password = `Use at least ${MIN_PASSWORD} characters.`;
  else if (password.length > 128) e.password = "Use 128 characters or fewer.";
  return e;
}

export function RegisterForm() {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (busy) return;
    const data = new FormData(ev.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const found = validate(name, email, password);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    const result = await postAuth("register", { name, email, password });
    if (result.ok) {
      setDone(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload so the root layout re-reads the session cookie
      window.location.href = "/requests/new";
      return;
    }
    setBusy(false);
    setErrors(result.errors);
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  return (
    <AuthCard
      title="Create an account"
      intro="It takes a minute. You can then report issues and follow each one until it is done."
      switchText="Already have an account?"
      switchLabel="Sign in"
      switchHref="/login"
    >
      <form ref={form} onSubmit={onSubmit} noValidate aria-busy={busy} className="flex flex-col gap-5">
        {done && <SuccessPopup title="Account created" text="Taking you to the request form…" />}
        {Object.keys(errors).length > 0 && <Notice kind="error" title="Fix the highlighted fields, then try again." />}
        <TextField label="Name" name="name" required autoComplete="name" error={errors.name} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" error={errors.email} />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          error={errors.password}
          hint={`At least ${MIN_PASSWORD} characters.`}
        />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Creating your account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
