/**
 * Service icon registry — brand logos + abstract concept icons.
 * Brand SVGs: Simple Icons (MIT) via scripts/sync-service-icons.mjs
 * Concept SVGs: custom line-art in public/icons/concepts/
 */

export interface ServiceIconMeta {
  src: string;
  alt: string;
  platform: string;
  /** White tile background like enterprise architecture diagrams */
  tile?: boolean;
}

const BRAND = "/icons/brands";
const CONCEPT = "/icons/concepts";
const DBX = "/icons/databricks";
const GENERIC = "/icons/generic";

function brand(file: string, alt: string, platform = "generic"): ServiceIconMeta {
  return { src: `${BRAND}/${file}.svg`, alt, platform, tile: true };
}

function concept(file: string, alt: string): ServiceIconMeta {
  return { src: `${CONCEPT}/${file}.svg`, alt, platform: "generic", tile: true };
}

function dbx(file: string, alt: string): ServiceIconMeta {
  const name = file.endsWith(".svg") ? file : `${file}.svg`;
  return { src: `${DBX}/${name}`, alt, platform: "databricks", tile: true };
}

/** Component catalog icon keys → bundled asset paths */
export const ICON_REGISTRY: Record<string, ServiceIconMeta> = {
  // ── Message / streaming ──
  "brand-kafka": brand("kafka", "Apache Kafka"),
  "brand-confluent": brand("confluent", "Confluent"),
  "brand-pulsar": brand("pulsar", "Apache Pulsar"),
  "brand-msk": brand("msk", "Amazon MSK", "aws"),
  "brand-kinesis": brand("kinesis", "Amazon Kinesis", "aws"),
  "brand-azure-event-hubs": brand("azure-event-hubs", "Azure Event Hubs", "azure"),
  "brand-gcp-pubsub": brand("gcp-pubsub", "Google Cloud Pub/Sub", "gcp"),
  "brand-rabbitmq": brand("rabbitmq", "RabbitMQ"),
  "brand-flink": brand("flink", "Apache Flink"),
  "brand-spark": brand("spark", "Apache Spark"),

  // ── Databases ──
  "brand-sql-server": brand("sql-server", "Microsoft SQL Server", "azure"),
  "brand-mysql": brand("mysql", "MySQL"),
  "brand-db2": brand("db2", "IBM DB2"),
  "brand-postgresql": brand("postgresql", "PostgreSQL"),
  "brand-mongodb": brand("mongodb", "MongoDB"),
  "brand-oracle": brand("oracle", "Oracle Database"),
  "brand-azure-sql": brand("azure-sql", "Azure SQL", "azure"),
  "brand-rds": brand("rds", "Amazon RDS", "aws"),
  "brand-snowflake": brand("snowflake", "Snowflake", "snowflake"),
  "brand-bigquery": brand("bigquery", "Google BigQuery", "gcp"),
  "brand-dynamodb": brand("dynamodb", "Amazon DynamoDB", "aws"),
  "brand-redis": brand("redis", "Redis"),
  "brand-cockroachdb": brand("cockroachdb", "CockroachDB"),
  "brand-clickhouse": brand("clickhouse", "ClickHouse"),
  "brand-neo4j": brand("neo4j", "Neo4j"),
  "brand-supabase": brand("supabase", "Supabase"),

  // ── Enterprise apps ──
  "brand-salesforce": brand("salesforce", "Salesforce"),
  "brand-workday": brand("workday", "Workday"),
  "brand-google-analytics": brand("google-analytics", "Google Analytics", "gcp"),
  "brand-netsuite": brand("netsuite", "Oracle NetSuite"),
  "brand-servicenow": brand("servicenow", "ServiceNow"),
  "brand-google-ads": brand("google-ads", "Google Ads", "gcp"),
  "brand-dynamics-365": brand("dynamics-365", "Microsoft Dynamics 365", "azure"),
  "brand-sharepoint": brand("sharepoint", "Microsoft SharePoint", "azure"),
  "brand-sap": brand("sap", "SAP"),
  "brand-hubspot": brand("hubspot", "HubSpot"),
  "brand-zendesk": brand("zendesk", "Zendesk"),
  "brand-shopify": brand("shopify", "Shopify"),
  "brand-stripe": brand("stripe", "Stripe"),

  // ── Lakehouse / storage formats ──
  "brand-parquet": brand("parquet", "Apache Parquet"),
  "brand-iceberg": brand("iceberg", "Apache Iceberg"),
  "brand-hadoop": brand("hadoop", "Apache Hadoop"),
  "brand-hive": brand("hive", "Apache Hive"),
  "brand-gcs": brand("gcs", "Google Cloud Storage", "gcp"),
  "brand-s3": brand("s3", "Amazon S3", "aws"),

  // ── Cloud platforms (intake + canvas) ──
  "brand-aws": brand("aws", "Amazon Web Services", "aws"),
  "brand-azure": brand("azure", "Microsoft Azure", "azure"),
  "brand-gcp": brand("gcp", "Google Cloud", "gcp"),
  "brand-databricks": brand("databricks", "Databricks", "databricks"),
  /** @deprecated use brand-* keys — kept for backward compatibility */
  "aws-brand": brand("aws", "Amazon Web Services", "aws"),
  "azure-brand": brand("azure", "Microsoft Azure", "azure"),
  "gcp-brand": brand("gcp", "Google Cloud", "gcp"),
  "databricks-brand": brand("databricks", "Databricks", "databricks"),
  "snowflake-brand": brand("snowflake", "Snowflake", "snowflake"),

  // ── AWS services ──
  "brand-lambda": brand("lambda", "AWS Lambda", "aws"),
  "brand-redshift": brand("redshift", "Amazon Redshift", "aws"),
  "brand-glue": brand("glue", "AWS Glue", "aws"),

  // ── Azure data ──
  "brand-azure-synapse": brand("azure-synapse", "Azure Synapse", "azure"),
  "brand-azure-data-factory": brand("azure-data-factory", "Azure Data Factory", "azure"),
  "brand-fabric": brand("fabric", "Microsoft Fabric", "azure"),

  // ── Analytics / BI / ML ──
  "brand-tableau": brand("tableau", "Tableau"),
  "brand-power-bi": brand("power-bi", "Power BI", "azure"),
  "brand-looker": brand("looker", "Looker", "gcp"),
  "brand-dbt": brand("dbt", "dbt"),
  "brand-airflow": brand("airflow", "Apache Airflow"),
  "brand-mlflow": brand("mlflow", "MLflow"),
  "brand-openai": brand("openai", "OpenAI"),
  "brand-anthropic": brand("anthropic", "Anthropic"),

  // ── Observability / DevOps ──
  "brand-datadog": brand("datadog", "Datadog"),
  "brand-splunk": brand("splunk", "Splunk"),
  "brand-kubernetes": brand("kubernetes", "Kubernetes"),
  "brand-docker": brand("docker", "Docker"),
  "brand-terraform": brand("terraform", "Terraform"),
  "brand-github": brand("github", "GitHub"),
  "brand-gitlab": brand("gitlab", "GitLab"),

  // ── Databricks product icons ──
  "databricks-auto-loader": dbx("auto-loader.svg", "Auto Loader"),
  "databricks-delta-lake": dbx("delta-lake.svg", "Delta Lake"),
  "databricks-unity-catalog": dbx("unity-catalog.svg", "Unity Catalog"),
  "databricks-sql": dbx("sql-warehouse.svg", "Databricks SQL"),
  "databricks-genie": dbx("genie.svg", "AI/BI Genie"),
  "databricks-genie-spaces": dbx("genie-spaces.svg", "Genie Spaces"),
  "databricks-genie-agent": dbx("genie-agent.svg", "Genie Agent Mode"),
  "databricks-genie-ontology": dbx("genie-ontology.svg", "Genie Ontology"),
  "databricks-genie-mcp": dbx("mcp.svg", "Genie MCP"),
  "databricks-mlflow": dbx("mlflow.svg", "MLflow"),
  "databricks-ai-gateway": dbx("ai-gateway.svg", "Unity AI Gateway"),
  "databricks-dlt": dbx("dlt.svg", "Delta Live Tables"),
  "databricks-model-serving": dbx("model-serving.svg", "Model Serving"),
  "databricks-vector-search": dbx("vector-search.svg", "Vector Search"),
  "databricks-agent-bricks": dbx("agent-bricks.svg", "Agent Bricks"),

  // ── Snowflake product icons ──
  "snowflake-warehouse": { src: "/icons/snowflake/warehouse.svg", alt: "Snowflake Warehouse", platform: "snowflake", tile: true },
  "snowflake-cortex": { src: "/icons/snowflake/cortex.svg", alt: "Snowflake Cortex", platform: "snowflake", tile: true },

  // ── Abstract concepts (line-art) ──
  "concept-batch": concept("batch", "Batch ingestion"),
  "concept-cdc": concept("cdc", "Change Data Capture"),
  "concept-streaming": concept("streaming", "Streaming"),
  "concept-streaming-analytics": concept("streaming-analytics", "Streaming analytics"),
  "concept-bi-reporting": concept("bi-reporting", "BI & reporting"),
  "concept-data-sharing": concept("data-sharing", "Data sharing"),
  "concept-ai-apps": concept("ai-apps", "AI applications"),
  "concept-apps": concept("apps", "Applications"),
  "concept-ingestion": concept("ingestion", "Data ingestion"),
  "concept-integration": concept("integration", "Integration"),
  "concept-customer-churn": concept("customer-churn", "Customer churn prediction"),
  "concept-customer-segmentation": concept("customer-segmentation", "Customer segmentation"),
  "concept-hr-analytics": concept("hr-analytics", "HR analytics"),
  "concept-operational-dashboard": concept("operational-dashboard", "Operational dashboards"),
  "concept-risk-assessment": concept("risk-assessment", "Risk assessment"),

  // ── Generic category fallbacks ──
  "generic-compute": { src: `${GENERIC}/compute.svg`, alt: "Compute", platform: "generic" },
  "generic-storage": { src: `${GENERIC}/storage.svg`, alt: "Storage", platform: "generic" },
  "generic-networking": { src: `${GENERIC}/networking.svg`, alt: "Networking", platform: "generic" },
  "generic-governance": { src: `${GENERIC}/governance.svg`, alt: "Governance", platform: "generic" },
  "generic-genai": { src: `${GENERIC}/genai.svg`, alt: "GenAI", platform: "generic" },
  "generic-observability": { src: `${GENERIC}/observability.svg`, alt: "Observability", platform: "generic" },
};

/** Catalog component id → icon key */
export const COMPONENT_ICON_KEYS: Record<string, string> = {
  "auto-loader": "databricks-auto-loader",
  "delta-lake": "databricks-delta-lake",
  "unity-catalog": "databricks-unity-catalog",
  "databricks-sql": "databricks-sql",
  genie: "databricks-genie",
  "genie-spaces": "databricks-genie-spaces",
  "genie-agent-mode": "databricks-genie-agent",
  "genie-ontology": "databricks-genie-ontology",
  "genie-mcp": "databricks-genie-mcp",
  mlflow: "databricks-mlflow",
  "ai-gateway": "databricks-ai-gateway",
  dlt: "databricks-dlt",
  "model-serving": "databricks-model-serving",
  "vector-search": "databricks-vector-search",
  "agent-bricks": "databricks-agent-bricks",
  kafka: "brand-kafka",
  confluent: "brand-confluent",
  pulsar: "brand-pulsar",
  msk: "brand-msk",
  kinesis: "brand-kinesis",
  "event-hubs": "brand-azure-event-hubs",
  pubsub: "brand-gcp-pubsub",
  "sql-server": "brand-sql-server",
  mysql: "brand-mysql",
  db2: "brand-db2",
  postgresql: "brand-postgresql",
  mongodb: "brand-mongodb",
  oracle: "brand-oracle",
  rds: "brand-rds",
  snowflake: "brand-snowflake",
  bigquery: "brand-bigquery",
  dynamodb: "brand-dynamodb",
  salesforce: "brand-salesforce",
  workday: "brand-workday",
  servicenow: "brand-servicenow",
  sharepoint: "brand-sharepoint",
  s3: "brand-s3",
  lambda: "brand-lambda",
  redshift: "brand-redshift",
  glue: "brand-glue",
  tableau: "brand-tableau",
  "power-bi": "brand-power-bi",
  dbt: "brand-dbt",
  airflow: "brand-airflow",
  spark: "brand-spark",
  flink: "brand-flink",
  parquet: "brand-parquet",
  iceberg: "brand-iceberg",
};

/** Fuzzy label matching for LLM-generated node labels */
const LABEL_PATTERNS: { pattern: RegExp; key: string }[] = [
  // Message / streaming
  { pattern: /\bkafka\b/i, key: "brand-kafka" },
  { pattern: /confluent/i, key: "brand-confluent" },
  { pattern: /pulsar/i, key: "brand-pulsar" },
  { pattern: /\bmsk\b|managed streaming/i, key: "brand-msk" },
  { pattern: /kinesis/i, key: "brand-kinesis" },
  { pattern: /event hub/i, key: "brand-azure-event-hubs" },
  { pattern: /pub\/sub|pubsub/i, key: "brand-gcp-pubsub" },
  { pattern: /rabbitmq|rabbit mq/i, key: "brand-rabbitmq" },
  { pattern: /\bflink\b/i, key: "brand-flink" },
  { pattern: /\bspark\b|pyspark/i, key: "brand-spark" },
  // Ingestion patterns
  { pattern: /\bbatch\b(?!.*live)/i, key: "concept-batch" },
  { pattern: /\bcdc\b|change data capture/i, key: "concept-cdc" },
  { pattern: /streaming analytics/i, key: "concept-streaming-analytics" },
  { pattern: /\bstreaming\b|real.?time|realtime/i, key: "concept-streaming" },
  // Databases
  { pattern: /sql server|mssql/i, key: "brand-sql-server" },
  { pattern: /\bmysql\b/i, key: "brand-mysql" },
  { pattern: /\bdb2\b/i, key: "brand-db2" },
  { pattern: /postgres/i, key: "brand-postgresql" },
  { pattern: /mongo/i, key: "brand-mongodb" },
  { pattern: /\boracle\b(?!.*netsuite)/i, key: "brand-oracle" },
  { pattern: /azure sql/i, key: "brand-azure-sql" },
  { pattern: /\brds\b|relational database service/i, key: "brand-rds" },
  { pattern: /snowflake/i, key: "brand-snowflake" },
  { pattern: /bigquery|big query/i, key: "brand-bigquery" },
  { pattern: /dynamodb|dynamo db/i, key: "brand-dynamodb" },
  { pattern: /\bredis\b/i, key: "brand-redis" },
  { pattern: /clickhouse/i, key: "brand-clickhouse" },
  { pattern: /neo4j/i, key: "brand-neo4j" },
  { pattern: /supabase/i, key: "brand-supabase" },
  // Enterprise apps
  { pattern: /salesforce|sfdc/i, key: "brand-salesforce" },
  { pattern: /workday/i, key: "brand-workday" },
  { pattern: /google analytics|\bga4\b/i, key: "brand-google-analytics" },
  { pattern: /netsuite/i, key: "brand-netsuite" },
  { pattern: /servicenow|service now/i, key: "brand-servicenow" },
  { pattern: /google ads/i, key: "brand-google-ads" },
  { pattern: /dynamics\s*365|d365/i, key: "brand-dynamics-365" },
  { pattern: /sharepoint/i, key: "brand-sharepoint" },
  { pattern: /\bsap\b/i, key: "brand-sap" },
  { pattern: /hubspot/i, key: "brand-hubspot" },
  { pattern: /zendesk/i, key: "brand-zendesk" },
  { pattern: /shopify/i, key: "brand-shopify" },
  { pattern: /stripe/i, key: "brand-stripe" },
  // Lakehouse / formats
  { pattern: /parquet/i, key: "brand-parquet" },
  { pattern: /iceberg/i, key: "brand-iceberg" },
  { pattern: /\bhive\b/i, key: "brand-hive" },
  { pattern: /hadoop|hdfs/i, key: "brand-hadoop" },
  { pattern: /cloud storage|\bgcs\b/i, key: "brand-gcs" },
  { pattern: /\bs3\b|simple storage/i, key: "brand-s3" },
  // Azure data
  { pattern: /synapse/i, key: "brand-azure-synapse" },
  { pattern: /data factory|\badf\b/i, key: "brand-azure-data-factory" },
  { pattern: /\bfabric\b|one lake/i, key: "brand-fabric" },
  // Analytics / BI / ML
  { pattern: /tableau/i, key: "brand-tableau" },
  { pattern: /power bi|powerbi/i, key: "brand-power-bi" },
  { pattern: /looker(?!.*studio)/i, key: "brand-looker" },
  { pattern: /\bdbt\b/i, key: "brand-dbt" },
  { pattern: /airflow/i, key: "brand-airflow" },
  { pattern: /datadog/i, key: "brand-datadog" },
  { pattern: /splunk/i, key: "brand-splunk" },
  { pattern: /kubernetes|\bk8s\b|\beks\b|\baks\b|\bgke\b/i, key: "brand-kubernetes" },
  { pattern: /docker|container/i, key: "brand-docker" },
  { pattern: /terraform|\biac\b/i, key: "brand-terraform" },
  { pattern: /\bopenai\b|chatgpt|gpt-4/i, key: "brand-openai" },
  { pattern: /anthropic|claude/i, key: "brand-anthropic" },
  { pattern: /\bbi\b|business intelligence|reporting dashboard/i, key: "concept-bi-reporting" },
  { pattern: /data sharing|marketplace|delta share/i, key: "concept-data-sharing" },
  { pattern: /ai app|ml app|intelligent app/i, key: "concept-ai-apps" },
  // Use cases
  { pattern: /churn/i, key: "concept-customer-churn" },
  { pattern: /segmentation|customer segment/i, key: "concept-customer-segmentation" },
  { pattern: /hr analytics|workforce/i, key: "concept-hr-analytics" },
  { pattern: /operational dashboard|ops dashboard/i, key: "concept-operational-dashboard" },
  { pattern: /risk assess|risk optim/i, key: "concept-risk-assessment" },
  // AWS
  { pattern: /redshift/i, key: "brand-redshift" },
  { pattern: /lambda/i, key: "brand-lambda" },
  { pattern: /glue/i, key: "brand-glue" },
  // Databricks
  { pattern: /auto loader/i, key: "databricks-auto-loader" },
  { pattern: /delta live tables|\bdlt\b/i, key: "databricks-dlt" },
  { pattern: /delta lake|\bdelta\b(?!.*share)/i, key: "databricks-delta-lake" },
  { pattern: /unity catalog/i, key: "databricks-unity-catalog" },
  { pattern: /sql warehouse|databricks sql/i, key: "databricks-sql" },
  { pattern: /genie spaces/i, key: "databricks-genie-spaces" },
  { pattern: /genie agent|agent mode/i, key: "databricks-genie-agent" },
  { pattern: /genie ontology|ontology/i, key: "databricks-genie-ontology" },
  { pattern: /\bgenie\b|ai\/bi/i, key: "databricks-genie" },
  { pattern: /ai gateway|unity ai gateway/i, key: "databricks-ai-gateway" },
  { pattern: /mlflow/i, key: "databricks-mlflow" },
  { pattern: /vector search/i, key: "databricks-vector-search" },
  { pattern: /model serving/i, key: "databricks-model-serving" },
  { pattern: /agent bricks/i, key: "databricks-agent-bricks" },
  { pattern: /\bmcp\b/i, key: "databricks-genie-mcp" },
  { pattern: /snowflake.*warehouse|warehouse.*snowflake/i, key: "snowflake-warehouse" },
  { pattern: /cortex|snowflake.*ai/i, key: "snowflake-cortex" },
];

const CATEGORY_FALLBACK: Record<string, string> = {
  compute: "generic-compute",
  storage: "generic-storage",
  networking: "generic-networking",
  governance: "generic-governance",
  genai: "generic-genai",
  ml: "concept-ai-apps",
  observability: "generic-observability",
  security: "generic-governance",
  ingestion: "concept-ingestion",
  serving: "concept-bi-reporting",
  orchestration: "databricks-dlt",
  integration: "concept-integration",
  other: "concept-apps",
};

const PLATFORM_BRAND: Record<string, string> = {
  aws: "brand-aws",
  databricks: "brand-databricks",
  azure: "brand-azure",
  gcp: "brand-gcp",
  snowflake: "brand-snowflake",
};

export function getIconByKey(iconKey: string): ServiceIconMeta | null {
  return ICON_REGISTRY[iconKey] ?? null;
}

export function resolveServiceIcon(options: {
  componentId?: string;
  label?: string;
  platform?: string;
  category?: string;
}): ServiceIconMeta {
  const { componentId, label, platform, category } = options;
  const normalizedLabel = label ?? "";
  const normalizedId = componentId ?? "";

  if (normalizedId && COMPONENT_ICON_KEYS[normalizedId]) {
    const meta = getIconByKey(COMPONENT_ICON_KEYS[normalizedId]);
    if (meta) return meta;
  }

  for (const { pattern, key } of LABEL_PATTERNS) {
    if (pattern.test(normalizedLabel) || pattern.test(normalizedId)) {
      const meta = getIconByKey(key);
      if (meta) return meta;
    }
  }

  if (category && CATEGORY_FALLBACK[category]) {
    const meta = getIconByKey(CATEGORY_FALLBACK[category]);
    if (meta) return meta;
  }

  if (platform && PLATFORM_BRAND[platform]) {
    const meta = getIconByKey(PLATFORM_BRAND[platform]);
    if (meta) return meta;
  }

  return getIconByKey("generic-compute")!;
}

/** List all registered icons (for docs / debugging) */
export function listRegisteredIcons(): ServiceIconMeta[] {
  return Object.values(ICON_REGISTRY);
}
