import type {
  ArchitectureGraph,
  CustomerInput,
  GenerationResult,
  ReviewResult,
} from "@architecture-ai/core";

export interface HistoryEntry {
  id: string;
  title: string;
  platform: string;
  business_goal: string;
  created_at: string;
  updated_at: string;
  input: CustomerInput;
  generation: GenerationResult | null;
  graph: ArchitectureGraph;
  review: ReviewResult | null;
}

export function createHistoryEntry(
  input: CustomerInput,
  generation: GenerationResult,
  review: ReviewResult | null = null
): HistoryEntry {
  const now = new Date().toISOString();
  const id = generation.graph.id ?? `arch-${Date.now()}`;

  return {
    id,
    title: generation.graph.title ?? input.business_goal.slice(0, 80),
    platform: input.platform_preference,
    business_goal: input.business_goal,
    created_at: now,
    updated_at: now,
    input,
    generation,
    graph: { ...generation.graph, id },
    review,
  };
}

export function updateHistoryEntry(
  entry: HistoryEntry,
  updates: Partial<Pick<HistoryEntry, "graph" | "generation" | "review">>
): HistoryEntry {
  return {
    ...entry,
    ...updates,
    updated_at: new Date().toISOString(),
  };
}
