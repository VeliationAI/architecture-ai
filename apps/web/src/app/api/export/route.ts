import { NextResponse } from "next/server";
import {
  ArchitectureGraphSchema,
  DataModelPackageSchema,
  exportToMermaid,
  exportToTerraformStub,
  createClientSummary,
  exportToDbtStub,
  exportToAdfPipelineStub,
  exportToDatabricksWorkflowStub,
} from "@architecture-ai/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const format = (body.format as string) ?? "json";

    if (format === "dbt" && body.data_model) {
      const model = DataModelPackageSchema.parse(body.data_model);
      return NextResponse.json({ content: exportToDbtStub(model), format });
    }

    const graph = ArchitectureGraphSchema.parse(body.graph);

    switch (format) {
      case "mermaid":
        return NextResponse.json({ content: exportToMermaid(graph), format });
      case "terraform":
        return NextResponse.json({ content: exportToTerraformStub(graph), format });
      case "summary":
        return NextResponse.json({ content: createClientSummary(graph), format });
      case "adf":
        return NextResponse.json({ content: exportToAdfPipelineStub(graph), format: "adf" });
      case "databricks_workflow":
        return NextResponse.json({
          content: exportToDatabricksWorkflowStub(graph),
          format: "databricks_workflow",
        });
      case "json":
      default:
        return NextResponse.json({ content: JSON.stringify(graph, null, 2), format: "json" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
