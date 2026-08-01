# Cheap-Worker + Cost/Trust Skeptic Report — Chamber #10

## 1. Cheap workers: DO vs NEVER

**DO:** bulk retrieval/scraping sweeps, summarization of known-good sources, candidate generation (options, drafts, hypotheses), formatting/conversion, dedup/normalization, smoke tests, structured extraction, and any task where failure is cheap and recoverable.

**NEVER:** wallet ops, external sends, sole verifier on any output that gates a real action, full MEMORY/WORLD_STATE dumps (keep the trust fence literal), config edits, final sign-off, or anything touching secrets. Also never let a cheap worker be the *last* model to see a deliverable. Cheap models are great for first drafts and terrible for "is this right?" — that's the flagship's job.

## 2. GLM-5.1 vs DeepSeek Flash

Don't flip the default yet — **run a dual-lane bake-off first** (both get disjoint work, ~20-30 real tasks with known answers). Criteria, in order of weight:
1. **Cost per *successfully verified* task** (not per attempt — flash fails more; failure inflates real cost)
2. JSON/schema adherence (the #1 spawn-integration cost)
3. Evidence-citation rate (does it quote sources or fabricate?)
4. Latency & rate-limit behavior at concurrency
5. Task-completion rate on multi-step briefs

Flip the default only if flash wins on (1) and (2) by ≥2x. If GLM wins on schema adherence, keep it as the structured-output lane and use flash for free-text sweeps. **Never single-source a lane until one model has 50+ verified passes.**

## 3. Concurrency: go 4

3 is fine but leaves fan-out on the table; 8 floods the parent — the orchestrator must read, dedup, and verify every output, and that's the real bottleneck, not spawn capacity. 4 gives ~2x headroom with bounded result-queue risk. If you see rate-limit retries or unread-output pileups, drop to 3. If verification stays trivially fast, 6 is the ceiling — but 8 is vibes, not engineering.

## 4. Spawn brief template (minimum)

```
TASK_ID: <deterministic slug>
ROLE: <worker; never decision-maker>
INPUT: <pointer + allowed sources ONLY>
CONSTRAINTS: <no external sends; no secrets; no config>
OUTPUT SCHEMA: {"task_id","answer","confidence":0-1,"evidence":[{"source_id","exact_quote_or_line"}],"unknowns":[]}
EVIDENCE RULES: every claim maps to a cited source; if not found, write "NOT FOUND" — never guess; mark confidence LOW when uncertain.
BUDGET: <max tokens; truncate over writing prose>
```

## 5. Thrash, duplicates, silent wrongness

- **Thrash:** deterministic task IDs + disjoint partition assignment; spawns never self-spawn (enforce `maxSpawnDepth=2`); no retry without parent seeing the error.
- **Duplicates:** task registry keyed by content hash; check before spawn, not after.
- **Silent wrongness:** mandatory confidence + evidence fields (reject outputs missing either), spot-check ≥1 output per batch yourself, and run the existing Gen→Verify pass on anything that gates an action. Disagreement between lanes (GLM vs flash on same task) is a flag, not a tiebreak — escalate to flagship.

## 6. Cost model (order of magnitude)

Flash-class ≈ $0.3/M in, $1/M out; GLM-5.1 ≈ 2-4x that. A light task ≈ 3K in + 1K out → **~$0.001-0.004 per worker task**. Ten tasks: **$0.01-0.04** in worker spend; add ~$0.05-0.15 parent cost to read/verify 10 outputs (20-30K tokens on flagship). **Total: ~$0.10-0.20 per verified 10-task cycle** — roughly 10-50x cheaper than doing it all on Grok 4.5. Verification doubles cost; skipping it makes the whole savings illusory.

## 7. Minimum viable boss mode

Keep Grok 4.5 default. Change **one variable per week**: (a) default cheap worker → flash with fences intact, (b) `maxConcurrent` 3→4, (c) enforce the spawn brief above. Non-negotiable process: every batch gets parent spot-check + Gen→Verify before any action, and a per-batch cost log. Boss mode is a *process* (cheap-first draft, expensive-only-adjudicate), not a config file. No wallet/memory config changes — ever.

## 8. Verdict

- **PROMOTE:** dual-lane bake-off (cheap, high signal)
- **PROMOTE:** evidence/confidence contract in all spawn briefs, immediately
- **PROMOTE:** `maxConcurrent` 3→4 after bake-off starts
- **HOLD:** flipping default worker until 50+ verified passes per lane
- **HOLD:** `maxSpawnDepth` beyond 2
- **REJECT:** cheap-worker wallet/external-send authority — permanent
- **REJECT:** any fan-out without the verification pass — the harness is the whole point