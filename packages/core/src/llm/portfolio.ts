import type { CustomerInput } from "../schema/graph.js";
import type { PortfolioResult, DesignProject, DesignVariant } from "../schema/project.js";
import { PortfolioResultSchema } from "../schema/project.js";
import { getMockPortfolioResult, variantToGenerationResult } from "./mock-portfolio.js";
import { relayoutGraph } from "../layout/auto-layout.js";
import { generateDataModelForVariant } from "../data-model/generator.js";
import type { LLMConfig } from "./client.js";

function shouldUseMock(config: LLMConfig): boolean {
  if (config.useMock) return true;
  if (!config.apiKey || config.apiKey === "sk-...") return true;
  if (process.env.USE_MOCK_LLM === "true") return true;
  return false;
}

export async function generatePortfolio(
  input: CustomerInput,
  config: LLMConfig = {}
): Promise<PortfolioResult> {
  if (shouldUseMock(config)) {
    const result = getMockPortfolioResult(input);
    return PortfolioResultSchema.parse(result);
  }

  // LLM path: use mock portfolio structure until dedicated prompt is wired
  const result = getMockPortfolioResult(input);
  return PortfolioResultSchema.parse(result);
}

export function adoptVariant(project: DesignProject, variantId: string): DesignProject {
  const variant = project.variant_bundle.variants.find((v) => v.variant_id === variantId);
  if (!variant) return project;

  return {
    ...project,
    active_variant_id: variantId,
    variant_bundle: {
      ...project.variant_bundle,
      default_recommendation: variantId,
    },
    updated_at: new Date().toISOString(),
  };
}

export function updateActiveVariant(
  project: DesignProject,
  updater: (variant: DesignVariant) => DesignVariant
): DesignProject {
  const variants = project.variant_bundle.variants.map((v) =>
    v.variant_id === project.active_variant_id ? updater(v) : v
  );
  return {
    ...project,
    variant_bundle: { ...project.variant_bundle, variants },
    updated_at: new Date().toISOString(),
  };
}

export function getActiveVariant(project: DesignProject): DesignVariant | undefined {
  return project.variant_bundle.variants.find((v) => v.variant_id === project.active_variant_id);
}

export function ensureDataModel(project: DesignProject): DesignProject {
  return updateActiveVariant(project, (variant) => {
    if (variant.data_model) return variant;
    return {
      ...variant,
      data_model: generateDataModelForVariant(project.requirements, variant),
    };
  });
}

export function relayoutActiveVariant(project: DesignProject): DesignProject {
  return updateActiveVariant(project, (variant) => ({
    ...variant,
    architecture_graph: relayoutGraph(variant.architecture_graph),
  }));
}

export { variantToGenerationResult };
