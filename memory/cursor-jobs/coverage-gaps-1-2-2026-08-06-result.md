# Coverage gaps 1+2 result — 2026-08-06

**Status:** PASS (gaps 1+2)  
**Mode:** implement tests only · no commit/push · no config · no gateway · no gap 3  
**Procedure:** 19 (Cursor completion gate)

## Files added

| Path | Role |
|------|------|
| `scripts/test-superseded-stubs.mjs` | Gap 1 — SUPERSEDED stub hygiene |
| `scripts/test-model-claims-vs-config.mjs` | Gap 2 — present-tense model claims vs runtime |
| `memory/cursor-jobs/coverage-gaps-1-2-2026-08-06-result.md` | This result |

No doc rewrites. No `openclaw.json` edits. No WORLD_STATE edits.

## Authoritative sources used (Gap 2)

| Source | Fields / expectation |
|--------|----------------------|
| `~/.openclaw/openclaw.json` | `agents.defaults.model.primary` = `xai/grok-4.5`; `agents.defaults.subagents.model` = `deepseek/deepseek-v4-flash` |
| `scripts/cursor-worker.sh` | `CURSOR_MODEL="${CURSOR_MODEL:-cursor-grok-4.5-high}"` → `cursor-grok-4.5-high` |
| Chamber seats (doc-architecture, not openclaw.json) | Structural = GLM-5.2; Skeptic = `gpt-5.6-sol` / `openai/gpt-5.6-sol` when asserted |

## CURRENT-doc surfaces checked (Gap 2)

- `WORLD_STATE.md` — `## Nova Architecture (Current)` region (brain / swarm / Structural GLM-5.2 / cursor pin)
- `MEMORY.md` — `## Architecture & harness (current)` only (not dated chronology dump)
- `TOOLS.md` — Cursor Agent sidecar / Default model table
- `docs/harness/swarm-protocol-v0.md` — header defaults + near-top role table
- `IDENTITY.md` — `**Model:**` line when present-tense / current

## Historical exclusions (must NOT fail)

- `memory/YYYY-MM-DD.md` dailies — not scanned
- `memory/research-*.md` — not scanned
- `memory/chambers/**` — not scanned
- MEMORY lines under Recent durable decisions / dated `**7/31:**` / `**8/1:**` chronology — not in architecture region
- Lines with historical markers: `was`, `flipped`, `true as of`, `superseded`, `History:`, etc. — skipped by conflict scanner
- Intentional alt inventory (e.g. WORLD_STATE Bulk ZAI worker GLM-5.1) — not treated as swarm default

## Gap 1 assertions covered

**A. `memory/priority-dashboard.md`**
1. Contains SUPERSEDED  
2. Mentions WORLD_STATE.md as canonical live source  
3. No live `| <number> | **...** |` task-inventory rows; no multi-row URGENT/IMPORTANT grid  
4. Missing file → loud fail  

**B. Procedure 3 only (`## 3.` → `## 4.`)**
1. SUPERSEDED (or stub-equivalent)  
2. No active commit/push checklist (`Commit with clear message` / `Verify push succeeded` as instructions)  
3. References Proc 21 and/or 15  

## Stale claims found

None on current post-mem-health tree. Suite PASS — no doc fixes required.

## PASS/FAIL per suite

| Suite | Exit | Notes |
|-------|------|-------|
| `node scripts/test-superseded-stubs.mjs` | **0 PASS** | 6/6 |
| `node scripts/test-model-claims-vs-config.mjs` | **0 PASS** | 8/8 |
| `node scripts/test-claim-guard.mjs` | **0 PASS** | 21/21 regress |
| `node scripts/test-session-startup.mjs` | **0 PASS** | 17/17 regress |
| `bash scripts/test-cursor-worker.sh` | **2** (expected) | Structural PASS; live raw smoke FAIL = Cursor not authenticated (brief: structural ok even if live smoke PATH fails) |
| `node --check scripts/test-superseded-stubs.mjs` | **0** | syntax OK |
| `node --check scripts/test-model-claims-vs-config.mjs` | **0** | syntax OK |

## Proc 19 completion gate

1. **Shell:** no `*.sh` modified → `bash -n` N/A  
2. **JS:** `node --check` on both new test files → exit 0  
3. **Targeted tests:** both new suites + claim-guard + session-startup → exit 0  
4. **Readback:** untracked adds only:
   - `scripts/test-superseded-stubs.mjs`
   - `scripts/test-model-claims-vs-config.mjs`
   - this result md

## Hard bans respected

- No gap 3  
- No commit/push  
- No openclaw.json edits  
- No gateway  
- No WORLD_STATE mass rewrites (none needed)

## Residual risks

- Conflict heuristics are pattern-based; a novel phrasing of a wrong live default could slip until the scanner is extended.  
- Skeptic seat is not a WORLD_STATE architecture row today — test only fails if a CURRENT surface asserts a conflicting Skeptic (swarm-protocol chamber line checked).  
- cursor-worker live smoke still needs `agent login` / `CURSOR_API_KEY` for auth path; unrelated to gaps 1+2.
