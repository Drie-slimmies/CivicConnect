import type { ReactNode } from "react";

const tone = {
  info: "bg-info-soft",
  success: "bg-success-soft",
  error: "bg-danger-soft",
};
const label = { info: "Note", success: "Done", error: "Problem" };

export function Notice({
  kind = "info",
  title,
  children,
}: {
  kind?: keyof typeof tone;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-2xl px-5 py-4 ${tone[kind]}`}>
      <p className="font-medium">
        <span className="sr-only">{label[kind]}: </span>
        {title}
      </p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
