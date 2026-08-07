# Cursor brief — Error Doctor precision pass (2026-08-01)

**Mode:** `write` (implement)  
**Model pin:** `cursor-grok-4.5-high`  
**Owner:** Nova chair · Cursor implement · Nova verify  
**Do not:** openclaw.json, gateway, secrets, git commit/push, auto-repair, nightly cron

## Goal

Precision-only upgrade to Runtime Error Doctor v0.1 so default output is **≤5 actionable families**, not 100+ fingerprints.

## Required changes

### 1. Exclude diagnostic corpus from evidence ingest

Do **not** ingest paths matching (extend as needed):

- `memory/swarm/runs/**`
- `memory/error-doctor-ledger.md`
- `**/error-doctor-report*.md`
- `**/chair-adjudication*.md`
- `**/worker-packet.json`
- prior doctor reports under `memory/cursor-jobs/*error-doctor*`
- `memory/cursor-jobs/nova-error-log-audit-*` (optional keep as secondary — prefer exclude if it pollutes)
- test fixtures unless `NODE_ENV=test` / explicit `--include-fixtures`

`discoverEvidenceSources` / `collectEvidence` must filter these.

### 2. Consolidate incident families

After clustering, run a **family merge** pass using:

- shared `runId` / `sessionId` extracted from samples
- tight timestamp chains when available
- known cascade tags: active-memory timeout, embedded run timeout, request aborted, abort-settle timeout
- normalized message similarity within cascade set

Minimum merge rule from validation:

```
F-active-memory-timeout family includes when same run or cascade:
  - active-memory recall/plugin timeout
  - embedded run timeout (active-memory runIds)
  - embedded abort settle timeout
  - openai-transport "Request was aborted"
  - embedded_run_failover_decision timeout for active-memory
```

Keep raw child fingerprints in `children[]` / appendix; parent is user-facing.

Unrelated timeouts (e.g. fetch TTS timeout vs AM) must **stay separate**.

### 3. Fingerprint normalization

Improve `normalizeErrorLine` / fingerprinting:

- punctuation (trailing `.`)
- numeric durations → `<N>`
- UUIDs, runIds, sessionIds, paths (optional path basename only)
- hashes
- do **not** merge genuinely different roots (billing 402 vs AM timeout)

### 4. User-facing output (default markdown)

```text
Runtime Error Doctor

Current health: <HEALTHY | HEALTHY WITH N WATCH ITEMS | DEGRADED | UNHEALTHY>

1..5 families:
  title
  Status: ...
  Risk: ...
  Probe: PASS|FAIL|n/a
  Recommendation: ...
  Confidence: ...

Appendix: unclassified / low-confidence / noise (counts + short list)
```

JSON mode should expose `families` (top) + `appendix` + `rawClusters` optional.

Never hide **high-severity** solely due to low count — pin to top section.

### 5. Tests (must pass)

Add fixtures in `scripts/test-error-doctor.mjs` (or split test file):

1. report corpus excluded from discovery
2. same-run lifecycle stages merge into one family
3. unrelated timeouts remain separate
4. punctuation variants merge (`aborted` vs `aborted.`)
5. high-severity low-count remains visible in top families
6. no raw secrets in formatted output (sample with Bearer/sk-)
7. doctor run does not call repair / doctor --fix / write config (assert hard bans + no side-effect flags)

Keep existing 10 tests green or migrate carefully.

### 6. Docs touch (minimal)

- `docs/harness/swarm-protocol-v0.md` error-doctor blurb: default top-5 + corpus exclude
- pack JSON note if needed
- Do **not** rewrite Procedure 22 wholesale

## Acceptance

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node --check scripts/lib/error-doctor-lib.mjs
node --check scripts/error-doctor.mjs
node scripts/test-error-doctor.mjs   # all pass
node scripts/error-doctor.mjs --out memory/swarm/runs/2026-08-01-error-doctor-precision/error-doctor-report.md
```

Report: `memory/cursor-jobs/error-doctor-precision-fix-2026-08-01.md`  
claim-guard clean language. Completion gate: tests + diff readback.

## Non-goals

Nightly automation, auto-repair, config edits, gateway restart, commit/push, Flash spawn inside CLI.
