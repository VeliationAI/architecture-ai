"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeChange,
  type NodePositionChange,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArchitectureGraph } from "@architecture-ai/core";
import { getCatalogForPlatform, getIconByKey, resolveServiceIcon } from "@architecture-ai/catalog";
import { ArchitectureNode } from "./ArchitectureNode";
import { useStudioStore } from "@/lib/store";

const nodeTypes = { architecture: ArchitectureNode };

function graphSignature(graph: ArchitectureGraph): string {
  return [
    graph.nodes
      .map((n) => n.id)
      .sort()
      .join("|"),
    graph.edges
      .map((e) => `${e.from}->${e.to}`)
      .sort()
      .join("|"),
  ].join(";");
}

function buildFlowNodes(
  graph: ArchitectureGraph,
  selectedNodeId: string | null
): Node[] {
  const catalog = getCatalogForPlatform(graph.platform ?? "databricks");

  return graph.nodes.map((node) => {
    const catalogItem = catalog.components.find(
      (c) =>
        c.id === node.id ||
        c.label.toLowerCase() === node.label.toLowerCase() ||
        node.label.toLowerCase().includes(c.label.toLowerCase())
    );
    const iconMeta =
      (catalogItem?.icon_key && getIconByKey(catalogItem.icon_key)) ||
      resolveServiceIcon({
        componentId: node.id,
        label: node.label,
        platform: node.platform,
        category: node.category,
      });

    return {
      id: node.id,
      type: "architecture",
      position: node.position ?? { x: 0, y: 0 },
      data: {
        label: node.label,
        category: node.category,
        platform: node.platform,
        required_level: node.required_level,
        description: node.description,
        iconSrc: iconMeta.src,
        iconAlt: iconMeta.alt,
        iconTile: iconMeta.tile,
      },
      selected: node.id === selectedNodeId,
    };
  });
}

function buildFlowEdges(graph: ArchitectureGraph): Edge[] {
  return graph.edges.map((edge, i) => ({
    id: edge.id ?? `e-${i}`,
    source: edge.from,
    target: edge.to,
    label: edge.protocol_or_flow,
    animated: true,
    style: { stroke: "#7c6cf0", strokeWidth: 2 },
    labelStyle: { fill: "#a1a1aa", fontSize: 10 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7c6cf0" },
  }));
}

function FitViewOnChange({
  signature,
  layoutKey,
}: {
  signature: string;
  layoutKey: number;
}) {
  const { fitView } = useReactFlow();
  const prev = useRef({ signature, layoutKey });

  useEffect(() => {
    if (
      prev.current.signature !== signature ||
      prev.current.layoutKey !== layoutKey
    ) {
      prev.current = { signature, layoutKey };
      const timer = setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [signature, layoutKey, fitView]);

  return null;
}

function CanvasInner({
  graph,
  layoutKey,
}: {
  graph: ArchitectureGraph;
  layoutKey: number;
}) {
  const setSelectedNodeId = useStudioStore((s) => s.setSelectedNodeId);
  const setGraph = useStudioStore((s) => s.setGraph);
  const selectedNodeId = useStudioStore((s) => s.selectedNodeId);

  const signature = graphSignature(graph);

  const flowNodes = useMemo(
    () => buildFlowNodes(graph, selectedNodeId),
    [graph, selectedNodeId]
  );
  const flowEdges = useMemo(() => buildFlowEdges(graph), [graph.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [signature, layoutKey, flowNodes, flowEdges, setNodes, setEdges]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      const finished = changes.filter(
        (c): c is NodePositionChange =>
          c.type === "position" && c.dragging === false && !!c.position
      );
      if (finished.length === 0) return;

      const posMap = new Map(finished.map((c) => [c.id, c.position!]));
      setGraph({
        ...graph,
        nodes: graph.nodes.map((n) =>
          posMap.has(n.id) ? { ...n, position: posMap.get(n.id) } : n
        ),
        updated_at: new Date().toISOString(),
      });
    },
    [onNodesChange, graph, setGraph]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);

  return (
    <div className="w-full h-full rounded-[var(--radius)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--background-elevated)] shadow-[var(--shadow)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable={false}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <FitViewOnChange signature={signature} layoutKey={layoutKey} />
        <Background color="#1e1e2e" gap={24} size={1} />
        <Controls />
        <MiniMap nodeColor={() => "#7c6cf0"} maskColor="rgba(0,0,0,0.6)" />
      </ReactFlow>
    </div>
  );
}

export function ArchitectureCanvas({
  graph,
  layoutKey = 0,
}: {
  graph: ArchitectureGraph;
  layoutKey?: number;
}) {
  return (
    <ReactFlowProvider>
      <CanvasInner graph={graph} layoutKey={layoutKey} />
    </ReactFlowProvider>
  );
}
