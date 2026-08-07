# Error Doctor Incident Ledger

Read-only diagnoses update this file only when Nova/Jason explicitly asks to record dispositions.
v0.1 CLI does **not** auto-write repairs; optional `--write-ledger-draft` may append NEW fingerprints as open drafts.

## E-memory-search-timeout
- status: KNOWN
- first_seen: 2026-08-01
- last_seen: 2026-08-01
- occurrences: 3
- fingerprint: memory_search + 15s timeout + 60s cooldown
- root_cause_confidence: high
- mitigation: embed warmup + CLI/file fallback + LIGHT CLI 20s
- permanent_repair: configurable upstream MEMORY_SEARCH_TOOL_TIMEOUT_MS
- owner: Codex/upstream
- regression_test: scripts/test-memory-health.mjs + memory-embed-warmup + startup suites

## E-active-memory-timeout
- status: KNOWN
- first_seen: 2026-07-28
- last_seen: 2026-08-01
- occurrences: many
- fingerprint: active-memory status=timeout
- root_cause_confidence: medium
- mitigation: accept soft-fail; strict prompt; timeoutMs 12000
- permanent_repair: retune only with Jason/Codex (protected config)
- owner: Codex/Jason
- regression_test: active-memory offline smoke (live inject queued)

## E-secrets-env-missing
- status: NOISE
- first_seen: 2026-08-01
- last_seen: 2026-08-01
- occurrences: burst during restart windows
- fingerprint: XAI_API_KEY env missing SecretRefResolutionError
- root_cause_confidence: medium
- mitigation: gateway currently up via auth profile; treat restart-window noise unless probe shows down
- permanent_repair: align SecretRef source with actual auth storage (Codex)
- owner: Codex/Jason
- regression_test: openclaw gateway status --deep

## E-memory-db-not-open
- status: KNOWN
- first_seen: 2026-07-29
- last_seen: intermittent
- occurrences: intermittent
- fingerprint: database is not open
- root_cause_confidence: medium
- mitigation: Procedure 16 probe + CLI trust over empty tool
- permanent_repair: manager lifecycle / tool path harden (upstream if needed)
- owner: Nova/Codex
- regression_test: scripts/memory-health-probe.mjs
