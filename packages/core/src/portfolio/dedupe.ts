import type { DesignVariant } from "../schema/project.js";

function similarity(a: DesignVariant, b: DesignVariant): number {
  const labelsA = new Set(a.architecture_graph.nodes.map((n) => n.label));
  const labelsB = new Set(b.architecture_graph.nodes.map((n) => n.label));
  const intersection = [...labelsA].filter((l) => labelsB.has(l)).length;
  const union = new Set([...labelsA, ...labelsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/** Remove near-duplicate variants (Jaccard > threshold on node labels) */
export function dedupeVariants(
  variants: DesignVariant[],
  threshold = 0.85
): DesignVariant[] {
  const kept: DesignVariant[] = [];

  for (const variant of variants) {
    const isDuplicate = kept.some((k) => similarity(k, variant) >= threshold);
    if (!isDuplicate) kept.push(variant);
  }

  return kept.length > 0 ? kept : variants.slice(0, 1);
}

export function rankVariants(variants: DesignVariant[]): DesignVariant[] {
  return [...variants].sort((a, b) => b.overall_score - a.overall_score);
}

export function pickDefaultRecommendation(variants: DesignVariant[]): string {
  if (variants.length === 0) return "";
  const ranked = rankVariants(variants);
  return ranked[0].variant_id;
}
