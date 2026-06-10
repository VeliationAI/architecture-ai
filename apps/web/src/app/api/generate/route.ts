import { NextResponse } from "next/server";
import {
  CustomerInputSchema,
  generateArchitecture,
} from "@architecture-ai/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = CustomerInputSchema.parse(body);

    const result = await generateArchitecture(input, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
      useMock: process.env.USE_MOCK_LLM === "true",
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
