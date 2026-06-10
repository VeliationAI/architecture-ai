import type {
  CustomerInput,
  ArchitectureGraph,
  GenerationResult,
  ReviewResult,
} from "../schema/graph.js";

function needsGenieAnalytics(input: CustomerInput): boolean {
  const text = [
    input.business_goal,
    input.analytics_needs ?? "",
    input.primary_users ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return /genie|natural.?language|conversational|self.?serve|bi\b|analytics|chatbot|data agent/.test(
    text
  );
}

export function getMockGenerationResult(input: CustomerInput): GenerationResult {
  const isDatabricks = input.platform_preference === "databricks";
  const includeGenie = isDatabricks && needsGenieAnalytics(input);

  const graph: ArchitectureGraph = {
    id: `arch-${Date.now()}`,
    title: input.business_goal.slice(0, 80),
    summary: `Target architecture for: ${input.business_goal}`,
    platform: input.platform_preference,
    zones: isDatabricks
      ? [
          { id: "bronze", label: "Bronze Layer", type: "layer" },
          { id: "silver", label: "Silver Layer", type: "layer" },
          { id: "gold", label: "Gold Layer", type: "layer" },
        ]
      : [{ id: "prod", label: "Production", type: "environment" }],
    nodes: isDatabricks
      ? [
          {
            id: "ingest",
            label: "Auto Loader / Ingestion",
            category: "ingestion",
            platform: "databricks",
            required_level: "required",
            description: "Incremental ingestion from source systems into bronze Delta tables.",
            zone_id: "bronze",
          },
          {
            id: "bronze-delta",
            label: "Bronze Delta Tables",
            category: "storage",
            platform: "databricks",
            required_level: "required",
            description: "Raw landing zone with schema-on-read and audit columns.",
            zone_id: "bronze",
          },
          {
            id: "silver-delta",
            label: "Silver Delta Tables",
            category: "storage",
            platform: "databricks",
            required_level: "required",
            description: "Cleaned, deduplicated, conformed data ready for analytics.",
            zone_id: "silver",
          },
          {
            id: "gold-delta",
            label: "Gold Delta Tables",
            category: "storage",
            platform: "databricks",
            required_level: "required",
            description: "Business-level aggregates and feature tables for BI/ML.",
            zone_id: "gold",
          },
          {
            id: "unity-catalog",
            label: "Unity Catalog",
            category: "governance",
            platform: "databricks",
            required_level: "required",
            description: "Unified governance for data and AI assets with lineage and ACLs.",
          },
          {
            id: "databricks-sql",
            label: "Databricks SQL Warehouse",
            category: "serving",
            platform: "databricks",
            required_level: "recommended",
            description: "Low-latency SQL serving for dashboards and ad-hoc queries.",
            zone_id: "gold",
          },
          {
            id: "mlflow",
            label: "MLflow Tracing",
            category: "observability",
            platform: "databricks",
            required_level: "recommended",
            description: "Trace and evaluate GenAI/ML pipelines in production.",
          },
          {
            id: "ai-gateway",
            label: "Unity AI Gateway",
            category: "genai",
            platform: "databricks",
            required_level: "optional",
            description: "Governed routing for LLM endpoints, agents, and MCP servers.",
          },
          ...(includeGenie
            ? [
                {
                  id: "genie-spaces",
                  label: "Genie Spaces",
                  category: "genai" as const,
                  platform: "databricks" as const,
                  required_level: "recommended" as const,
                  description:
                    "Curated knowledge store with certified metrics and domain guardrails for NL analytics.",
                  zone_id: "gold",
                },
                {
                  id: "genie",
                  label: "AI/BI Genie",
                  category: "genai" as const,
                  platform: "databricks" as const,
                  required_level: "recommended" as const,
                  description:
                    "Conversational interface for natural-language queries over governed data assets.",
                },
                {
                  id: "genie-agent-mode",
                  label: "Genie Agent Mode",
                  category: "genai" as const,
                  platform: "databricks" as const,
                  required_level: "optional" as const,
                  description:
                    "Multi-step iterative reasoning for complex why/how business questions.",
                },
                {
                  id: "genie-ontology",
                  label: "Genie Ontology",
                  category: "governance" as const,
                  platform: "databricks" as const,
                  required_level: "optional" as const,
                  description:
                    "Auto-extracted business knowledge map from dashboards, notebooks, and pipelines.",
                },
              ]
            : []),
        ]
      : [
          {
            id: "api-gateway",
            label: "API Gateway",
            category: "networking",
            platform: input.platform_preference,
            required_level: "required",
            description: "Entry point for external API traffic with auth and rate limiting.",
          },
          {
            id: "compute",
            label: "Compute Service",
            category: "compute",
            platform: input.platform_preference,
            required_level: "required",
            description: "Core application compute layer.",
          },
          {
            id: "database",
            label: "Managed Database",
            category: "storage",
            platform: input.platform_preference,
            required_level: "required",
            description: "Persistent transactional data store.",
          },
          {
            id: "monitoring",
            label: "Monitoring & Logging",
            category: "observability",
            platform: input.platform_preference,
            required_level: "recommended",
            description: "Centralized logs, metrics, and alerting.",
          },
        ],
    edges: isDatabricks
      ? [
          { from: "ingest", to: "bronze-delta", protocol_or_flow: "Delta write", description: "Raw data landing" },
          { from: "bronze-delta", to: "silver-delta", protocol_or_flow: "ETL/ELT", description: "Cleansing and conforming" },
          { from: "silver-delta", to: "gold-delta", protocol_or_flow: "Aggregation", description: "Business modeling" },
          { from: "gold-delta", to: "databricks-sql", protocol_or_flow: "SQL", description: "BI serving" },
          { from: "unity-catalog", to: "bronze-delta", protocol_or_flow: "Governance", description: "Access control & lineage" },
          { from: "unity-catalog", to: "silver-delta", protocol_or_flow: "Governance", description: "Access control & lineage" },
          { from: "unity-catalog", to: "gold-delta", protocol_or_flow: "Governance", description: "Access control & lineage" },
          { from: "mlflow", to: "gold-delta", protocol_or_flow: "Traces", description: "ML/GenAI observability" },
          { from: "ai-gateway", to: "mlflow", protocol_or_flow: "LLM routing", description: "Governed AI traffic" },
          ...(includeGenie
            ? [
                { from: "gold-delta", to: "genie-spaces", protocol_or_flow: "Semantic layer", description: "Certified metrics" },
                { from: "genie-spaces", to: "genie", protocol_or_flow: "NL queries", description: "Conversational analytics" },
                { from: "genie", to: "genie-agent-mode", protocol_or_flow: "Agent routing", description: "Complex analysis" },
                { from: "genie-ontology", to: "genie-spaces", protocol_or_flow: "Knowledge", description: "Business ontology" },
                { from: "unity-catalog", to: "genie", protocol_or_flow: "Governance", description: "Access control" },
                { from: "ai-gateway", to: "genie", protocol_or_flow: "MCP", description: "Governed external connectors" },
              ]
            : []),
        ]
      : [
          { from: "api-gateway", to: "compute", protocol_or_flow: "HTTPS", description: "API requests" },
          { from: "compute", to: "database", protocol_or_flow: "TCP", description: "Data persistence" },
          { from: "monitoring", to: "compute", protocol_or_flow: "Metrics", description: "Health monitoring" },
        ],
    assumptions: [
      input.expected_scale ? `Scale: ${input.expected_scale}` : "Moderate scale assumed",
      "Team has basic cloud platform experience",
    ],
    unknowns: input.pain_points
      ? [`Clarify: ${input.pain_points}`]
      : ["Exact data volumes and refresh SLAs need confirmation"],
    rationales: [],
    suggestions: [],
  };

  const rationales = graph.nodes.map((node) => ({
    node_id: node.id,
    purpose: `Provide ${node.label} capability in the architecture`,
    why_needed: node.description,
    expected_benefit: `Enables ${node.category} requirements for ${input.business_goal}`,
    implementation_note: `Deploy as managed ${node.platform} service with IaC and environment separation`,
    alternatives_considered: ["Custom self-managed alternative (higher ops burden)"],
    risk_if_omitted:
      node.required_level === "required"
        ? "Architecture cannot meet core requirements without this component"
        : "Reduced resilience, governance, or performance headroom",
    cost_impact: node.required_level === "optional" ? "Low incremental cost" : "Moderate — sized to workload",
  }));

  return {
    architecture_summary: `A ${input.platform_preference}-native architecture designed to achieve: ${input.business_goal}. The design follows platform best practices with clear separation of concerns, governance, and observability.`,
    recommended_architecture: isDatabricks
      ? includeGenie
        ? "Medallion lakehouse with Unity Catalog governance, plus AI/BI Genie with curated Genie Spaces, Agent Mode for multi-step analysis, Genie Ontology for knowledge extraction, and Unity AI Gateway for governed MCP access."
        : "Medallion lakehouse architecture with Unity Catalog governance, incremental ingestion via Auto Loader, Delta Lake storage across bronze/silver/gold layers, SQL warehouse for serving, and MLflow + AI Gateway for GenAI observability and governance."
      : `Cloud-native architecture with API gateway, managed compute, persistent storage, and centralized monitoring aligned to ${input.platform_preference} well-architected principles.`,
    graph,
    component_rationale: rationales,
    improvement_suggestions: [
      {
        id: "sug-1",
        title: isDatabricks ? "Add Delta Live Tables for pipeline orchestration" : "Add CI/CD pipeline",
        priority: "Medium" as const,
        add_or_change: isDatabricks
          ? "Introduce DLT pipelines between medallion layers"
          : "Introduce automated deployment pipeline",
        reason: "Reduces manual orchestration and improves reliability",
        benefit: "Simpler operations, built-in data quality expectations",
        tradeoff: "Additional platform licensing and pipeline design effort",
        risk_if_skipped: "Manual pipeline management increases error rates",
        affected_nodes: isDatabricks ? ["bronze-delta", "silver-delta"] : ["compute"],
      },
      {
        id: "sug-2",
        title: isDatabricks ? "Enable AI Gateway for LLM governance" : "Add WAF and secrets management",
        priority: "High" as const,
        add_or_change: isDatabricks
          ? "Route all LLM traffic through Unity AI Gateway"
          : "Add WAF in front of API gateway and use managed secrets",
        reason: "Security and governance for production workloads",
        benefit: "Audit logging, access control, and policy enforcement",
        tradeoff: "Additional configuration and latency overhead",
        risk_if_skipped: "Uncontrolled AI/API access and compliance gaps",
        affected_nodes: isDatabricks ? ["ai-gateway"] : ["api-gateway"],
      },
    ],
    risks_and_gaps: [
      "Data volume and concurrency requirements need validation",
      input.security_compliance
        ? `Compliance scope (${input.security_compliance}) requires detailed control mapping`
        : "Security/compliance requirements not fully specified",
    ],
    next_best_actions: [
      "Validate assumptions with stakeholders",
      "Size compute and storage based on expected workload",
      "Define IaC templates and environment promotion strategy",
      "Run architecture review against production readiness checklist",
    ],
  };
}

export function getMockReviewResult(graph: ArchitectureGraph): ReviewResult {
  const hasGovernance = graph.nodes.some(
    (n) => n.category === "governance" || n.label.toLowerCase().includes("catalog")
  );
  const hasObservability = graph.nodes.some((n) => n.category === "observability");
  const hasMedallion = graph.zones?.some((z) =>
    ["bronze", "silver", "gold"].includes(z.id)
  );

  const findings = [];

  if (!hasGovernance && graph.platform === "databricks") {
    findings.push({
      id: "finding-governance",
      severity: "Required" as const,
      title: "Add Unity Catalog for unified governance",
      what_to_change: "Introduce Unity Catalog as the governance layer for all data and AI assets",
      why: "Databricks well-architected framework requires centralized access control, lineage, and auditing",
      benefit: "Consistent permissions, audit trails, and cross-workspace asset discovery",
      tradeoff: "Requires metastore setup and migration of existing tables",
      risk_if_ignored: "Siloed permissions, compliance gaps, and difficult lineage tracking",
      affected_nodes: graph.nodes.filter((n) => n.category === "storage").map((n) => n.id),
      confidence: "High" as const,
      suggested_node: {
        id: "unity-catalog-review",
        label: "Unity Catalog",
        category: "governance" as const,
        platform: "databricks" as const,
        required_level: "required" as const,
        description: "Unified governance for data and AI with lineage, ACLs, and auditing.",
      },
    });
  }

  if (!hasMedallion && graph.platform === "databricks") {
    findings.push({
      id: "finding-medallion",
      severity: "Strongly Recommended" as const,
      title: "Implement medallion architecture layers",
      what_to_change: "Organize data into bronze, silver, and gold Delta layers",
      why: "Medallion pattern is the Databricks-recommended approach for incremental refinement",
      benefit: "Clear data quality progression, simpler debugging, and reusable pipelines",
      tradeoff: "More storage tiers and pipeline complexity",
      risk_if_ignored: "Mixed-quality data in production tables, harder troubleshooting",
      affected_nodes: [],
      confidence: "High" as const,
    });
  }

  if (!hasObservability) {
    findings.push({
      id: "finding-observability",
      severity: "Strongly Recommended" as const,
      title: "Add observability and tracing",
      what_to_change: "Add monitoring, logging, and MLflow tracing for ML/GenAI workloads",
      why: "Production architectures need visibility into pipeline health and model behavior",
      benefit: "Faster incident response, performance tuning, and model evaluation",
      tradeoff: "Additional instrumentation effort and storage for traces",
      risk_if_ignored: "Blind spots in production, slower incident resolution",
      affected_nodes: [],
      confidence: "High" as const,
      suggested_node: {
        id: "observability-review",
        label: "MLflow Tracing",
        category: "observability" as const,
        platform: (graph.platform ?? "databricks") as "databricks",
        required_level: "recommended" as const,
        description: "End-to-end tracing and evaluation for ML and GenAI applications.",
      },
    });
  }

  findings.push({
    id: "finding-dr",
    severity: "Optional" as const,
    title: "Document disaster recovery strategy",
    what_to_change: "Define RPO/RTO targets and cross-region replication for critical data",
    why: "Reliability pillar requires explicit recovery planning",
    benefit: "Business continuity during regional outages",
    tradeoff: "Increased cost for replication and DR testing",
    risk_if_ignored: "Extended downtime during regional failures",
    affected_nodes: graph.nodes.filter((n) => n.category === "storage").map((n) => n.id),
    confidence: "Medium" as const,
  });

  const baseScore = 72 + (hasGovernance ? 8 : 0) + (hasMedallion ? 5 : 0) + (hasObservability ? 5 : 0);

  return {
    overall_score: Math.min(baseScore, 95),
    category_scores: {
      security: hasGovernance ? 78 : 62,
      reliability: 70,
      performance: 75,
      cost: 68,
      operations: hasObservability ? 76 : 60,
      governance: hasGovernance ? 82 : 55,
      explainability: 80,
    },
    findings,
    assumptions: graph.assumptions ?? [],
    open_questions: graph.unknowns ?? [],
  };
}
