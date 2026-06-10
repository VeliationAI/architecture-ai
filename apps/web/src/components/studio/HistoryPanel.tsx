"use client";

import { useState } from "react";
import { useStudioStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, X, Trash2, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HistoryPanel() {
  const [open, setOpen] = useState(false);
  const history = useStudioStore((s) => s.history);
  const activeHistoryId = useStudioStore((s) => s.activeHistoryId);
  const loadHistory = useStudioStore((s) => s.loadHistory);
  const deleteHistory = useStudioStore((s) => s.deleteHistory);
  const _hasHydrated = useStudioStore((s) => s._hasHydrated);

  if (!_hasHydrated) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">History</span>
        {history.length > 0 && (
          <Badge variant="accent" className="ml-0.5 px-1.5 min-w-[18px] justify-center">
            {history.length}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-[var(--card)] border-l border-[var(--border)] flex flex-col shadow-[var(--shadow-lg)] animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="font-semibold text-sm">Project history</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-[var(--card-hover)] text-[var(--muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {history.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-[var(--muted)]">No saved projects yet.</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Generated architectures appear here automatically.</p>
                </div>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "rounded-[var(--radius-sm)] border p-3.5 transition-all",
                      entry.id === activeHistoryId
                        ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                        : "border-[var(--border-subtle)] hover:border-[var(--border)]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        className="flex-1 text-left group"
                        onClick={() => {
                          loadHistory(entry.id);
                          setOpen(false);
                        }}
                      >
                        <p className="font-medium text-sm line-clamp-2 group-hover:text-[var(--accent-hover)] transition-colors">
                          {entry.title}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-1 line-clamp-1">{entry.business_goal}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{entry.platform}</Badge>
                          <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(entry.updated_at)}
                          </span>
                        </div>
                      </button>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            loadHistory(entry.id);
                            setOpen(false);
                          }}
                          className="p-1.5 rounded-md hover:bg-[var(--card-hover)] text-[var(--accent)]"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHistory(entry.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-[var(--muted)] hover:text-[var(--danger)]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
