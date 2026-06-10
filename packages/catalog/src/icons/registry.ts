/**
 * Official-style service icon registry.
 * AWS icons sourced from AWS Architecture Icons via awslabs/aws-icons-for-plantuml (local bundles).
 * Brand icons from Simple Icons. Databricks service icons are custom SVGs matching product palette.
 */

export interface ServiceIconMeta {
  src: string;
  alt: string;
  platform: string;
}

const AWS = "/icons/aws";
const DBX = "/icons/databricks";
const AZURE = "/icons/azure";
const GCP = "/icons/gcp";
const SNOW = "/icons/snowflake";
const GENERIC = "/icons/generic";

/** Component catalog icon keys → bundled asset paths */
export const ICON_REGISTRY: Record<string, ServiceIconMeta> = {
  // AWS
  "aws-redshift": { src: `${AWS}/redshift.png`, alt: "Amazon Redshift", platform: "aws" },
  "aws-s3": { src: `${AWS}/s3.png`, alt: "Amazon S3", platform: "aws" },
  "aws-lambda": { src: `${AWS}/lambda.png`, alt: "AWS Lambda", platform: "aws" },
  "aws-api-gateway": { src: `${AWS}/api-gateway.png`, alt: "Amazon API Gateway", platform: "aws" },
  "aws-rds": { src: `${AWS}/rds.png`, alt: "Amazon RDS", platform: "aws" },
  "aws-dynamodb": { src: `${AWS}/dynamodb.png`, alt: "Amazon DynamoDB", platform: "aws" },
  "aws-cloudwatch": { src: `${AWS}/cloudwatch.png`, alt: "Amazon CloudWatch", platform: "aws" },
  "aws-ec2": { src: `${AWS}/ec2.png`, alt: "Amazon EC2", platform: "aws" },
  "aws-ecs": { src: `${AWS}/ecs.png`, alt: "Amazon ECS", platform: "aws" },
  "aws-eks": { src: `${AWS}/eks.png`, alt: "Amazon EKS", platform: "aws" },
  "aws-glue": { src: `${AWS}/glue.png`, alt: "AWS Glue", platform: "aws" },
  "aws-kinesis": { src: `${AWS}/kinesis.png`, alt: "Amazon Kinesis", platform: "aws" },
  "aws-sagemaker": { src: `${AWS}/sagemaker.png`, alt: "Amazon SageMaker", platform: "aws" },
  "aws-sqs": { src: `${AWS}/sqs.png`, alt: "Amazon SQS", platform: "aws" },
  "aws-sns": { src: `${AWS}/sns.png`, alt: "Amazon SNS", platform: "aws" },
  "aws-eventbridge": { src: `${AWS}/eventbridge.png`, alt: "Amazon EventBridge", platform: "aws" },
  "aws-step-functions": { src: `${AWS}/step-functions.png`, alt: "AWS Step Functions", platform: "aws" },
  "aws-waf": { src: `${AWS}/waf.png`, alt: "AWS WAF", platform: "aws" },
  "aws-iam": { src: `${AWS}/iam.png`, alt: "AWS IAM", platform: "aws" },
  "aws-secrets-manager": { src: `${AWS}/secrets-manager.png`, alt: "AWS Secrets Manager", platform: "aws" },
  "aws-brand": { src: `${AWS}/brand.svg`, alt: "AWS", platform: "aws" },

  // Databricks
  "databricks-auto-loader": { src: `${DBX}/auto-loader.svg`, alt: "Auto Loader", platform: "databricks" },
  "databricks-delta-lake": { src: `${DBX}/delta-lake.svg`, alt: "Delta Lake", platform: "databricks" },
  "databricks-unity-catalog": { src: `${DBX}/unity-catalog.svg`, alt: "Unity Catalog", platform: "databricks" },
  "databricks-sql": { src: `${DBX}/sql-warehouse.svg`, alt: "Databricks SQL", platform: "databricks" },
  "databricks-genie": { src: `${DBX}/genie.svg`, alt: "AI/BI Genie", platform: "databricks" },
  "databricks-genie-spaces": { src: `${DBX}/genie-spaces.svg`, alt: "Genie Spaces", platform: "databricks" },
  "databricks-genie-agent": { src: `${DBX}/genie-agent.svg`, alt: "Genie Agent Mode", platform: "databricks" },
  "databricks-genie-ontology": { src: `${DBX}/genie-ontology.svg`, alt: "Genie Ontology", platform: "databricks" },
  "databricks-genie-mcp": { src: `${DBX}/mcp.svg`, alt: "Genie MCP", platform: "databricks" },
  "databricks-mlflow": { src: `${DBX}/mlflow.svg`, alt: "MLflow", platform: "databricks" },
  "databricks-ai-gateway": { src: `${DBX}/ai-gateway.svg`, alt: "Unity AI Gateway", platform: "databricks" },
  "databricks-dlt": { src: `${DBX}/dlt.svg`, alt: "Delta Live Tables", platform: "databricks" },
  "databricks-model-serving": { src: `${DBX}/model-serving.svg`, alt: "Model Serving", platform: "databricks" },
  "databricks-vector-search": { src: `${DBX}/vector-search.svg`, alt: "Vector Search", platform: "databricks" },
  "databricks-agent-bricks": { src: `${DBX}/agent-bricks.svg`, alt: "Agent Bricks", platform: "databricks" },
  "databricks-brand": { src: `${DBX}/brand.png`, alt: "Databricks", platform: "databricks" },

  // Snowflake
  "snowflake-warehouse": { src: `${SNOW}/warehouse.svg`, alt: "Snowflake Warehouse", platform: "snowflake" },
  "snowflake-cortex": { src: `${SNOW}/cortex.svg`, alt: "Snowflake Cortex", platform: "snowflake" },
  "snowflake-brand": { src: `${SNOW}/brand.png`, alt: "Snowflake", platform: "snowflake" },

  // Azure / GCP fallbacks
  "azure-brand": { src: `${AZURE}/brand.svg`, alt: "Microsoft Azure", platform: "azure" },
  "gcp-brand": { src: `${GCP}/brand.png`, alt: "Google Cloud", platform: "gcp" },

  // Generic categories
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
  "api-gateway": "aws-api-gateway",
  lambda: "aws-lambda",
  rds: "aws-rds",
  s3: "aws-s3",
  cloudwatch: "aws-cloudwatch",
  redshift: "aws-redshift",
  glue: "aws-glue",
  kinesis: "aws-kinesis",
  sagemaker: "aws-sagemaker",
  dynamodb: "aws-dynamodb",
  ec2: "aws-ec2",
  ecs: "aws-ecs",
  eks: "aws-eks",
  waf: "aws-waf",
  sqs: "aws-sqs",
  sns: "aws-sns",
};

/** Fuzzy label matching for LLM-generated node labels */
const LABEL_PATTERNS: { pattern: RegExp; key: string }[] = [
  // AWS
  { pattern: /redshift/i, key: "aws-redshift" },
  { pattern: /\bs3\b|simple storage/i, key: "aws-s3" },
  { pattern: /lambda/i, key: "aws-lambda" },
  { pattern: /api gateway/i, key: "aws-api-gateway" },
  { pattern: /\brds\b|relational database/i, key: "aws-rds" },
  { pattern: /dynamodb/i, key: "aws-dynamodb" },
  { pattern: /cloudwatch|cloud watch/i, key: "aws-cloudwatch" },
  { pattern: /\bec2\b/i, key: "aws-ec2" },
  { pattern: /\becs\b/i, key: "aws-ecs" },
  { pattern: /\beks\b|kubernetes/i, key: "aws-eks" },
  { pattern: /glue/i, key: "aws-glue" },
  { pattern: /kinesis/i, key: "aws-kinesis" },
  { pattern: /sagemaker/i, key: "aws-sagemaker" },
  { pattern: /\bsqs\b/i, key: "aws-sqs" },
  { pattern: /\bsns\b/i, key: "aws-sns" },
  { pattern: /eventbridge/i, key: "aws-eventbridge" },
  { pattern: /step functions/i, key: "aws-step-functions" },
  { pattern: /\bwaf\b|web application firewall/i, key: "aws-waf" },
  { pattern: /\biam\b|identity and access/i, key: "aws-iam" },
  { pattern: /secrets manager/i, key: "aws-secrets-manager" },
  // Databricks
  { pattern: /auto loader/i, key: "databricks-auto-loader" },
  { pattern: /delta live tables|\bdlt\b/i, key: "databricks-dlt" },
  { pattern: /delta lake|\bdelta\b/i, key: "databricks-delta-lake" },
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
  // Snowflake
  { pattern: /snowflake.*warehouse|warehouse.*snowflake/i, key: "snowflake-warehouse" },
  { pattern: /cortex|snowflake.*ai/i, key: "snowflake-cortex" },
  { pattern: /snowflake/i, key: "snowflake-brand" },
];

const CATEGORY_FALLBACK: Record<string, string> = {
  compute: "generic-compute",
  storage: "generic-storage",
  networking: "generic-networking",
  governance: "generic-governance",
  genai: "generic-genai",
  ml: "generic-genai",
  observability: "generic-observability",
  security: "generic-governance",
  ingestion: "databricks-auto-loader",
  serving: "databricks-sql",
  orchestration: "databricks-dlt",
  integration: "databricks-genie-mcp",
};

const PLATFORM_BRAND: Record<string, string> = {
  aws: "aws-brand",
  databricks: "databricks-brand",
  azure: "azure-brand",
  gcp: "gcp-brand",
  snowflake: "snowflake-brand",
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
