import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ArchitectureGraph,
  CustomerInput,
  GenerationResult,
  ReviewResult,
  ComponentRationale,
  DesignProject,
  PortfolioResult,
  DesignVariant,
  StudioMode,
  WorkArea,
} from "@architecture-ai/core";
import {
  adoptVariant,
  getActiveVariant,
  variantToGenerationResult,
  updateActiveVariant,
  relayoutGraph,
} from "@architecture-ai/core";
import {
  createHistoryEntryFromPortfolio,
  updateHistoryEntry,
  type HistoryEntry,
} from "./history";

export type { StudioMode, WorkArea };

/** Single workspace view — left nav opens content in the main center panel */
export type WorkspaceView =
  | "canvas"
  | "variants"
  | "compare"
  | "model"
  | "improve"
  | "review"
  | "approve"
  | "summary"
  | "export";

function upsertHistory(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const index = history.findIndex((h) => h.id === entry.id);
  if (index === -1) return [entry, ...history];
  const next = [...history];
  next[index] = entry;
  return next;
}

interface StudioState {
  step: "intake" | "studio";
  input: CustomerInput | null;
  project: DesignProject | null;
  generation: GenerationResult | null;
  graph: ArchitectureGraph | null;
  review: ReviewResult | null;
  history: HistoryEntry[];
  activeHistoryId: string | null;
  selectedNodeId: string | null;
  selectedTableId: string | null;
  compareVariantId: string | null;
  nodeExplanation: string | null;
  isGenerating: boolean;
  isReviewing: boolean;
  isExplaining: boolean;
  layoutKey: number;
  workspaceView: WorkspaceView;
  /** @deprecated legacy — kept for persisted state migration */
  studioMode?: StudioMode;
  workArea?: WorkArea;
  _hasHydrated: boolean;

  setStep: (step: "intake" | "studio") => void;
  setInput: (input: CustomerInput) => void;
  setPortfolio: (result: PortfolioResult) => void;
  setGeneration: (result: GenerationResult) => void;
  setGraph: (graph: ArchitectureGraph, options?: { reflow?: boolean }) => void;
  setProject: (project: DesignProject) => void;
  adoptVariant: (variantId: string) => void;
  updateActiveVariant: (updater: (v: DesignVariant) => DesignVariant) => void;
  setCompareVariant: (id: string | null) => void;
  setWorkspaceView: (view: WorkspaceView) => void;
  /** @deprecated use setWorkspaceView */
  setStudioMode: (mode: StudioMode) => void;
  /** @deprecated use setWorkspaceView */
  setWorkArea: (area: WorkArea) => void;
  bumpLayoutKey: () => void;
  setReview: (review: ReviewResult | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedTableId: (id: string | null) => void;
  setNodeExplanation: (text: string | null) => void;
  setIsGenerating: (v: boolean) => void;
  setIsReviewing: (v: boolean) => void;
  setIsExplaining: (v: boolean) => void;
  getActiveVariant: () => DesignVariant | undefined;
  getRationale: (nodeId: string) => ComponentRationale | undefined;
  loadHistory: (id: string) => void;
  deleteHistory: (id: string) => void;
  reset: () => void;
  setHasHydrated: (v: boolean) => void;
}

function syncFromProject(project: DesignProject): Pick<
  StudioState,
  "project" | "graph" | "generation"
> {
  const active = getActiveVariant(project);
  return {
    project,
    graph: active?.architecture_graph ?? null,
    generation: active
      ? variantToGenerationResult(active, project.variant_bundle)
      : null,
  };
}

function historyPatchFromSync(
  synced: ReturnType<typeof syncFromProject>
): Partial<Pick<HistoryEntry, "project" | "graph" | "generation">> {
  return {
    project: synced.project,
    ...(synced.graph ? { graph: synced.graph } : {}),
    ...(synced.generation ? { generation: synced.generation } : {}),
  };
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      step: "intake",
      input: null,
      project: null,
      generation: null,
      graph: null,
      review: null,
      history: [],
      activeHistoryId: null,
      selectedNodeId: null,
      selectedTableId: null,
      compareVariantId: null,
      nodeExplanation: null,
      isGenerating: false,
      isReviewing: false,
      isExplaining: false,
      _hasHydrated: false,
      layoutKey: 0,
      workspaceView: "canvas",

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      bumpLayoutKey: () => set((s) => ({ layoutKey: s.layoutKey + 1 })),

      setStep: (step) => set({ step }),
      setInput: (input) => set({ input }),

      setPortfolio: (result) => {
        const { input, history } = get();
        const entry = createHistoryEntryFromPortfolio(input!, result);
        const synced = syncFromProject(result.project);
        set({
          ...synced,
          review: null,
          step: "studio",
          activeHistoryId: entry.id,
          history: upsertHistory(history, entry),
          selectedNodeId: null,
          selectedTableId: null,
          compareVariantId: null,
          nodeExplanation: null,
          layoutKey: get().layoutKey + 1,
          workspaceView: "variants",
        });
      },

      setProject: (project) => {
        const { history, activeHistoryId } = get();
        const synced = syncFromProject(project);
        const entry = history.find((h) => h.id === activeHistoryId);
        if (entry) {
          set({
            ...synced,
            history: upsertHistory(history, updateHistoryEntry(entry, { project })),
          });
        } else {
          set(synced);
        }
      },

      adoptVariant: (variantId) => {
        const { project, history, activeHistoryId } = get();
        if (!project) return;
        const updated = adoptVariant(project, variantId);
        const synced = syncFromProject(updated);
        const entry = history.find((h) => h.id === activeHistoryId);
        set({
          ...synced,
          compareVariantId: null,
          selectedNodeId: null,
          layoutKey: get().layoutKey + 1,
          history: entry
            ? upsertHistory(history, updateHistoryEntry(entry, { project: updated, ...historyPatchFromSync(synced) }))
            : history,
        });
      },

      updateActiveVariant: (updater) => {
        const { project, history, activeHistoryId } = get();
        if (!project) return;
        const updatedProject = updateActiveVariant(project, updater);
        const synced = syncFromProject(updatedProject);
        const entry = history.find((h) => h.id === activeHistoryId);
        set({
          ...synced,
          project: updatedProject,
          history: entry
            ? upsertHistory(
                history,
                updateHistoryEntry(entry, { project: updatedProject, ...historyPatchFromSync(synced) })
              )
            : history,
        });
      },

      setGeneration: (result) => {
        const { input, history } = get();
        if (!input) {
          set({ generation: result, graph: result.graph, step: "studio" });
          return;
        }
        const entry = createHistoryEntryFromPortfolio(input, {
          project: {
            id: result.graph.id ?? `arch-${Date.now()}`,
            requirements: { ...input, classified_intents: [] },
            variant_bundle: {
              project_summary: {
                use_case: input.business_goal,
                platform: input.platform_preference,
              },
              variants: [
                {
                  variant_id: "single",
                  title: result.graph.title ?? "Architecture",
                  design_intent: "time_to_market",
                  thesis: result.recommended_architecture,
                  overall_score: 80,
                  category_scores: {
                    security: 75,
                    reliability: 75,
                    performance: 75,
                    cost: 80,
                    operations: 75,
                    governance: 75,
                    explainability: 85,
                  },
                  architecture_graph: result.graph,
                  component_rationale: result.component_rationale,
                  improvement_suggestions: result.improvement_suggestions,
                  key_tradeoffs: [],
                  recommended_for: [],
                  not_ideal_for: [],
                },
              ],
              default_recommendation: "single",
              mergeable_suggestions: [],
              architecture_summary: result.architecture_summary,
              risks_and_gaps: result.risks_and_gaps,
              next_best_actions: result.next_best_actions,
            },
            active_variant_id: "single",
            approval: { status: "draft", comments: [], assumptions_pending: [] },
          },
        });
        set({
          project: entry.project,
          generation: result,
          graph: result.graph,
          review: null,
          step: "studio",
          activeHistoryId: entry.id,
          history: upsertHistory(history, entry),
          selectedNodeId: null,
          nodeExplanation: null,
          layoutKey: get().layoutKey + 1,
        });
      },

      setGraph: (graph, options) => {
        const { project, history, activeHistoryId, layoutKey } = get();
        const nextLayoutKey = options?.reflow ? layoutKey + 1 : layoutKey;

        if (project) {
          const updatedProject = updateActiveVariant(project, (v) => ({
            ...v,
            architecture_graph: options?.reflow ? relayoutGraph(graph) : graph,
          }));
          const synced = syncFromProject(updatedProject);
          const entry = history.find((h) => h.id === activeHistoryId);
          set({
            ...synced,
            layoutKey: nextLayoutKey,
            history: entry
              ? upsertHistory(
                  history,
                  updateHistoryEntry(entry, { project: updatedProject, ...historyPatchFromSync(synced) })
                )
              : history,
          });
          return;
        }

        const entry = history.find((h) => h.id === activeHistoryId);
        if (entry) {
          set({
            graph,
            history: upsertHistory(history, updateHistoryEntry(entry, { graph })),
            layoutKey: nextLayoutKey,
          });
        } else {
          set({ graph, layoutKey: nextLayoutKey });
        }
      },

      setReview: (review) => {
        const { history, activeHistoryId } = get();
        const entry = history.find((h) => h.id === activeHistoryId);
        if (entry && review) {
          set({
            review,
            history: upsertHistory(history, updateHistoryEntry(entry, { review })),
          });
        } else {
          set({ review });
        }
      },

      setCompareVariant: (id) => set({ compareVariantId: id }),

      setWorkspaceView: (view) => set({ workspaceView: view }),

      setStudioMode: (mode) => {
        const map: Record<StudioMode, WorkspaceView> = {
          generate: "improve",
          compare: "variants",
          review: "review",
          approve: "approve",
          export: "export",
        };
        set({ workspaceView: map[mode] });
      },

      setWorkArea: (area) => {
        const map: Record<WorkArea, WorkspaceView> = {
          architecture: "canvas",
          compare: "compare",
          model: "model",
        };
        set({ workspaceView: map[area] });
      },

      setSelectedNodeId: (id) => set({ selectedNodeId: id, nodeExplanation: null }),
      setSelectedTableId: (id) => set({ selectedTableId: id }),
      setNodeExplanation: (text) => set({ nodeExplanation: text }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      setIsReviewing: (v) => set({ isReviewing: v }),
      setIsExplaining: (v) => set({ isExplaining: v }),

      getActiveVariant: () => {
        const { project } = get();
        return project ? getActiveVariant(project) : undefined;
      },

      getRationale: (nodeId) => {
        const { generation, graph, project } = get();
        const variant = project ? getActiveVariant(project) : undefined;
        return (
          variant?.component_rationale.find((r) => r.node_id === nodeId) ??
          generation?.component_rationale.find((r) => r.node_id === nodeId) ??
          graph?.rationales?.find((r) => r.node_id === nodeId)
        );
      },

      loadHistory: (id) => {
        const entry = get().history.find((h) => h.id === id);
        if (!entry) return;
        set({
          step: "studio",
          input: entry.input,
          project: entry.project,
          generation: entry.generation,
          graph: entry.graph,
          review: entry.review,
          activeHistoryId: entry.id,
          selectedNodeId: null,
          selectedTableId: null,
          compareVariantId: null,
          nodeExplanation: null,
          workspaceView: entry.project ? "canvas" : "canvas",
        });
      },

      deleteHistory: (id) => {
        const { history, activeHistoryId } = get();
        const nextHistory = history.filter((h) => h.id !== id);
        if (activeHistoryId === id) {
          set({
            history: nextHistory,
            step: "intake",
            input: null,
            project: null,
            generation: null,
            graph: null,
            review: null,
            activeHistoryId: null,
            selectedNodeId: null,
            selectedTableId: null,
            compareVariantId: null,
            nodeExplanation: null,
          });
        } else {
          set({ history: nextHistory });
        }
      },

      reset: () =>
        set({
          step: "intake",
          input: null,
          project: null,
          generation: null,
          graph: null,
          review: null,
          activeHistoryId: null,
          selectedNodeId: null,
          selectedTableId: null,
          compareVariantId: null,
          nodeExplanation: null,
          isGenerating: false,
          isReviewing: false,
          isExplaining: false,
          workspaceView: "canvas",
        }),
    }),
    {
      name: "architecture-ai-studio",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        input: state.input,
        project: state.project,
        generation: state.generation,
        graph: state.graph,
        review: state.review,
        history: state.history,
        activeHistoryId: state.activeHistoryId,
        workspaceView: state.workspaceView,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Studio state rehydration failed, resetting session", error);
          state?.reset();
        } else if (state?.step === "studio" && !state?.graph) {
          state.setStep("intake");
        } else if (state && !state.workspaceView) {
          // Migrate legacy persisted navigation
          const legacy = state as StudioState & { workArea?: WorkArea; studioMode?: StudioMode };
          if (legacy.workArea === "compare") state.setWorkspaceView("compare");
          else if (legacy.workArea === "model") state.setWorkspaceView("model");
          else if (legacy.studioMode === "review") state.setWorkspaceView("review");
          else if (legacy.studioMode === "approve") state.setWorkspaceView("approve");
          else if (legacy.studioMode === "export") state.setWorkspaceView("export");
          else if (legacy.studioMode === "compare") state.setWorkspaceView("variants");
          else if (legacy.studioMode === "generate") state.setWorkspaceView("improve");
          else state.setWorkspaceView("canvas");
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
