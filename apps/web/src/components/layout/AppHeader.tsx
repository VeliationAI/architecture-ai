"use client";

import { HistoryPanel } from "@/components/studio/HistoryPanel";
import { useStudioStore } from "@/lib/store";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const step = useStudioStore((s) => s.step);
  const reset = useStudioStore((s) => s.reset);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[var(--border-subtle)] glass">
      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--accent)] to-[#5b4cc4] flex items-center justify-center shadow-lg shadow-[var(--accent)]/25 shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="font-semibold text-sm tracking-tight truncate">Architecture AI Studio</h1>
            <p className="text-[11px] text-[var(--muted)] truncate">
              Explainable architecture intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {step === "studio" && (
            <Button size="sm" variant="outline" onClick={reset} className="hidden sm:inline-flex gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New project
            </Button>
          )}
          <HistoryPanel />
        </div>
      </div>
    </header>
  );
}
