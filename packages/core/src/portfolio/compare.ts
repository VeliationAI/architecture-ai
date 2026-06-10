import type { ArchitectureGraph } from "../schema/graph.js";
import type { CategoryScores, DesignVariant } from "../schema/project.js";
import { CategoryScoresSchema } from "../schema/project.js";

export interface VariantComparison {
  variant_a_id: string;
  variant_b_id: string;
  score_deltas: Partial<Record<keyof CategoryScores, number>>;
  overall_score_delta: number;
  only_in_a: string[];
  only_in_b: string[];
  common_components: string[];
  edge_count_delta: number;
  node_count_delta: number;
}

export function compareGraphs(
  graphA: ArchitectureGraph,
  graphB: ArchitectureGraph
): Omit<VariantComparison, "variant_a_id" | "variant_b_id" | "score_deltas" | "overall_score_delta"> {
  const labelsA = new Set(graphA.nodes.map((n) => n.label));
  const labelsB = new Set(graphB.nodes.map((n) => n.label));

  return {
    only_in_a: [...labelsA].filter((l) => !labelsB.has(l)),
    only_in_b: [...labelsB].filter((l) => !labelsA.has(l)),
    common_components: [...labelsA].filter((l) => labelsB.has(l)),
    edge_count_delta: graphA.edges.length - graphB.edges.length,
    node_count_delta: graphA.nodes.length - graphB.nodes.length,
  };
}

export function compareVariants(a: DesignVariant, b: DesignVariant): VariantComparison {
  const graphDiff = compareGraphs(a.architecture_graph, b.architecture_graph);
  const scoreKeys = Object.keys(CategoryScoresSchema.shape) as (keyof CategoryScores)[];

  const score_deltas: Partial<Record<keyof CategoryScores, number>> = {};
  for (const key of scoreKeys) {
    score_deltas[key] = a.category_scores[key] - b.category_scores[key];
  }

  return {
    variant_a_id: a.variant_id,
    variant_b_id: b.variant_id,
    score_deltas,
    overall_score_delta: a.overall_score - b.overall_score,
    ...graphDiff,
  };
}

export function compareAllVariants(variants: DesignVariant[]): VariantComparison[] {
  const results: VariantComparison[] = [];
  for (let i = 0; i < variants.length; i++) {
    for (let j = i + 1; j < variants.length; j++) {
      results.push(compareVariants(variants[i], variants[j]));
    }
  }
  return results;
}
