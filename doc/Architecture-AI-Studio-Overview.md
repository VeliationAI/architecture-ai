# Architecture AI Studio — Product Overview

**Version:** 0.1.0  
**License:** MIT  
**Live demo:** [https://architecture-ai.onrender.com/](https://architecture-ai.onrender.com/)  
**Repository:** [github.com/VeliationAI/architecture-ai](https://github.com/VeliationAI/architecture-ai)

---

## Executive summary

Architecture AI Studio turns business use cases into **explainable, governable target architectures** — not static diagrams. It combines structured intake, multi-variant portfolio generation, interactive canvas editing, well-architected review scoring, approval workflows, and export to engineering artifacts (JSON, Mermaid, Terraform, dbt, ADF, Databricks workflows).

Unlike generic diagramming tools, every component carries a **decision record**: what it is, why it was chosen, the benefit, the tradeoff, and the risk if omitted.

---

## The problem

| Challenge | Impact |
|-----------|--------|
| Architecture decisions live in slides and whiteboards | Knowledge is lost; designs are not executable |
| One-size-fits-all recommendations | Misses tradeoffs between speed, governance, and scale |
| Platform features change monthly | Review checklists go stale (Genie, Unity Catalog, AI Gateway…) |
| AI generates pretty boxes | No rationale, no scoring, no approval trail |

---

## The solution

```
Prompt → Typed graph → Canvas → Review → Approve → Export & MCP
```

1. **Intake** — Structured requirements (platform, scale, compliance, data mode).
2. **Portfolio** — Three strategic variants per run (e.g. fast delivery, governed, scale/AI-ready).
3. **Canvas** — React Flow diagram with semantic service icons and click-to-explain nodes.
4. **Review** — Seven well-architected dimensions with platform-native rule packs.
5. **Workflow** — Improve suggestions, approval comments, sign-off states.
6. **Deliver** — Export artifacts and MCP tools for IDE/agent integration.

---

## Key capabilities

### Multi-variant portfolio

Each generation produces **three design postures** for the same requirements, each with:

- Overall score and design intent label
- Thesis and key tradeoffs
- Full architecture graph and optional data model
- Improvement suggestions

Users preview variants on the canvas and **adopt** one as the active design.

### Typed architecture graph

The canonical data model is a **typed graph** (nodes, edges, zones, assumptions, rationale) — not pixels. This enables:

- Deterministic export and diff
- Rule-pack review against structured components
- MCP tools that read/write the same schema

### Well-architected review engine

Scores designs across **seven dimensions**:

| Dimension | Focus |
|-----------|--------|
| Security | Identity, encryption, network boundaries |
| Reliability | HA, DR, failure modes |
| Performance | Latency, throughput, right-sizing |
| Cost | Spend optimization, reserved vs on-demand |
| Operations | Observability, runbooks, deployment |
| Governance | Catalog, lineage, access control |
| Explainability | Rationale completeness per component |

Platform knowledge registries (Databricks, AWS) feed both generation and review prompts.

### Data modeling

Conceptual → dimensional star schema with facts, dimensions, and transform stubs — aligned to the active architecture variant.

### Approval workflow

States: `draft` → `in_review` → `approved` / `changes_requested`

- Assumptions to confirm
- Threaded review comments
- Approve design / request changes actions

### Export formats

| Format | Use case |
|--------|----------|
| JSON | API integration, version control |
| Mermaid | Documentation, Confluence |
| Terraform stub | IaC starting point |
| dbt | Analytics engineering |
| ADF pipeline stub | Azure Data Factory |
| Databricks workflow | Lakehouse orchestration |
| Client summary | Stakeholder-ready narrative |

### MCP server (agent-native)

Tools for Cursor, Claude Desktop, and custom agents:

- `generate_architecture`, `review_architecture`, `explain_component`
- `compare_designs`, `apply_suggestion`, export helpers
- Resources: `catalog://`, `rules://`, `knowledge://`, `templates://`

---

## Workspace UX

The studio uses a **unified left navigation** — selecting a mode opens content in the **main center panel** (not a disconnected right sidebar):

| Section | Views |
|---------|--------|
| **Design** | Canvas, Variants, Compare, Data model |
| **Workflow** | Improve, Review, Approve |
| **Deliver** | Summary, Export |

Mobile: horizontal pill navigation under the toolbar.

---

## Technical architecture

```
architecture-ai/
├── apps/web/              Next.js 15 studio + API routes
├── packages/core/         Graph schema, LLM, portfolio, review, export
├── packages/catalog/      Platform knowledge, icons, domain packs
└── packages/mcp/          MCP server (stdio)
```

### API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate architecture / portfolio |
| `/api/review` | POST | Well-architected review |
| `/api/explain` | POST | Component decision record |
| `/api/export` | POST | Multi-format export |
| `/api/variants` | POST | Variant operations |
| `/api/compare` | POST | Side-by-side diff |
| `/api/merge` | POST | Merge suggestions |
| `/api/approve` | POST | Approval workflow |
| `/api/platform-knowledge` | GET | Versioned platform registry |

### Platform knowledge registry

Single source of truth at `packages/catalog/src/platform-knowledge/`. Updating one file propagates to:

- Generation and review prompts
- Component catalog and canvas icons
- MCP resources and REST API

**Supported today:** Databricks (deep), AWS (well-architected basics)  
**Planned:** Azure, GCP, Snowflake rule packs

### Deployment

| Environment | URL / method |
|-------------|----------------|
| Production | [architecture-ai.onrender.com](https://architecture-ai.onrender.com/) on Render |
| Local | `npm run dev` → localhost:3000 |
| Mock mode | `USE_MOCK_LLM=true` — no API key required |

---

## User journey (typical session)

1. Land on intake form — select platform (Databricks, AWS, Azure, GCP, Snowflake).
2. Describe use case, scale, compliance, and data mode.
3. Generation overlay — portfolio of three variants appears.
4. Open **Variants** — preview and adopt a design.
5. **Canvas** — explore diagram; click nodes for rationale.
6. **Review** — run well-architected scoring.
7. **Approve** — submit for review, comment, sign off.
8. **Export** — download JSON, Mermaid, or platform stubs.

---

## Differentiators

| vs Diagramming tools | vs Generic AI chat |
|---------------------|-------------------|
| Typed graph schema | Structured portfolio output |
| Platform rule packs | Versioned knowledge registry |
| Scored review dimensions | Explainability per node (4× rationale) |
| Approval + export pipeline | MCP for agent workflows |

---

## Roadmap (planned)

- Azure, GCP, Snowflake knowledge packs
- LLM application patterns (routing, grounding, evaluation)
- Deeper merge and dedupe across variant portfolios
- Demo video on landing page

---

## Team & license

| Contributor | Role |
|-------------|------|
| [Akhil Vydyula](https://www.linkedin.com/in/akhilvydyula/) | Core contributor |
| [Sai Sankara Thamma](https://www.linkedin.com/in/sankara-reddy-thamma-18a6a6ba/) | Core contributor |

**License:** MIT — Copyright © 2026 contributors.

---

## Quick start

```bash
git clone https://github.com/VeliationAI/architecture-ai.git
cd architecture-ai
npm install
cp .env.example .env.local   # set USE_MOCK_LLM=true for offline demo
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or use the [live demo](https://architecture-ai.onrender.com/).

---

*Document generated for Architecture AI Studio — Veliation AI*
