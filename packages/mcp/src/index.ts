#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  CustomerInputSchema,
  ArchitectureGraphSchema,
  DesignVariantSchema,
  generateArchitecture,
  generatePortfolio,
  reviewArchitecture,
  explainComponent,
  exportToMermaid,
  exportToTerraformStub,
  createClientSummary,
  applySuggestion,
  runAllRulePacks,
  mergeReviewIntoGraph,
  RULE_PACKS,
  compareVariants,
  exportToDbtStub,
  exportToAdfPipelineStub,
  exportToDatabricksWorkflowStub,
  generateDataModelForVariant,
} from "@architecture-ai/core";
import {
  getCatalogForPlatform,
  getPlatformKnowledge,
  getAllPlatformKnowledge,
  DOMAIN_PACKS,
} from "@architecture-ai/catalog";

const server = new Server(
  {
    name: "architecture-ai-studio",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

const sessionGraphs = new Map<string, z.infer<typeof ArchitectureGraphSchema>>();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_architecture",
      description:
        "Generate an explainable target architecture from a use case description. Returns a typed architecture graph with component rationale and improvement suggestions.",
      inputSchema: {
        type: "object",
        properties: {
          business_goal: { type: "string", description: "Primary business goal" },
          platform_preference: {
            type: "string",
            enum: ["databricks", "aws", "azure", "gcp", "snowflake"],
            description: "Target cloud/platform",
          },
          industry: { type: "string" },
          expected_scale: { type: "string" },
          security_compliance: { type: "string" },
          data_sources: { type: "string" },
          analytics_needs: { type: "string" },
          pain_points: { type: "string" },
        },
        required: ["business_goal"],
      },
    },
    {
      name: "review_architecture",
      description:
        "Review an architecture graph against platform well-architected rule packs and LLM analysis. Returns scores, findings, and suggestions.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object", description: "Architecture graph JSON" },
        },
        required: ["graph"],
      },
    },
    {
      name: "suggest_components",
      description: "Get improvement suggestions for an architecture graph based on rule packs.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object", description: "Architecture graph JSON" },
        },
        required: ["graph"],
      },
    },
    {
      name: "explain_component",
      description: "Get a detailed explanation of a specific architecture component.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object" },
          node_id: { type: "string" },
        },
        required: ["graph", "node_id"],
      },
    },
    {
      name: "apply_suggestion",
      description: "Apply an improvement suggestion to the architecture graph, adding suggested components.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object" },
          suggestion_id: { type: "string" },
        },
        required: ["graph", "suggestion_id"],
      },
    },
    {
      name: "export_mermaid",
      description: "Export architecture graph as Mermaid flowchart diagram.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object" },
        },
        required: ["graph"],
      },
    },
    {
      name: "export_terraform_stub",
      description: "Export architecture graph as Terraform stub with comments.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object" },
        },
        required: ["graph"],
      },
    },
    {
      name: "create_client_summary",
      description: "Generate a client-ready markdown architecture summary.",
      inputSchema: {
        type: "object",
        properties: {
          graph: { type: "object" },
        },
        required: ["graph"],
      },
    },
    {
      name: "compare_designs",
      description: "Compare two architecture graphs and summarize differences.",
      inputSchema: {
        type: "object",
        properties: {
          graph_a: { type: "object" },
          graph_b: { type: "object" },
        },
        required: ["graph_a", "graph_b"],
      },
    },
    {
      name: "generate_variants",
      description: "Generate up to 3 meaningfully different design variants for the same use case with scores and tradeoffs.",
      inputSchema: {
        type: "object",
        properties: {
          business_goal: { type: "string" },
          platform_preference: { type: "string" },
          industry: { type: "string" },
        },
        required: ["business_goal"],
      },
    },
    {
      name: "compare_variants",
      description: "Compare two design variants with score deltas and component differences.",
      inputSchema: {
        type: "object",
        properties: {
          variant_a: { type: "object" },
          variant_b: { type: "object" },
        },
        required: ["variant_a", "variant_b"],
      },
    },
    {
      name: "generate_data_model",
      description: "Generate conceptual, logical, dimensional model and transforms for a design variant.",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "object" },
          variant: { type: "object" },
        },
        required: ["input", "variant"],
      },
    },
    {
      name: "explain_table",
      description: "Explain a data model table's purpose, grain, keys, and downstream impact.",
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "object" },
          table_id: { type: "string" },
        },
        required: ["variant", "table_id"],
      },
    },
    {
      name: "export_dbt",
      description: "Export data model as dbt SQL stubs.",
      inputSchema: {
        type: "object",
        properties: { variant: { type: "object" } },
        required: ["variant"],
      },
    },
    {
      name: "export_adf_pipeline_stub",
      description: "Export architecture as Azure Data Factory pipeline JSON stub.",
      inputSchema: {
        type: "object",
        properties: { graph: { type: "object" } },
        required: ["graph"],
      },
    },
    {
      name: "export_databricks_workflow_stub",
      description: "Export architecture as Databricks workflow JSON stub.",
      inputSchema: {
        type: "object",
        properties: { graph: { type: "object" } },
        required: ["graph"],
      },
    },
  ],
}));

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "catalog://databricks/components",
      name: "Databricks Component Catalog",
      description: "Official-style Databricks component definitions and best practices",
      mimeType: "application/json",
    },
    {
      uri: "catalog://aws/components",
      name: "AWS Component Catalog",
      description: "AWS component definitions and best practices",
      mimeType: "application/json",
    },
    {
      uri: "rules://databricks/well-architected",
      name: "Databricks Well-Architected Rules",
      description: "Rule pack for Databricks lakehouse architecture review",
      mimeType: "application/json",
    },
    {
      uri: "rules://aws/well-architected",
      name: "AWS Well-Architected Rules",
      description: "Rule pack for AWS architecture review",
      mimeType: "application/json",
    },
    {
      uri: "templates://databricks",
      name: "Databricks Architecture Templates",
      description: "Reference architecture templates for Databricks",
      mimeType: "application/json",
    },
    {
      uri: "knowledge://databricks",
      name: "Databricks Platform Knowledge",
      description: "Versioned platform knowledge including Genie advanced techniques",
      mimeType: "application/json",
    },
    {
      uri: "knowledge://registry",
      name: "Platform Knowledge Registry",
      description: "All platform knowledge versions and changelogs",
      mimeType: "application/json",
    },
    {
      uri: "domain-packs://registry",
      name: "Domain Packs Registry",
      description: "Finance, insurance, healthcare domain modeling packs",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "catalog://databricks/components":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(getCatalogForPlatform("databricks"), null, 2),
          },
        ],
      };
    case "catalog://aws/components":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(getCatalogForPlatform("aws"), null, 2),
          },
        ],
      };
    case "rules://databricks/well-architected":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(RULE_PACKS.find((p) => p.id === "databricks-well-architected"), null, 2),
          },
        ],
      };
    case "rules://aws/well-architected":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(RULE_PACKS.find((p) => p.id === "aws-well-architected"), null, 2),
          },
        ],
      };
    case "templates://databricks":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(getCatalogForPlatform("databricks").templates, null, 2),
          },
        ],
      };
    case "knowledge://databricks":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(getPlatformKnowledge("databricks"), null, 2),
          },
        ],
      };
    case "knowledge://registry":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(getAllPlatformKnowledge(), null, 2),
          },
        ],
      };
    case "domain-packs://registry":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(DOMAIN_PACKS, null, 2),
          },
        ],
      };
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "generate_from_use_case",
      description: "Generate architecture from a business use case",
      arguments: [
        { name: "business_goal", description: "Business goal", required: true },
        { name: "platform", description: "Target platform", required: false },
      ],
    },
    {
      name: "review_for_security",
      description: "Review architecture focusing on security",
      arguments: [{ name: "graph_json", description: "Architecture graph JSON", required: true }],
    },
    {
      name: "optimize_for_cost",
      description: "Review architecture focusing on cost optimization",
      arguments: [{ name: "graph_json", description: "Architecture graph JSON", required: true }],
    },
    {
      name: "client_ready_summary",
      description: "Prepare a client-ready architecture summary",
      arguments: [{ name: "graph_json", description: "Architecture graph JSON", required: true }],
    },
    {
      name: "generate_star_schema",
      description: "Generate dimensional star schema from use case",
      arguments: [
        { name: "business_goal", description: "Business goal", required: true },
        { name: "industry", description: "Industry domain", required: false },
      ],
    },
    {
      name: "prepare_executive_summary",
      description: "Prepare executive summary from variant portfolio",
      arguments: [{ name: "project_json", description: "Design project JSON", required: true }],
    },
  ],
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "generate_from_use_case":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate an explainable ${args?.platform ?? "databricks"} architecture for: ${args?.business_goal ?? "[describe use case]"}`,
            },
          },
        ],
      };
    case "review_for_security":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Review this architecture for security gaps and compliance:\n${args?.graph_json ?? "{}"}`,
            },
          },
        ],
      };
    case "optimize_for_cost":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Review this architecture for cost optimization opportunities:\n${args?.graph_json ?? "{}"}`,
            },
          },
        ],
      };
    case "client_ready_summary":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create a client-ready architecture summary from:\n${args?.graph_json ?? "{}"}`,
            },
          },
        ],
      };
    case "generate_star_schema":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a dimensional star schema for ${args?.industry ?? "general"} industry use case: ${args?.business_goal ?? "[describe use case]"}`,
            },
          },
        ],
      };
    case "prepare_executive_summary":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Prepare an executive summary comparing design variants:\n${args?.project_json ?? "{}"}`,
            },
          },
        ],
      };
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_architecture": {
        const input = CustomerInputSchema.parse({
          business_goal: args?.business_goal,
          platform_preference: args?.platform_preference ?? "databricks",
          industry: args?.industry,
          expected_scale: args?.expected_scale,
          security_compliance: args?.security_compliance,
          data_sources: args?.data_sources,
          analytics_needs: args?.analytics_needs,
          pain_points: args?.pain_points,
        });
        const result = await generateArchitecture(input, {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL,
          useMock: process.env.USE_MOCK_LLM === "true",
        });
        if (result.graph.id) sessionGraphs.set(result.graph.id, result.graph);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "review_architecture": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        const [llmReview, ruleFindings] = await Promise.all([
          reviewArchitecture(graph, undefined, {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL,
            useMock: process.env.USE_MOCK_LLM === "true",
          }),
          Promise.resolve(runAllRulePacks(graph)),
        ]);
        const mergedFindings = [
          ...ruleFindings,
          ...llmReview.findings.filter((f) => !ruleFindings.some((r) => r.title === f.title)),
        ];
        const updatedGraph = mergeReviewIntoGraph(graph, mergedFindings);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ...llmReview, findings: mergedFindings, graph: updatedGraph }, null, 2),
            },
          ],
        };
      }

      case "suggest_components": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        const findings = runAllRulePacks(graph);
        return {
          content: [{ type: "text", text: JSON.stringify(findings, null, 2) }],
        };
      }

      case "explain_component": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        const nodeId = args?.node_id as string;
        const explanation = await explainComponent(graph, nodeId, {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL,
          useMock: process.env.USE_MOCK_LLM === "true",
        });
        return { content: [{ type: "text", text: explanation }] };
      }

      case "apply_suggestion": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        const suggestionId = args?.suggestion_id as string;
        const suggestion = graph.suggestions?.find((s) => s.id === suggestionId);
        if (!suggestion) throw new Error(`Suggestion ${suggestionId} not found`);
        const updated = applySuggestion(graph, suggestion);
        return { content: [{ type: "text", text: JSON.stringify(updated, null, 2) }] };
      }

      case "export_mermaid": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        return { content: [{ type: "text", text: exportToMermaid(graph) }] };
      }

      case "export_terraform_stub": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        return { content: [{ type: "text", text: exportToTerraformStub(graph) }] };
      }

      case "create_client_summary": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        return { content: [{ type: "text", text: createClientSummary(graph) }] };
      }

      case "compare_designs": {
        const graphA = ArchitectureGraphSchema.parse(args?.graph_a);
        const graphB = ArchitectureGraphSchema.parse(args?.graph_b);
        const nodesA = new Set(graphA.nodes.map((n) => n.label));
        const nodesB = new Set(graphB.nodes.map((n) => n.label));
        const onlyA = [...nodesA].filter((n) => !nodesB.has(n));
        const onlyB = [...nodesB].filter((n) => !nodesA.has(n));
        const common = [...nodesA].filter((n) => nodesB.has(n));
        const comparison = {
          design_a: { title: graphA.title, node_count: graphA.nodes.length },
          design_b: { title: graphB.title, node_count: graphB.nodes.length },
          only_in_a: onlyA,
          only_in_b: onlyB,
          common_components: common,
          edge_count_diff: graphA.edges.length - graphB.edges.length,
        };
        return { content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }] };
      }

      case "generate_variants": {
        const input = CustomerInputSchema.parse({
          business_goal: args?.business_goal,
          platform_preference: args?.platform_preference ?? "databricks",
          industry: args?.industry,
        });
        const result = await generatePortfolio(input, {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL,
          useMock: process.env.USE_MOCK_LLM === "true",
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "compare_variants": {
        const variantA = DesignVariantSchema.parse(args?.variant_a);
        const variantB = DesignVariantSchema.parse(args?.variant_b);
        const comparison = compareVariants(variantA, variantB);
        return { content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }] };
      }

      case "generate_data_model": {
        const input = CustomerInputSchema.parse(args?.input);
        const variant = DesignVariantSchema.parse(args?.variant);
        const model = generateDataModelForVariant(input, variant);
        return { content: [{ type: "text", text: JSON.stringify(model, null, 2) }] };
      }

      case "explain_table": {
        const variant = DesignVariantSchema.parse(args?.variant);
        const tableId = args?.table_id as string;
        const model = variant.data_model;
        if (!model) throw new Error("Variant has no data model");
        const allTables = [
          ...model.dimensional.facts,
          ...model.dimensional.dimensions,
          ...model.dimensional.bridges,
        ];
        const table = allTables.find((t) => t.id === tableId);
        if (!table) throw new Error(`Table ${tableId} not found`);
        const explanation = {
          table_id: table.id,
          name: table.name,
          table_type: table.table_type,
          schema_name: table.schema_name,
          explanation: table.explanation,
          columns: table.columns.map((c) => ({
            name: c.name,
            type: c.data_type,
            is_key: c.is_key,
            is_measure: c.is_measure,
          })),
          downstream: model.transforms.filter((t) => t.source_tables.includes(tableId)).map((t) => t.name),
        };
        return { content: [{ type: "text", text: JSON.stringify(explanation, null, 2) }] };
      }

      case "export_dbt": {
        const variant = DesignVariantSchema.parse(args?.variant);
        const input = CustomerInputSchema.parse({
          business_goal: variant.title,
          platform_preference: "databricks",
        });
        const model = variant.data_model ?? generateDataModelForVariant(input, variant);
        return { content: [{ type: "text", text: exportToDbtStub(model) }] };
      }

      case "export_adf_pipeline_stub": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        return { content: [{ type: "text", text: exportToAdfPipelineStub(graph) }] };
      }

      case "export_databricks_workflow_stub": {
        const graph = ArchitectureGraphSchema.parse(args?.graph);
        return { content: [{ type: "text", text: exportToDatabricksWorkflowStub(graph) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool execution failed";
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Architecture AI MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
