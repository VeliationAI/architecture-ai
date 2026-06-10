import { z } from "zod";

export const ScdTypeSchema = z.enum(["type0", "type1", "type2", "type3"]);
export type ScdType = z.infer<typeof ScdTypeSchema>;

export const TableTypeSchema = z.enum(["fact", "dimension", "bridge", "snapshot", "aggregate"]);
export type TableType = z.infer<typeof TableTypeSchema>;

export const ColumnSpecSchema = z.object({
  name: z.string(),
  data_type: z.string(),
  nullable: z.boolean().default(true),
  is_key: z.boolean().default(false),
  is_measure: z.boolean().default(false),
  description: z.string().optional(),
});
export type ColumnSpec = z.infer<typeof ColumnSpecSchema>;

export const TableExplanationSchema = z.object({
  business_purpose: z.string(),
  grain: z.string(),
  source_systems: z.array(z.string()).default([]),
  key_strategy: z.string(),
  scd_type: ScdTypeSchema.optional(),
  transformation_logic: z.string().optional(),
  data_quality_checks: z.array(z.string()).default([]),
  lineage: z.array(z.string()).default([]),
  downstream_consumers: z.array(z.string()).default([]),
  change_impact: z.string().optional(),
  why_needed: z.string(),
  expected_benefit: z.string(),
  tradeoff: z.string().optional(),
  risk_if_omitted: z.string().optional(),
});
export type TableExplanation = z.infer<typeof TableExplanationSchema>;

export const TableSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  table_type: TableTypeSchema,
  schema_name: z.string().default("gold"),
  columns: z.array(ColumnSpecSchema).default([]),
  explanation: TableExplanationSchema,
});
export type TableSpec = z.infer<typeof TableSpecSchema>;

export const ConceptualEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  entity_type: z.enum(["party", "event", "product", "location", "account", "document", "other"]),
  description: z.string(),
  related_entities: z.array(z.string()).default([]),
});
export type ConceptualEntity = z.infer<typeof ConceptualEntitySchema>;

export const LogicalRelationshipSchema = z.object({
  from_entity: z.string(),
  to_entity: z.string(),
  cardinality: z.string(),
  label: z.string().optional(),
});
export type LogicalRelationship = z.infer<typeof LogicalRelationshipSchema>;

export const TransformSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  source_tables: z.array(z.string()).default([]),
  target_table: z.string(),
  transform_type: z.enum(["sql", "dbt", "spark", "adf", "dlt"]).default("sql"),
  logic_summary: z.string(),
  schedule: z.string().optional(),
});
export type TransformSpec = z.infer<typeof TransformSpecSchema>;

export const DataModelPackageSchema = z.object({
  domain: z.string(),
  domain_pack: z.string().optional(),
  business_process: z.string(),
  conceptual: z.object({
    entities: z.array(ConceptualEntitySchema),
  }),
  logical: z.object({
    entities: z.array(ConceptualEntitySchema),
    relationships: z.array(LogicalRelationshipSchema),
  }),
  dimensional: z.object({
    facts: z.array(TableSpecSchema),
    dimensions: z.array(TableSpecSchema),
    bridges: z.array(TableSpecSchema).default([]),
  }),
  transforms: z.array(TransformSpecSchema).default([]),
});
export type DataModelPackage = z.infer<typeof DataModelPackageSchema>;
