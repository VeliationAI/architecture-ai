"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface PlatformSummary {
  platform: string;
  display_name: string;
  version: string;
  last_updated: string;
  latest_additions: string[];
}

export function PlatformKnowledgeBadge({ platform }: { platform?: string }) {
  const [summary, setSummary] = useState<PlatformSummary | null>(null);

  useEffect(() => {
    fetch("/api/platform-knowledge")
      .then((r) => r.json())
      .then((data) => {
        const match = platform
          ? data.platforms?.find((p: PlatformSummary) => p.platform === platform)
          : data.platforms?.[0];
        if (match) setSummary(match);
      })
      .catch(() => {});
  }, [platform]);

  if (!summary) return null;

  return (
    <div
      className="flex items-center gap-2 text-[10px] text-[var(--muted)]"
      title={
        summary.latest_additions.length
          ? `Latest: ${summary.latest_additions.join(", ")}`
          : undefined
      }
    >
      <Sparkles className="w-3 h-3 text-[var(--accent)]" />
      <span>
        {summary.display_name} knowledge v{summary.version}
      </span>
      <span className="text-[var(--border)]">·</span>
      <span>updated {summary.last_updated}</span>
    </div>
  );
}
