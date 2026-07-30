# Retrieval Eval Set v1

**Purpose:** Score `memory_search` hit quality so we can hill-climb recall.  
**Created:** 2026-07-28  
**Method:** 15 facts with known gold paths + category tags. Query → top-3 paths. Score hit@1 / hit@3 overall and per category.  
**Rule:** Gold path may be any of the listed accept paths. Snippet should support the fact, not just share a keyword.

**Categories (exact):** `current_ops` · `recent_events` · `durable_facts` · `procedures` · `historical_narrative`

## Scoring
- **hit@1:** gold path is rank 1
- **hit@3:** gold path in top 3
- **support:** snippet actually contains/supports the fact (Y/N)
- Weekly target: hit@3 ≥ 0.8, support@3 ≥ 0.7

## Per-category scoring

Score each fact as usual (hit@1 / hit@3 / support), then roll up **by Category**, not only the aggregate:

1. Group the 15 facts by the Category column.
2. For each category C:  
   - `hit@1(C) = (# facts in C with gold at rank 1) / (|C|)`  
   - `hit@3(C) = (# facts in C with gold in top 3) / (|C|)`  
   - `support@3(C)` = same denominator, count only rows with support=Y among top-3 hits (or miss → N).
3. Report a five-row category table **plus** overall (all 15). A category can pass while overall fails (or vice versa) — use that to target filters (e.g. dream noise hurting `current_ops` more than `procedures`).
4. Optional filtered scoring (ignore `memory/dreaming/**`, `DREAMS.md`, `memory/.dreams/**`, eval-set self-hits) applies the same way: filter ranks first, then score overall and per category.

## Fact set

| ID | Query | Gold fact | Accept paths (any) | Category |
|----|-------|-----------|-------------------|----------|
| F01 | Vista business license Millegar unincorporated | No City of Vista business license required; unincorporated SD County | MEMORY.md, WORLD_STATE.md, memory/2026-07-27.md, memory/2026-07-22.md | durable_facts |
| F02 | Nova sovereign wallet address Cardano | Nova wallet addr1q8acwcxa7… / sovereign wallet V2 | MEMORY.md, memory/2026-06-23-wallet-v2.md, memory/2026-06-23.md | durable_facts |
| F03 | default model Grok 4.5 Nova | Default brain xai/grok-4.5 as of 2026-07-11 | MEMORY.md, IDENTITY.md, WORLD_STATE.md, memory/research-2026-07-11-grok-4.5.md | durable_facts |
| F04 | Hilltop listing street address Chula Vista zip code | 1434 Hilltop Dr, Chula Vista 91911 | WORLD_STATE.md, MEMORY.md, memory/2026-07-11.md, memory/ops-fact-cards-v1.md | durable_facts |
| F05 | Active Memory plugin Layer A | active-memory enabled main+direct 2026-07-27 | MEMORY.md, memory/claim-ledger.md, memory/2026-07-27.md, memory/research-2026-07-27-top-agent-harness.md, memory/procedural-memory-v1.md | current_ops |
| F06 | Chamber 7 casino prediction market reject | Chamber #7 REJECT both casino and prediction market | MEMORY.md, memory/2026-06-23.md, memory/ops-fact-cards-v1.md | historical_narrative |
| F07 | Möbius promotion rule research audit | No research to durable memory without audit | MEMORY.md, memory/procedural-memory-v1.md, memory/research-2026-06-22-ai-agents.md | procedures |
| F08 | How many automatic identity checks were condensed 2026-07-27 | 173 auto identity checks condensed 2026-07-27 | MEMORY.md, memory/identity-substrate.md, memory/2026-07-27.md, memory/ops-fact-cards-v1.md | recent_events |
| F09 | Big House Real Estate FBN newspaper publish status Jason | FBN published / Jason clear (or prior proof-held state) | WORLD_STATE.md, MEMORY.md, memory/2026-07-28.md, memory/2026-07-27.md, memory/ops-fact-cards-v1.md | current_ops |
| F10 | subagent defaults glm-5.1 Layer A | agents.defaults.subagents model zai/glm-5.1 | MEMORY.md, memory/claim-ledger.md, memory/procedural-memory-v1.md | current_ops |
| F11 | Hilltop Dr weekly five thousand dollar price reductions until sold | Hilltop policy $5k/week cuts until sells; −$10k cumulative so far | WORLD_STATE.md, MEMORY.md, memory/2026-07-28.md, memory/ops-fact-cards-v1.md | current_ops |
| F12 | openclaw.json file mode critical permissions patch July 28 | openclaw.json mode 664→600; re-audit 0 critical 2026-07-28 | memory/2026-07-28.md, MEMORY.md, memory/claim-ledger.md, memory/ops-fact-cards-v1.md | recent_events |
| F13 | Nova robot body Tesla Optimus embodiment | Preferred embodiment Tesla Optimus; perfect harness first; not near-term | MEMORY.md | durable_facts |
| F14 | Which success words are banned without proof in claim language | Banned without proof: done, fixed, verified, clean, working, pushed, live, shipped | memory/procedural-memory-v1.md, MEMORY.md, memory/ops-fact-cards-v1.md | procedures |
| F15 | Chamber nine Obsidian vault integration chamber verdict | Chamber #9 Obsidian Integration: HOLD (unanimous) | MEMORY.md, memory/ops-fact-cards-v1.md, memory/chambers/chamber-9-verdict.md | historical_narrative |

## Run log

### 2026-07-29 — C3 Retrieval Residual Attack
- Runner: Nova + Cursor (`scripts/retrieval-eval.mjs`); eval set moved to `docs/harness/`
- Changes: ops-fact-cards; filter harden; maxResults 24; WORLD_STATE anchors; remove self-hit pollution
- **Final (20:49):** raw hit@3 **0.67** · filtered hit@3 **0.87** · filt hit@1 **0.80** — report `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md`
- Residual: F09 FBN, F11 Hilltop weekly path
- Prior stub text archived in job report; do not restore gold table under `memory/`

### Baseline — 2026-07-28 ~00:30 PDT
- Runner: Nova main session
- Backend: ollama `nomic-embed-text` (builtin memory_search)
- **hit@1 = 6/10 (0.60)** · **hit@3 = 6/10 (0.60)**
- Full table: `memory/harness-scorecard.md`
- Misses: F04 (eval self-hit / weak address), F05 (dreams), F07 (dreams/compliance not gold), F09 (dreams beat FBN truth)
- Next experiment: down-rank or exclude `memory/dreaming/**` for ops queries; re-index freshness check on WORLD_STATE

### Efficiency pass — 2026-07-28 ~11:35 PDT
- Config: hybrid 0.55/0.45 + MMR + temporalDecay 14d + minScore 0.38; AM strict/220chars
- Scoring rule: **filtered** = ignore `memory/dreaming/**`, `DREAMS.md`, `memory/.dreams/**`, eval-set self-hits
- **Raw hit@3 still ~0.60** (dreams still rank #1 often)
- **Filtered hit@1 = 7/10 (0.70)** · **filtered hit@3 = 8/10 (0.80)** · support@3 ~0.80
- Residual misses: F04 (address weakly indexed), F09 (FBN — gold buried under dreams; use ops-first WORLD_STATE/today)
- Engine has **no path-exclude knob**; agent filter + ops-first is the enforced control

### Category expansion — 2026-07-28 (Cursor sidecar job #1) — structure only; scores not re-run

## How to run

Automated runner (Nova sidecar / Cursor job):

```bash
# Unit tests (no network)
node scripts/test-retrieval-eval.mjs

# Live eval (requires `openclaw` on PATH; Node ≥24.15 recommended for openclaw)
node scripts/retrieval-eval.mjs --help
node scripts/retrieval-eval.mjs                 # all facts
node scripts/retrieval-eval.mjs --limit 3       # smoke
node scripts/retrieval-eval.mjs --id F09        # one fact
node scripts/retrieval-eval.mjs --json          # machine summary on stdout

# Reports land at:
#   memory/cursor-jobs/retrieval-eval-report-YYYYMMDD-HHMM.md
```

Scores **raw** (engine order) and **filtered** (dream/candidates/eval-self/archive/training-docs dropped, then re-ranked). Per-category rollups included.
Canonical meter = classic **filtered**. Optional **opsPrefer** (tie-break boost for WORLD_STATE/MEMORY/today daily) prints separately when enabled.
