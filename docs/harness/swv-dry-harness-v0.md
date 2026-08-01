# Scout→Worker→Verifier dry harness v0

**Job:** C9 (`memory/cursor-jobs/c9-swv-dry-harness-2026-08-01.md`)  
**Purpose:** Repeatable SWV brief templates + mechanical validation so multi-agent work is measured, not cosplay.

## What this is

A **dry harness**: fill-in templates, validate task JSON, render ready-to-paste spawn briefs, write checklist reports, and init a run directory with evidence stubs.

**CLI does not auto-spawn agents.** OpenClaw `sessions_spawn` stays in the agent runtime (Nova/Cursor). This tool prepares + grades; humans/agents paste and run live.

## Roles

| Role | Does | Does not |
|------|------|----------|
| **Scout** | Read-only inventory, prior art, risks, open questions | Edit product code; claim done |
| **Worker** | Implement only within `scopePaths`; produce evidence paths | Expand scope; touch forbidden paths; sole-verify |
| **Verifier** | Checklist vs evidence; mark verified/pending/rejected | Rewrite worker output as truth without checks; chair synthesis |

**Chair (Nova)** always synthesizes live runs. Verifier is mechanical/checklist, not final promote.

## Forbidden scopes (hard)

- `openclaw.json`
- wallet / secrets / credentials / money paths
- live send/spend
- C1–C8 mass redo
- Changing swarm default model in config

## Layout

| Path | Role |
|------|------|
| `memory/evals/swv/templates/*.md` | Scout / Worker / Verifier briefs + acceptance checklist |
| `memory/evals/swv/fixtures/sample-task.json` | Harmless claim-guard gap scout |
| `scripts/lib/swv-dry-harness-lib.mjs` | Validate / render / checklist / init-run |
| `scripts/swv-dry-harness.mjs` | CLI |
| `scripts/test-swv-dry-harness.mjs` | Unit tests |
| `memory/cursor-jobs/swv-runs/<id>/` | Dry-run outputs (briefs + evidence stubs) |

## Template variables

Minimum `{{VAR}}` set:

`{{TASK_ID}}` `{{OBJECTIVE}}` `{{SCOPE_PATHS}}` `{{OUT_OF_SCOPE}}` `{{EVIDENCE_REQUIRED}}` `{{ACCEPTANCE}}` `{{MODEL_HINT}}` `{{PARENT_REF}}`

Also filled when present: `{{TITLE}}` `{{ROLE}}`.

## How to run

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"

node scripts/swv-dry-harness.mjs --help
node scripts/swv-dry-harness.mjs validate --task memory/evals/swv/fixtures/sample-task.json
node scripts/swv-dry-harness.mjs render --task memory/evals/swv/fixtures/sample-task.json --role scout
node scripts/swv-dry-harness.mjs render-all --task memory/evals/swv/fixtures/sample-task.json
node scripts/swv-dry-harness.mjs checklist --task memory/evals/swv/fixtures/sample-task.json
node scripts/swv-dry-harness.mjs init-run --task memory/evals/swv/fixtures/sample-task.json

node scripts/test-swv-dry-harness.mjs
```

Exit codes: `0` ok · `1` validation fail · `2` usage/infra

## Acceptance (v0)

1. Deliverable paths exist
2. Unit tests exit 0
3. `validate` on sample-task exits 0
4. `render-all` / `init-run` briefs have no leftover required `{{VAR}}`
5. `checklist` writes a report
6. No openclaw.json / wallet / secrets touched
7. Docs state clearly: CLI does not auto-spawn agents

## Procedure hook

See **Procedure 18** in `memory/procedural-memory-v1.md` (extends live pattern in Procedure 8).
