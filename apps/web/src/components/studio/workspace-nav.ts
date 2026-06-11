import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Layers,
  GitCompare,
  Database,
  Lightbulb,
  Shield,
  CheckCircle2,
  FileText,
  FileOutput,
} from "lucide-react";
import type { WorkspaceView } from "@/lib/store";

export interface WorkspaceNavItem {
  id: WorkspaceView;
  label: string;
  description: string;
  icon: LucideIcon;
  requiresProject?: boolean;
}

export const WORKSPACE_SECTIONS: { title: string; items: WorkspaceNavItem[] }[] = [
  {
    title: "Design",
    items: [
      {
        id: "canvas",
        label: "Canvas",
        description: "Interactive architecture diagram",
        icon: Sparkles,
      },
      {
        id: "variants",
        label: "Variants",
        description: "Compare and adopt design options",
        icon: Layers,
        requiresProject: true,
      },
      {
        id: "compare",
        label: "Compare",
        description: "Side-by-side variant differences",
        icon: GitCompare,
        requiresProject: true,
      },
      {
        id: "model",
        label: "Data model",
        description: "Star schema and transforms",
        icon: Database,
      },
    ],
  },
  {
    title: "Workflow",
    items: [
      {
        id: "improve",
        label: "Improve",
        description: "Suggestions to strengthen the design",
        icon: Lightbulb,
      },
      {
        id: "review",
        label: "Review",
        description: "Well-architected scores and findings",
        icon: Shield,
      },
      {
        id: "approve",
        label: "Approve",
        description: "Sign-off and review comments",
        icon: CheckCircle2,
        requiresProject: true,
      },
    ],
  },
  {
    title: "Deliver",
    items: [
      {
        id: "summary",
        label: "Summary",
        description: "Risks, tradeoffs, and next steps",
        icon: FileText,
      },
      {
        id: "export",
        label: "Export",
        description: "Download JSON, Mermaid, Terraform, dbt",
        icon: FileOutput,
      },
    ],
  },
];

export function getWorkspaceMeta(view: WorkspaceView): WorkspaceNavItem | undefined {
  for (const section of WORKSPACE_SECTIONS) {
    const item = section.items.find((i) => i.id === view);
    if (item) return item;
  }
  return undefined;
}

export function visibleWorkspaceSections(hasProject: boolean) {
  return WORKSPACE_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.requiresProject || hasProject),
  })).filter((section) => section.items.length > 0);
}
