# C3 — Retrieval Residual Attack (2026-07-29)

**Status:** PASS — **Nova verified ~20:49 PDT**  
**Acceptance:** filtered hit@3 ≥0.70 first mile · stretch 0.80 → **met (0.87)**

## Before → After (canonical automated 15-fact)

| Snapshot | raw hit@1 | raw hit@3 | filt hit@1 | filt hit@3 | Report |
|----------|-----------|-----------|------------|------------|--------|
| 2026-07-28 12:30 | 0.33 | 0.53 | 0.53 | **0.60** | `retrieval-eval-report-20260728-1230.md` |
| 2026-07-29 ~20:39 mid | 0.27 | 0.33 | 0.60 | 0.60 | mid-run (self-hit wall) |
| 2026-07-29 ~20:43 mid | 0.33 | 0.47 | 0.60 | 0.67 | after maxResults=24 |
| **2026-07-29 20:49 final** | **0.53** | **0.67** | **0.80** | **0.87** | `retrieval-eval-report-20260729-2049.md` |

Delta filtered hit@3: **+0.27** (0.60 → 0.87). Stretch target cleared.

## What changed (real levers)

1. **`memory/ops-fact-cards-v1.md`** — short real-fact anchors for residual IDs (F04/F06/F08/F09/F11/F12/F14/F15).
2. **Eval set relocated** out of indexed memory pollution:  
   `docs/harness/retrieval-eval-set-v1.md`  
   Stub left at old path. Runner default updated.  
   **Root cause:** gold table self-hits monopolized residual queries (often only 1–2 results above minScore).
3. **Filter hardened** (`scripts/lib/retrieval-eval-lib.mjs`): dreaming, .dreams, DREAMS, candidates, eval-set (old+new paths), MEMORY-archive-*, `*-training-docs/**`, `memory/cursor-jobs/**`, `memory/evals/**`.
4. **Runner depth:** default `--max-results` **8 → 24** so filter has room after noise drop.
5. **Config:** `agents.defaults.memorySearch.query.maxResults` **8 → 24** (backup `~/.openclaw/openclaw.json.bak.2026-07-29-c3-retrieval`). validate OK. No model/fallback edits.
6. **WORLD_STATE** plain-prose retrieval anchors (address / price path / FBN).
7. **MEMORY** already had Chamber #9 + Hilltop zip + 173 checks (Cursor/prior).
8. **opsPrefer** secondary re-rank (equal-score ties only) — reported but **not** the canonical meter.
9. Unit tests: **15/15** pass.

## Final per-fact (filtered hit@3)

| ID | filt hit@3 | Note |
|----|------------|------|
| F01–F05, F07–F08, F10, F12–F15 | Y | solid |
| F06 | Y | ops-fact-cards after archive/dream filter |
| **F09** | **N** | search prefers `memory/re-ops/fbn-publish-options-2026-07-11.md` (planning doc) over live WORLD_STATE/ops cards within top depth |
| **F11** | **N** | semantic drift to night-dip/profit research + fixture noise; live WORLD_STATE path not in top filtered |

**Do not “fix” F09/F11 by adding wrong accept paths.** Ops-first (Procedure 14) still required for live FBN/Hilltop price path.

## Category (filtered hit@3)

| Category | hit@3 |
|----------|-------|
| durable_facts | 5/5 (1.00) |
| procedures | 2/2 (1.00) |
| historical_narrative | 2/2 (1.00) |
| recent_events | 2/2 (1.00) |
| current_ops | 2/4 (0.50) ← F09/F11 residual |

## How to re-run

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/test-retrieval-eval.mjs
node scripts/retrieval-eval.mjs
# report → memory/cursor-jobs/retrieval-eval-report-YYYYMMDD-HHMM.md
```

## Limitations / next levers (not tonight scope)

- Raw still dream-heavy on several queries (filter remains mandatory).
- No engine path-exclude for dreaming; agent filter + ops-first is control surface.
- F09/F11 need either stronger live-doc embedding, query rewrite to ops-first wording, or future hard path boost for WORLD_STATE — without accept-path gaming.
- `memory/evals/fixtures/**` still sometimes ranks (filtered when under evals/).

## Acceptance checklist

1. Unit tests exit 0 — **15/15**  
2. Full 15-fact live run + report — **yes** (`…-2049.md`)  
3. filtered hit@3 ≥0.70 — **0.87**  
4. Scorecard new canonical row — yes  
5. Honest residual F09/F11 — yes  
6. No fallbacks / wallets / HEARTBEAT governance rewrite — yes  
