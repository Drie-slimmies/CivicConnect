import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Common = { label: string; hint?: string; error?: string; optional?: boolean };

const control = (error?: string) =>
  `min-h-11 w-full rounded-xl border bg-surface px-4 py-3 text-ink placeholder:text-muted ${
    error ? "border-danger" : "border-line"
  }`;

function Shell({ id, label, hint, error, optional, children }: Common & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5v4M8 11v.01" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function aria(id: string, hint?: string, error?: string, required?: boolean) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-required": required ? true : undefined,
    "aria-describedby": [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined,
  } as const;
}

export function TextField({ label, hint, error, optional, required, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
      <input {...aria(id, hint, error, required)} className={control(error)} {...rest} />
    </Shell>
  );
}

export function TextArea({ label, hint, error, optional, required, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea rows={5} {...aria(id, hint, error, required)} className={control(error)} {...rest} />
    </Shell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  required,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select {...aria(id, hint, error, required)} className={control(error)} {...rest}>
        {children}
      </select>
    </Shell>
  );
}
