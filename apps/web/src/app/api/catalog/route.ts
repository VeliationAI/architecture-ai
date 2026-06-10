import { NextResponse } from "next/server";
import { getCatalogForPlatform } from "@architecture-ai/catalog";
import { RULE_PACKS } from "@architecture-ai/core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") ?? "databricks";

  const catalog = getCatalogForPlatform(platform);

  return NextResponse.json({
    platform,
    components: catalog.components,
    templates: catalog.templates,
    rule_packs: RULE_PACKS.filter((p) => p.platform === platform || platform === "all"),
  });
}
