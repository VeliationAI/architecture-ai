"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { cn } from "@/lib/utils";

export interface ArchNodeData {
  label: string;
  category: string;
  platform: string;
  required_level: string;
  description: string;
  iconSrc?: string;
  iconAlt?: string;
  iconTile?: boolean;
}

const LEVEL_STYLES: Record<string, { border: string; dot: string }> = {
  required: { border: "border-l-red-500", dot: "bg-red-500" },
  recommended: { border: "border-l-amber-500", dot: "bg-amber-500" },
  optional: { border: "border-l-emerald-500", dot: "bg-emerald-500" },
};

function ArchitectureNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as ArchNodeData;
  const level = LEVEL_STYLES[d.required_level] ?? LEVEL_STYLES.recommended;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]",
        "min-w-[200px] max-w-[240px] transition-all duration-200 border-l-[3px]",
        level.border,
        selected && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] scale-[1.02]"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[var(--accent)] !border-2 !border-[var(--card)]"
      />
      <div className="px-3.5 py-3">
        <div className="flex items-start gap-2.5 mb-2">
          {d.iconSrc ? (
            <ServiceIcon
              src={d.iconSrc}
              alt={d.iconAlt ?? d.label}
              size={36}
              tile={d.iconTile !== false}
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-white border border-[var(--border-subtle)]" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs leading-snug text-[var(--foreground)]">{d.label}</p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5 capitalize">{d.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", level.dot)} />
          <span className="text-[10px] text-[var(--muted-foreground)] capitalize">{d.required_level}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[var(--accent)] !border-2 !border-[var(--card)]"
      />
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent);
