"use client";

import { useState } from "react";
import type { ArchitectureGraph } from "@architecture-ai/core";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, FileJson, FileCode, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMATS = [
  { id: "json", label: "JSON", desc: "Full architecture graph", icon: FileJson },
  { id: "mermaid", label: "Mermaid", desc: "Diagram syntax", icon: FileCode },
  { id: "terraform", label: "Terraform", desc: "IaC stub", icon: FileCode },
  { id: "summary", label: "Summary", desc: "Client-ready doc", icon: FileText },
];

export function ExportPanel({ graph }: { graph: ArchitectureGraph }) {
  const [content, setContent] = useState<string | null>(null);
  const [format, setFormat] = useState("json");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (fmt: string) => {
    setLoading(true);
    setFormat(fmt);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph, format: fmt }),
      });
      const data = await res.json();
      if (res.ok) setContent(data.content);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content) return;
    const ext = format === "json" ? "json" : format === "mermaid" ? "md" : format === "terraform" ? "tf" : "md";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `architecture-${graph.id ?? "export"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => handleExport(f.id)}
              disabled={loading}
              className={cn(
                "p-3 rounded-[var(--radius-sm)] border text-left transition-all duration-200",
                format === f.id
                  ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                  : "border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--card-hover)]"
              )}
            >
              <Icon className="w-4 h-4 text-[var(--accent)] mb-2" />
              <p className="text-xs font-medium">{f.label}</p>
              <p className="text-[10px] text-[var(--muted)]">{f.desc}</p>
            </button>
          );
        })}
      </div>

      {content && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1 gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
          <pre className="text-[11px] bg-[var(--background-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3 max-h-48 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">
            {content.slice(0, 2000)}
            {content.length > 2000 && "\n…"}
          </pre>
        </div>
      )}
    </div>
  );
}
