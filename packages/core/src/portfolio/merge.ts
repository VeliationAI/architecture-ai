import type { ArchitectureGraph, ArchitectureNode, ArchitectureEdge } from "../schema/graph.js";
import type { DesignVariant, MergeSuggestion } from "../schema/project.js";
import type { TableSpec } from "../schema/data-model.js";
import { relayoutGraph } from "../layout/auto-layout.js";

export interface MergeOptions {
  nodeIds?: string[];
  tableIds?: string[];
}

export function mergeNodesFromVariant(
  targetGraph: ArchitectureGraph,
  sourceVariant: DesignVariant,
  nodeIds: string[]
): ArchitectureGraph {
  const sourceGraph = sourceVariant.architecture_graph;
  const existingIds = new Set(targetGraph.nodes.map((n) => n.id));
  const newNodes: ArchitectureNode[] = [];
  const newEdges: ArchitectureEdge[] = [...targetGraph.edges];

  for (const nodeId of nodeIds) {
    const node = sourceGraph.nodes.find((n) => n.id === nodeId);
    if (!node || existingIds.has(node.id)) continue;

    const mergedId = existingIds.has(node.id) ? `${node.id}-merged` : node.id;
    newNodes.push({ ...node, id: mergedId });
    existingIds.add(mergedId);

    for (const edge of sourceGraph.edges) {
      if (edge.from === nodeId || edge.to === nodeId) {
        const from = edge.from === nodeId ? mergedId : edge.from;
        const to = edge.to === nodeId ? mergedId : edge.to;
        const exists = newEdges.some((e) => e.from === from && e.to === to);
        if (!exists && targetGraph.nodes.some((n) => n.id === from || n.id === to) || newNodes.some((n) => n.id === from || n.id === to)) {
          newEdges.push({ ...edge, from, to });
        }
      }
    }
  }

  return relayoutGraph({
    ...targetGraph,
    nodes: [...targetGraph.nodes, ...newNodes],
    edges: newEdges,
    updated_at: new Date().toISOString(),
  });
}

export function mergeTablesFromVariant(
  targetVariant: DesignVariant,
  sourceVariant: DesignVariant,
  tableIds: string[]
): DesignVariant {
  if (!targetVariant.data_model || !sourceVariant.data_model) return targetVariant;

  const target = targetVariant.data_model;
  const source = sourceVariant.data_model;
  const existingNames = new Set([
    ...target.dimensional.facts.map((t) => t.name),
    ...target.dimensional.dimensions.map((t) => t.name),
  ]);

  const newFacts: TableSpec[] = [];
  const newDims: TableSpec[] = [];

  for (const tableId of tableIds) {
    const fact = source.dimensional.facts.find((t) => t.id === tableId);
    const dim = source.dimensional.dimensions.find((t) => t.id === tableId);
    const table = fact ?? dim;
    if (!table || existingNames.has(table.name)) continue;

    if (fact) newFacts.push(fact);
    else if (dim) newDims.push(dim);
    existingNames.add(table.name);
  }

  return {
    ...targetVariant,
    data_model: {
      ...target,
      dimensional: {
        ...target.dimensional,
        facts: [...target.dimensional.facts, ...newFacts],
        dimensions: [...target.dimensional.dimensions, ...newDims],
      },
    },
  };
}

export function applyMergeSuggestion(
  activeVariant: DesignVariant,
  sourceVariant: DesignVariant,
  suggestion: MergeSuggestion
): DesignVariant {
  let updated = activeVariant;

  if (suggestion.node_ids.length > 0) {
    const newGraph = mergeNodesFromVariant(
      activeVariant.architecture_graph,
      sourceVariant,
      suggestion.node_ids
    );
    updated = { ...updated, architecture_graph: newGraph };
  }

  if (suggestion.table_ids.length > 0) {
    updated = mergeTablesFromVariant(updated, sourceVariant, suggestion.table_ids);
  }

  return updated;
}

export function buildMergeSuggestions(variants: DesignVariant[]): MergeSuggestion[] {
  const suggestions: MergeSuggestion[] = [];

  for (const target of variants) {
    for (const source of variants) {
      if (target.variant_id === source.variant_id) continue;

      const targetLabels = new Set(target.architecture_graph.nodes.map((n) => n.label));
      const uniqueNodes = source.architecture_graph.nodes.filter(
        (n) => !targetLabels.has(n.label) && n.required_level !== "optional"
      );

      if (uniqueNodes.length > 0) {
        suggestions.push({
          id: `merge-${source.variant_id}-into-${target.variant_id}`,
          source_variant_id: source.variant_id,
          title: `Add ${uniqueNodes.length} component(s) from ${source.title}`,
          description: uniqueNodes.map((n) => n.label).join(", "),
          node_ids: uniqueNodes.map((n) => n.id),
          table_ids: [],
        });
      }
    }
  }

  return suggestions.slice(0, 6);
}
