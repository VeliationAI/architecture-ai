import OpenAI from "openai";
import {
  GenerationResultSchema,
  ReviewResultSchema,
  type CustomerInput,
  type ArchitectureGraph,
  type GenerationResult,
  type ReviewResult,
} from "../schema/graph.js";
import { buildGenerationPrompt, GENERATION_JSON_SCHEMA } from "../prompts/generation.js";
import { buildReviewPrompt, REVIEW_JSON_SCHEMA } from "../prompts/review.js";
import { getMockGenerationResult, getMockReviewResult } from "./mock.js";
import { relayoutGraph } from "../layout/auto-layout.js";

export interface LLMConfig {
  apiKey?: string;
  model?: string;
  useMock?: boolean;
}

function shouldUseMock(config: LLMConfig): boolean {
  if (config.useMock) return true;
  if (!config.apiKey || config.apiKey === "sk-...") return true;
  if (process.env.USE_MOCK_LLM === "true") return true;
  return false;
}

function getClient(config: LLMConfig): OpenAI | null {
  if (shouldUseMock(config)) return null;
  return new OpenAI({ apiKey: config.apiKey });
}

async function callStructured<T>(
  client: OpenAI,
  model: string,
  prompt: string,
  schemaName: string,
  schema: Record<string, unknown>
): Promise<T> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "developer",
        content:
          "You are a precise architecture copilot. Return only valid JSON matching the provided schema.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: schemaName,
        strict: true,
        schema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  return JSON.parse(content) as T;
}

export async function generateArchitecture(
  input: CustomerInput,
  config: LLMConfig = {}
): Promise<GenerationResult> {
  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (shouldUseMock(config)) {
    const result = getMockGenerationResult(input);
    result.graph = relayoutGraph(result.graph);
    return GenerationResultSchema.parse(result);
  }

  const client = getClient(config)!;
  const prompt = buildGenerationPrompt(input);
  const raw = await callStructured<GenerationResult>(
    client,
    model,
    prompt,
    "architecture_generation",
    GENERATION_JSON_SCHEMA as unknown as Record<string, unknown>
  );

  const parsed = GenerationResultSchema.parse(raw);
  parsed.graph = relayoutGraph({
    ...parsed.graph,
    rationales: parsed.component_rationale,
    suggestions: parsed.improvement_suggestions,
    created_at: new Date().toISOString(),
  });
  return parsed;
}

export async function reviewArchitecture(
  graph: ArchitectureGraph,
  input?: Partial<CustomerInput>,
  config: LLMConfig = {}
): Promise<ReviewResult> {
  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (shouldUseMock(config)) {
    return ReviewResultSchema.parse(getMockReviewResult(graph));
  }

  const client = getClient(config)!;
  const prompt = buildReviewPrompt(graph, input);
  const raw = await callStructured<ReviewResult>(
    client,
    model,
    prompt,
    "architecture_review",
    REVIEW_JSON_SCHEMA as unknown as Record<string, unknown>
  );

  return ReviewResultSchema.parse(raw);
}

export async function explainComponent(
  graph: ArchitectureGraph,
  nodeId: string,
  config: LLMConfig = {}
): Promise<string> {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Node ${nodeId} not found`);

  const rationale = graph.rationales?.find((r) => r.node_id === nodeId);

  if (shouldUseMock(config) || rationale) {
    if (rationale) {
      return [
        `## ${node.label}`,
        `**Purpose:** ${rationale.purpose}`,
        `**Why needed:** ${rationale.why_needed}`,
        `**Expected benefit:** ${rationale.expected_benefit}`,
        `**Implementation:** ${rationale.implementation_note}`,
        rationale.risk_if_omitted ? `**Risk if omitted:** ${rationale.risk_if_omitted}` : "",
        rationale.cost_impact ? `**Cost impact:** ${rationale.cost_impact}` : "",
        rationale.alternatives_considered.length
          ? `**Alternatives:** ${rationale.alternatives_considered.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  const client = getClient(config);
  if (!client) {
    return `**${node.label}** — ${node.description}`;
  }

  const model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "developer",
        content:
          "Explain this architecture component clearly for a solution architect. Cover purpose, why it is needed, benefits, tradeoffs, and implementation notes.",
      },
      {
        role: "user",
        content: `Component: ${JSON.stringify(node)}\nArchitecture context: ${graph.summary ?? graph.title ?? "Architecture"}`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? node.description;
}
