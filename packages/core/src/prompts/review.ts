import type { ArchitectureGraph, CustomerInput } from "../schema/graph.js";
import { buildReviewContext } from "@architecture-ai/catalog";

export function buildReviewPrompt(
  graph: ArchitectureGraph,
  input?: Partial<CustomerInput>
): string {
  const platform = graph.platform ?? input?.platform_preference ?? "databricks";
  const reviewContext = buildReviewContext(platform);

  return `You are an architecture review engine.

You are given:
- a typed architecture graph,
- the selected provider/platform,
- system requirements,
- non-functional requirements,
- and optional customer constraints.

Your job is to review the architecture like a senior solution architect.

Instructions:
- Score the design on security, reliability, performance, cost, operations, governance, and explainability.
- Identify missing components, weak links, hidden risks, and over-engineering.
- Prefer minimal changes that materially improve the design.
- Do not suggest components unless you can explain their purpose and expected impact.
- Distinguish platform-native recommendations from cross-platform generic advice.
- Mark suggestions as Required, Strongly Recommended, or Optional.
- Use the platform review knowledge below — it reflects the latest platform capabilities and techniques.
- For Databricks, check Genie Spaces, Agent Mode, Ontology, Inspect, MCP via AI Gateway, medallion layers, Unity Catalog, and MLflow tracing.
- Return only valid JSON matching the schema.

<Platform_Review_Knowledge>
${reviewContext}
</Platform_Review_Knowledge>

Platform: ${platform}
Business goal: ${input?.business_goal ?? "Not specified"}
Security/compliance: ${input?.security_compliance ?? "Not specified"}

Architecture graph:
${JSON.stringify(graph, null, 2)}

Return JSON with this exact structure:
{
  "overall_score": 0-100,
  "category_scores": {
    "security": 0-100,
    "reliability": 0-100,
    "performance": 0-100,
    "cost": 0-100,
    "operations": 0-100,
    "governance": 0-100,
    "explainability": 0-100
  },
  "findings": [
    {
      "id": "string",
      "severity": "Required|Strongly Recommended|Optional",
      "title": "string",
      "what_to_change": "string",
      "why": "string",
      "benefit": "string",
      "tradeoff": "string",
      "risk_if_ignored": "string",
      "affected_nodes": ["string"],
      "confidence": "High|Medium|Low"
    }
  ],
  "assumptions": ["string"],
  "open_questions": ["string"]
}`;
}

export const REVIEW_JSON_SCHEMA = {
  type: "object",
  properties: {
    overall_score: { type: "number" },
    category_scores: {
      type: "object",
      properties: {
        security: { type: "number" },
        reliability: { type: "number" },
        performance: { type: "number" },
        cost: { type: "number" },
        operations: { type: "number" },
        governance: { type: "number" },
        explainability: { type: "number" },
      },
      required: ["security", "reliability", "performance", "cost", "operations", "governance", "explainability"],
      additionalProperties: false,
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          severity: { type: "string" },
          title: { type: "string" },
          what_to_change: { type: "string" },
          why: { type: "string" },
          benefit: { type: "string" },
          tradeoff: { type: "string" },
          risk_if_ignored: { type: "string" },
          affected_nodes: { type: "array", items: { type: "string" } },
          confidence: { type: "string" },
        },
        required: ["id", "severity", "title", "what_to_change", "why", "benefit", "tradeoff", "risk_if_ignored", "confidence"],
        additionalProperties: false,
      },
    },
    assumptions: { type: "array", items: { type: "string" } },
    open_questions: { type: "array", items: { type: "string" } },
  },
  required: ["overall_score", "category_scores", "findings"],
  additionalProperties: false,
} as const;
