import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldStyles =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition-colors focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldStyles, "resize-y min-h-[88px] leading-relaxed", className)}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label className={cn("block mb-2", className)} {...props}>
      <span className="text-sm font-medium text-[var(--foreground)]">{children}</span>
      {hint && <span className="block text-xs text-[var(--muted)] mt-0.5 font-normal">{hint}</span>}
    </label>
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldStyles, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}
