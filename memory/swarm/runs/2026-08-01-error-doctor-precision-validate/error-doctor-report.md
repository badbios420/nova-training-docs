Runtime Error Doctor

Current health: HEALTHY WITH 2 WATCH ITEMS

_v0.1.1 · 2026-08-01T22:52:46.934Z · READ-ONLY (no repairs executed)_
Sources ok/fail: 10/0 · Raw clusters: 81 · Families shown: 2

1. Fetch / TTS timeout
   Status: NEW · count=3
   Risk: low — Localized or unclear impact — verify before repair
   Probe: PASS
   Recommendation: Observe / monitor — No change; re-run doctor later if recurrence rises
   Confidence: medium

2. Active-memory child / embedded timeouts
   Status: KNOWN · count=80 · ledger=KNOWN
   Risk: low-medium — Active Memory pre-turn context may miss; core chat continues
   Probe: PASS
   Recommendation: Observe / monitor.
   Confidence: medium
   Children: 62 fingerprints (see JSON rawClusters / children)

Appendix: unclassified / low-confidence / noise
- unclassified/low-confidence: 14
- other deferred: 0
- noise: 3
  - F-secrets-env-missing (NOISE, sev=high, n=5)
  - F-generic (NEW, sev=low, n=2)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - F-generic (NEW, sev=low, n=1)
  - … +5 more

Hard bans honored
- no openclaw doctor --fix / --repair
- no gateway restart
- no config edits
- no log deletion
- no full-log model dumps (bounded tails only)
- no secret exposure (redaction applied)
- no auto-commit or push
- no resolved claim without current passing probe
- no auto-repair (diagnosis only)

Probes:
- ollama_tags: PASS — reachable
- memory_health_quick: PASS — Memory health probe — overall: PASS | Started:  2026-08-01T22:52:40.135Z | Finished: 2026-08-01T22:52:46.926Z |  | [PASS] node_path: Node ≥24.15 available (process v24.18.0; preferred v24.18.0) | [PASS] openclaw_cli: openclaw at /home/mrbig3/.npm-global/bin/openclaw | [PASS] sqlite_store: sqlite ok 

Chair: pick family + option number to approve a repair brief. No auto-fix / no doctor --fix / no gateway restart.
