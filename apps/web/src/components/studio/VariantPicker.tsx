"use client";

import type { DesignVariant, VariantBundle } from "@architecture-ai/core";
import { useStudioStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";

const INTENT_LABELS: Record<string, string> = {
  time_to_market: "Fast delivery",
  governance_reliability: "Governed",
  scale_ai_ready: "Scale / AI",
};

function VariantCard({
  variant,
  isActive,
  isDefault,
  onSelect,
  onAdopt,
}: {
  variant: DesignVariant;
  isActive: boolean;
  isDefault: boolean;
  onSelect: () => void;
  onAdopt: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-[var(--radius-sm)] border p-3.5 transition-all",
        isActive
          ? "border-[var(--accent)] bg-[var(--accent-muted)] shadow-[0_0_0_1px_var(--accent)]"
          : "border-[var(--border-subtle)] bg-[var(--background-elevated)] hover:border-[var(--border)]"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-sm">{variant.title}</p>
          <Badge variant="outline" className="mt-1 text-[10px]">
            {INTENT_LABELS[variant.design_intent] ?? variant.design_intent}
          </Badge>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-[var(--accent-hover)]">{variant.overall_score}</p>
          <p className="text-[10px] text-[var(--muted)]">score</p>
        </div>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2 mb-2">
        {variant.thesis}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-[var(--muted)]">
          {variant.architecture_graph.nodes.length} components
          {variant.data_model
            ? ` · ${variant.data_model.dimensional.facts.length + variant.data_model.dimensional.dimensions.length} tables`
            : ""}
        </span>
        {isDefault && (
          <span className="flex items-center gap-0.5 text-[10px] text-[var(--warning)]">
            <Star className="w-3 h-3" /> Recommended
          </span>
        )}
      </div>
      {isActive && (
        <Button
          size="sm"
          variant="primary"
          className="w-full mt-2.5 gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onAdopt();
          }}
        >
          <Check className="w-3.5 h-3.5" />
          Adopt this design
        </Button>
      )}
    </button>
  );
}

export function VariantPicker({ bundle }: { bundle: VariantBundle }) {
  const activeId = useStudioStore((s) => s.project?.active_variant_id);
  const compareId = useStudioStore((s) => s.compareVariantId);
  const adoptVariant = useStudioStore((s) => s.adoptVariant);
  const setCompareVariant = useStudioStore((s) => s.setCompareVariant);
  const setWorkspaceView = useStudioStore((s) => s.setWorkspaceView);

  const selectedId = compareId ?? activeId ?? bundle.default_recommendation;

  return (
    <div className="p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-1">Design variants</h3>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Three strategic postures for the same requirements. Select to preview, adopt to make active.
        </p>
      </div>
      <div className="space-y-2.5">
        {bundle.variants.map((variant) => (
          <VariantCard
            key={variant.variant_id}
            variant={variant}
            isActive={selectedId === variant.variant_id}
            isDefault={bundle.default_recommendation === variant.variant_id}
            onSelect={() => {
              setCompareVariant(variant.variant_id);
              setWorkspaceView("canvas");
            }}
            onAdopt={() => adoptVariant(variant.variant_id)}
          />
        ))}
      </div>
    </div>
  );
}
