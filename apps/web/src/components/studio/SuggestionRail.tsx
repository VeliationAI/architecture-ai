"use client";

import type { ImprovementSuggestion, ReviewFinding } from "@architecture-ai/core";
import { applySuggestion } from "@architecture-ai/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudioStore } from "@/lib/store";
import { Plus, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SuggestionItem = ImprovementSuggestion | ReviewFinding;

const PRIORITY_CONFIG = {
  High: { icon: AlertTriangle, badge: "danger" as const },
  Medium: { icon: Info, badge: "warning" as const },
  Low: { icon: CheckCircle, badge: "success" as const },
  Required: { icon: AlertTriangle, badge: "danger" as const },
  "Strongly Recommended": { icon: Info, badge: "warning" as const },
  Optional: { icon: CheckCircle, badge: "success" as const },
};

function getPriority(item: SuggestionItem): string {
  if ("priority" in item) return item.priority;
  return item.severity;
}

export function SuggestionRail({ suggestions, title }: { suggestions: SuggestionItem[]; title?: string }) {
  const graph = useStudioStore((s) => s.graph);
  const setGraph = useStudioStore((s) => s.setGraph);

  const handleApply = (suggestion: SuggestionItem) => {
    if (!graph) return;
    setGraph(applySuggestion(graph, suggestion), { reflow: true });
  };

  if (!suggestions.length) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
        </div>
        <p className="text-sm font-medium mb-1">Looking good</p>
        <p className="text-xs text-[var(--muted)]">
          No improvements suggested yet. Run a review for platform-specific recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2.5">
      {title && <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider px-1">{title}</h3>}
      {suggestions.map((item) => {
        const priority = getPriority(item);
        const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.Medium;
        const Icon = config.icon;
        const hasSuggestedNode = "suggested_node" in item && item.suggested_node;
        const changeText = "add_or_change" in item ? item.add_or_change : item.what_to_change;

        return (
          <div
            key={item.id}
            className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--background-elevated)] p-3.5 space-y-2.5 hover:border-[var(--border)] transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[var(--card)] flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm leading-snug">{item.title}</p>
                  <Badge variant={config.badge} className="shrink-0">{priority}</Badge>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{changeText}</p>
              </div>
            </div>

            <details className="group">
              <summary className="text-[11px] text-[var(--accent)] cursor-pointer hover:underline list-none flex items-center gap-1">
                Why this matters
              </summary>
              <div className="mt-2 space-y-1.5 text-[11px] text-[var(--muted-foreground)] pl-2 border-l border-[var(--border)]">
                <p><span className="text-[var(--muted)]">Why: </span>{"reason" in item ? item.reason : item.why}</p>
                <p><span className="text-[var(--muted)]">Benefit: </span>{item.benefit}</p>
                <p><span className="text-[var(--muted)]">Tradeoff: </span>{item.tradeoff}</p>
              </div>
            </details>

            {hasSuggestedNode && (
              <Button
                size="sm"
                variant="outline"
                className={cn("w-full gap-1.5")}
                onClick={() => handleApply(item)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add to canvas
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
