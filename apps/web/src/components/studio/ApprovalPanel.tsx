"use client";

import { useState } from "react";
import type { DesignProject } from "@architecture-ai/core";
import { useStudioStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, MessageSquare, Send, AlertCircle } from "lucide-react";

const STATUS_STYLES = {
  draft: "outline",
  in_review: "warning",
  approved: "success",
  changes_requested: "danger",
} as const;

export function ApprovalPanel({ project }: { project: DesignProject }) {
  const setProject = useStudioStore((s) => s.setProject);
  const [comment, setComment] = useState("");
  const [reviewer, setReviewer] = useState("Reviewer");
  const [loading, setLoading] = useState(false);

  const { approval } = project;

  const runAction = async (
    action: "submit_review" | "approve" | "request_changes" | "add_comment" | "resolve_comment",
    extra?: Record<string, unknown>
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, action, ...extra }),
      });
      const data = await res.json();
      if (res.ok) setProject(data.project);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Approval workflow</h3>
        <Badge variant={STATUS_STYLES[approval.status] ?? "outline"} className="capitalize">
          {approval.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {approval.status === "approved" && approval.signed_off_at && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--success)]/30 bg-[var(--success)]/10 p-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--success)] font-medium mb-1">
            <CheckCircle className="w-4 h-4" />
            Approved
          </div>
          <p className="text-[var(--muted-foreground)]">
            Signed off by {approval.signed_off_by} on {new Date(approval.signed_off_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {approval.assumptions_pending.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Assumptions to confirm
          </p>
          <ul className="space-y-1">
            {approval.assumptions_pending.map((a, i) => (
              <li key={i} className="text-xs text-[var(--muted-foreground)] pl-3 border-l-2 border-[var(--warning)]">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {approval.status === "draft" && (
          <Button size="sm" disabled={loading} onClick={() => runAction("submit_review")} className="gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Submit for review
          </Button>
        )}
        {approval.status === "in_review" && (
          <>
            <Button size="sm" variant="primary" disabled={loading} onClick={() => runAction("approve", { signed_off_by: reviewer })} className="gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Approve design
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => runAction("request_changes", { reason: comment || "Changes requested" })}>
              Request changes
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          Add review comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comment on this design decision..."
          className="w-full min-h-[80px] rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--background-elevated)] px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={loading || !comment.trim()}
          onClick={() => {
            runAction("add_comment", {
              comment: {
                author: reviewer,
                target_type: "variant",
                target_id: project.active_variant_id,
                comment: comment.trim(),
              },
            });
            setComment("");
          }}
        >
          Post comment
        </Button>
      </div>

      {approval.comments.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Comments</p>
          {approval.comments.map((c) => (
            <div
              key={c.id}
              className={cn(
                "rounded-[var(--radius-sm)] border p-3 text-xs",
                c.status === "open" ? "border-[var(--border)]" : "border-[var(--border-subtle)] opacity-70"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{c.author}</span>
                <Badge variant={c.status === "open" ? "warning" : "outline"} className="text-[9px]">
                  {c.status}
                </Badge>
              </div>
              <p className="text-[var(--muted-foreground)] leading-relaxed">{c.comment}</p>
              {c.status === "open" && (
                <button
                  type="button"
                  className="text-[10px] text-[var(--accent)] mt-2 hover:underline"
                  onClick={() => runAction("resolve_comment", { comment_id: c.id })}
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
