import type {
  ArchitectureGraph,
  ArchitectureNode,
  ArchitectureEdge,
  ImprovementSuggestion,
  ReviewFinding,
  ComponentRationale,
} from "../schema/graph.js";
import { relayoutGraph } from "../layout/auto-layout.js";

export function applySuggestion(
  graph: ArchitectureGraph,
  suggestion: ImprovementSuggestion | ReviewFinding
): ArchitectureGraph {
  const suggestedNode =
    "suggested_node" in suggestion ? suggestion.suggested_node : undefined;

  if (!suggestedNode) {
    return graph;
  }

  const exists = graph.nodes.some((n) => n.id === suggestedNode.id);
  if (exists) return graph;

  const newNodes = [...graph.nodes, suggestedNode];
  let newEdges = [...graph.edges];

  if (suggestion.affected_nodes?.length) {
    const targetNode = suggestion.affected_nodes[0];
    newEdges = [
      ...newEdges,
      {
        from: suggestedNode.id,
        to: targetNode,
        protocol_or_flow: "Integration",
        description: `Added via suggestion: ${suggestion.title}`,
      },
    ];
  }

  const newRationale: ComponentRationale = {
    node_id: suggestedNode.id,
    purpose: suggestedNode.description,
    why_needed:
      "why" in suggestion
        ? (suggestion as ReviewFinding).why
        : (suggestion as ImprovementSuggestion).reason,
    expected_benefit:
      "benefit" in suggestion
        ? (suggestion as ReviewFinding).benefit
        : (suggestion as ImprovementSuggestion).benefit,
    implementation_note: `Added from suggestion: ${suggestion.title}`,
    alternatives_considered: [],
    risk_if_omitted:
      "risk_if_ignored" in suggestion
        ? (suggestion as ReviewFinding).risk_if_ignored
        : (suggestion as ImprovementSuggestion).risk_if_skipped,
  };

  return relayoutGraph({
    ...graph,
    nodes: newNodes,
    edges: newEdges,
    rationales: [...(graph.rationales ?? []), newRationale],
    updated_at: new Date().toISOString(),
  });
}

export function addNode(
  graph: ArchitectureGraph,
  node: ArchitectureNode,
  connectTo?: { from: string; edge?: Partial<ArchitectureEdge> }
): ArchitectureGraph {
  return relayoutGraph({
    ...graph,
    nodes: [...graph.nodes, node],
    edges: connectTo
      ? [
          ...graph.edges,
          {
            from: connectTo.from,
            to: node.id,
            protocol_or_flow: connectTo.edge?.protocol_or_flow ?? "Data flow",
            description: connectTo.edge?.description ?? `Connection to ${node.label}`,
          },
        ]
      : graph.edges,
    updated_at: new Date().toISOString(),
  });
}

export function removeNode(graph: ArchitectureGraph, nodeId: string): ArchitectureGraph {
  return relayoutGraph({
    ...graph,
    nodes: graph.nodes.filter((n) => n.id !== nodeId),
    edges: graph.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    rationales: (graph.rationales ?? []).filter((r) => r.node_id !== nodeId),
    updated_at: new Date().toISOString(),
  });
}

export function mergeReviewIntoGraph(
  graph: ArchitectureGraph,
  findings: ReviewFinding[]
): ArchitectureGraph {
  const suggestions = findings.map((f) => ({
    id: f.id,
    title: f.title,
    priority:
      f.severity === "Required"
        ? ("High" as const)
        : f.severity === "Strongly Recommended"
          ? ("Medium" as const)
          : ("Low" as const),
    add_or_change: f.what_to_change,
    reason: f.why,
    benefit: f.benefit,
    tradeoff: f.tradeoff,
    risk_if_skipped: f.risk_if_ignored,
    affected_nodes: f.affected_nodes,
    suggested_node: f.suggested_node,
  }));

  return {
    ...graph,
    suggestions: [...(graph.suggestions ?? []), ...suggestions],
    updated_at: new Date().toISOString(),
  };
}

export function createClientSummary(graph: ArchitectureGraph): string {
  const lines = [
    `# ${graph.title ?? "Architecture Summary"}`,
    "",
    graph.summary ? `## Overview\n${graph.summary}` : "",
    "",
    "## Components",
    ...graph.nodes.map(
      (n) =>
        `- **${n.label}** (${n.required_level}): ${n.description}`
    ),
    "",
    "## Data Flows",
    ...graph.edges.map(
      (e) => `- ${e.from} → ${e.to} (${e.protocol_or_flow}): ${e.description}`
    ),
  ];

  if (graph.assumptions?.length) {
    lines.push("", "## Assumptions", ...graph.assumptions.map((a) => `- ${a}`));
  }

  if (graph.unknowns?.length) {
    lines.push("", "## Open Questions", ...graph.unknowns.map((u) => `- ${u}`));
  }

  return lines.filter((l) => l !== undefined).join("\n");
}
