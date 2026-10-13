"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CATEGORIES } from "@/lib/dto";
import { Button, buttonClass } from "@/components/ui/Button";
import { SelectField, TextArea, TextField } from "@/components/ui/Fields";
import { Notice } from "@/components/ui/Notice";
import { TicketStub } from "@/components/ui/TicketStub";

type Errors = Partial<Record<"title" | "category" | "location" | "description", string>>;

function validate(f: FormData): Errors {
  const get = (k: string) => String(f.get(k) ?? "").trim();
  const e: Errors = {};
  if (!get("title")) e.title = 'Give your request a short title, for example "Pothole outside the school".';
  else if (get("title").length > 120) e.title = "Shorten the title to 120 characters or fewer.";
  if (!get("category")) e.category = "Choose a category so the right team sees your request.";
  if (!get("location")) e.location = "Tell us where the problem is, for example a street name or landmark.";
  else if (get("location").length > 200) e.location = "Shorten the location to 200 characters or fewer.";
  if (get("description").length < 10) e.description = "Describe the problem in at least 10 characters so the team knows what to look for.";
  else if (get("description").length > 2000) e.description = "Shorten the description to 2000 characters or fewer.";
  return e;
}

const newId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "CC-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export function RequestForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<"idle" | "sending" | "done">("idle");
  const [id, setId] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "done") done.current?.focus();
  }, [phase]);

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (phase === "sending") return; // controls repeat submission
    const found = validate(new FormData(ev.currentTarget));
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setPhase("sending");
    // Prototype: replace with POST /api/requests once the contract exists.
    setTimeout(() => {
      setId(newId());
      setPhase("done");
    }, 800);
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
        <Notice kind="info" title="Prototype note">
          Nothing is saved yet, so this ID will not be found on the tracking page until the API is connected.
        </Notice>
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
      {Object.keys(errors).length > 0 && (
        <Notice kind="error" title="Fix the highlighted fields, then send again." />
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
