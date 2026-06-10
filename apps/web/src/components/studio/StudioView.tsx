"use client";

import { useState, useMemo } from "react";
import { useStudioStore } from "@/lib/store";
import { ArchitectureCanvas } from "./ArchitectureCanvas";
import { SuggestionRail } from "./SuggestionRail";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { ReviewScores } from "./ReviewScores";
import { ExportPanel } from "./ExportPanel";
import { PlatformKnowledgeBadge } from "./PlatformKnowledgeBadge";
import { ProjectNavigator } from "./ProjectNavigator";
import { VariantPicker } from "./VariantPicker";
import { CompareView } from "./CompareView";
import { ModelView } from "./ModelView";
import { ApprovalPanel } from "./ApprovalPanel";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Shield,
  PanelRightOpen,
  PanelRightClose,
  Lightbulb,
  ListChecks,
  AlertTriangle,
  LayoutGrid,
} from "lucide-react";
import { relayoutGraph, getActiveVariant } from "@architecture-ai/core";
import { cn } from "@/lib/utils";

type SideTab = "variants" | "suggestions" | "review" | "summary" | "export" | "approve";

export function StudioView() {
  const project = useStudioStore((s) => s.project);
  const graph = useStudioStore((s) => s.graph);
  const generation = useStudioStore((s) => s.generation);
  const review = useStudioStore((s) => s.review);
  const input = useStudioStore((s) => s.input);
  const selectedNodeId = useStudioStore((s) => s.selectedNodeId);
  const isReviewing = useStudioStore((s) => s.isReviewing);
  const setReview = useStudioStore((s) => s.setReview);
  const setGraph = useStudioStore((s) => s.setGraph);
  const layoutKey = useStudioStore((s) => s.layoutKey);
  const reset = useStudioStore((s) => s.reset);
  const setIsReviewing = useStudioStore((s) => s.setIsReviewing);
  const workArea = useStudioStore((s) => s.workArea);
  const studioMode = useStudioStore((s) => s.studioMode);
  const compareVariantId = useStudioStore((s) => s.compareVariantId);
  const setWorkArea = useStudioStore((s) => s.setWorkArea);
  const setStudioMode = useStudioStore((s) => s.setStudioMode);

  const [sideTab, setSideTab] = useState<SideTab>(project ? "variants" : "suggestions");
  const [panelOpen, setPanelOpen] = useState(true);

  const previewVariant = useMemo(() => {
    if (!project) return undefined;
    const previewId = compareVariantId ?? project.active_variant_id;
    return project.variant_bundle.variants.find((v) => v.variant_id === previewId);
  }, [project, compareVariantId]);

  const displayGraph = previewVariant?.architecture_graph ?? graph;
  const activeVariant = project ? getActiveVariant(project) : undefined;
  const dataModel = previewVariant?.data_model ?? activeVariant?.data_model;

  const handleReview = async () => {
    if (!displayGraph) return;
    setIsReviewing(true);
    setSideTab("review");
    setStudioMode("review");
    setPanelOpen(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph: displayGraph, input }),
      });
      const data = await res.json();
      if (res.ok) {
        setReview(data);
        if (data.graph) setGraph(data.graph);
      }
    } finally {
      setIsReviewing(false);
    }
  };

  if (!displayGraph) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-4 p-6 text-center">
        <p className="text-sm text-[var(--muted)]">No architecture loaded for this session.</p>
        <Button variant="primary" onClick={reset}>
          Start new architecture
        </Button>
      </div>
    );
  }

  const suggestions = [
    ...(generation?.improvement_suggestions ?? []),
    ...(displayGraph.suggestions ?? []),
    ...(review?.findings ?? []),
    ...(activeVariant?.improvement_suggestions ?? []),
  ];
  const uniqueSuggestions = suggestions.filter(
    (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
  );

  const isPreviewingOther =
    project &&
    compareVariantId &&
    compareVariantId !== project.active_variant_id;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] animate-fade-in">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--card)]/80">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-sm truncate">{displayGraph.title ?? "Architecture"}</h2>
            <Badge variant="outline" className="capitalize shrink-0">{displayGraph.platform}</Badge>
            <Badge variant="default" className="shrink-0">{displayGraph.nodes.length} components</Badge>
            {isPreviewingOther && (
              <Badge variant="warning" className="shrink-0">Preview</Badge>
            )}
            {project && (
              <Badge variant="outline" className="shrink-0 capitalize">
                {project.approval.status.replace(/_/g, " ")}
              </Badge>
            )}
            <PlatformKnowledgeBadge platform={displayGraph.platform} />
          </div>
          {(previewVariant?.thesis ?? generation?.architecture_summary) && (
            <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1 hidden md:block">
              {previewVariant?.thesis ?? generation?.architecture_summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setGraph(relayoutGraph(displayGraph), { reflow: true })}
            className="gap-1.5"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arrange</span>
          </Button>
          <Button size="sm" variant="primary" onClick={handleReview} disabled={isReviewing} className="gap-1.5">
            {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Review</span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPanelOpen(!panelOpen)}
            className="lg:hidden"
          >
            {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {project && <ProjectNavigator project={project} />}

        <div className="flex-1 flex flex-col min-w-0">
          {workArea === "architecture" && (
            <div className="flex-1 p-3 sm:p-4 min-h-0 relative">
              <ArchitectureCanvas graph={displayGraph} layoutKey={layoutKey} />
              <div className="absolute bottom-6 left-6 hidden sm:flex gap-3 p-2 rounded-[var(--radius-sm)] glass border border-[var(--border-subtle)] text-[10px] text-[var(--muted)]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/80" /> Required</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/80" /> Recommended</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/80" /> Optional</span>
              </div>
            </div>
          )}

          {workArea === "compare" && project && (
            <CompareView
              variants={project.variant_bundle.variants}
              activeId={project.active_variant_id}
            />
          )}

          {workArea === "model" && dataModel && <ModelView model={dataModel} />}
          {workArea === "model" && !dataModel && (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--muted)] p-8">
              No data model for this variant yet.
            </div>
          )}

          {workArea === "architecture" && selectedNodeId && (
            <div className="border-t border-[var(--border-subtle)] bg-[var(--card)] max-h-[35vh] overflow-hidden animate-slide-up">
              <NodeDetailPanel />
            </div>
          )}
        </div>

        <aside
          className={cn(
            "border-l border-[var(--border-subtle)] bg-[var(--card)] flex flex-col min-h-0 transition-all duration-300",
            "fixed lg:relative inset-y-0 right-0 z-30 lg:z-auto",
            panelOpen ? "w-full sm:w-96 translate-x-0" : "w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
          )}
        >
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <Tabs
              tabs={[
                ...(project ? [{ id: "variants", label: "Variants", count: project.variant_bundle.variants.length }] : []),
                { id: "suggestions", label: "Improve", count: uniqueSuggestions.length },
                { id: "review", label: "Review", count: review ? 1 : 0 },
                ...(project ? [{ id: "approve", label: "Approve" }] : []),
                { id: "summary", label: "Summary" },
                { id: "export", label: "Export" },
              ]}
              active={sideTab}
              onChange={(id) => {
                setSideTab(id as SideTab);
                if (id === "approve") setStudioMode("approve");
                if (id === "variants") setWorkArea("architecture");
              }}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {sideTab === "variants" && project && (
              <VariantPicker bundle={project.variant_bundle} />
            )}
            {sideTab === "suggestions" && <SuggestionRail suggestions={uniqueSuggestions} />}
            {sideTab === "review" && (
              review ? (
                <ReviewScores review={review} />
              ) : (
                <EmptyPanel
                  icon={Shield}
                  title="No review yet"
                  desc="Run a well-architected review to score your design."
                  action={
                    <Button size="sm" onClick={handleReview} disabled={isReviewing} className="gap-1.5 mt-3">
                      {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                      Run review
                    </Button>
                  }
                />
              )
            )}
            {sideTab === "approve" && project && <ApprovalPanel project={project} />}
            {sideTab === "summary" && (
              <div className="p-4 space-y-4">
                {project?.variant_bundle.risks_and_gaps && project.variant_bundle.risks_and_gaps.length > 0 && (
                  <SummarySection icon={AlertTriangle} title="Risks & gaps" items={project.variant_bundle.risks_and_gaps} />
                )}
                {(project?.variant_bundle.next_best_actions ?? generation?.next_best_actions)?.length ? (
                  <SummarySection
                    icon={ListChecks}
                    title="Next actions"
                    items={project?.variant_bundle.next_best_actions ?? generation?.next_best_actions ?? []}
                  />
                ) : null}
                {previewVariant?.key_tradeoffs && previewVariant.key_tradeoffs.length > 0 && (
                  <SummarySection icon={Lightbulb} title="Key tradeoffs" items={previewVariant.key_tradeoffs} />
                )}
              </div>
            )}
            {sideTab === "export" && (
              <ExportPanel graph={displayGraph} dataModel={dataModel} />
            )}
          </div>
        </aside>

        {panelOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setPanelOpen(false)} />
        )}
      </div>
    </div>
  );
}

function SummarySection({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof AlertTriangle;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-[var(--muted-foreground)] pl-3 border-l-2 border-[var(--border)] leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: typeof Shield;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
      {action}
    </div>
  );
}
