#!/usr/bin/env node
/**
 * Downloads brand SVG icons from Simple Icons (MIT) into apps/web/public/icons/brands/
 * Run: node scripts/sync-service-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../apps/web/public/icons/brands");
const CDN = "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons";

/** slug → output filename (without .svg) */
const BRANDS = {
  apachekafka: "kafka",
  confluent: "confluent",
  apachepulsar: "pulsar",
  amazonaws: "aws",
  amazonkinesis: "kinesis",
  amazonrds: "rds",
  amazondynamodb: "dynamodb",
  amazons3: "s3",
  awslambda: "lambda",
  amazonredshift: "redshift",
  amazonmsk: "msk",
  microsoftazure: "azure",
  googlecloud: "gcp",
  microsoftsqlserver: "sql-server",
  mysql: "mysql",
  ibmdb2: "db2",
  postgresql: "postgresql",
  mongodb: "mongodb",
  oracle: "oracle",
  snowflake: "snowflake",
  googlebigquery: "bigquery",
  salesforce: "salesforce",
  workday: "workday",
  googleanalytics: "google-analytics",
  servicenow: "servicenow",
  googleads: "google-ads",
  dynamics365: "dynamics-365",
  microsoftsharepoint: "sharepoint",
  apacheparquet: "parquet",
  apacheiceberg: "iceberg",
  databricks: "databricks",
  apachespark: "spark",
  redis: "redis",
  elasticsearch: "elasticsearch",
  tableau: "tableau",
  powerbi: "power-bi",
  dbt: "dbt",
  apacheairflow: "airflow",
  apacheflink: "flink",
  netflix: "netflix-conductor",
  fivetran: "fivetran",
  stitch: "stitch",
  looker: "looker",
  datadog: "datadog",
  splunk: "splunk",
  hashicorp: "terraform",
  kubernetes: "kubernetes",
  docker: "docker",
  github: "github",
  gitlab: "gitlab",
  jira: "jira",
  slack: "slack",
  teams: "microsoftteams",
  hubspot: "hubspot",
  sap: "sap",
  stripe: "stripe",
  paypal: "paypal",
  shopify: "shopify",
  adobe: "adobe",
  openai: "openai",
  anthropic: "anthropic",
  huggingface: "huggingface",
  langchain: "langchain",
  pinecone: "pinecone",
  weaviate: "weaviate",
  mlflow: "mlflow",
  feast: "feast",
  great_expectations: "great-expectations",
  prefect: "prefect",
  dagster: "dagster",
  supabase: "supabase",
  planetscale: "planetscale",
  cockroachlabs: "cockroachdb",
  neo4j: "neo4j",
  cassandra: "cassandra",
  influxdb: "influxdb",
  timescale: "timescale",
  clickhouse: "clickhouse",
  dremio: "dremio",
  trino: "trino",
  presto: "presto",
  apachehudi: "hudi",
  apachehive: "hive",
  apachehadoop: "hadoop",
  apachekafka_connect: "kafka-connect",
  eventstore: "eventstore",
  rabbitmq: "rabbitmq",
  nats: "nats",
  zeromq: "zeromq",
  microsoftpowerplatform: "power-platform",
  microsoftfabric: "fabric",
  synapse: "azure-synapse",
  azuredatafactory: "azure-data-factory",
  azureeventhubs: "azure-event-hubs",
  azuredevops: "azure-devops",
  googlepubsub: "gcp-pubsub",
  googlecloudstorage: "gcs",
  googlecloudcomposer: "cloud-composer",
  googlelooker: "looker-studio",
  netsuite: "netsuite",
  zendesk: "zendesk",
  twilio: "twilio",
  segment: "segment",
  amplitude: "amplitude",
  mixpanel: "mixpanel",
};

async function fetchIcon(slug, name) {
  const url = `${CDN}/${slug}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  skip ${name} (${slug}): HTTP ${res.status}`);
    return false;
  }
  const svg = await res.text();
  await writeFile(path.join(OUT, `${name}.svg`), svg, "utf8");
  console.log(`  ✓ ${name}`);
  return true;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("Syncing brand icons to", OUT);
  let ok = 0;
  let fail = 0;
  for (const [slug, name] of Object.entries(BRANDS)) {
    if (await fetchIcon(slug, name)) ok++;
    else fail++;
  }
  console.log(`Done: ${ok} saved, ${fail} skipped`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
