"use client";

import type { DesignProject } from "@architecture-ai/core";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Layers,
  GitCompare,
  Database,
  Shield,
  FileOutput,
  Sparkles,
} from "lucide-react";

const MODES = [
  { id: "compare" as const, label: "Variants", icon: Layers },
  { id: "review" as const, label: "Review", icon: Shield },
  { id: "approve" as const, label: "Approve", icon: Shield },
  { id: "export" as const, label: "Export", icon: FileOutput },
];

const AREAS = [
  { id: "architecture" as const, label: "Architecture", icon: Sparkles },
  { id: "compare" as const, label: "Compare", icon: GitCompare },
  { id: "model" as const, label: "Model", icon: Database },
];

export function ProjectNavigator({ project }: { project: DesignProject }) {
  const workArea = useStudioStore((s) => s.workArea);
  const studioMode = useStudioStore((s) => s.studioMode);
  const setWorkArea = useStudioStore((s) => s.setWorkArea);
  const setStudioMode = useStudioStore((s) => s.setStudioMode);

  return (
    <nav className="w-52 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--card)]/60 flex flex-col min-h-0 hidden lg:flex">
      <div className="p-3 border-b border-[var(--border-subtle)]">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">Project</p>
        <p className="text-xs font-medium line-clamp-2 leading-snug">
          {project.variant_bundle.project_summary.use_case.slice(0, 60)}
        </p>
        <p className="text-[10px] text-[var(--muted)] mt-1 capitalize">
          {project.variant_bundle.project_summary.domain ?? project.variant_bundle.project_summary.platform}
        </p>
      </div>

      <div className="p-2 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] px-2 py-1">Work area</p>
        {AREAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkArea(id)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors",
              workArea === id
                ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)]"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-2 space-y-1 border-t border-[var(--border-subtle)]">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] px-2 py-1">Mode</p>
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setStudioMode(id)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors",
              studioMode === id
                ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)]"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-auto p-3 border-t border-[var(--border-subtle)] text-[10px] text-[var(--muted)]">
        {project.variant_bundle.variants.length} design variants
      </div>
    </nav>
  );
}
