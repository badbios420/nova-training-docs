# Error Doctor v0.1.1 — Precision Validation (Chair adjudication)

**Date:** 2026-08-01 15:56 PDT  
**Chair:** Nova (xai/grok-4.5)  
**Flash lanes:** deepseek/deepseek-v4-flash ×3 (A evidence · B diagnosis · C risk) — all done  
**Cursor implement:** cursor-grok-4.5-high (17/17 tests, live pass clean)  
**Mode:** READ-ONLY · no repairs · no commits · no ledger writes  

---

## Overall verdict: **PASS — precision upgrade validated**

Error Doctor v0.1.1 is promoted as a manual read-only swarm protocol feature. The precision pass (5 requirements) is substantially met with known residual gaps that do not block promotion.

---

## Requirement acceptance

| # | Requirement | Verdict | Evidence |
|---|-------------|---------|----------|
| 1 | Exclude diagnostic corpus | **PASS** | `isExcludedEvidencePath` covers 5 path classes + double-filtered in discovery/collection; `isErrorishLine` drops probe-report markdown; no self-ingestion in live run (10/0 sources) |
| 2 | Consolidate incident families | **PASS*** | AM family: 80 raw clusters → 1 parent with 62 children; Fetch/TTS separate; *caveat: `am-aborted` role is unconditional — unrelated transport aborts can be absorbed into AM family when AM core exists (Lane A + B flag) |
| 3 | Improve fingerprint normalization | **PASS** | Punctuation, durations→`<N>`, UUIDs, runIds, AM runs, paths→basename, hashes→`<HASH>`, timestamps — all handled with explicit rules; 17/17 tests pass |
| 4 | User-facing output | **PASS*** | Health + 2 families + status/risk/probe/rec/confidence + appendix; *caveat: `rootCause`/`competingHypothesis`/option list computed but not rendered in markdown (JSON only); "pick family + option" footer but no visible options |
| 5 | Tests | **PASS** | 17/17 — 10 legacy + 7 precision (corpus exclude, lifecycle merge, unrelated separate, punctuation merge, high-sev low-count, no secrets, no repairs) |

---

## Flash lane consensus (18 questions)

| Lane | PASS | PARTIAL | FAIL | Key flags |
|------|------|---------|------|-----------|
| A Evidence | 4 | 1 | 0 | F-secrets-env-missing NOISE+sev=high unexplained; no JSON artifact saved |
| B Diagnosis | 3 | 2 | 0 | Budget inversion missing from report; AM recommendation undersold; options invisible |
| C Risk | 3 | 2 | 0 | AM Probe: PASS overstates coverage; sev=high appendix item deserves callout |

### Consensus flags (agreed by ≥2 lanes)

1. **Unconditional `am-aborted` role** (A + B) — absorbs unrelated transport aborts into AM family when AM core exists. Low risk now (AM dominates this window), but a correlation gate (shared runId) would tighten precision.
2. **`F-secrets-env-missing` NOISE + sev=high** (A + B + C) — correctly dispositioned per ledger (restart-window burst, gateway up, probe PASS), but a sev=high recurring item sitting in noise is the highest-severity finding in the run and gets no health-label influence. Design is defensible; a callout line would improve visibility.
3. **AM Probe: PASS overstates coverage** (B + C) — probes test infra health (ollama + memory-health), not the AM child/embedded fault path. AM timeout is a budget/timing failure that infra probes cannot detect. `Probe: PASS` should be read as "infra healthy," not "AM path healthy."
4. **Root cause / options not rendered in markdown** (B + C) — `hypothesizeRootCause` computes budget-inversion hypothesis with competing causes; `planRepairs` generates Level 0–4 options. Neither appears in the markdown card. Chair cannot act on "pick family + option" without visible options.

### Lone flags (1 lane only)

- **Ledger KNOWN→REGRESSED path missing** (B only) — KNOWN entries can never degrade even if probes fail. Real risk, but low priority since ledger entries are current this run.
- **No JSON artifact saved** (A + B) — report references "see JSON rawClusters / children" but no JSON file was written to the run directory. Minor traceability gap.
- **Appendix count confusion** (A + C) — "noise: 3" header followed by 12 lines (mostly unclassified F-generic, not NOISE). Bucket attribution per line is absent.

---

## Quality metrics (v0.1.1 vs v0.1)

| Metric | v0.1 | v0.1.1 | Delta |
|--------|------|--------|-------|
| Raw events | 60 | ~60 | Same window |
| Raw clusters | 115 | 81 | −30% (corpus exclude + normalization) |
| Families shown | 12 | 2 | −83% (family merge) |
| Top-family consolidation | 0 | 1 (AM, 62 children) | New |
| Noise/appendix | 3 NOISE | 3 NOISE + 14 unclassified | Cleaner top |
| Tests | 10/10 | 17/17 | +7 precision |
| Secrets leaked | 0 | 0 | Clean |
| Repairs executed | 0 | 0 | Clean |
| Probes | 2 PASS | 2 PASS | Same (gap acknowledged) |

---

## Residual items for v0.1.2 (not blocking promotion)

1. **Correlation gate on aborted-cluster absorption** — require shared runId or AM context before merging into AM family
2. **Render rootCause + option list in markdown** — budget inversion hypothesis + Level 1–4 options visible to Chair
3. **Save JSON artifact alongside report** — traceability for rawClusters/children
4. **AM-specific probe** — live inject latency test (currently "queued" in ledger)
5. **NOISE+sev≥high callout** — one-line "highest-severity appendix item" in the card
6. **Appendix bucket labels** — distinguish NOISE vs unclassified per line
7. **KNOWN→REGRESSED path** — ledger staleness check or regression trigger

These are **Cursor work when Jason opens** — not done now.

---

## Safety check (this pass)

- No repairs executed ✓
- No config edits ✓
- No gateway restart ✓
- No log deletion ✓
- No commits/push ✓
- No ledger writes ✓
- No secrets exposed ✓
- No auto-repair code path ✓
- All sideEffects fields false ✓

---

## Promotion decision

**Error Doctor v0.1.1 is PROMOTED** as a manual read-only swarm protocol feature (menu 8).

Known residual gaps are documented above and in the v0.1.2 backlog. They do not block the read-only diagnosis use case.

**STOP.**
