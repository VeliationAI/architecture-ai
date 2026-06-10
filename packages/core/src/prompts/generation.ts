import type { CustomerInput } from "../schema/graph.js";
import {
  buildPromptContext,
  findRelevantTechniques,
  type PlatformTechnique,
} from "@architecture-ai/catalog";

export function buildGenerationPrompt(input: CustomerInput): string {
  const platformContext = buildPromptContext(input.platform_preference);

  const relevantKeywords = [
    input.business_goal,
    input.analytics_needs ?? "",
    input.pain_points ?? "",
    input.priorities.join(" "),
  ].join(" ");

  const relevantTechniques = findRelevantTechniques(
    input.platform_preference,
    relevantKeywords.split(/\s+/)
  );

  const techniqueFocus =
    relevantTechniques.length > 0
      ? `\nPrioritize these platform techniques for this use case:\n${relevantTechniques
          .map((t: PlatformTechnique) => `- ${t.name}: ${t.description}`)
          .join("\n")}\n`
      : "";

  return `You are an expert cloud and data architecture copilot.

Your job is to turn the customer's use case into:
1. a recommended target architecture,
2. an explainable list of components and connections,
3. a set of improvement suggestions,
4. a clean architecture graph that can be rendered on a visual canvas.

Follow these rules:
- Be practical and opinionated.
- Prefer platform-native services when they clearly reduce complexity.
- If information is missing, make limited assumptions and label them clearly.
- Distinguish between required components, recommended components, and optional enhancements.
- For every suggested component, explain why it was added, what problem it solves, what tradeoff it introduces, and what risk exists if it is omitted.
- Optimize for clarity, maintainability, security, reliability, performance, observability, governance, and cost.
- Use the platform knowledge below as the source of truth for components, techniques, and best practices.
- When the use case involves natural-language analytics, BI, or data agents, include Genie Spaces, Agent Mode, and knowledge store patterns where platform is Databricks.
- Return output as valid JSON matching the schema exactly.

<Platform_Knowledge>
${platformContext}
${techniqueFocus}
</Platform_Knowledge>

<Customer_Input>
Business goal: ${input.business_goal}
Industry: ${input.industry ?? "Not specified"}
Primary users: ${input.primary_users ?? "Not specified"}
Expected scale: ${input.expected_scale ?? "Not specified"}
Latency expectations: ${input.latency_expectations ?? "Not specified"}
Availability/SLA needs: ${input.availability_sla ?? "Not specified"}
Security/compliance requirements: ${input.security_compliance ?? "Not specified"}
Cloud/platform preference: ${input.platform_preference}
Current stack: ${input.current_stack ?? "Not specified"}
Data sources: ${input.data_sources ?? "Not specified"}
Batch / streaming / both: ${input.data_mode ?? "Not specified"}
Analytics / ML / GenAI needs: ${input.analytics_needs ?? "Not specified"}
Budget sensitivity: ${input.budget_sensitivity ?? "Not specified"}
Existing pain points: ${input.pain_points ?? "Not specified"}
Anything that must be reused: ${input.must_reuse ?? "Not specified"}
Anything that must be avoided: ${input.must_avoid ?? "Not specified"}
Priorities: ${input.priorities.length ? input.priorities.join(", ") : "Not specified"}
</Customer_Input>

Return JSON with this exact structure:
{
  "architecture_summary": "string",
  "recommended_architecture": "string",
  "graph": {
    "title": "string",
    "platform": "${input.platform_preference}",
    "nodes": [{ "id": "string", "label": "string", "category": "ingestion|storage|compute|serving|governance|security|observability|networking|orchestration|ml|genai|integration|other", "platform": "databricks|aws|azure|gcp|snowflake|generic|llm", "environment": "string", "required_level": "required|recommended|optional", "description": "string", "zone_id": "string" }],
    "edges": [{ "from": "string", "to": "string", "protocol_or_flow": "string", "description": "string" }],
    "zones": [{ "id": "string", "label": "string", "type": "vpc|subnet|zone|layer|environment|other" }],
    "assumptions": ["string"],
    "unknowns": ["string"]
  },
  "component_rationale": [{ "node_id": "string", "purpose": "string", "why_needed": "string", "expected_benefit": "string", "implementation_note": "string", "alternatives_considered": ["string"], "risk_if_omitted": "string", "cost_impact": "string" }],
  "improvement_suggestions": [{ "id": "string", "title": "string", "priority": "High|Medium|Low", "add_or_change": "string", "reason": "string", "benefit": "string", "tradeoff": "string", "risk_if_skipped": "string", "affected_nodes": ["string"] }],
  "risks_and_gaps": ["string"],
  "next_best_actions": ["string"]
}`;
}

export const GENERATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    architecture_summary: { type: "string" },
    recommended_architecture: { type: "string" },
    graph: {
      type: "object",
      properties: {
        title: { type: "string" },
        platform: { type: "string" },
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              category: { type: "string" },
              platform: { type: "string" },
              environment: { type: "string" },
              required_level: { type: "string" },
              description: { type: "string" },
              zone_id: { type: "string" },
            },
            required: ["id", "label", "category", "platform", "required_level", "description"],
            additionalProperties: false,
          },
        },
        edges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              protocol_or_flow: { type: "string" },
              description: { type: "string" },
            },
            required: ["from", "to", "protocol_or_flow", "description"],
            additionalProperties: false,
          },
        },
        zones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              type: { type: "string" },
            },
            required: ["id", "label", "type"],
            additionalProperties: false,
          },
        },
        assumptions: { type: "array", items: { type: "string" } },
        unknowns: { type: "array", items: { type: "string" } },
      },
      required: ["nodes", "edges"],
      additionalProperties: false,
    },
    component_rationale: {
      type: "array",
      items: {
        type: "object",
        properties: {
          node_id: { type: "string" },
          purpose: { type: "string" },
          why_needed: { type: "string" },
          expected_benefit: { type: "string" },
          implementation_note: { type: "string" },
          alternatives_considered: { type: "array", items: { type: "string" } },
          risk_if_omitted: { type: "string" },
          cost_impact: { type: "string" },
        },
        required: ["node_id", "purpose", "why_needed", "expected_benefit", "implementation_note"],
        additionalProperties: false,
      },
    },
    improvement_suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          priority: { type: "string" },
          add_or_change: { type: "string" },
          reason: { type: "string" },
          benefit: { type: "string" },
          tradeoff: { type: "string" },
          risk_if_skipped: { type: "string" },
          affected_nodes: { type: "array", items: { type: "string" } },
        },
        required: ["id", "title", "priority", "add_or_change", "reason", "benefit", "tradeoff", "risk_if_skipped"],
        additionalProperties: false,
      },
    },
    risks_and_gaps: { type: "array", items: { type: "string" } },
    next_best_actions: { type: "array", items: { type: "string" } },
  },
  required: [
    "architecture_summary",
    "recommended_architecture",
    "graph",
    "component_rationale",
    "improvement_suggestions",
    "risks_and_gaps",
    "next_best_actions",
  ],
  additionalProperties: false,
} as const;
