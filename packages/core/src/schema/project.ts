import { z } from "zod";
import {
  ArchitectureGraphSchema,
  ComponentRationaleSchema,
  ImprovementSuggestionSchema,
  ReviewResultSchema,
  CustomerInputSchema,
} from "./graph.js";
import { DataModelPackageSchema } from "./data-model.js";

export const DesignIntentSchema = z.enum([
  "time_to_market",
  "governance_reliability",
  "scale_ai_ready",
]);
export type DesignIntent = z.infer<typeof DesignIntentSchema>;

export const CategoryScoresSchema = z.object({
  security: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
  cost: z.number().min(0).max(100),
  operations: z.number().min(0).max(100),
  governance: z.number().min(0).max(100),
  explainability: z.number().min(0).max(100),
});
export type CategoryScores = z.infer<typeof CategoryScoresSchema>;

export const DesignVariantSchema = z.object({
  variant_id: z.string(),
  title: z.string(),
  design_intent: DesignIntentSchema,
  thesis: z.string(),
  overall_score: z.number().min(0).max(100),
  category_scores: CategoryScoresSchema,
  architecture_graph: ArchitectureGraphSchema,
  component_rationale: z.array(ComponentRationaleSchema).default([]),
  improvement_suggestions: z.array(ImprovementSuggestionSchema).default([]),
  key_tradeoffs: z.array(z.string()).default([]),
  recommended_for: z.array(z.string()).default([]),
  not_ideal_for: z.array(z.string()).default([]),
  data_model: DataModelPackageSchema.optional(),
  review: ReviewResultSchema.optional(),
});
export type DesignVariant = z.infer<typeof DesignVariantSchema>;

export const MergeSuggestionSchema = z.object({
  id: z.string(),
  source_variant_id: z.string(),
  title: z.string(),
  description: z.string(),
  node_ids: z.array(z.string()).default([]),
  table_ids: z.array(z.string()).default([]),
});
export type MergeSuggestion = z.infer<typeof MergeSuggestionSchema>;

export const ProjectSummarySchema = z.object({
  use_case: z.string(),
  platform: z.string(),
  domain: z.string().optional(),
  industry: z.string().optional(),
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

export const VariantBundleSchema = z.object({
  id: z.string().optional(),
  project_summary: ProjectSummarySchema,
  variants: z.array(DesignVariantSchema).min(1).max(3),
  default_recommendation: z.string(),
  mergeable_suggestions: z.array(MergeSuggestionSchema).default([]),
  architecture_summary: z.string().optional(),
  risks_and_gaps: z.array(z.string()).default([]),
  next_best_actions: z.array(z.string()).default([]),
  created_at: z.string().optional(),
});
export type VariantBundle = z.infer<typeof VariantBundleSchema>;

export const RequirementsProfileSchema = CustomerInputSchema.extend({
  classified_intents: z.array(DesignIntentSchema).default([]),
  domain_hint: z.string().optional(),
  nfr_weights: z
    .object({
      cost: z.number().default(1),
      governance: z.number().default(1),
      speed: z.number().default(1),
      scale: z.number().default(1),
    })
    .optional(),
});
export type RequirementsProfile = z.infer<typeof RequirementsProfileSchema>;

export const ApprovalCommentSchema = z.object({
  id: z.string(),
  author: z.string().default("Reviewer"),
  target_type: z.enum(["variant", "node", "table", "assumption"]),
  target_id: z.string(),
  comment: z.string(),
  status: z.enum(["open", "resolved"]).default("open"),
  created_at: z.string(),
});
export type ApprovalComment = z.infer<typeof ApprovalCommentSchema>;

export const ApprovalStateSchema = z.object({
  status: z.enum(["draft", "in_review", "approved", "changes_requested"]).default("draft"),
  approved_variant_id: z.string().optional(),
  comments: z.array(ApprovalCommentSchema).default([]),
  assumptions_pending: z.array(z.string()).default([]),
  signed_off_at: z.string().optional(),
  signed_off_by: z.string().optional(),
});
export type ApprovalState = z.infer<typeof ApprovalStateSchema>;

export const DesignProjectSchema = z.object({
  id: z.string(),
  requirements: RequirementsProfileSchema,
  variant_bundle: VariantBundleSchema,
  active_variant_id: z.string(),
  approval: ApprovalStateSchema.default({ status: "draft", comments: [], assumptions_pending: [] }),
  updated_at: z.string().optional(),
});
export type DesignProject = z.infer<typeof DesignProjectSchema>;

export const PortfolioResultSchema = z.object({
  project: DesignProjectSchema,
});
export type PortfolioResult = z.infer<typeof PortfolioResultSchema>;

export type StudioMode = "generate" | "review" | "compare" | "approve" | "export";
export type WorkArea = "architecture" | "model" | "compare";
