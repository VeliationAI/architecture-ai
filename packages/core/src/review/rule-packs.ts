import type { ArchitectureGraph, ReviewFinding } from "../schema/graph.js";

export interface RulePack {
  id: string;
  name: string;
  platform: string;
  description: string;
  rules: Rule[];
}

export interface Rule {
  id: string;
  title: string;
  severity: "Required" | "Strongly Recommended" | "Optional";
  check: (graph: ArchitectureGraph) => boolean;
  finding: (graph: ArchitectureGraph) => Omit<ReviewFinding, "id" | "confidence"> & {
    confidence?: "High" | "Medium" | "Low";
  };
}

export const databricksRulePack: RulePack = {
  id: "databricks-well-architected",
  name: "Databricks Well-Architected",
  platform: "databricks",
  description:
    "Checks aligned with Databricks well-architected lakehouse framework: medallion, Unity Catalog, governance, MLflow, and AI Gateway.",
  rules: [
    {
      id: "dbx-unity-catalog",
      title: "Unity Catalog governance",
      severity: "Required",
      check: (g) =>
        g.nodes.some(
          (n) =>
            n.category === "governance" ||
            n.label.toLowerCase().includes("unity catalog")
        ),
      finding: () => ({
        severity: "Required",
        title: "Add Unity Catalog",
        what_to_change: "Add Unity Catalog as the unified governance layer",
        why: "Databricks recommends Unity Catalog for access control, lineage, and auditing across data and AI assets",
        benefit: "Centralized permissions, audit logs, and cross-workspace discovery",
        tradeoff: "Metastore setup and potential migration effort",
        risk_if_ignored: "Fragmented governance and compliance gaps",
        affected_nodes: [],
        confidence: "High",
        suggested_node: {
          id: "unity-catalog-rule",
          label: "Unity Catalog",
          category: "governance",
          platform: "databricks",
          required_level: "required",
          description: "Unified governance for data and AI assets.",
        },
      }),
    },
    {
      id: "dbx-medallion",
      title: "Medallion architecture",
      severity: "Strongly Recommended",
      check: (g) => {
        const labels = g.nodes.map((n) => n.label.toLowerCase()).join(" ");
        const zones = (g.zones ?? []).map((z) => z.id.toLowerCase());
        return (
          (labels.includes("bronze") && labels.includes("silver")) ||
          zones.includes("bronze")
        );
      },
      finding: () => ({
        severity: "Strongly Recommended",
        title: "Implement medallion layers",
        what_to_change: "Structure data into bronze, silver, and gold Delta layers",
        why: "Medallion architecture is the recommended Databricks pattern for incremental data quality",
        benefit: "Clear data progression, easier debugging, reusable pipelines",
        tradeoff: "Additional pipeline and storage tiers",
        risk_if_ignored: "Mixed-quality data reaching production consumers",
        affected_nodes: [],
        confidence: "High",
      }),
    },
    {
      id: "dbx-mlflow",
      title: "MLflow tracing for GenAI/ML",
      severity: "Strongly Recommended",
      check: (g) => {
        const hasMl = g.nodes.some((n) => n.category === "ml" || n.category === "genai");
        const hasMlflow = g.nodes.some((n) =>
          n.label.toLowerCase().includes("mlflow")
        );
        return !hasMl || hasMlflow;
      },
      finding: (g) => ({
        severity: "Strongly Recommended",
        title: "Add MLflow tracing and evaluation",
        what_to_change: "Instrument ML/GenAI pipelines with MLflow tracing",
        why: "Production ML and GenAI apps need traceability and evaluation loops",
        benefit: "Debug prompts, compare models, and monitor production quality",
        tradeoff: "Instrumentation overhead and trace storage costs",
        risk_if_ignored: "No visibility into model/prompt behavior in production",
        affected_nodes: g.nodes
          .filter((n) => n.category === "ml" || n.category === "genai")
          .map((n) => n.id),
        confidence: "High",
        suggested_node: {
          id: "mlflow-rule",
          label: "MLflow Tracing",
          category: "observability",
          platform: "databricks",
          required_level: "recommended",
          description: "Trace and evaluate ML/GenAI applications.",
        },
      }),
    },
    {
      id: "dbx-genie-spaces",
      title: "Genie Spaces for conversational analytics",
      severity: "Strongly Recommended",
      check: (g) => {
        const hasAnalytics = g.nodes.some(
          (n) =>
            n.category === "serving" ||
            n.category === "genai" ||
            n.label.toLowerCase().includes("sql") ||
            n.label.toLowerCase().includes("bi")
        );
        const hasGenie = g.nodes.some((n) =>
          n.label.toLowerCase().includes("genie")
        );
        return !hasAnalytics || hasGenie;
      },
      finding: () => ({
        severity: "Strongly Recommended",
        title: "Add AI/BI Genie with curated Genie Spaces",
        what_to_change:
          "Introduce Genie Spaces with knowledge store, certified metrics, and domain guardrails",
        why: "Databricks Genie provides governed natural-language analytics with verified metric logic",
        benefit: "Self-serve BI with trust — business users query data without writing SQL",
        tradeoff: "Requires knowledge store curation and benchmark testing",
        risk_if_ignored: "Ungoverned text-to-SQL or shadow BI tools outside Unity Catalog",
        affected_nodes: [],
        confidence: "High",
        suggested_node: {
          id: "genie-spaces-rule",
          label: "Genie Spaces",
          category: "genai",
          platform: "databricks",
          required_level: "recommended",
          description:
            "Curated semantic experiences with knowledge stores and verified metrics.",
        },
      }),
    },
    {
      id: "dbx-genie-agent-mode",
      title: "Genie Agent Mode for complex analysis",
      severity: "Optional",
      check: (g) => {
        const hasGenie = g.nodes.some((n) => n.label.toLowerCase().includes("genie"));
        const hasAgentMode = g.nodes.some((n) =>
          n.label.toLowerCase().includes("agent mode")
        );
        return !hasGenie || hasAgentMode;
      },
      finding: () => ({
        severity: "Optional",
        title: "Enable Genie Agent Mode for multi-step reasoning",
        what_to_change:
          "Add Genie Agent Mode for iterative plan-explore-reflect analysis",
        why: "Agent Mode handles complex 'why/how' questions with hypothesis testing and multiple SQL queries",
        benefit: "Professional-grade analysis for non-technical users on open-ended questions",
        tradeoff: "Higher compute cost and longer response times for deep investigations",
        risk_if_ignored: "Users cannot answer multi-domain root-cause questions conversationally",
        affected_nodes: [],
        confidence: "Medium",
        suggested_node: {
          id: "genie-agent-mode-rule",
          label: "Genie Agent Mode",
          category: "genai",
          platform: "databricks",
          required_level: "optional",
          description: "Iterative agentic reasoning over governed data assets.",
        },
      }),
    },
    {
      id: "dbx-genie-ontology",
      title: "Genie Ontology for business knowledge",
      severity: "Optional",
      check: (g) => {
        const hasGenie = g.nodes.some((n) => n.label.toLowerCase().includes("genie"));
        const hasOntology = g.nodes.some((n) =>
          n.label.toLowerCase().includes("ontology")
        );
        return !hasGenie || hasOntology;
      },
      finding: () => ({
        severity: "Optional",
        title: "Add Genie Ontology for automatic knowledge extraction",
        what_to_change:
          "Enable Genie Ontology to auto-build business knowledge maps from existing assets",
        why: "Ontology extracts and ranks knowledge from dashboards, notebooks, and pipelines",
        benefit: "Improved asset discovery and response accuracy without manual curation at scale",
        tradeoff: "Quality depends on source asset documentation",
        risk_if_ignored: "Manual knowledge curation bottleneck as workspace grows",
        affected_nodes: [],
        confidence: "Medium",
        suggested_node: {
          id: "genie-ontology-rule",
          label: "Genie Ontology",
          category: "governance",
          platform: "databricks",
          required_level: "optional",
          description: "Auto-built business knowledge map from workspace assets.",
        },
      }),
    },
    {
      id: "dbx-ai-gateway",
      title: "Unity AI Gateway for LLM governance",
      severity: "Optional",
      check: (g) => {
        const hasGenAi = g.nodes.some((n) => n.category === "genai");
        const hasGateway = g.nodes.some((n) =>
          n.label.toLowerCase().includes("ai gateway")
        );
        return !hasGenAi || hasGateway;
      },
      finding: () => ({
        severity: "Optional",
        title: "Route LLM traffic through AI Gateway",
        what_to_change: "Add Unity AI Gateway for governed LLM and MCP access",
        why: "Databricks positions AI Gateway for visibility, access control, and audit across AI endpoints",
        benefit: "Policy enforcement, cost tracking, and audit logging for AI traffic",
        tradeoff: "Additional routing hop and configuration",
        risk_if_ignored: "Ungoverned LLM access and untracked AI spend",
        affected_nodes: [],
        confidence: "Medium",
        suggested_node: {
          id: "ai-gateway-rule",
          label: "Unity AI Gateway",
          category: "genai",
          platform: "databricks",
          required_level: "optional",
          description: "Governed routing for LLM endpoints, agents, and MCP servers.",
        },
      }),
    },
  ],
};

export const awsRulePack: RulePack = {
  id: "aws-well-architected",
  name: "AWS Well-Architected",
  platform: "aws",
  description: "Basic checks for security, reliability, and observability on AWS architectures.",
  rules: [
    {
      id: "aws-monitoring",
      title: "Observability stack",
      severity: "Strongly Recommended",
      check: (g) => g.nodes.some((n) => n.category === "observability"),
      finding: () => ({
        severity: "Strongly Recommended",
        title: "Add CloudWatch monitoring",
        what_to_change: "Add centralized logging, metrics, and alerting",
        why: "Operational excellence pillar requires production visibility",
        benefit: "Faster incident detection and resolution",
        tradeoff: "Monitoring costs scale with log volume",
        risk_if_ignored: "Blind spots during production incidents",
        affected_nodes: [],
        confidence: "High",
      }),
    },
    {
      id: "aws-security",
      title: "Security controls",
      severity: "Required",
      check: (g) =>
        g.nodes.some(
          (n) => n.category === "security" || n.label.toLowerCase().includes("waf")
        ),
      finding: () => ({
        severity: "Required",
        title: "Add WAF and secrets management",
        what_to_change: "Add WAF, IAM least-privilege, and Secrets Manager",
        why: "Security pillar requires defense in depth for public-facing workloads",
        benefit: "Reduced attack surface and credential exposure",
        tradeoff: "Configuration complexity and WAF rule maintenance",
        risk_if_ignored: "Increased vulnerability to common web attacks",
        affected_nodes: [],
        confidence: "High",
      }),
    },
  ],
};

export const RULE_PACKS: RulePack[] = [databricksRulePack, awsRulePack];

export function runRulePack(
  graph: ArchitectureGraph,
  packId: string
): ReviewFinding[] {
  const pack = RULE_PACKS.find((p) => p.id === packId);
  if (!pack) return [];

  const findings: ReviewFinding[] = [];

  for (const rule of pack.rules) {
    if (!rule.check(graph)) {
      const f = rule.finding(graph);
      findings.push({
        id: rule.id,
        confidence: f.confidence ?? "High",
        ...f,
      });
    }
  }

  return findings;
}

export function runAllRulePacks(graph: ArchitectureGraph): ReviewFinding[] {
  const platform = graph.platform ?? "databricks";
  const relevantPacks = RULE_PACKS.filter(
    (p) => p.platform === platform || p.platform === "generic"
  );
  return relevantPacks.flatMap((pack) => runRulePack(graph, pack.id));
}
