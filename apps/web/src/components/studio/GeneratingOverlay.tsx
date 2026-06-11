"use client";

import { Loader2, Sparkles, GitBranch, Shield, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Sparkles, label: "Analyzing requirements" },
  { icon: Layers, label: "Generating design variants" },
  { icon: GitBranch, label: "Building architecture graph" },
  { icon: Shield, label: "Applying best practices" },
];

export function GeneratingOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Generating architecture"
    >
      <div className="card-glow rounded-[var(--radius)] p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-[var(--accent)]/20 animate-pulse-glow" />
          </div>

          <h3 className="text-lg font-semibold mb-1">Generating your architecture</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-8 max-w-xs">
            Creating multiple design variants with scores, rationale, and platform-native patterns.
          </p>

          <ul className="w-full space-y-3 text-left">
            {STEPS.map(({ icon: Icon, label }, i) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm transition-all duration-500",
                  i === 0 ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]" : "text-[var(--muted)]"
                )}
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
                {i === 0 && <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin opacity-70" />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
