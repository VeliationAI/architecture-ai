import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        {
          "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30":
            variant === "primary",
          "bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--foreground)]":
            variant === "secondary",
          "hover:bg-[var(--card-hover)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]":
            variant === "ghost",
          "bg-[var(--danger)] hover:bg-red-500 text-white": variant === "danger",
          "border border-[var(--border)] bg-transparent hover:bg-[var(--card-hover)] text-[var(--foreground)]":
            variant === "outline",
          "h-8 px-3 text-xs gap-1.5": size === "sm",
          "h-10 px-4 text-sm gap-2": size === "md",
          "h-12 px-6 text-base gap-2": size === "lg",
          "h-9 w-9 p-0": size === "icon",
        },
        className
      )}
      {...props}
    />
  );
}
