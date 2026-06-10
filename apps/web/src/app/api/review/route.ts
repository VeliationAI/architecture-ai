import { NextResponse } from "next/server";
import {
  ArchitectureGraphSchema,
  CustomerInputSchema,
  reviewArchitecture,
  runAllRulePacks,
  mergeReviewIntoGraph,
} from "@architecture-ai/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const graph = ArchitectureGraphSchema.parse(body.graph);
    const input = body.input ? CustomerInputSchema.partial().parse(body.input) : undefined;

    const [llmReview, ruleFindings] = await Promise.all([
      reviewArchitecture(graph, input, {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
        useMock: process.env.USE_MOCK_LLM === "true",
      }),
      Promise.resolve(runAllRulePacks(graph)),
    ]);

    const mergedFindings = [
      ...ruleFindings,
      ...llmReview.findings.filter(
        (f) => !ruleFindings.some((r) => r.title === f.title)
      ),
    ];

    const updatedGraph = mergeReviewIntoGraph(graph, mergedFindings);

    return NextResponse.json({
      ...llmReview,
      findings: mergedFindings,
      graph: updatedGraph,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
