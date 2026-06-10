import { z } from "zod";

export const RequiredLevelSchema = z.enum(["required", "recommended", "optional"]);
export type RequiredLevel = z.infer<typeof RequiredLevelSchema>;

export const PlatformSchema = z.enum([
  "databricks",
  "aws",
  "azure",
  "gcp",
  "snowflake",
  "generic",
  "llm",
]);
export type Platform = z.infer<typeof PlatformSchema>;

export const NodeCategorySchema = z.enum([
  "ingestion",
  "storage",
  "compute",
  "serving",
  "governance",
  "security",
  "observability",
  "networking",
  "orchestration",
  "ml",
  "genai",
  "integration",
  "other",
]);
export type NodeCategory = z.infer<typeof NodeCategorySchema>;

export const ArchitectureNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: NodeCategorySchema,
  platform: PlatformSchema,
  environment: z.string().optional(),
  required_level: RequiredLevelSchema,
  description: z.string(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  zone_id: z.string().optional(),
  icon: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ArchitectureNode = z.infer<typeof ArchitectureNodeSchema>;

export const ArchitectureEdgeSchema = z.object({
  id: z.string().optional(),
  from: z.string(),
  to: z.string(),
  protocol_or_flow: z.string(),
  description: z.string(),
});
export type ArchitectureEdge = z.infer<typeof ArchitectureEdgeSchema>;

export const ArchitectureZoneSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["vpc", "subnet", "zone", "layer", "environment", "other"]),
});
export type ArchitectureZone = z.infer<typeof ArchitectureZoneSchema>;

export const ComponentRationaleSchema = z.object({
  node_id: z.string(),
  purpose: z.string(),
  why_needed: z.string(),
  expected_benefit: z.string(),
  implementation_note: z.string(),
  alternatives_considered: z.array(z.string()).default([]),
  risk_if_omitted: z.string().optional(),
  cost_impact: z.string().optional(),
});
export type ComponentRationale = z.infer<typeof ComponentRationaleSchema>;

export const ImprovementSuggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
  add_or_change: z.string(),
  reason: z.string(),
  benefit: z.string(),
  tradeoff: z.string(),
  risk_if_skipped: z.string(),
  affected_nodes: z.array(z.string()).default([]),
  suggested_node: ArchitectureNodeSchema.optional(),
});
export type ImprovementSuggestion = z.infer<typeof ImprovementSuggestionSchema>;

export const ArchitectureGraphSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
  platform: PlatformSchema.optional(),
  nodes: z.array(ArchitectureNodeSchema),
  edges: z.array(ArchitectureEdgeSchema),
  zones: z.array(ArchitectureZoneSchema).default([]),
  assumptions: z.array(z.string()).default([]),
  unknowns: z.array(z.string()).default([]),
  rationales: z.array(ComponentRationaleSchema).default([]),
  suggestions: z.array(ImprovementSuggestionSchema).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ArchitectureGraph = z.infer<typeof ArchitectureGraphSchema>;

export const CustomerInputSchema = z.object({
  business_goal: z.string(),
  industry: z.string().optional(),
  primary_users: z.string().optional(),
  expected_scale: z.string().optional(),
  latency_expectations: z.string().optional(),
  availability_sla: z.string().optional(),
  security_compliance: z.string().optional(),
  platform_preference: PlatformSchema.default("databricks"),
  current_stack: z.string().optional(),
  data_sources: z.string().optional(),
  data_mode: z.enum(["batch", "streaming", "both"]).optional(),
  analytics_needs: z.string().optional(),
  budget_sensitivity: z.string().optional(),
  pain_points: z.string().optional(),
  must_reuse: z.string().optional(),
  must_avoid: z.string().optional(),
  priorities: z.array(z.string()).default([]),
});
export type CustomerInput = z.infer<typeof CustomerInputSchema>;

export const ReviewFindingSchema = z.object({
  id: z.string(),
  severity: z.enum(["Required", "Strongly Recommended", "Optional"]),
  title: z.string(),
  what_to_change: z.string(),
  why: z.string(),
  benefit: z.string(),
  tradeoff: z.string(),
  risk_if_ignored: z.string(),
  affected_nodes: z.array(z.string()).default([]),
  confidence: z.enum(["High", "Medium", "Low"]),
  suggested_node: ArchitectureNodeSchema.optional(),
});
export type ReviewFinding = z.infer<typeof ReviewFindingSchema>;

export const ReviewResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  category_scores: z.object({
    security: z.number().min(0).max(100),
    reliability: z.number().min(0).max(100),
    performance: z.number().min(0).max(100),
    cost: z.number().min(0).max(100),
    operations: z.number().min(0).max(100),
    governance: z.number().min(0).max(100),
    explainability: z.number().min(0).max(100),
  }),
  findings: z.array(ReviewFindingSchema),
  assumptions: z.array(z.string()).default([]),
  open_questions: z.array(z.string()).default([]),
});
export type ReviewResult = z.infer<typeof ReviewResultSchema>;

export const GenerationResultSchema = z.object({
  architecture_summary: z.string(),
  recommended_architecture: z.string(),
  graph: ArchitectureGraphSchema,
  component_rationale: z.array(ComponentRationaleSchema),
  improvement_suggestions: z.array(ImprovementSuggestionSchema),
  risks_and_gaps: z.array(z.string()),
  next_best_actions: z.array(z.string()),
});
export type GenerationResult = z.infer<typeof GenerationResultSchema>;
