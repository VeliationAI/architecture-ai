import { NextResponse } from "next/server";
import {
  CustomerInputSchema,
  generatePortfolio,
  variantToGenerationResult,
  getActiveVariant,
} from "@architecture-ai/core";

/** Generates a 3-variant portfolio (primary API). Also returns legacy generation shape for compatibility. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = CustomerInputSchema.parse(body);

    const portfolio = await generatePortfolio(input, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      useMock: process.env.USE_MOCK_LLM === "true",
    });

    const active = getActiveVariant(portfolio.project);
    const generation = active
      ? variantToGenerationResult(active, portfolio.project.variant_bundle)
      : null;

    return NextResponse.json({
      ...portfolio,
      generation,
      graph: active?.architecture_graph,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
