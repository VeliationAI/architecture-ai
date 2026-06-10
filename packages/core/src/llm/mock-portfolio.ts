import type { CustomerInput, ArchitectureGraph, ArchitectureNode, ArchitectureEdge } from "../schema/graph.js";
import type {
  DesignVariant,
  VariantBundle,
  PortfolioResult,
  DesignProject,
  CategoryScores,
} from "../schema/project.js";
import { getMockGenerationResult } from "./mock.js";
import { relayoutGraph } from "../layout/auto-layout.js";
import { generateDataModelForVariant } from "../data-model/generator.js";
import { dedupeVariants, pickDefaultRecommendation } from "../portfolio/dedupe.js";
import { buildMergeSuggestions } from "../portfolio/merge.js";
import { createEmptyApproval } from "../approval/workflow.js";
import { resolveDomainPack } from "@architecture-ai/catalog";

const SCORES: Record<string, CategoryScores> = {
  mvp: { security: 72, reliability: 75, performance: 78, cost: 90, operations: 80, governance: 70, explainability: 88 },
  governed: { security: 88, reliability: 90, performance: 82, cost: 72, operations: 85, governance: 92, explainability: 85 },
  scale: { security: 85, reliability: 88, performance: 92, cost: 68, operations: 82, governance: 86, explainability: 80 },
};

function avgScore(s: CategoryScores): number {
  return Math.round(
    (s.security + s.reliability + s.performance + s.cost + s.operations + s.governance + s.explainability) / 7
  );
}

function extraNodes(intent: string, platform: string): ArchitectureNode[] {
  if (platform !== "databricks") return [];

  if (intent === "governed") {
    return [
      {
        id: "dlt-pipelines",
        label: "Delta Live Tables",
        category: "orchestration",
        platform: "databricks",
        required_level: "recommended",
        description: "Declarative pipelines with built-in data quality expectations between medallion layers.",
        zone_id: "silver",
      },
      {
        id: "data-quality",
        label: "Data Quality Rules",
        category: "governance",
        platform: "databricks",
        required_level: "required",
        description: "Expectations and quarantine for conformed data before gold publication.",
      },
      {
        id: "lineage",
        label: "Lineage & Audit",
        category: "governance",
        platform: "databricks",
        required_level: "required",
        description: "End-to-end lineage and audit trail for regulated workloads.",
      },
    ];
  }

  if (intent === "scale") {
    return [
      {
        id: "cdc-stream",
        label: "CDC / Streaming Ingestion",
        category: "ingestion",
        platform: "databricks",
        required_level: "required",
        description: "Change data capture for near-real-time warehouse updates.",
        zone_id: "bronze",
      },
      {
        id: "vector-search",
        label: "Vector Search",
        category: "ml",
        platform: "databricks",
        required_level: "recommended",
        description: "Semantic retrieval for RAG and AI feature serving.",
        zone_id: "gold",
      },
      {
        id: "feature-store",
        label: "Feature Store",
        category: "ml",
        platform: "databricks",
        required_level: "recommended",
        description: "Reusable features for ML and GenAI workloads.",
        zone_id: "gold",
      },
      {
        id: "ai-gateway",
        label: "Unity AI Gateway",
        category: "genai",
        platform: "databricks",
        required_level: "recommended",
        description: "Governed routing for LLM endpoints and MCP connectors.",
      },
    ];
  }

  return [];
}

function extraEdges(intent: string, nodes: ArchitectureNode[]): ArchitectureEdge[] {
  const ids = new Set(nodes.map((n) => n.id));
  const edges: ArchitectureEdge[] = [];

  if (intent === "governed" && ids.has("dlt-pipelines") && ids.has("silver-delta")) {
    edges.push({ from: "bronze-delta", to: "dlt-pipelines", protocol_or_flow: "DLT", description: "Medallion orchestration" });
    edges.push({ from: "dlt-pipelines", to: "silver-delta", protocol_or_flow: "DLT", description: "Cleansing pipeline" });
    edges.push({ from: "data-quality", to: "gold-delta", protocol_or_flow: "DQ checks", description: "Quality gate" });
    edges.push({ from: "lineage", to: "unity-catalog", protocol_or_flow: "Lineage", description: "Audit trail" });
  }

  if (intent === "scale" && ids.has("cdc-stream")) {
    edges.push({ from: "cdc-stream", to: "bronze-delta", protocol_or_flow: "Streaming", description: "Real-time landing" });
    if (ids.has("vector-search")) {
      edges.push({ from: "gold-delta", to: "vector-search", protocol_or_flow: "Embeddings", description: "Vector index" });
    }
    if (ids.has("feature-store")) {
      edges.push({ from: "gold-delta", to: "feature-store", protocol_or_flow: "Features", description: "Feature publishing" });
    }
    if (ids.has("ai-gateway")) {
      edges.push({ from: "ai-gateway", to: "vector-search", protocol_or_flow: "RAG", description: "Governed retrieval" });
    }
  }

  return edges;
}

function buildVariantGraph(
  base: ArchitectureGraph,
  intent: "mvp" | "governed" | "scale",
  title: string
): ArchitectureGraph {
  const extras = extraNodes(intent, base.platform ?? "databricks");
  const mvpTrim =
    intent === "mvp"
      ? base.nodes.filter(
          (n) =>
            n.required_level === "required" ||
            ["ingest", "bronze-delta", "silver-delta", "gold-delta", "unity-catalog"].includes(n.id)
        )
      : base.nodes;

  const nodes = intent === "mvp" ? mvpTrim : [...base.nodes, ...extras];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = [
    ...base.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to)),
    ...extraEdges(intent, nodes),
  ];

  return relayoutGraph({
    ...base,
    id: `${base.id}-${intent}`,
    title,
    nodes,
    edges,
  });
}

function makeVariant(
  input: CustomerInput,
  base: ReturnType<typeof getMockGenerationResult>,
  config: {
    variant_id: string;
    title: string;
    intent: "mvp" | "governed" | "scale";
    design_intent: DesignVariant["design_intent"];
    thesis: string;
    scores: CategoryScores;
    recommended_for: string[];
    not_ideal_for: string[];
    tradeoffs: string[];
  }
): DesignVariant {
  const graph = buildVariantGraph(base.graph, config.intent, config.title);
  const variant: DesignVariant = {
    variant_id: config.variant_id,
    title: config.title,
    design_intent: config.design_intent,
    thesis: config.thesis,
    overall_score: avgScore(config.scores),
    category_scores: config.scores,
    architecture_graph: graph,
    component_rationale: base.component_rationale.filter((r) =>
      graph.nodes.some((n) => n.id === r.node_id)
    ),
    improvement_suggestions: base.improvement_suggestions,
    key_tradeoffs: config.tradeoffs,
    recommended_for: config.recommended_for,
    not_ideal_for: config.not_ideal_for,
  };
  variant.data_model = generateDataModelForVariant(input, variant);
  return variant;
}

export function getMockPortfolioResult(input: CustomerInput): PortfolioResult {
  const base = getMockGenerationResult(input);
  const domainPack = resolveDomainPack(input.industry, input.business_goal);
  const isDatabricks = input.platform_preference === "databricks";

  const variants: DesignVariant[] = isDatabricks
    ? [
        makeVariant(input, base, {
          variant_id: "mvp_fast",
          title: "Delivery-first MVP",
          intent: "mvp",
          design_intent: "time_to_market",
          thesis: "Minimal viable lakehouse path to production analytics in the shortest time.",
          scores: SCORES.mvp,
          recommended_for: ["POCs", "First production release", "Tight timelines", "Small teams"],
          not_ideal_for: ["Strict compliance audits", "Multi-region HA", "Sub-minute latency"],
          tradeoffs: [
            "Fewer controls than enterprise baseline",
            "Manual pipeline ops until DLT is added",
            "Lower governance score acceptable for MVP phase",
          ],
        }),
        makeVariant(input, base, {
          variant_id: "governed_enterprise",
          title: "Governed Enterprise Baseline",
          intent: "governed",
          design_intent: "governance_reliability",
          thesis: "Full medallion with Unity Catalog, DLT, data quality, and lineage for regulated workloads.",
          scores: SCORES.governed,
          recommended_for: ["Enterprise production", "Compliance-heavy industries", "Multi-team data platforms"],
          not_ideal_for: ["Ultra-fast POCs", "Minimal budget pilots"],
          tradeoffs: [
            "Higher implementation effort",
            "More platform licensing and ops overhead",
            "Longer time to first dashboard",
          ],
        }),
        makeVariant(input, base, {
          variant_id: "scale_ai_ready",
          title: "Scale & AI-Ready Design",
          intent: "scale",
          design_intent: "scale_ai_ready",
          thesis: "CDC streaming, feature store, vector search, and AI Gateway for advanced analytics and GenAI.",
          scores: SCORES.scale,
          recommended_for: ["High volume", "Real-time analytics", "ML/GenAI workloads", "Feature serving"],
          not_ideal_for: ["Simple batch BI only", "Cost-sensitive MVP"],
          tradeoffs: [
            "Highest complexity and cost",
            "Requires streaming ops expertise",
            "More moving parts to monitor",
          ],
        }),
      ]
    : [
        makeVariant(input, base, {
          variant_id: "mvp_fast",
          title: "Delivery-first MVP",
          intent: "mvp",
          design_intent: "time_to_market",
          thesis: "Minimal cloud-native stack for fastest delivery.",
          scores: SCORES.mvp,
          recommended_for: ["Startups", "POCs"],
          not_ideal_for: ["Enterprise compliance"],
          tradeoffs: ["Fewer resilience controls"],
        }),
      ];

  const deduped = dedupeVariants(variants);
  const defaultId = pickDefaultRecommendation(deduped);
  const mergeable = buildMergeSuggestions(deduped);

  const bundle: VariantBundle = {
    id: `project-${Date.now()}`,
    project_summary: {
      use_case: input.business_goal,
      platform: input.platform_preference,
      domain: domainPack.name,
      industry: input.industry,
    },
    variants: deduped,
    default_recommendation: defaultId,
    mergeable_suggestions: mergeable,
    architecture_summary: base.architecture_summary,
    risks_and_gaps: base.risks_and_gaps,
    next_best_actions: base.next_best_actions,
    created_at: new Date().toISOString(),
  };

  const project: DesignProject = {
    id: bundle.id!,
    requirements: {
      ...input,
      classified_intents: deduped.map((v) => v.design_intent),
      domain_hint: domainPack.id,
    },
    variant_bundle: bundle,
    active_variant_id: defaultId,
    approval: createEmptyApproval(),
    updated_at: new Date().toISOString(),
  };

  return { project };
}

export function variantToGenerationResult(variant: DesignVariant, bundle: VariantBundle) {
  return {
    architecture_summary: bundle.architecture_summary ?? variant.thesis,
    recommended_architecture: variant.thesis,
    graph: variant.architecture_graph,
    component_rationale: variant.component_rationale,
    improvement_suggestions: variant.improvement_suggestions,
    risks_and_gaps: bundle.risks_and_gaps,
    next_best_actions: bundle.next_best_actions,
  };
}
