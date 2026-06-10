import type { PlatformKnowledge, PlatformTechnique } from "./types.js";
import { DATABRICKS_KNOWLEDGE } from "./databricks.js";
import { AWS_KNOWLEDGE } from "./aws.js";

const REGISTRY: Record<string, PlatformKnowledge> = {
  databricks: DATABRICKS_KNOWLEDGE,
  aws: AWS_KNOWLEDGE,
};

export function getPlatformKnowledge(platform: string): PlatformKnowledge | null {
  return REGISTRY[platform] ?? null;
}

export function getAllPlatformKnowledge(): PlatformKnowledge[] {
  return Object.values(REGISTRY);
}

export function getRegistryVersion(): string {
  const versions = Object.values(REGISTRY).map((p) => p.version);
  return versions.sort().reverse()[0] ?? "0.0.0";
}

export function buildPromptContext(platform: string): string {
  const knowledge = getPlatformKnowledge(platform);
  if (!knowledge) {
    return `Platform: ${platform} — use cloud-native best practices.`;
  }

  const componentList = knowledge.components
    .map((c) => `- ${c.label}: ${c.description}`)
    .join("\n");

  const techniqueList = knowledge.techniques
    .map(
      (t) =>
        `- ${t.name} (${t.added_in_version}): ${t.description}. Use when: ${t.when_to_use}`
    )
    .join("\n");

  const hints = knowledge.generation_hints.map((h) => `- ${h}`).join("\n");

  return `
Platform: ${knowledge.display_name} (knowledge version ${knowledge.version}, updated ${knowledge.last_updated})

Key components:
${componentList}

Advanced techniques:
${techniqueList}

Architecture guidance:
${hints}

Review dimensions: ${knowledge.review_dimensions.join("; ")}
`.trim();
}

export function buildReviewContext(platform: string): string {
  const knowledge = getPlatformKnowledge(platform);
  if (!knowledge) return "";

  const techniqueChecks = knowledge.techniques
    .map((t) => `- ${t.name}: ${t.best_practices[0]}`)
    .join("\n");

  return `
Review against ${knowledge.display_name} knowledge v${knowledge.version}:
Dimensions: ${knowledge.review_dimensions.join(", ")}

Technique checks:
${techniqueChecks}
`.trim();
}

export function findRelevantTechniques(
  platform: string,
  keywords: string[]
): PlatformTechnique[] {
  const knowledge = getPlatformKnowledge(platform);
  if (!knowledge) return [];

  const lower = keywords.join(" ").toLowerCase();
  return knowledge.techniques.filter(
    (t) =>
      lower.includes(t.category) ||
      lower.includes(t.name.toLowerCase()) ||
      t.when_to_use.toLowerCase().split(" ").some((w) => lower.includes(w)) ||
      ["genai", "genie", "analytics", "bi", "natural language", "agent", "chat"].some(
        (k) => lower.includes(k) && (t.category === "genai" || t.id.includes("genie"))
      )
  );
}

export function getComponentsForPlatform(platform: string) {
  return getPlatformKnowledge(platform)?.components ?? [];
}

export function getTemplatesForPlatform(platform: string) {
  return getPlatformKnowledge(platform)?.templates ?? [];
}
