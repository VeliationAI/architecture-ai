"use client";

import type { DesignProject } from "@architecture-ai/core";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { visibleWorkspaceSections } from "./workspace-nav";

export function ProjectNavigator({ project }: { project: DesignProject }) {
  const workspaceView = useStudioStore((s) => s.workspaceView);
  const setWorkspaceView = useStudioStore((s) => s.setWorkspaceView);
  const sections = visibleWorkspaceSections(true);

  return (
    <nav className="w-56 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--card)]/60 flex flex-col min-h-0 hidden lg:flex">
      <div className="p-3 border-b border-[var(--border-subtle)]">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">Project</p>
        <p className="text-xs font-medium line-clamp-2 leading-snug">
          {project.variant_bundle.project_summary.use_case.slice(0, 60)}
        </p>
        <p className="text-[10px] text-[var(--muted)] mt-1 capitalize">
          {project.variant_bundle.project_summary.domain ?? project.variant_bundle.project_summary.platform}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] px-2 py-1 mb-1">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWorkspaceView(id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-all relative text-left",
                    workspaceView === id
                      ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)]"
                  )}
                >
                  {workspaceView === id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-full" />
                  )}
                  <Icon className="w-3.5 h-3.5 shrink-0 ml-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[var(--border-subtle)] text-[10px] text-[var(--muted)]">
        {project.variant_bundle.variants.length} design variants
      </div>
    </nav>
  );
}

export function ProjectNavigatorSimple() {
  const workspaceView = useStudioStore((s) => s.workspaceView);
  const setWorkspaceView = useStudioStore((s) => s.setWorkspaceView);
  const sections = visibleWorkspaceSections(false);

  return (
    <nav className="w-56 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--card)]/60 flex flex-col min-h-0 hidden lg:flex">
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] px-2 py-1 mb-1">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWorkspaceView(id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-all relative text-left",
                    workspaceView === id
                      ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--background-elevated)]"
                  )}
                >
                  {workspaceView === id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-full" />
                  )}
                  <Icon className="w-3.5 h-3.5 shrink-0 ml-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function WorkspaceMobileNav({ hasProject }: { hasProject: boolean }) {
  const workspaceView = useStudioStore((s) => s.workspaceView);
  const setWorkspaceView = useStudioStore((s) => s.setWorkspaceView);
  const sections = visibleWorkspaceSections(hasProject);
  const items = sections.flatMap((s) => s.items);

  return (
    <div className="lg:hidden border-b border-[var(--border-subtle)] bg-[var(--card)]/80 overflow-x-auto shrink-0">
      <div className="flex gap-1 p-2 min-w-max">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkspaceView(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              workspaceView === id
                ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25"
                : "bg-[var(--background-elevated)] text-[var(--muted-foreground)]"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
