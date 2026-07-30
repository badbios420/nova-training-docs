# C7 — Memory-before-speech meter v0 (2026-07-30)

**Status:** PASS  
**Priority:** P1 (next after C1–C6)  
**Constraint:** Grok 4.5 only until 4.6. **No fallback / OpenRouter / openclaw.json / wallet work.**

## Why
Harness scorecard meter #1 is still **unmeasured**. Active Memory is ON (strict) but we cannot hill-climb without a sampling method + script that writes a real scorecard row.

## Goal
Ship a **v0 meter** that answers: *On turns that needed prior facts, did memory/AM/ops-first fire before speech?*

Not perfect LLM grading — mechanical + light heuristics first.

## Deliverables

1. **`scripts/lib/memory-before-speech-lib.mjs`** — PASS
2. **`scripts/memory-before-speech-meter.mjs`** CLI — PASS
3. **`scripts/test-memory-before-speech.mjs`** — **13/13 PASS**
4. **Fixtures** `memory/evals/fixtures/memory-before-speech/samples-v0.json` (10 turns) — PASS
5. **Doc** `memory/evals/memory-before-speech-meter-v0.md` — PASS
6. **Scorecard** meter #1 snapshot labeled `fixture-baseline` (not live production) — PASS

## Schema (samples JSON)
```json
{
  "version": 1,
  "source": "fixture|manual|log-scan",
  "generatedAt": "ISO-8601",
  "turns": [
    {
      "id": "t01",
      "at": "optional ISO",
      "needsPriorFact": true,
      "memoryEvidence": true,
      "amStatus": "hit",
      "notes": "optional"
    }
  ]
}
```

## Evidence (2026-07-30 acceptance)

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/test-memory-before-speech.mjs
# → 13 passed, 0 failed · exit 0

node scripts/memory-before-speech-meter.mjs --fixture memory/evals/fixtures/memory-before-speech/samples-v0.json
# → Rate 0.63 (5/8) · Label fixture-baseline · exit 0

node scripts/memory-before-speech-meter.mjs --samples memory/evals/fixtures/memory-before-speech/samples-v0.json --scorecard
# → Scorecard updated: memory/harness-scorecard.md · exit 0
```

| Check | Result |
|-------|--------|
| Unit tests | **13/13** exit 0 |
| Fixture rate | **0.63 (5/8)** eligible · label `fixture-baseline` |
| Scorecard meter #1 | dated snapshot appended · **not** claimed as live production |
| openclaw.json / wallet / secrets | untouched |

## Out of scope (still)
- Enabling/changing Active Memory config
- Full transcript LLM-as-judge
- lossless-claw integration
- C8 wiki pack / C9 SWV
- Live production sampling (next: real session turns → `--samples` with `source: manual`)

## Pattern mirrored
- `scripts/memory-health-probe.mjs` + `scripts/lib/memory-health-lib.mjs` + `scripts/test-memory-health.mjs`
- `scripts/claim-guard.mjs` style CLI flags / exit codes (0 measure · 1 schema · 2 usage)
