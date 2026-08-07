# Coverage gaps 1+2 — Chair accept (2026-08-06 ~19:34 PDT)

**Implementer:** Cursor `cursor-grok-4.5-high`  
**Chair:** Nova independent verify  
**Scope:** gaps 1+2 only · stop after report

## Tests added
| File | Cases | Chair run |
|------|------:|-----------|
| `scripts/test-superseded-stubs.mjs` | 6 | **6/6 PASS** exit 0 |
| `scripts/test-model-claims-vs-config.mjs` | 8 | **8/8 PASS** exit 0 |

## Authoritative sources used (gap 2)
- `~/.openclaw/openclaw.json` → primary `xai/grok-4.5`, subagents `deepseek/deepseek-v4-flash`
- `scripts/cursor-worker.sh` → default `cursor-grok-4.5-high`
- Chamber seats from CURRENT docs when asserted (Structural GLM-5.2, Skeptic gpt-5.6-sol)

## CURRENT surfaces checked
WORLD_STATE Nova Architecture · MEMORY architecture bullets (not full chronology) · TOOLS Cursor table · swarm-protocol-v0 header · IDENTITY Model line

## Historical exclusions
Dailies, research, chambers, dated MEMORY chronology / “true as of” / “superseded” / “was” / “flipped” lines — do not fail suite

## Stale claims found by tests
**None** on current tree (all PASS). Mem-health/SoT fixes already aligned.

## Minimal regression (chair)
| Suite | Result |
|-------|--------|
| test-superseded-stubs | **PASS** 6/6 |
| test-model-claims-vs-config | **PASS** 8/8 |
| test-claim-guard | **PASS** 21/21 |
| test-session-startup | **PASS** 17/17 |
| test-cursor-worker | **structural PASS**; live smoke **exit 2** (agent not on PATH in test env — known; not a gaps 1–2 fail) |

## Overall: **PASS** (gaps 1+2)

## Not done
gap 3 · commit/push · config · gateway
