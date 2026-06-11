import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Shield,
  GitBranch,
  Zap,
  Layers,
  Database,
  FileCode,
} from "lucide-react";
import { DemoVideo } from "./DemoVideo";

const STATS = [
  { value: "3", label: "Design variants per run" },
  { value: "7", label: "Well-architected dimensions" },
  { value: "MIT", label: "Open source license" },
];

const FEATURES = [
  {
    icon: Sparkles,
    label: "Multi-variant portfolio",
    desc: "MVP, governed, and scale-ready designs with scores and tradeoffs",
  },
  {
    icon: Shield,
    label: "Well-architected review",
    desc: "Platform-native rule packs with security, cost, and governance scoring",
  },
  {
    icon: GitBranch,
    label: "Explainable by design",
    desc: "Every component includes why, benefit, tradeoff, and risk",
  },
  {
    icon: Database,
    label: "Domain data models",
    desc: "Conceptual → dimensional star schema with transforms",
  },
  {
    icon: Layers,
    label: "Compare & adopt",
    desc: "Side-by-side variant diff, merge suggestions, approval workflow",
  },
  {
    icon: FileCode,
    label: "Export anywhere",
    desc: "JSON, Mermaid, Terraform, dbt, ADF, Databricks workflow, MCP",
  },
];

export function LandingHero() {
  return (
    <div className="max-w-4xl mx-auto mb-12 animate-slide-up">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
          <Badge variant="accent">Architecture intelligence, not diagramming</Badge>
          <Badge variant="outline">Databricks · AWS · Azure · GCP · Snowflake</Badge>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.15]">
          <span className="bg-gradient-to-b from-white via-white to-[var(--muted-foreground)] bg-clip-text text-transparent">
            Turn use cases into explainable
          </span>
          <br />
          <span className="bg-gradient-to-r from-[var(--accent-hover)] to-[#a78bfa] bg-clip-text text-transparent">
            target architectures
          </span>
        </h2>

        <p className="text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          Describe what you&apos;re building. Get governed designs with review scores, improvement
          suggestions, data models, and platform-native best practices — in minutes.
        </p>

        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[var(--accent-hover)]">{value}</p>
              <p className="text-[10px] sm:text-xs text-[var(--muted)] mt-0.5 max-w-[100px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <DemoVideo />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="group p-4 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--card)]/60 hover:bg-[var(--card)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-glow)] transition-all duration-300"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Icon className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <p className="text-sm font-medium mb-1 group-hover:text-[var(--accent-hover)] transition-colors">
              {label}
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--muted)] mt-8 flex items-center justify-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-[var(--warning)]" />
        Free to run locally · No credit card · Mock mode works offline
      </p>
    </div>
  );
}
