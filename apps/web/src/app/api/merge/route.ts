import { NextResponse } from "next/server";
import {
  DesignVariantSchema,
  MergeSuggestionSchema,
  applyMergeSuggestion,
} from "@architecture-ai/core";
import { z } from "zod";

const MergeBodySchema = z.object({
  active_variant: DesignVariantSchema,
  source_variant: DesignVariantSchema,
  suggestion: MergeSuggestionSchema,
});

export async function POST(request: Request) {
  try {
    const body = MergeBodySchema.parse(await request.json());
    const merged = applyMergeSuggestion(
      body.active_variant,
      body.source_variant,
      body.suggestion
    );
    return NextResponse.json({ variant: merged });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Merge failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
