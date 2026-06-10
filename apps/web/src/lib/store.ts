import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ArchitectureGraph,
  CustomerInput,
  GenerationResult,
  ReviewResult,
  ComponentRationale,
} from "@architecture-ai/core";
import {
  createHistoryEntry,
  updateHistoryEntry,
  type HistoryEntry,
} from "./history";

interface StudioState {
  step: "intake" | "studio";
  input: CustomerInput | null;
  generation: GenerationResult | null;
  graph: ArchitectureGraph | null;
  review: ReviewResult | null;
  history: HistoryEntry[];
  activeHistoryId: string | null;
  selectedNodeId: string | null;
  nodeExplanation: string | null;
  isGenerating: boolean;
  isReviewing: boolean;
  isExplaining: boolean;
  layoutKey: number;
  _hasHydrated: boolean;

  setStep: (step: "intake" | "studio") => void;
  setInput: (input: CustomerInput) => void;
  setGeneration: (result: GenerationResult) => void;
  setGraph: (graph: ArchitectureGraph, options?: { reflow?: boolean }) => void;
  bumpLayoutKey: () => void;
  setReview: (review: ReviewResult | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  setNodeExplanation: (text: string | null) => void;
  setIsGenerating: (v: boolean) => void;
  setIsReviewing: (v: boolean) => void;
  setIsExplaining: (v: boolean) => void;
  getRationale: (nodeId: string) => ComponentRationale | undefined;
  loadHistory: (id: string) => void;
  deleteHistory: (id: string) => void;
  reset: () => void;
  setHasHydrated: (v: boolean) => void;
}

function upsertHistory(
  history: HistoryEntry[],
  entry: HistoryEntry
): HistoryEntry[] {
  const index = history.findIndex((h) => h.id === entry.id);
  if (index === -1) return [entry, ...history];
  const next = [...history];
  next[index] = entry;
  return next;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      step: "intake",
      input: null,
      generation: null,
      graph: null,
      review: null,
      history: [],
      activeHistoryId: null,
      selectedNodeId: null,
      nodeExplanation: null,
      isGenerating: false,
      isReviewing: false,
      isExplaining: false,
      _hasHydrated: false,
      layoutKey: 0,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      bumpLayoutKey: () => set((s) => ({ layoutKey: s.layoutKey + 1 })),

      setStep: (step) => set({ step }),

      setInput: (input) => set({ input }),

      setGeneration: (result) => {
        const { input, history } = get();
        if (!input) {
          set({
            generation: result,
            graph: result.graph,
            step: "studio",
          });
          return;
        }

        const entry = createHistoryEntry(input, result);
        set({
          generation: result,
          graph: entry.graph,
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
        const { history, activeHistoryId, layoutKey } = get();
        const entry = history.find((h) => h.id === activeHistoryId);
        const nextLayoutKey = options?.reflow ? layoutKey + 1 : layoutKey;
        if (entry) {
          const updated = updateHistoryEntry(entry, { graph });
          set({
            graph,
            history: upsertHistory(history, updated),
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
          const updated = updateHistoryEntry(entry, { review });
          set({
            review,
            history: upsertHistory(history, updated),
          });
        } else {
          set({ review });
        }
      },

      setSelectedNodeId: (id) => set({ selectedNodeId: id, nodeExplanation: null }),
      setNodeExplanation: (text) => set({ nodeExplanation: text }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      setIsReviewing: (v) => set({ isReviewing: v }),
      setIsExplaining: (v) => set({ isExplaining: v }),

      getRationale: (nodeId) => {
        const { generation, graph } = get();
        return (
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
          generation: entry.generation,
          graph: entry.graph,
          review: entry.review,
          activeHistoryId: entry.id,
          selectedNodeId: null,
          nodeExplanation: null,
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
            generation: null,
            graph: null,
            review: null,
            activeHistoryId: null,
            selectedNodeId: null,
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
          generation: null,
          graph: null,
          review: null,
          activeHistoryId: null,
          selectedNodeId: null,
          nodeExplanation: null,
          isGenerating: false,
          isReviewing: false,
          isExplaining: false,
        }),
    }),
    {
      name: "architecture-ai-studio",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        input: state.input,
        generation: state.generation,
        graph: state.graph,
        review: state.review,
        history: state.history,
        activeHistoryId: state.activeHistoryId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Studio state rehydration failed, resetting session", error);
          state?.reset();
        } else if (state?.step === "studio" && !state?.graph) {
          state.setStep("intake");
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
