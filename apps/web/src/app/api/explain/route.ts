import { NextResponse } from "next/server";
import {
  ArchitectureGraphSchema,
  explainComponent,
} from "@architecture-ai/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const graph = ArchitectureGraphSchema.parse(body.graph);
    const nodeId = body.nodeId as string;

    if (!nodeId) {
      return NextResponse.json({ error: "nodeId is required" }, { status: 400 });
    }

    const explanation = await explainComponent(graph, nodeId, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      useMock: process.env.USE_MOCK_LLM === "true",
    });

    return NextResponse.json({ explanation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Explain failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
