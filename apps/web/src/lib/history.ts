import type {
  ArchitectureGraph,
  CustomerInput,
  GenerationResult,
  ReviewResult,
  DesignProject,
  PortfolioResult,
} from "@architecture-ai/core";
import { variantToGenerationResult, getActiveVariant } from "@architecture-ai/core";

export interface HistoryEntry {
  id: string;
  title: string;
  platform: string;
  business_goal: string;
  created_at: string;
  updated_at: string;
  input: CustomerInput;
  project: DesignProject | null;
  generation: GenerationResult | null;
  graph: ArchitectureGraph;
  review: ReviewResult | null;
}

export function createHistoryEntryFromPortfolio(
  input: CustomerInput,
  portfolio: PortfolioResult,
  review: ReviewResult | null = null
): HistoryEntry {
  const { project } = portfolio;
  const active = getActiveVariant(project)!;
  const now = new Date().toISOString();

  return {
    id: project.id,
    title: active.architecture_graph.title ?? input.business_goal.slice(0, 80),
    platform: input.platform_preference,
    business_goal: input.business_goal,
    created_at: now,
    updated_at: now,
    input,
    project,
    generation: variantToGenerationResult(active, project.variant_bundle),
    graph: active.architecture_graph,
    review,
  };
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
    project: null,
    generation,
    graph: { ...generation.graph, id },
    review,
  };
}

export function updateHistoryEntry(
  entry: HistoryEntry,
  updates: Partial<Pick<HistoryEntry, "graph" | "generation" | "review" | "project">>
): HistoryEntry {
  return {
    ...entry,
    ...updates,
    updated_at: new Date().toISOString(),
  };
}
