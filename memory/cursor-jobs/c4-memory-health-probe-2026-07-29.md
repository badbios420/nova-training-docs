# C4 — Memory Health Probe + Recovery (2026-07-29)

**Status:** PASS — implemented + live baseline **overall pass** (~20:18 PDT)  
**Scope:** Infra reliability only (NOT C3 retrieval quality). No `openclaw.json` / wallet / HEARTBEAT governance edits.

## Design

Zero-dep Node ESM probe matching `nova-task-grade` / `claim-guard` style.

| Piece | Path |
|-------|------|
| Library | `scripts/lib/memory-health-lib.mjs` |
| CLI | `scripts/memory-health-probe.mjs` |
| Unit tests | `scripts/test-memory-health.mjs` |
| Recovery | `memory/evals/memory-health-recovery-v0.md` |
| Procedure | Procedure **16** in `memory/procedural-memory-v1.md` |

**Checks (stable ids):** `node_path` · `openclaw_cli` · `sqlite_store` · `ollama_http` · `embed_model` · `memory_status` · `memory_search_smoke` · `workspace_memory_dir` · `index_nonempty`

**Rollup:** `pass` (no fails) · `degraded` (warns only) · `fail` (any fail).  
**Exit codes:** 0 pass · 1 fail · 3 degraded · 2 probe usage/infra.

**Hard guarantees:**
- `database is not open` → fail (`classifySearchFailure` / search smoke)
- Spawn timeouts (default 60s) — no hang forever
- `--repair` / `--repair-dry-run` print discovered `openclaw memory` commands only — **never execute** reindex
- Does not modify memory DB
- Child env prepends nvm Node v24.18.0 bin (retrieval-eval pattern)

## How to run

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/test-memory-health.mjs
node scripts/memory-health-probe.mjs --help
node scripts/memory-health-probe.mjs --json
node scripts/memory-health-probe.mjs
node scripts/memory-health-probe.mjs --quick
```

Reports default to `memory/cursor-jobs/memory-health-YYYYMMDD-HHMM.md` (`--no-report` to skip).

## Unit results

```
memory-health unit tests

  PASS  parseNodeVersion handles v-prefix
  PASS  meetsMinNodeVersion gate ≥24.15
  PASS  classifySearchFailure detects database is not open
  PASS  classifySearchFailure detects timeout
  PASS  parseMemoryStatus extracts Indexed/Dirty/Store/FTS/Provider
  PASS  parseMemoryStatus dirty yes
  PASS  rollupOverall pass/degraded/fail
  PASS  overallToExitCode mapping
  PASS  discoverMemoryRemediationCommands from help fixture
  PASS  tagsIncludeEmbedModel matches :latest suffix
  PASS  parseMemoryStatus ignores Recall store line
  PASS  formatHumanReport includes FAIL for db-not-open style check

12 passed, 0 failed
```

## Live baseline probe output (full `--json`)

**When:** 2026-07-29 ~20:18 PDT · **overall:** `pass` · **exit:** 0

```json
{
  "overall": "pass",
  "exitCode": 0,
  "startedAt": "2026-07-30T03:18:20.128Z",
  "finishedAt": "2026-07-30T03:18:30.998Z",
  "env": {
    "workspace": "/home/mrbig3/.openclaw/workspace",
    "sqlitePath": "/home/mrbig3/.openclaw/agents/main/agent/openclaw-agent.sqlite",
    "ollamaBase": "http://127.0.0.1:11434",
    "embedModel": "nomic-embed-text",
    "searchQuery": "Vista business license unincorporated",
    "timeoutMs": 60000,
    "skipSearch": false,
    "skipOllama": false,
    "processVersion": "v24.18.0",
    "platform": "linux"
  },
  "checks": [
    {
      "id": "node_path",
      "status": "pass",
      "summary": "Node ≥24.15 available (process v24.18.0; preferred v24.18.0)"
    },
    {
      "id": "openclaw_cli",
      "status": "pass",
      "summary": "openclaw at /home/mrbig3/.npm-global/bin/openclaw"
    },
    {
      "id": "sqlite_store",
      "status": "pass",
      "summary": "sqlite ok (106856448 bytes; shm=true wal=true; integrity=skipped)"
    },
    {
      "id": "ollama_http",
      "status": "pass",
      "summary": "ollama reachable (http://127.0.0.1:11434/api/tags)"
    },
    {
      "id": "embed_model",
      "status": "pass",
      "summary": "embed model present: nomic-embed-text"
    },
    {
      "id": "memory_status",
      "status": "pass",
      "summary": "status ok: Indexed 356/357 · Dirty no · FTS ready · Provider ollama (requested: ollama)",
      "detail": {
        "parsed": {
          "indexed": 356,
          "indexedTotal": 357,
          "chunks": 2239,
          "dirty": false,
          "store": "~/.openclaw/agents/main/agent/openclaw-agent.sqlite",
          "fts": "ready",
          "provider": "ollama (requested: ollama)",
          "model": "nomic-embed-text",
          "workspace": "~/.openclaw/workspace"
        }
      }
    },
    {
      "id": "memory_search_smoke",
      "status": "pass",
      "summary": "memory search smoke ok (8 result(s))",
      "detail": {
        "query": "Vista business license unincorporated",
        "resultCount": 8
      }
    },
    {
      "id": "workspace_memory_dir",
      "status": "pass",
      "summary": "workspace memory ok (62 daily file(s); MEMORY.md)"
    },
    {
      "id": "index_nonempty",
      "status": "pass",
      "summary": "indexed files 356/357 (dirty=no)"
    }
  ]
}
```

### Human full run (same session, earlier stamp)

```
Memory health probe — overall: PASS
Started:  2026-07-30T03:17:46.236Z
Finished: 2026-07-30T03:17:57.280Z

[PASS] node_path: Node ≥24.15 available (process v24.18.0; preferred v24.18.0)
[PASS] openclaw_cli: openclaw at /home/mrbig3/.npm-global/bin/openclaw
[PASS] sqlite_store: sqlite ok (106844160 bytes; shm=true wal=true; integrity=skipped)
[PASS] ollama_http: ollama reachable (http://127.0.0.1:11434/api/tags)
[PASS] embed_model: embed model present: nomic-embed-text
[PASS] memory_status: status ok: Indexed 356/356 · Dirty no · FTS ready · Provider ollama (requested: ollama)
[PASS] memory_search_smoke: memory search smoke ok (8 result(s))
[PASS] workspace_memory_dir: workspace memory ok (62 daily file(s); MEMORY.md)
[PASS] index_nonempty: indexed files 356/356 (dirty=no)

Report written: memory/cursor-jobs/memory-health-20260729-2017.md
```

### `--quick` (search skipped)

```
Memory health probe — overall: PASS
[SKIP] memory_search_smoke: skipped (--quick / skipSearch)
…all other checks PASS
Report written: memory/cursor-jobs/memory-health-20260729-2018.md
```

## Interpretation

Host is **infra-healthy**: Node 24.18, openclaw on PATH, sqlite present (~102MB) with shm/wal, ollama up, `nomic-embed-text:latest` present, status+search smoke OK (8 hits), workspace memory dir populated, index ≥1 and Dirty=no.

Indexed sometimes shows `N/(N+1)` briefly while a file is mid-index — still passes `index_nonempty` (indexed ≥ 1). Not a fail unless indexed stays 0 or Dirty stuck yes.

## Limitations

- Does **not** prove agent-tool `memory_search` path equals CLI (tool flake vs CLI OK is a documented recovery case).
- `sqlite3` integrity skipped when binary absent (this host).
- Search smoke requires ≥1 hit by default (stable query chosen for this corpus).
- Not retrieval quality / dream-noise scoring (C3 / retrieval-eval).
- Probe never auto-reindexes; `--repair` is print-only.

## Deliverable checklist

| # | Item | Status |
|---|------|--------|
| 1 | Lib + CLI + tests | yes |
| 2 | Unit tests exit 0 offline | 12/12 |
| 3 | Live probe + report written | pass + `memory-health-20260729-2017.md` |
| 4 | Procedure 16 + recovery doc | yes |
| 5 | Scorecard + job report | yes |
| 6 | Forbidden files untouched | yes (`openclaw.json`, wallets, HEARTBEAT governance) |
