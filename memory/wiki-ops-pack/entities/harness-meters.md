---
pageType: entity
entityType: system
id: entity.harness-meters
title: Nova harness meters
canonicalId: ops.harness-meters
aliases:
  - harness scorecard
  - retrieval meters
  - alpha harness
privacyTier: local-private
bestUsedFor:
  - Retrieval hit@k and alpha tool status
  - Memory-before-speech fixture-baseline pointer
notEnoughFor:
  - Live production memory-before-speech rate (fixture only)
lastRefreshedAt: "2026-07-31T22:45:00.000Z"
claims:
  - id: claim.harness.retrieval-c3
    text: Canonical retrieval (2026-07-29 20:49 C3) filtered hit@1 0.80 / hit@3 0.87; raw hit@1 0.53 / hit@3 0.67; residual misses F09 FBN and F11 Hilltop weekly path.
    status: supported
    confidence: 0.95
    evidence:
      - kind: workspace-file
        path: memory/harness-scorecard.md
        note: C3 20:49 canonical row
      - kind: workspace-file
        path: MEMORY.md
        note: Retrieval meters section
      - kind: workspace-file
        path: docs/harness/retrieval-eval-set-v1.md
        note: Eval set path
  - id: claim.harness.alpha-c1-c7
    text: Alpha tools C1–C7 live; C7 memory-before-speech meter fixture-baseline 0.63 (not live prod rate); default brain xai/grok-4.5 until Grok 4.6; Procedure 14 ops-first + dream filter.
    status: supported
    confidence: 0.9
    evidence:
      - kind: workspace-file
        path: memory/cursor-jobs/alpha-queue-2026-07-29.md
        note: C1–C7 DONE rows
      - kind: workspace-file
        path: memory/cursor-jobs/c7-memory-before-speech-meter-2026-07-30.md
        note: Fixture rate 0.63
      - kind: workspace-file
        path: memory/harness-scorecard.md
        note: Meter #1 fixture-baseline snapshot
      - kind: workspace-file
        path: MEMORY.md
        note: Default brain + Procedure 14
---

## Summary

Nova harness Layer B meters and alpha Cursor jobs (C1–C7). Retrieval health is quoted from the C3 automated 15-fact row. Memory-before-speech has a **fixture-baseline** only (0.63) — not a live production rate.

## Current state

- Default brain: `xai/grok-4.5` until Grok 4.6
- Canonical retrieval (2026-07-29 20:49 C3): filtered hit@1 **0.80** / hit@3 **0.87**; raw hit@1 0.53 / hit@3 0.67
- Residual misses: **F09** FBN, **F11** Hilltop weekly path (ops-first still required)
- Alpha tools: C1 task-grade, C2 claim-guard, C3 retrieval eval, C4 memory-health-probe, C5 trajectory-closeout, C6 verifier-pass-v1, C7 memory-before-speech meter
- Scorecard: `memory/harness-scorecard.md`
- Eval set: `docs/harness/retrieval-eval-set-v1.md`
- Policy: Procedure 14 ops-first + dream filter

## Claims

See structured `claims` in frontmatter.

## Sources

- `MEMORY.md`
- `memory/harness-scorecard.md`
- `memory/cursor-jobs/alpha-queue-2026-07-29.md`
- `memory/cursor-jobs/c7-memory-before-speech-meter-2026-07-30.md`
- `docs/harness/retrieval-eval-set-v1.md`

## Open questions

- Live memory-before-speech production rate (not yet measured)
- Residual F09/F11 mitigation beyond ops-first policy

## Notes

<!-- openclaw:human:start -->
<!-- openclaw:human:end -->

## Related

<!-- openclaw:wiki:related:start -->
- [Hilltop listing](hilltop-listing.md)
- [Big House FBN + Vista city license](fbn-vista-license.md)
- [Quorra ↔ Nova sister porch](sister-porch.md)
- path:`memory/harness-scorecard.md`
- path:`docs/harness/retrieval-eval-set-v1.md`
<!-- openclaw:wiki:related:end -->
