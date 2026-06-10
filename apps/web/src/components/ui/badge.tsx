import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "outline";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        {
          "bg-[var(--background-elevated)] text-[var(--muted-foreground)]": variant === "default",
          "bg-[var(--accent-muted)] text-[var(--accent-hover)]": variant === "accent",
          "bg-emerald-500/10 text-emerald-400": variant === "success",
          "bg-amber-500/10 text-amber-400": variant === "warning",
          "bg-red-500/10 text-red-400": variant === "danger",
          "border border-[var(--border)] text-[var(--muted-foreground)]": variant === "outline",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
