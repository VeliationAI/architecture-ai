import type { PlatformKnowledge } from "./types.js";
import { AWS_COMPONENTS } from "../aws.js";

export const AWS_KNOWLEDGE: PlatformKnowledge = {
  platform: "aws",
  display_name: "AWS",
  version: "2026.06",
  last_updated: "2026-06-09",
  doc_sources: ["https://aws.amazon.com/architecture/well-architected/"],
  components: AWS_COMPONENTS,
  techniques: [
    {
      id: "well-architected-six-pillars",
      name: "Well-Architected Six Pillars",
      category: "governance",
      description: "Operational excellence, security, reliability, performance, cost, sustainability.",
      when_to_use: "All AWS production architectures",
      best_practices: [
        "Run Well-Architected reviews before production",
        "Document tradeoffs per pillar",
      ],
      related_components: ["cloudwatch", "api-gateway"],
      added_in_version: "2024.01",
    },
  ],
  templates: [],
  review_dimensions: [
    "Security and IAM least-privilege",
    "Reliability and Multi-AZ",
    "Observability with CloudWatch",
    "Cost optimization",
  ],
  generation_hints: [
    "Align with AWS Well-Architected Framework six pillars",
    "Use managed services to reduce operational burden",
    "Enable CloudWatch for logs, metrics, and alarms",
  ],
  changelog: [
    {
      version: "2026.06",
      date: "2026-06-09",
      summary: "Initial AWS knowledge registry",
      additions: ["Well-Architected rule integration"],
    },
  ],
};
