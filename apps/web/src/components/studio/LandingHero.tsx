import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, GitBranch, Zap } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, label: "AI-generated architectures", desc: "From use case to typed graph in minutes" },
  { icon: Shield, label: "Well-architected review", desc: "Platform-native rule packs & scoring" },
  { icon: GitBranch, label: "Explainable decisions", desc: "Every component has a why, tradeoff & risk" },
  { icon: Zap, label: "Export & integrate", desc: "JSON, Mermaid, Terraform, MCP" },
];

export function LandingHero() {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
      <Badge variant="accent" className="mb-4">
        Architecture intelligence, not diagramming
      </Badge>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-b from-white to-[var(--muted-foreground)] bg-clip-text text-transparent">
        Turn your use case into an explainable architecture
      </h2>
      <p className="text-[var(--muted-foreground)] text-sm sm:text-base leading-relaxed mb-8">
        Describe what you&apos;re building. Get a governed target architecture with review scores,
        improvement suggestions, and platform-native best practices — starting with Databricks.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--card)]/50"
          >
            <Icon className="w-4 h-4 text-[var(--accent)] mb-2" />
            <p className="text-xs font-medium mb-0.5">{label}</p>
            <p className="text-[10px] text-[var(--muted)] leading-snug">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
