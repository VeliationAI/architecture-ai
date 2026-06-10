"use client";

import { useState } from "react";
import type { CustomerInput, Platform } from "@architecture-ai/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Label, Select, FieldGroup } from "@/components/ui/input";
import { useStudioStore } from "@/lib/store";
import {
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { getIconByKey } from "@architecture-ai/catalog";

const PLATFORMS: { value: Platform; label: string; iconKey: string; desc: string }[] = [
  { value: "databricks", label: "Databricks", iconKey: "databricks-brand", desc: "Lakehouse, Genie, Unity Catalog" },
  { value: "aws", label: "AWS", iconKey: "aws-brand", desc: "Redshift, S3, Lambda, Well-Architected" },
  { value: "azure", label: "Azure", iconKey: "azure-brand", desc: "Enterprise Microsoft cloud" },
  { value: "gcp", label: "Google Cloud", iconKey: "gcp-brand", desc: "GCP data & AI services" },
  { value: "snowflake", label: "Snowflake", iconKey: "snowflake-brand", desc: "Data cloud & Cortex AI" },
];

const QUICK_STARTS = [
  {
    title: "Databricks Lakehouse",
    goal: "Build a medallion lakehouse with real-time ingestion, Unity Catalog governance, and SQL serving for enterprise analytics",
    platform: "databricks" as Platform,
  },
  {
    title: "Genie Analytics",
    goal: "Self-serve natural language analytics with Genie Spaces, Agent Mode, and governed conversational BI for business users",
    platform: "databricks" as Platform,
  },
  {
    title: "GenAI Platform",
    goal: "Production RAG and agent platform with Vector Search, MLflow tracing, Unity AI Gateway, and MCP integration",
    platform: "databricks" as Platform,
  },
  {
    title: "AWS Cloud Native",
    goal: "Scalable API-first application with managed compute, RDS database, S3 storage, and CloudWatch observability",
    platform: "aws" as Platform,
  },
];

const PRIORITIES = [
  "Security",
  "Cost optimization",
  "Performance",
  "Governance",
  "Time to market",
  "Reliability",
];

const STEPS = ["Goal & platform", "Requirements", "Generate"];

export function IntakeForm() {
  const setPortfolio = useStudioStore((s) => s.setPortfolio);
  const setGeneration = useStudioStore((s) => s.setGeneration);
  const setInput = useStudioStore((s) => s.setInput);
  const isGenerating = useStudioStore((s) => s.isGenerating);
  const setIsGenerating = useStudioStore((s) => s.setIsGenerating);

  const [step, setStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState<CustomerInput>({
    business_goal: "",
    platform_preference: "databricks",
    priorities: [],
  });
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof CustomerInput, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePriority = (p: string) => {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter((x) => x !== p)
        : [...prev.priorities, p],
    }));
  };

  const applyQuickStart = (qs: (typeof QUICK_STARTS)[0]) => {
    setForm((prev) => ({
      ...prev,
      business_goal: qs.goal,
      platform_preference: qs.platform,
    }));
    setStep(1);
  };

  const canProceed = () => {
    if (step === 0) return form.business_goal.trim().length > 10;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.business_goal.trim()) {
      setError("Business goal is required");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setInput(form);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (data.project) {
        setPortfolio(data);
      } else {
        setGeneration(data.generation ?? data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                i === step
                  ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                  : i < step
                    ? "text-[var(--success)] cursor-pointer hover:bg-[var(--card)]"
                    : "text-[var(--muted)]"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i === step
                    ? "bg-[var(--accent)] text-white"
                    : i < step
                      ? "bg-[var(--success)]/20 text-[var(--success)]"
                      : "bg-[var(--background-elevated)] text-[var(--muted)]"
                )}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn("w-8 h-px", i < step ? "bg-[var(--success)]/40" : "bg-[var(--border)]")} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 0 && (
            <div className="space-y-6">
              <FieldGroup>
                <Label htmlFor="business_goal" hint="Be specific — what are you building and for whom?">
                  What are you building? *
                </Label>
                <Textarea
                  id="business_goal"
                  placeholder="e.g. Build a real-time customer 360 lakehouse with GenAI-powered support agents and self-serve BI for sales teams"
                  value={form.business_goal}
                  onChange={(e) => update("business_goal", e.target.value)}
                  rows={4}
                  className="text-base"
                />
                <p className="text-[11px] text-[var(--muted)]">
                  {form.business_goal.length}/10 min characters
                </p>
              </FieldGroup>

              <div>
                <Label hint="We'll apply this platform's well-architected patterns">Target platform</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {PLATFORMS.map((p) => {
                    const selected = form.platform_preference === p.value;
                    const brandIcon = getIconByKey(p.iconKey);
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => update("platform_preference", p.value)}
                        className={cn(
                          "p-3 rounded-[var(--radius-sm)] border text-left transition-all duration-200",
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent-muted)] ring-1 ring-[var(--accent)]/30"
                            : "border-[var(--border)] hover:border-[var(--muted)] hover:bg-[var(--card-hover)]"
                        )}
                      >
                        {brandIcon && (
                          <ServiceIcon src={brandIcon.src} alt={brandIcon.alt} size={28} className="mb-2" />
                        )}
                        <p className="text-sm font-medium">{p.label}</p>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label hint="Click to pre-fill a proven architecture pattern">Quick start templates</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {QUICK_STARTS.map((qs) => (
                    <button
                      key={qs.title}
                      type="button"
                      onClick={() => applyQuickStart(qs)}
                      className="p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 hover:bg-[var(--card-hover)] text-left transition-all group"
                    >
                      <p className="text-sm font-medium group-hover:text-[var(--accent-hover)]">{qs.title}</p>
                      <p className="text-[10px] text-[var(--muted)] mt-1 line-clamp-2">{qs.goal}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup>
                  <Label htmlFor="scale">Expected scale</Label>
                  <Input
                    id="scale"
                    placeholder="10TB/day, 500 users"
                    value={form.expected_scale ?? ""}
                    onChange={(e) => update("expected_scale", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="sla">Availability / SLA</Label>
                  <Input
                    id="sla"
                    placeholder="99.9% uptime"
                    value={form.availability_sla ?? ""}
                    onChange={(e) => update("availability_sla", e.target.value)}
                  />
                </FieldGroup>
              </div>

              <FieldGroup>
                <Label htmlFor="compliance">Security & compliance</Label>
                <Input
                  id="compliance"
                  placeholder="SOC2, HIPAA, GDPR"
                  value={form.security_compliance ?? ""}
                  onChange={(e) => update("security_compliance", e.target.value)}
                />
              </FieldGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup>
                  <Label htmlFor="data_sources">Data sources</Label>
                  <Input
                    id="data_sources"
                    placeholder="Kafka, S3, Salesforce"
                    value={form.data_sources ?? ""}
                    onChange={(e) => update("data_sources", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="data_mode">Processing mode</Label>
                  <Select
                    id="data_mode"
                    value={form.data_mode ?? ""}
                    onChange={(e) => update("data_mode", e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="batch">Batch</option>
                    <option value="streaming">Streaming</option>
                    <option value="both">Both</option>
                  </Select>
                </FieldGroup>
              </div>

              <FieldGroup>
                <Label htmlFor="analytics">Analytics / ML / GenAI needs</Label>
                <Textarea
                  id="analytics"
                  placeholder="BI dashboards, ML training, RAG chatbot, Genie natural-language analytics..."
                  value={form.analytics_needs ?? ""}
                  onChange={(e) => update("analytics_needs", e.target.value)}
                  rows={2}
                />
              </FieldGroup>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                {showAdvanced ? "Hide" : "Show"} advanced options
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)] animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="Financial services"
                        value={form.industry ?? ""}
                        onChange={(e) => update("industry", e.target.value)}
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor="users">Primary users</Label>
                      <Input
                        id="users"
                        placeholder="Data engineers, analysts"
                        value={form.primary_users ?? ""}
                        onChange={(e) => update("primary_users", e.target.value)}
                      />
                    </FieldGroup>
                  </div>
                  <FieldGroup>
                    <Label htmlFor="pain_points">Pain points</Label>
                    <Textarea
                      id="pain_points"
                      placeholder="No governance, slow pipelines, ungoverned LLM usage"
                      value={form.pain_points ?? ""}
                      onChange={(e) => update("pain_points", e.target.value)}
                      rows={2}
                    />
                  </FieldGroup>
                </div>
              )}

              <div>
                <Label hint="We'll weight review suggestions toward these">Architectural priorities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePriority(p)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                        form.priorities.includes(p)
                          ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--background-elevated)] border border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--muted)] mb-2 uppercase tracking-wider">Summary</p>
                <p className="text-sm leading-relaxed mb-3">{form.business_goal}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-md bg-[var(--accent-muted)] text-[var(--accent-hover)] capitalize">
                    {form.platform_preference}
                  </span>
                  {form.priorities.map((p) => (
                    <span key={p} className="text-xs px-2 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                We&apos;ll generate a typed architecture graph with component rationale, improvement
                suggestions, and platform-native best practices. You can refine on the canvas afterward.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-[var(--danger)] bg-red-500/10 border border-red-500/20 rounded-[var(--radius-sm)] px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-subtle)]">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-1"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                size="lg"
                className="gap-2 min-w-[200px] animate-pulse-glow"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate architecture
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
