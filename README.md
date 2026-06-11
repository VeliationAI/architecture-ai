# Architecture AI Studio

Turn use cases into **explainable target architectures** with platform-native best practice review. Not just diagramming — architecture intelligence.

**Prompt → typed graph → canvas → suggestion rail → click-to-explain → export & MCP**

## Features

- **Intake form** compiles structured requirements into architecture generation prompts
- **Typed architecture graph** (nodes, edges, zones, assumptions, rationale) — not pixels
- **React Flow canvas** with drag-and-drop refinement and click-to-explain decision records
- **Review engine** with Databricks & AWS well-architected rule packs + LLM analysis
- **Suggestion rail** — every recommendation answers what / why / benefit / tradeoff / risk
- **Exports** — JSON, Mermaid, Terraform stub, client-ready summary
- **MCP server** — tools, resources, and prompts for IDE/agent integration

## Quick start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local
# Add OPENAI_API_KEY or set USE_MOCK_LLM=true for offline demo

# Build packages
npm run build

# Start web studio
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
architecture-ai/
├── apps/web/           # Next.js studio (React Flow canvas, API routes)
├── packages/core/      # Graph schema, prompts, LLM client, rule packs, exports
├── packages/catalog/   # Databricks & AWS component catalogs
└── packages/mcp/       # MCP server (stdio)
```

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate architecture from customer input |
| `/api/review` | POST | Review graph against rule packs + LLM |
| `/api/explain` | POST | Explain a specific component |
| `/api/export` | POST | Export graph (json, mermaid, terraform, summary) |
| `/api/catalog` | GET | Component catalog and rule packs |

## MCP server

Add to your Cursor/Claude MCP config:

```json
{
  "mcpServers": {
    "architecture-ai": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "USE_MOCK_LLM": "true"
      }
    }
  }
}
```

Build first: `npm run build`

### MCP tools

- `generate_architecture` — use case → typed graph + rationale
- `review_architecture` — well-architected review with scores
- `suggest_components` — rule-pack findings
- `explain_component` — decision record for a node
- `apply_suggestion` — add suggested component to graph
- `export_mermaid` / `export_terraform_stub` / `create_client_summary`
- `compare_designs` — diff two architecture graphs

### MCP resources

- `catalog://databricks/components`
- `catalog://aws/components`
- `rules://databricks/well-architected`
- `templates://databricks`

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for generation/review |
| `OPENAI_MODEL` | Model (default: `gpt-4o-mini`) |
| `USE_MOCK_LLM` | `true` for offline demo without API calls |

## Platform knowledge (auto-propagates)

Platform capabilities live in a **versioned knowledge registry** at `packages/catalog/src/platform-knowledge/`. When Databricks (or any platform) ships new features — e.g. Genie Agent Mode, Ontology, Inspect, Deep Research — update **one file** and it flows everywhere:

- Generation prompts (LLM context)
- Review prompts and rule packs
- Component catalog and canvas icons
- MCP resources (`knowledge://databricks`)
- API (`GET /api/platform-knowledge`)

```bash
# Check current knowledge versions
curl http://localhost:3000/api/platform-knowledge

# Get full Databricks knowledge including Genie techniques
curl http://localhost:3000/api/platform-knowledge?platform=databricks
```

To add a new platform technique, edit `packages/catalog/src/platform-knowledge/databricks.ts` → bump `version` and add to `changelog`.

## Platform support

**v1 (included):**
- Databricks (medallion, Unity Catalog, MLflow, AI Gateway, **Genie Spaces, Agent Mode, Ontology, MCP**)
- AWS (basic well-architected checks)

**Planned:**
- Azure, GCP, Snowflake rule packs
- LLM application patterns (routing, grounding, evaluation)

## Contributors

| Name | LinkedIn |
|------|----------|
| [Akhil Vydyula](https://www.linkedin.com/in/akhilvydyula/) | Core contributor |
| [Sai Sankara Thamma](https://www.linkedin.com/in/sankara-reddy-thamma-18a6a6ba/) | Core contributor |

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for the full list and contribution guidelines.

## License

Private — Veliation AI
