"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CATEGORIES } from "@/lib/dto";
import { readFields, validateRequest, type RequestErrors } from "@/lib/requests/rules";
import { Button, buttonClass } from "@/components/ui/Button";
import { SelectField, TextArea, TextField } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";
import { TicketStub } from "@/components/ui/TicketStub";

export function RequestForm() {
  const [errors, setErrors] = useState<RequestErrors>({});
  const [phase, setPhase] = useState<"idle" | "sending" | "done">("idle");
  const [id, setId] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "done") done.current?.focus();
  }, [phase]);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (phase === "sending") return;
    const data = new FormData(ev.currentTarget);
    const fields = readFields((key) => data.get(key));
    const found = validateRequest(fields);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setPhase("sending");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.trackingId) {
        setId(body.trackingId);
        setPhase("done");
        return;
      }
      setErrors(body?.errors ?? { form: "Something went wrong. Please try again." });
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    }
    setPhase("idle");
  }

  if (phase === "done") {
    return (
      <div ref={done} tabIndex={-1} className="flex flex-col gap-6 outline-none">
        <Notice kind="success" title="We have your request.">
          Keep your tracking ID. You can use it to check progress at any time.
        </Notice>
        <TicketStub id={id}>
          <p className="text-muted">Status</p>
          <p className="font-display text-xl font-semibold">Submitted</p>
        </TicketStub>
        <div className="flex flex-wrap gap-3">
          <Link href="/requests" className={buttonClass("primary")}>
            See my requests
          </Link>
          <Button variant="ghost" onClick={() => setPhase("idle")}>
            Report another issue
          </Button>
        </div>
      </div>
    );
  }

  const sending = phase === "sending";
  return (
    <form ref={form} onSubmit={onSubmit} noValidate aria-busy={sending} className="flex flex-col gap-6">
      {errors.form ? (
        <Notice kind="error" title={errors.form} />
      ) : (
        Object.keys(errors).length > 0 && <Notice kind="error" title="Fix the highlighted fields, then send again." />
      )}
      <TextField label="Title" name="title" required autoComplete="off" error={errors.title} hint="A few words that describe the problem." />
      <SelectField label="Category" name="category" required defaultValue="" error={errors.category}>
        <option value="" disabled>
          Choose a category
        </option>
        {CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </SelectField>
      <TextField label="Location" name="location" required autoComplete="street-address" error={errors.location} hint="Street name, landmark or nearest address." />
      <TextArea label="What is happening?" name="description" required error={errors.description} hint="Say what you see and how it affects people." />
      <div>
        <Button type="submit" disabled={sending}>
          {sending ? "Sending your request…" : "Send request"}
        </Button>
      </div>
    </form>
  );
}
