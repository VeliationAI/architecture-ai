import type { ArchitectureGraph, ArchitectureNode } from "../schema/graph.js";

const PIPELINE_ORDER = [
  "ingestion",
  "networking",
  "integration",
  "storage",
  "orchestration",
  "compute",
  "ml",
  "genai",
  "serving",
  "governance",
  "security",
  "observability",
  "other",
];

const CROSS_CUTTING = new Set(["governance", "security", "observability"]);
const MEDALLION_ZONES = ["bronze", "silver", "gold"];

const COL_WIDTH = 280;
const ROW_HEIGHT = 120;
const ORIGIN_X = 60;
const ORIGIN_Y = 140;
const TOP_BAND_Y = 32;

const CATEGORY_ZONE_HINT: Record<string, string> = {
  ingestion: "bronze",
  storage: "silver",
  compute: "silver",
  orchestration: "silver",
  ml: "gold",
  genai: "gold",
  serving: "gold",
};

function sortByPipeline(a: ArchitectureNode, b: ArchitectureNode): number {
  return PIPELINE_ORDER.indexOf(a.category) - PIPELINE_ORDER.indexOf(b.category);
}

function nodeIndex(graph: ArchitectureGraph): Map<string, ArchitectureNode> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

/** Order nodes top-to-bottom using edge direction within a subset */
function orderByFlow(
  graph: ArchitectureGraph,
  nodes: ArchitectureNode[]
): ArchitectureNode[] {
  if (nodes.length <= 1) return nodes;

  const ids = new Set(nodes.map((n) => n.id));
  const rank = new Map<string, number>();
  for (const node of nodes) rank.set(node.id, 0);

  for (let pass = 0; pass < nodes.length; pass++) {
    for (const edge of graph.edges) {
      if (!ids.has(edge.from) || !ids.has(edge.to)) continue;
      rank.set(edge.to, Math.max(rank.get(edge.to)!, rank.get(edge.from)! + 1));
    }
  }

  return [...nodes].sort((a, b) => {
    const dr = rank.get(a.id)! - rank.get(b.id)!;
    return dr !== 0 ? dr : sortByPipeline(a, b);
  });
}

function inferZoneId(node: ArchitectureNode, graph: ArchitectureGraph): string | undefined {
  if (node.zone_id) return node.zone_id;
  if (CROSS_CUTTING.has(node.category)) return undefined;

  const byId = nodeIndex(graph);
  const scores = new Map<string, number>();

  for (const edge of graph.edges) {
    if (edge.from === node.id) {
      const peer = byId.get(edge.to);
      if (peer?.zone_id && MEDALLION_ZONES.includes(peer.zone_id)) {
        scores.set(peer.zone_id, (scores.get(peer.zone_id) ?? 0) + 2);
      }
    }
    if (edge.to === node.id) {
      const peer = byId.get(edge.from);
      if (peer?.zone_id && MEDALLION_ZONES.includes(peer.zone_id)) {
        scores.set(peer.zone_id, (scores.get(peer.zone_id) ?? 0) + 1);
      }
    }
  }

  if (scores.size > 0) {
    return [...scores.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  const hint = CATEGORY_ZONE_HINT[node.category];
  return hint && MEDALLION_ZONES.includes(hint) ? hint : "gold";
}

function enrichZones(graph: ArchitectureGraph): ArchitectureGraph {
  const hasMedallion = graph.nodes.some(
    (n) => n.zone_id && MEDALLION_ZONES.includes(n.zone_id)
  );
  if (!hasMedallion) return graph;

  return {
    ...graph,
    nodes: graph.nodes.map((node) => {
      if (node.zone_id || CROSS_CUTTING.has(node.category)) return node;
      const inferred = inferZoneId(node, graph);
      return inferred ? { ...node, zone_id: inferred } : node;
    }),
  };
}

function layoutMedallion(graph: ArchitectureGraph): ArchitectureNode[] {
  const zoneBuckets = new Map<string, ArchitectureNode[]>();
  const crossCutting: ArchitectureNode[] = [];

  for (const node of graph.nodes) {
    if (CROSS_CUTTING.has(node.category) && !node.zone_id) {
      crossCutting.push(node);
    } else if (node.zone_id && MEDALLION_ZONES.includes(node.zone_id)) {
      const bucket = zoneBuckets.get(node.zone_id) ?? [];
      bucket.push(node);
      zoneBuckets.set(node.zone_id, bucket);
    } else {
      const inferred = inferZoneId(node, graph);
      if (inferred) {
        const bucket = zoneBuckets.get(inferred) ?? [];
        bucket.push({ ...node, zone_id: inferred });
        zoneBuckets.set(inferred, bucket);
      } else {
        crossCutting.push(node);
      }
    }
  }

  const laidOut: ArchitectureNode[] = [];
  const orderedCross = orderByFlow(graph, crossCutting.sort(sortByPipeline));
  const crossSpan = MEDALLION_ZONES.length * COL_WIDTH;

  orderedCross.forEach((node, i) => {
    const cols = Math.max(orderedCross.length, 1);
    const xStep = crossSpan / cols;
    laidOut.push({
      ...node,
      position: { x: ORIGIN_X + i * xStep, y: TOP_BAND_Y },
    });
  });

  const layerStartY = orderedCross.length > 0 ? ORIGIN_Y : ORIGIN_Y - 40;

  MEDALLION_ZONES.forEach((zoneId, colIndex) => {
    const nodes = orderByFlow(graph, zoneBuckets.get(zoneId) ?? []);
    nodes.forEach((node, rowIndex) => {
      laidOut.push({
        ...node,
        position: {
          x: ORIGIN_X + colIndex * COL_WIDTH,
          y: layerStartY + rowIndex * ROW_HEIGHT,
        },
      });
    });
  });

  return laidOut;
}

function layoutHierarchical(graph: ArchitectureGraph): ArchitectureNode[] {
  const nodes = graph.nodes;
  if (nodes.length === 0) return [];

  const crossCutting = nodes.filter((n) => CROSS_CUTTING.has(n.category));
  const mainNodes = nodes.filter((n) => !CROSS_CUTTING.has(n.category));

  const layer = new Map<string, number>();
  for (const node of mainNodes) layer.set(node.id, 0);

  for (let pass = 0; pass < mainNodes.length + 1; pass++) {
    for (const edge of graph.edges) {
      if (!layer.has(edge.from) || !layer.has(edge.to)) continue;
      layer.set(edge.to, Math.max(layer.get(edge.to)!, layer.get(edge.from)! + 1));
    }
  }

  const laidOut: ArchitectureNode[] = [];
  const orderedCross = orderByFlow(graph, crossCutting.sort(sortByPipeline));

  orderedCross.forEach((node, i) => {
    laidOut.push({
      ...node,
      position: { x: ORIGIN_X + i * (COL_WIDTH + 24), y: TOP_BAND_Y },
    });
  });

  const startY = orderedCross.length > 0 ? ORIGIN_Y : ORIGIN_Y - 40;
  const byLayer = new Map<number, ArchitectureNode[]>();

  for (const node of mainNodes) {
    const d = layer.get(node.id) ?? 0;
    const group = byLayer.get(d) ?? [];
    group.push(node);
    byLayer.set(d, group);
  }

  const maxDepth = Math.max(...byLayer.keys(), 0);

  for (let d = 0; d <= maxDepth; d++) {
    const group = orderByFlow(graph, byLayer.get(d) ?? []);
    group.forEach((node, i) => {
      laidOut.push({
        ...node,
        position: {
          x: ORIGIN_X + d * COL_WIDTH,
          y: startY + i * ROW_HEIGHT,
        },
      });
    });
  }

  return laidOut;
}

export interface LayoutOptions {
  /** When true, keeps existing positions (default false — always recalculates) */
  preservePositions?: boolean;
}

export function autoLayoutGraph(
  graph: ArchitectureGraph,
  options: LayoutOptions = {}
): ArchitectureGraph {
  if (options.preservePositions) {
    const needsLayout = graph.nodes.filter((n) => !n.position);
    if (needsLayout.length === 0) return graph;
  }

  const enriched = enrichZones(graph);
  const hasMedallion = enriched.nodes.some(
    (n) => n.zone_id && MEDALLION_ZONES.includes(n.zone_id)
  );

  const laidOutNodes = hasMedallion
    ? layoutMedallion(enriched)
    : layoutHierarchical(enriched);

  return { ...enriched, nodes: laidOutNodes };
}

/** Strip positions and relayout entire graph (use after adding/removing nodes) */
export function relayoutGraph(graph: ArchitectureGraph): ArchitectureGraph {
  const stripped = {
    ...graph,
    nodes: graph.nodes.map((n) => {
      const { position: _p, ...rest } = n;
      return rest as ArchitectureNode;
    }),
  };
  return autoLayoutGraph(stripped);
}
