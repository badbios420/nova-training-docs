# Prediction Tracker

**Purpose:** Track Nova's predictions vs results over time. Direct measurement of judgment quality.

**Created:** 2026-06-22 (Chamber #5, per GPT-5.5 suggestion)

**Rule:** Every prediction gets a date, a result (TBD initially), and a verdict (correct/wrong/partial) when resolved. No editing predictions after they're logged.

---

## Predictions

| # | Date | Prediction | Result | Verdict | Source |
|---|------|-----------|--------|---------|--------|
| 1 | 2026-06-22 | Flash cuts costs 40–70% | TBD | TBD | Chamber #5 (demoted from "finding" to "prediction" per GPT) |
| 2 | 2026-06-22 | Chamber system useful after 10 runs | TBD | TBD | Chamber #3 |
| 3 | 2026-06-22 | Cache hit rate rises over time | TBD | TBD | Chamber #2 |
| 4 | 2026-06-22 | GLM-4.7-Flash can handle heartbeats/maintenance/file reads without errors | TBD | TBD | Chamber #5 |
| 5 | 2026-06-22 | GLM Coding Plan subscription key works with OpenClaw zai: provider | TBD | TBD | Chamber #5 |
| 6 | 2026-06-22 | Nova produces decisive chamber outputs (PROMOTE or REJECT) without GPT in the loop | TBD | TBD | Claude (external audit) — controlled test not yet run |
| 7 | 2026-06-22 | Chamber produces a decision Jason implements and can evaluate 2-3 weeks later | TBD | TBD | Claude — graduation test for chamber-as-infrastructure |
| 8 | 2026-06-22 | Two-auditor pattern (GPT=behavioral, Claude=structural) is more valuable than single-model auditing | TBD | TBD | Claude — formalize which auditor for which problem type |
| 9 | 2026-06-22 | Fable 5 outperforms Sonnet 4.6 on Nova's actual workload | TBD | TBD | Claude — skepticism about "word on the street" hype |

### Predictions from external auditors (Claude, GPT) tracked separately for calibration comparison

| Source | Predictions contributed | Resolved | Correct | Wrong | Accuracy |
|--------|----------------------|----------|---------|-------|----------|
| Nova (Chamber) | 5 | 0 | 0 | 0 | N/A |
| GPT-5.5 | 0 (reframes, not predictions) | — | — | — | — |
| Claude | 4 (#6, #7, #8, #9) | 0 | 0 | 0 | N/A |

---

## Scoring

Updated when predictions resolve:

| Metric | Value |
|--------|-------|
| Total predictions | 9 |
| Resolved | 0 |
| Correct | 0 |
| Wrong | 0 |
| Partial | 0 |
| Accuracy | N/A |

---

## Rules

1. **No retroactive editing of predictions.** What was predicted stays as predicted.
2. **Log resolved predictions with evidence.** "Correct because [X measurement showed Y]."
3. **Partial counts.** "40-70% cost reduction" → actual 25% = partial.
4. **Trend matters more than any single prediction.** Track accuracy over time.
5. **Wrong predictions are valuable.** They identify calibration errors.
