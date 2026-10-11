import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-strong",
  soft: "bg-primary-soft text-ink hover:brightness-95",
  ghost: "border border-line bg-surface text-ink hover:bg-primary-soft",
};

export const buttonClass = (variant: keyof typeof variants = "primary") => `${base} ${variants[variant]}`;

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button type={type} className={`${buttonClass(variant)} ${className}`} {...props} />;
}
