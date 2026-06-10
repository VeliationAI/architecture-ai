"use client";

import { useState } from "react";
import type { DataModelPackage, TableSpec } from "@architecture-ai/core";
import { useStudioStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Database, Table2, GitBranch, Layers } from "lucide-react";

type ModelTab = "conceptual" | "logical" | "dimensional" | "transforms";

function TableCard({
  table,
  selected,
  onSelect,
}: {
  table: TableSpec;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-[var(--radius-sm)] border p-3 transition-colors",
        selected
          ? "border-[var(--accent)] bg-[var(--accent-muted)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border)]"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Table2 className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span className="font-medium text-sm">{table.name}</span>
        <Badge variant="outline" className="text-[10px] ml-auto capitalize">
          {table.table_type}
        </Badge>
      </div>
      <p className="text-[10px] text-[var(--muted)] line-clamp-1">{table.explanation.grain}</p>
    </button>
  );
}

function TableDetail({ table }: { table: TableSpec }) {
  const exp = table.explanation;
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 space-y-3 bg-[var(--background-elevated)]">
      <div>
        <h4 className="font-semibold text-sm">{table.name}</h4>
        <p className="text-xs text-[var(--muted)] mt-0.5">{exp.business_purpose}</p>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-[var(--muted)]">Grain</dt>
          <dd>{exp.grain}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Keys</dt>
          <dd>{exp.key_strategy}</dd>
        </div>
        {exp.scd_type && (
          <div>
            <dt className="text-[var(--muted)]">SCD</dt>
            <dd className="uppercase">{exp.scd_type}</dd>
          </div>
        )}
      </dl>
      <div className="text-xs space-y-1.5">
        <p><span className="text-[var(--muted)]">Why: </span>{exp.why_needed}</p>
        <p><span className="text-[var(--muted)]">Benefit: </span>{exp.expected_benefit}</p>
        {exp.risk_if_omitted && (
          <p><span className="text-[var(--muted)]">Risk if omitted: </span>{exp.risk_if_omitted}</p>
        )}
      </div>
      {table.columns.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1.5">Columns</p>
          <div className="space-y-1">
            {table.columns.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-[var(--foreground)]">{c.name}</span>
                <span className="text-[var(--muted)]">{c.data_type}</span>
                {c.is_key && <Badge variant="outline" className="text-[9px] py-0">key</Badge>}
                {c.is_measure && <Badge variant="outline" className="text-[9px] py-0">measure</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ModelView({ model }: { model: DataModelPackage }) {
  const selectedTableId = useStudioStore((s) => s.selectedTableId);
  const setSelectedTableId = useStudioStore((s) => s.setSelectedTableId);
  const [tab, setTab] = useState<ModelTab>("dimensional");

  const allTables = [...model.dimensional.facts, ...model.dimensional.dimensions];
  const selectedTable = allTables.find((t) => t.id === selectedTableId);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold">Data model</h3>
          <Badge variant="outline" className="text-[10px]">{model.domain_pack ?? model.domain}</Badge>
        </div>
        <p className="text-xs text-[var(--muted)]">{model.business_process}</p>
      </div>

      <div className="flex gap-1 p-2 border-b border-[var(--border-subtle)] overflow-x-auto">
        {(
          [
            { id: "conceptual" as const, label: "Conceptual", icon: Layers },
            { id: "logical" as const, label: "Logical", icon: GitBranch },
            { id: "dimensional" as const, label: "Dimensional", icon: Table2 },
            { id: "transforms" as const, label: "Transforms", icon: GitBranch },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              tab === id
                ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                : "text-[var(--muted)] hover:bg-[var(--background-elevated)]"
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "conceptual" && (
          <div className="grid sm:grid-cols-2 gap-2">
            {model.conceptual.entities.map((e) => (
              <div key={e.id} className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3">
                <p className="font-medium text-sm">{e.name}</p>
                <Badge variant="outline" className="text-[10px] mt-1 capitalize">{e.entity_type}</Badge>
                <p className="text-xs text-[var(--muted)] mt-2">{e.description}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "logical" && (
          <div className="space-y-3">
            {model.logical.relationships.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{model.logical.entities.find((e) => e.id === r.from_entity)?.name ?? r.from_entity}</span>
                <span className="text-[var(--muted)]">{r.cardinality}</span>
                <span className="font-medium">{model.logical.entities.find((e) => e.id === r.to_entity)?.name ?? r.to_entity}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "dimensional" && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Facts ({model.dimensional.facts.length})</p>
              {model.dimensional.facts.map((t) => (
                <TableCard key={t.id} table={t} selected={selectedTableId === t.id} onSelect={() => setSelectedTableId(t.id)} />
              ))}
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] pt-2">Dimensions ({model.dimensional.dimensions.length})</p>
              {model.dimensional.dimensions.map((t) => (
                <TableCard key={t.id} table={t} selected={selectedTableId === t.id} onSelect={() => setSelectedTableId(t.id)} />
              ))}
            </div>
            <div>{selectedTable ? <TableDetail table={selectedTable} /> : (
              <p className="text-xs text-[var(--muted)] text-center py-8">Select a table to view details</p>
            )}</div>
          </div>
        )}

        {tab === "transforms" && (
          <div className="space-y-2">
            {model.transforms.map((t) => (
              <div key={t.id} className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-3">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{t.logic_summary}</p>
                <div className="flex gap-2 mt-2 text-[10px] text-[var(--muted)]">
                  <Badge variant="outline">{t.transform_type}</Badge>
                  {t.schedule && <Badge variant="outline">{t.schedule}</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
