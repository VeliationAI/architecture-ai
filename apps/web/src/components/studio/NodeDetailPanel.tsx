"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, BookOpen } from "lucide-react";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { resolveServiceIcon } from "@architecture-ai/catalog";

export function NodeDetailPanel() {
  const selectedNodeId = useStudioStore((s) => s.selectedNodeId);
  const graph = useStudioStore((s) => s.graph);
  const nodeExplanation = useStudioStore((s) => s.nodeExplanation);
  const isExplaining = useStudioStore((s) => s.isExplaining);
  const setIsExplaining = useStudioStore((s) => s.setIsExplaining);
  const setNodeExplanation = useStudioStore((s) => s.setNodeExplanation);
  const setSelectedNodeId = useStudioStore((s) => s.setSelectedNodeId);
  const getRationale = useStudioStore((s) => s.getRationale);

  const node = graph?.nodes.find((n) => n.id === selectedNodeId);
  const rationale = selectedNodeId ? getRationale(selectedNodeId) : undefined;

  useEffect(() => {
    if (rationale) setNodeExplanation(null);
  }, [selectedNodeId, rationale, setNodeExplanation]);

  const handleExplain = async () => {
    if (!graph || !selectedNodeId) return;
    setIsExplaining(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph, nodeId: selectedNodeId }),
      });
      const data = await res.json();
      if (res.ok) setNodeExplanation(data.explanation);
    } finally {
      setIsExplaining(false);
    }
  };

  if (!node) return null;

  const iconMeta = resolveServiceIcon({
    componentId: node.id,
    label: node.label,
    platform: node.platform,
    category: node.category,
  });

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <ServiceIcon src={iconMeta.src} alt={iconMeta.alt} size={40} />
          <div>
          <h3 className="font-semibold text-sm">{node.label}</h3>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <Badge variant="outline" className="capitalize">{node.category}</Badge>
            <Badge variant="outline">{node.platform}</Badge>
            <Badge
              variant={
                node.required_level === "required" ? "danger" :
                node.required_level === "recommended" ? "warning" : "success"
              }
              className="capitalize"
            >
              {node.required_level}
            </Badge>
          </div>
          </div>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1.5 rounded-md hover:bg-[var(--card-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{node.description}</p>

      {rationale ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailCard label="Purpose" value={rationale.purpose} />
          <DetailCard label="Why needed" value={rationale.why_needed} />
          <DetailCard label="Expected benefit" value={rationale.expected_benefit} />
          <DetailCard label="Implementation" value={rationale.implementation_note} />
          {rationale.risk_if_omitted && (
            <DetailCard label="Risk if omitted" value={rationale.risk_if_omitted} className="sm:col-span-2" />
          )}
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={handleExplain} disabled={isExplaining} className="gap-1.5">
          {isExplaining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <BookOpen className="w-3.5 h-3.5" />
          )}
          Explain this component
        </Button>
      )}

      {nodeExplanation && (
        <div className="text-sm whitespace-pre-wrap bg-[var(--background-elevated)] rounded-[var(--radius-sm)] p-3.5 border border-[var(--border-subtle)] leading-relaxed">
          {nodeExplanation}
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`p-3 rounded-[var(--radius-sm)] bg-[var(--background-elevated)] border border-[var(--border-subtle)] ${className ?? ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">{label}</p>
      <p className="text-xs text-[var(--foreground)] leading-relaxed">{value}</p>
    </div>
  );
}
