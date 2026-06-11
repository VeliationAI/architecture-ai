"use client";

import { HistoryPanel } from "@/components/studio/HistoryPanel";
import { useStudioStore } from "@/lib/store";
import { Layers, Plus, Github, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/VeliationAI/architecture-ai";

export function AppHeader() {
  const step = useStudioStore((s) => s.step);
  const reset = useStudioStore((s) => s.reset);
  const graph = useStudioStore((s) => s.graph);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[var(--border-subtle)] glass">
      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 gap-3">
        <button
          type="button"
          onClick={step === "studio" ? reset : undefined}
          className={cn(
            "flex items-center gap-3 min-w-0 group text-left",
            step === "studio" && "cursor-pointer"
          )}
          aria-label={step === "studio" ? "Back to home" : "Architecture AI Studio"}
        >
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--accent)] to-[#5b4cc4] flex items-center justify-center shadow-lg shadow-[var(--accent)]/25 shrink-0 group-hover:shadow-[var(--accent)]/40 transition-shadow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm tracking-tight truncate group-hover:text-[var(--accent-hover)] transition-colors">
                Architecture AI Studio
              </h1>
              <Badge variant="success" className="hidden md:inline-flex text-[9px] px-1.5 py-0">
                Open source
              </Badge>
            </div>
            <p className="text-[11px] text-[var(--muted)] truncate">
              {step === "studio" && graph?.title ? graph.title : "Explainable architecture intelligence"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {step === "studio" ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={reset}
                className="hidden sm:inline-flex gap-1.5 text-[var(--muted-foreground)]"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Button>
              <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">New</span>
              </Button>
            </>
          ) : (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          )}
          <HistoryPanel />
        </div>
      </div>
    </header>
  );
}
