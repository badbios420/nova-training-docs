# Error Doctor precision pass — Cursor form (2026-08-01)

**Mode:** write (implement) · **Model:** cursor-grok-4.5-high  
**Owner:** Nova chair · Cursor implement · Nova verify  
**Claim posture:** evidence below; no repair executed; no config/gateway/git writes.

## Verdict

Precision upgrade for Runtime Error Doctor **v0.1.1** is implemented and locally verified under the acceptance commands. Default user-facing output is **≤5 families** (this live window: **2** watch families) with appendix for leftover noise/low-confidence clusters.

## What changed

| Area | Change |
|------|--------|
| Corpus exclude | `isExcludedEvidencePath` filters swarm runs, ledger, doctor reports, chair/worker packets, cursor-jobs `*error-doctor*`, nova-error-log-audit; job ingest limited to `*.log`; memory-health markdown reports no longer auto-discovered |
| Normalization | Trailing punctuation, durations→`<N>`, UUIDs/runIds/sessionIds/AM runs, path basename, hashes |
| Family merge | `mergeIncidentFamilies` via shared runId/sessionId + AM cascade roles (timeout/unavailable/embedded/abort-settle/aborted/failover); TTS stays separate |
| Output | Markdown card: health + ≤5 families + appendix; JSON: `families`, `appendix`, `rawClusters`, `sideEffects` |
| Docs | Minimal swarm-protocol blurb + pack JSON `precision` note |

## Files touched

- `scripts/lib/error-doctor-lib.mjs` (v0.1.1 precision engine)
- `scripts/error-doctor.mjs` (`--include-fixtures`)
- `scripts/test-error-doctor.mjs` (10 legacy + 7 precision)
- `docs/harness/swarm-protocol-v0.md` (error-doctor blurb only)
- `memory/swarm/packs/error-doctor-v0.json` (precision note)
- `memory/swarm/runs/2026-08-01-error-doctor-precision/error-doctor-report.md` (acceptance out)

## Acceptance evidence

```text
node --check scripts/lib/error-doctor-lib.mjs   # exit 0
node --check scripts/error-doctor.mjs           # exit 0
node scripts/test-error-doctor.mjs              # 17 passed, 0 failed
node scripts/error-doctor.mjs --skip-live-probes \
  --out memory/swarm/runs/2026-08-01-error-doctor-precision/error-doctor-report.md
```

Live skim (skip-live-probes; probes n/a by design for this run):

- Current health: **HEALTHY WITH 2 WATCH ITEMS**
- Top families: Fetch/TTS timeout (separate); **F-active-memory-timeout** (count≈85, children≈65)
- Sources: openclaw logs + cursor-jobs `*.log` only; no `swarm/runs` / error-doctor-report corpus
- `sideEffects.repaired/doctorFix/configWritten/gatewayRestarted` = false
- Hard bans include no `doctor --fix`, no config edits, no auto-repair

## Diff readback

```text
 M docs/harness/swarm-protocol-v0.md
?? memory/swarm/packs/error-doctor-v0.json
?? scripts/error-doctor.mjs
?? scripts/lib/error-doctor-lib.mjs
?? scripts/test-error-doctor.mjs
?? memory/swarm/runs/2026-08-01-error-doctor-precision/error-doctor-report.md
```

(Scripts were previously untracked in this workspace; pack JSON likewise.)

## Residual risks

1. Live `/tmp/openclaw` logs still grow between runs → family counts drift; structure should hold.
2. Some low-sev generics remain in appendix (not eliminated; deferred by design).
3. High-severity pin + watch-slot reserve can still compete when many distinct high-sev roots appear; ≤5 cap may push some high-sev into appendix after slots fill (high-sev still preferred over low-count demotion).
4. `--skip-live-probes` used for acceptance write to avoid coupling to live ollama/memory-health; Nova verify may re-run without that flag.

## Non-goals (honored)

No nightly cron, auto-repair, openclaw.json edits, gateway restart, commit/push, Flash spawn inside CLI.
