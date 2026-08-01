# Verifier evidence — SWV-DRY-001

**Role:** Verifier (mechanical checklist — NOT chair)
**Model:** deepseek/deepseek-v4-flash
**Parent:** C9 dry harness
**Date:** 2026-08-01 02:00 PDT
**Brief source:** `verifier-brief.md` (2026-08-01 01:53)

## Paths read

- `memory/cursor-jobs/swv-runs/SWV-DRY-001-nova-verify/evidence/worker.md` (deliverable under review)
- `memory/cursor-jobs/swv-runs/SWV-DRY-001-nova-verify/evidence/scout.md` (stub, unchanged)
- `memory/cursor-jobs/swv-runs/SWV-DRY-001-nova-verify/{task.json,checklist.md,meta.json}` (scope/out-of-scope gates)
- Git status + mtimes for: `scripts/claim-guard.mjs`, `scripts/lib/claim-guard-lib.mjs`, `scripts/test-claim-guard.mjs`, `memory/evals/fixtures/claim-guard/*`, `scripts/cursor-worker.sh`, harness files

## Commands + exits (independent re-probes, run 02:00)

| Probe | Command | Exit | Matches worker claim? |
|-------|---------|------|------------------------|
| empty EVIDENCE | `node scripts/claim-guard.mjs --text "Ship is done.\nEVIDENCE:" --json` | 0, violations 0, `done` cleared evidence_nearby | ✅ exact |
| clean-slate FP | `node scripts/claim-guard.mjs --text "The fix is clean-slate. Also clean up the dir." --json` | 1, 2 violations multi_bare | ✅ exact |
| banned word in path | `node scripts/claim-guard.mjs --text "Feature done in scripts/done.md" --json` | 0, both `done` self-cleared | ✅ exact |

3/3 independent probes reproduce worker's reported behavior byte-for-byte on exit code, violation count, and cleared reasons.

## File-write audit (git + mtime)

| Path | mtime | Git | Verdict |
|------|-------|-----|---------|
| scripts/claim-guard.mjs | 2026-07-29 20:08 | clean | untouched ✓ |
| scripts/lib/claim-guard-lib.mjs | 2026-07-29 20:10 | clean | untouched ✓ |
| scripts/test-claim-guard.mjs | 2026-07-29 20:08 | clean | untouched ✓ |
| memory/evals/fixtures/claim-guard/{clean,dirty,policy}.md | 2026-07-29 20:09 | clean | untouched ✓ |
| scripts/cursor-worker.sh | 2026-08-01 **01:45** | modified | **pre-dates run** (run started 01:53). Diff = model-pin `cursor-grok-4.5-high` (Chamber #11 / Jason B, documented in TOOLS.md). Not attributable to worker. |
| scripts/swv-dry-harness*.mjs, test-swv-dry-harness.mjs | 2026-08-01 01:52–53 | untracked | created by harness setup before worker.md (01:58); part of C9 dry harness, not worker deliverable |
| scripts/__pycache__/ | — | untracked | unrelated to node-based claim-guard; not a worker artifact |
| openclaw.json / wallet / secrets / MEMORY.md | — | no change | out-of-scope paths untouched ✓ |

Only run-dir evidence file written by worker: `evidence/worker.md` (01:58, 6306 B). Note: worker §1 says it "replaced an existing stub", but evidence dir at 01:53 contained only `scout.md` + `verifier.md` stubs — worker.md was created fresh. Trivial wording inaccuracy, no material impact.

## Acceptance checklist

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | 3+ concrete missing cases OR explicit none-found w/ rationale | **VERIFIED** | worker.md §4: 18 cases (8 evasion ★ + 9–10 precision + 12–18 coverage); 3 representative probes independently reproduced (see table above) |
| 2 | Each case maps to a test name | **VERIFIED** | worker.md §4 table: all 18 rows carry a `Proposed test name` |
| 3 | No production money paths | **VERIFIED** | task.json outOfScope = wallet/secrets/openclaw.json/MEMORY.md; git audit shows zero writes to any product path; worker §5 explicit no-product-writes claim corroborated by mtimes/git |
| 4 | evidenceRequired: paths read | **VERIFIED** | worker.md §2 lists 8 paths, all exist in repo; consistent with scope (read-actions themselves not independently auditable — inherent to read-only ops) |
| 5 | evidenceRequired: proposed missing cases list | **VERIFIED** | worker.md §4 full table + §3 probe log with exit codes |
| 6 | evidenceRequired: no-file-writes claim (product) | **VERIFIED** | mtime + git audit above confirms no product/fixture/test modifications during or after run window |

## Residual risks

1. **Evasion-fix precision tradeoff** (worker §6.1): tightening `EVIDENCE:`/`Source:`/URL/tx/64-hex heuristics could re-flag legit claim-ledger lines. Fixes must ship with precision cases 9–11 in the same pass.
2. **`Source:` marker is legitimate elsewhere** (worker §6.2) — fixes must preserve `Source: <real path>` clearing.
3. **Case 11 (`live` verb) is an owner decision**, not a worker call — Chair should route to Jason.
4. **CLI exit-code tests (16–18) need a child-process harness** — current unit file only imports lib.
5. **`cursor-worker.sh` uncommitted change** predates this run (model pin) — unrelated to worker, but repo is not fully clean; Chair may want it committed separately.
6. Worker's "replaced stub" wording vs. actual fresh-create (see audit) — cosmetic only.

## Overall verdict: **PASS** (for dry-run purpose)

All 6 acceptance items verified; 3/3 independent probes matched worker claims exactly; zero product writes confirmed via git + mtimes.

## Handoff note for Chair Nova

- Worker deliverable is **trustworthy as-is**: 18 cases (8 evasion core) with test names and priorities; probe log reproducible.
- Recommend next step (production, not dry): implement tests for cases 1–8 + 9–10 first; require owner sign-off on case 11; add child-process test harness for 16–18.
- Keep precision suite (9–11) coupled to any evasion fix — see risk 1.
- No MEMORY.md promotion performed (per brief).
- Dry-run objective met: read-only, no code edits, verifier loop exercised end-to-end.
