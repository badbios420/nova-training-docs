# Memory-before-speech meter v0

**Harness meter #1.** Answers: *On turns that needed prior facts, did memory / Active Memory / ops-first fire before speech?*

Mechanical + light heuristics — not LLM-as-judge. Fixture baselines are **not** live production rates.

| | |
|--|--|
| CLI | `node scripts/memory-before-speech-meter.mjs` |
| Lib | `scripts/lib/memory-before-speech-lib.mjs` |
| Tests | `node scripts/test-memory-before-speech.mjs` |
| Fixture | `memory/evals/fixtures/memory-before-speech/samples-v0.json` |

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
      "amStatus": "hit|none|timeout|unknown|null",
      "notes": "optional"
    }
  ]
}
```

Optional fields `prompt` / `logExcerpt` can fill booleans via keyword heuristics when omitted.

## How to run

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/test-memory-before-speech.mjs
node scripts/memory-before-speech-meter.mjs --fixture memory/evals/fixtures/memory-before-speech/samples-v0.json
node scripts/memory-before-speech-meter.mjs --samples memory/evals/fixtures/memory-before-speech/samples-v0.json --scorecard
```

Exit codes: **0** successful measure · **1** invalid schema · **2** usage/infra.

## What the meter means

| Field | Meaning |
|-------|---------|
| `eligibleTurns` | Turns with `needsPriorFact: true` |
| `withMemoryBeforeSpeech` | Eligible turns that also have `memoryEvidence: true` |
| `rate` | `with / eligible` (null if eligible = 0) |
| `amStatus` breakdown | hit / none / timeout / unknown / null counts |

**Label rule:** `--scorecard` writes a dated snapshot labeled `fixture-baseline` (or your `--label`). Do **not** quote that as live production memory-before-speech until real session samples are measured.
