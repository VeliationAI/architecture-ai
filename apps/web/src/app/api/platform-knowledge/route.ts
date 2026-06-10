import { NextResponse } from "next/server";
import {
  getPlatformKnowledge,
  getAllPlatformKnowledge,
  getRegistryVersion,
} from "@architecture-ai/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (platform) {
    const knowledge = getPlatformKnowledge(platform);
    if (!knowledge) {
      return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 404 });
    }
    return NextResponse.json(knowledge);
  }

  return NextResponse.json({
    registry_version: getRegistryVersion(),
    platforms: getAllPlatformKnowledge().map((p) => ({
      platform: p.platform,
      display_name: p.display_name,
      version: p.version,
      last_updated: p.last_updated,
      component_count: p.components.length,
      technique_count: p.techniques.length,
      latest_additions: p.changelog[0]?.additions ?? [],
    })),
  });
}
