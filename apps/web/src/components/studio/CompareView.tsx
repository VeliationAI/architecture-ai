"use client";

import { useMemo } from "react";
import type { DesignVariant } from "@architecture-ai/core";
import { compareVariants } from "@architecture-ai/core";
import { useStudioStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus } from "lucide-react";

function ScoreDelta({ label, delta }: { label: string; delta: number }) {
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-[var(--muted)] capitalize">{label}</span>
      <span
        className={cn(
          "font-mono font-medium",
          delta > 0 ? "text-[var(--success)]" : delta < 0 ? "text-[var(--danger)]" : "text-[var(--muted)]"
        )}
      >
        {delta > 0 ? "+" : ""}
        {delta}
      </span>
    </div>
  );
}

export function CompareView({
  variants,
  activeId,
}: {
  variants: DesignVariant[];
  activeId: string;
}) {
  const compareId = useStudioStore((s) => s.compareVariantId);
  const setCompareVariant = useStudioStore((s) => s.setCompareVariant);
  const adoptVariant = useStudioStore((s) => s.adoptVariant);
  const updateActiveVariant = useStudioStore((s) => s.updateActiveVariant);
  const mergeSuggestions = useStudioStore((s) => s.project?.variant_bundle.mergeable_suggestions ?? []);

  const compareTargetId = compareId && compareId !== activeId ? compareId : variants.find((v) => v.variant_id !== activeId)?.variant_id;
  const variantA = variants.find((v) => v.variant_id === activeId);
  const variantB = variants.find((v) => v.variant_id === compareTargetId);

  const comparison = useMemo(() => {
    if (!variantA || !variantB) return null;
    return compareVariants(variantA, variantB);
  }, [variantA, variantB]);

  if (!variantA || variants.length < 2) {
    return (
      <div className="p-8 text-center text-sm text-[var(--muted)]">
        Generate a portfolio with multiple variants to compare.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div>
        <h3 className="text-sm font-semibold mb-1">Compare variants</h3>
        <p className="text-xs text-[var(--muted)]">Side-by-side score and component deltas.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => (
          <button
            key={v.variant_id}
            type="button"
            onClick={() => setCompareVariant(v.variant_id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              compareTargetId === v.variant_id || (v.variant_id === activeId && !compareTargetId)
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                : "border-[var(--border-subtle)] text-[var(--muted)] hover:border-[var(--border)]"
            )}
          >
            {v.title} ({v.overall_score})
          </button>
        ))}
      </div>

      {variantB && comparison && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 bg-[var(--background-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">{variantA.title}</p>
              <Badge variant="default">{variantA.overall_score}</Badge>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">{variantA.thesis}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Only in this design</p>
            <ul className="space-y-1">
              {comparison.only_in_a.length === 0 ? (
                <li className="text-xs text-[var(--muted)]">—</li>
              ) : (
                comparison.only_in_a.map((l) => (
                  <li key={l} className="text-xs text-[var(--foreground)]">{l}</li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 bg-[var(--background-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">{variantB.title}</p>
              <Badge variant="default">{variantB.overall_score}</Badge>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">{variantB.thesis}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Only in this design</p>
            <ul className="space-y-1">
              {comparison.only_in_b.length === 0 ? (
                <li className="text-xs text-[var(--muted)]">—</li>
              ) : (
                comparison.only_in_b.map((l) => (
                  <li key={l} className="text-xs text-[var(--foreground)]">{l}</li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {comparison && variantB && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4">
          <p className="text-xs font-semibold mb-3">Score deltas (A − B)</p>
          {Object.entries(comparison.score_deltas).map(([key, delta]) => (
            <ScoreDelta key={key} label={key} delta={delta ?? 0} />
          ))}
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex gap-4 text-xs text-[var(--muted)]">
            <span>Nodes: {comparison.node_count_delta > 0 ? "+" : ""}{comparison.node_count_delta}</span>
            <span>Edges: {comparison.edge_count_delta > 0 ? "+" : ""}{comparison.edge_count_delta}</span>
            <span>Common: {comparison.common_components.length}</span>
          </div>
        </div>
      )}

      {mergeSuggestions.length > 0 && variantB && (
        <div className="space-y-2">
          <p className="text-xs font-semibold">Merge suggestions</p>
          {mergeSuggestions
            .filter((s) => s.source_variant_id === variantB.variant_id)
            .slice(0, 3)
            .map((suggestion) => (
              <div
                key={suggestion.id}
                className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium">{suggestion.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{suggestion.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1"
                  onClick={async () => {
                    const res = await fetch("/api/merge", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        active_variant: variantA,
                        source_variant: variantB,
                        suggestion,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      updateActiveVariant(() => data.variant);
                    }
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Merge
                </Button>
              </div>
            ))}
        </div>
      )}

      {variantB && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => adoptVariant(variantB.variant_id)}
        >
          Adopt {variantB.title}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
