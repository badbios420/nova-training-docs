# Worker evidence — SWV-DRY-001

**Role:** Worker | **Model:** deepseek/deepseek-v4-flash
**Title:** Claim-guard fixture gap scout (read-only)
**Date:** 2026-08-01

## 1. What changed

- **Only** `memory/cursor-jobs/swv-runs/SWV-DRY-001-nova-verify/evidence/worker.md` (this file) was written.
- No product code, fixtures, tests, scripts, config, or memory files were edited.
- Existing `evidence/worker.md` stub was replaced with this deliverable.

## 2. Paths read

- `scripts/claim-guard.mjs` (CLI: parseArgs, resolveInputs, exit-code paths)
- `scripts/lib/claim-guard-lib.mjs` (scanText, lineHasEvidence, isEvidenceNearby, idiom clears, multi_bare)
- `scripts/test-claim-guard.mjs` (existing coverage)
- `memory/evals/fixtures/claim-guard/clean.md`, `dirty.md`, `policy.md`
- `memory/cursor-jobs/swv-runs/SWV-DRY-001-nova-verify/{scout.md,worker-brief.md,task.json,checklist.md,meta.json}`

## 3. Commands run (re-probes of critical scout findings)

| Probe | Command (node scripts/claim-guard.mjs) | Exit | Result |
|-------|----------------------------------------|------|--------|
| empty EVIDENCE | `--text "Ship is done.\nEVIDENCE:" --json` | 0 | violations 0, `done` cleared via `evidence_nearby` — **gap confirmed** |
| clean-slate / clean up | `--text "The fix is clean-slate. Also clean up the dir." --json` | 1 | 2 violations — **FP confirmed** |
| bare tx | `--text "Deploy is done.\ntx 0xabc" --json` | 0 | `done` cleared — **gap confirmed** |
| path w/ banned word | `--text "Feature done in scripts/done.md" --json` | 0 | `done` self-cleared — **gap confirmed** |
| git push circular | `--text "Changes were pushed.\ngit push origin main" --json` | 0 | `pushed` cleared — **gap confirmed** |
| code fence | `--text "Everything is shipped.\n```\ngit push origin main\n```" --json` | 0 | `shipped` cleared — **gap confirmed** |
| live verb FP | `--text "We live in the workspace docs." --json` | 1 | `live` bare_success — **FP confirmed** |
| window 0 | `--window 0 --text "Ship is done.\nEVIDENCE: ..." --json` | 1 | `done` no_evidence — correct, **untested in suite** |
| empty input | `--text ""` | 0 | exit 0, zero stats — **untested in suite** |
| exclude | `--exclude clean memory/evals/fixtures/claim-guard/dirty.md --json` | 1 | 7 violations; exclude is path-only — **untested in suite** |

## 4. Final deliverable — missing adversarial cases (18, core 8 evasion marked ★)

| case_id | Description | Proposed test name | Priority |
|---------|-------------|--------------------|----------|
| 1★ | Empty `EVIDENCE:` marker (no content) still clears a bare claim | `empty EVIDENCE marker alone does not clear` | A evasion |
| 2★ | `Source: vibes` (no path/URL/command) clears | `Source marker without real evidence does not clear` | A evasion |
| 3★ | Bare `tx` token (any 2+ letter token after "tx") counts as evidence | `bare tx token is not evidence` | A evasion |
| 4★ | Random junk 64-hex string counts as proof | `junk 64-hex is not evidence` | A evasion |
| 5★ | Path containing banned word (`scripts/done.md`) self-clears the word inside it | `banned word inside evidence path still flags` | A evasion |
| 6★ | Any `https://` URL clears a `live` claim on same/adjacent line | `URL alone does not clear live claim` | A evasion |
| 7★ | `git push` command line clears `pushed` claim (circular — command contains word stem) | `git push command is not evidence for pushed claim` | A evasion |
| 8★ | Backtick code fence with `git push` clears nearby claim | `code-fence command block does not clear adjacent claim` | A evasion |
| 9 | `clean-slate` (hyphenated compound) flagged as `clean` | `clean-slate hyphenated compound not flagged` | B precision |
| 10 | `clean up` phrasal verb flagged as `clean` | `clean up phrasal verb not flagged` | B precision |
| 11 | `live` as ordinary verb ("we live in...") flagged — may stay intentional, needs decision | `live as ordinary verb not flagged` | B precision |
| 12 | `stats.multiBareParagraphs` never asserted; paragraph grouping untested | `multi_bare paragraph stats counted` | C coverage |
| 13 | `--window 0` (same-line evidence only) untested | `window 0 requires same-line evidence` | C coverage |
| 14 | Evidence **above** claim (symmetric window) untested | `evidence above claim clears symmetric window` | C coverage |
| 15 | Empty input behavior untested (currently exit 0) | `empty input exits 0 with zero stats` | C coverage |
| 16 | `--json` machine-readable output untested | `CLI --json outputs valid machine-readable report` | C coverage |
| 17 | CLI usage errors → exit 2 (unknown arg, no input, missing path) untested | `CLI usage error exits 2` | C coverage |
| 18 | `--exclude` regex skip untested (path-only; file vs dir semantics) | `CLI --exclude skips matching files` | C coverage |

Core set (highest value): cases 1–8 (evasion), then 9–10 (precision), then 12/13/15/17 (coverage) as the next tier.

## 5. Explicit no-product-writes claim

- **No product file writes.** Only `evidence/worker.md` under the run dir. No edits to `scripts/*`, fixtures, `test-claim-guard.mjs`, `openclaw.json`, wallet, secrets, MEMORY.md, or dirty.md.

## 6. Residual risks / open questions

1. **Evasion fixes risk precision regressions.** `EVIDENCE:`/`Source:` markers, URLs, tx, and 64-hex are cheap proxies by design; tightening them (e.g., require content after marker, require path-shaped tokens) may re-flag legit claim-ledger lines — needs the precision tests (9–11) run in the same pass.
2. **`Source:` marker** is used for legitimate evidence elsewhere; any fix must keep `Source: <real path>` clearing.
3. **`live` verb FP (11)** may be intentional under an aggressive banned list; owner decision needed, not a worker call.
4. **CLI exit-code tests (16–18) need a child-process harness** — current unit file only imports the lib; new tests require spawning `scripts/claim-guard.mjs`.
5. **multi_bare semantics** interact with bullet-block handling; changing evidence heuristics may shift paragraph grouping and `multiBareParagraphs` counts.
6. URL/tx/hex heuristics stay offline-only; real tx validation is out of scope.

## 7. Verification status

- **Not self-marked verified.** Verifier + Chair decide. Evidence above is probe output, not a pass claim.
