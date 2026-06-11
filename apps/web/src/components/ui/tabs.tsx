"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--background-elevated)] overflow-x-auto scrollbar-none",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap",
            active === tab.id
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border-subtle)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50"
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
                active === tab.id ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]" : "opacity-70"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
