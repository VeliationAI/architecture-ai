import { NextResponse } from "next/server";
import {
  ArchitectureGraphSchema,
  exportToMermaid,
  exportToTerraformStub,
  createClientSummary,
} from "@architecture-ai/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const graph = ArchitectureGraphSchema.parse(body.graph);
    const format = (body.format as string) ?? "json";

    switch (format) {
      case "mermaid":
        return NextResponse.json({ content: exportToMermaid(graph), format });
      case "terraform":
        return NextResponse.json({ content: exportToTerraformStub(graph), format });
      case "summary":
        return NextResponse.json({ content: createClientSummary(graph), format });
      case "json":
      default:
        return NextResponse.json({ content: JSON.stringify(graph, null, 2), format: "json" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
