"use client";

import type { ReviewResult } from "@architecture-ai/core";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "security", label: "Security" },
  { key: "reliability", label: "Reliability" },
  { key: "performance", label: "Performance" },
  { key: "cost", label: "Cost" },
  { key: "operations", label: "Operations" },
  { key: "governance", label: "Governance" },
  { key: "explainability", label: "Explainability" },
] as const;

function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Needs work";
  return "Critical gaps";
}

export function ReviewScores({ review }: { review: ReviewResult }) {
  const label = scoreLabel(review.overall_score);

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--background-elevated)] border border-[var(--border-subtle)]">
        <div>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Overall score</p>
          <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold tabular-nums">{review.overall_score}</span>
          <span className="text-sm text-[var(--muted)] ml-1">/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map(({ key, label: catLabel }) => {
          const score = review.category_scores[key];
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--muted-foreground)]">{catLabel}</span>
                <span className="font-medium tabular-nums">{score}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--background-elevated)] overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", scoreColor(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
