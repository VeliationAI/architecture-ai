import { NextResponse } from "next/server";
import {
  DesignVariantSchema,
  compareVariants,
  compareAllVariants,
} from "@architecture-ai/core";
import { z } from "zod";

const CompareBodySchema = z.object({
  variant_a: DesignVariantSchema,
  variant_b: DesignVariantSchema.optional(),
  variants: z.array(DesignVariantSchema).optional(),
});

export async function POST(request: Request) {
  try {
    const body = CompareBodySchema.parse(await request.json());

    if (body.variants && body.variants.length >= 2) {
      return NextResponse.json({ comparisons: compareAllVariants(body.variants) });
    }

    if (body.variant_a && body.variant_b) {
      return NextResponse.json({ comparison: compareVariants(body.variant_a, body.variant_b) });
    }

    return NextResponse.json({ error: "Provide variant_a + variant_b or variants array" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compare failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
