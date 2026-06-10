import type { CustomerInput } from "../schema/graph.js";
import type { DesignVariant } from "../schema/project.js";
import type { DataModelPackage, TableSpec } from "../schema/data-model.js";
import { resolveDomainPack } from "@architecture-ai/catalog";

function inferDomain(input: CustomerInput): string {
  return input.industry ?? resolveDomainPack(input.industry, input.business_goal).name;
}

function makeTable(
  id: string,
  name: string,
  tableType: TableSpec["table_type"],
  purpose: string,
  grain: string,
  cols: { name: string; type: string; key?: boolean; measure?: boolean }[]
): TableSpec {
  return {
    id,
    name,
    table_type: tableType,
    schema_name: tableType === "fact" ? "gold" : "gold",
    columns: cols.map((c) => ({
      name: c.name,
      data_type: c.type,
      nullable: !c.key,
      is_key: c.key ?? false,
      is_measure: c.measure ?? false,
    })),
    explanation: {
      business_purpose: purpose,
      grain,
      source_systems: ["source_systems"],
      key_strategy: cols.filter((c) => c.key).map((c) => c.name).join(", ") || "surrogate key",
      scd_type: tableType === "dimension" ? "type2" : undefined,
      data_quality_checks: ["not_null keys", "referential integrity"],
      lineage: ["silver layer"],
      downstream_consumers: ["BI dashboards", "ML features"],
      why_needed: purpose,
      expected_benefit: `Enables ${purpose.toLowerCase()} analytics at ${grain}`,
      tradeoff: "Adds storage and pipeline complexity",
      risk_if_omitted: "Incomplete analytics coverage for this business process",
    },
  };
}

export function generateDataModelForVariant(
  input: CustomerInput,
  variant: DesignVariant
): DataModelPackage {
  const pack = resolveDomainPack(input.industry, input.business_goal);
  const intent = variant.design_intent;
  const domain = inferDomain(input);

  const entities = pack.entity_mappings.map((m, i) => ({
    id: `entity-${i}`,
    name: m.domain_label,
    entity_type: (m.universal_id === "party"
      ? "party"
      : m.universal_id === "event"
        ? "event"
        : m.universal_id === "product"
          ? "product"
          : m.universal_id === "location"
            ? "location"
            : m.universal_id === "account"
              ? "account"
              : "other") as DataModelPackage["conceptual"]["entities"][0]["entity_type"],
    description: m.domain_description,
    related_entities: [],
  }));

  const factCount = intent === "time_to_market" ? 2 : intent === "governance_reliability" ? 4 : 5;
  const dimCount = intent === "time_to_market" ? 4 : intent === "governance_reliability" ? 8 : 10;

  const facts: TableSpec[] = [];
  const dimensions: TableSpec[] = [];

  for (let i = 0; i < factCount; i++) {
    const factName = pack.common_facts[i] ?? `fact_${i + 1}`;
    facts.push(
      makeTable(
        `fact-${i}`,
        factName,
        "fact",
        `${pack.name} ${factName.replace(/_/g, " ")}`,
        `One row per ${factName.replace(/_fact$/, "").replace(/_/g, " ")} event`,
        [
          { name: `${factName}_key`, type: "BIGINT", key: true },
          { name: "date_key", type: "INT", key: true },
          { name: "amount", type: "DECIMAL(18,2)", measure: true },
          { name: "quantity", type: "INT", measure: true },
        ]
      )
    );
  }

  for (let i = 0; i < dimCount; i++) {
    const dimName = pack.common_dimensions[i] ?? `dim_${i + 1}`;
    dimensions.push(
      makeTable(
        `dim-${i}`,
        dimName,
        "dimension",
        `Conformed ${dimName.replace(/_/g, " ")}`,
        `One row per ${dimName.replace(/_dim$/, "").replace(/_/g, " ")}`,
        [
          { name: `${dimName}_key`, type: "INT", key: true },
          { name: "business_key", type: "STRING" },
          { name: "name", type: "STRING" },
          { name: "effective_from", type: "DATE" },
          { name: "effective_to", type: "DATE" },
        ]
      )
    );
  }

  if (intent === "scale_ai_ready") {
    facts.push(
      makeTable(
        "fact-event-stream",
        "event_stream_fact",
        "fact",
        "Near-real-time event capture for AI/ML features",
        "One row per streaming event",
        [
          { name: "event_id", type: "STRING", key: true },
          { name: "event_timestamp", type: "TIMESTAMP", key: true },
          { name: "feature_vector_ref", type: "STRING" },
        ]
      )
    );
  }

  return {
    domain,
    domain_pack: pack.id,
    business_process: input.business_goal.slice(0, 120),
    conceptual: { entities },
    logical: {
      entities,
      relationships: entities.slice(0, -1).map((e, i) => ({
        from_entity: e.id,
        to_entity: entities[i + 1].id,
        cardinality: "1:N",
        label: "relates to",
      })),
    },
    dimensional: { facts, dimensions, bridges: [] },
    transforms: facts.map((f, i) => ({
      id: `transform-${i}`,
      name: `load_${f.name}`,
      source_tables: ["silver.conformed"],
      target_table: `gold.${f.name}`,
      transform_type: intent === "time_to_market" ? "sql" : "dlt",
      logic_summary: `Aggregate and conform source data into ${f.name} at ${f.explanation.grain}`,
      schedule: intent === "scale_ai_ready" ? "continuous" : "daily",
    })),
  };
}
