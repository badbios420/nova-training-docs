# Pack 4 implement decision — 2026-08-06 ~18:00 PDT

**Trigger:** Jason + GPT review → “your call I trust you”  
**Chair:** Nova · xai/grok-4.5  
**Mode:** Bounded authority design + safe microfixes (no pack runner, no skill-diet, no git lock-in)

## Decisions

| Item | Decision | Rationale |
|------|----------|-----------|
| MEMORY gate | **Resolved via Proc 23 L2/L3 split** | Not a pure text tweak — GPT 3-level model fits; L2 curation vs L3 new promotion |
| “Just do it” | **Replaced with delegated autonomy** | GPT wording adapted; points at Proc 21+23 |
| Porch dual gate | **Proc 15 authorized on lock-in/session-close**; mid-session needs ask | Avoids permission spam; keeps Proc 21 |
| Proc 19 cite | **Fixed** | Cite was wrong; launch UX stays swarm doc §2 |
| Dead TOOLS path | **Fixed** | Point to upstream docs + workspace helper |
| IDENTITY ADA | **Fixed** | Volatile → WORLD_STATE only |
| Proc 12 path | **Fixed** | Canonical docs/harness eval set |
| Proc 13/14 order | **Fixed** | Numeric order in file |
| verifier skill | **Fixed** | Proc 6 → 5 |
| Swarm status header | **Live v0** | Matches operational reality |
| Pack 9 authority-audit | **Queued on menu** | Manual until pack JSON; no auto-edit |
| swarm-pack-run / chi JSON | **HOLD** | Manual workflow not boring yet |
| Skill sprawl / gmail twins | **HOLD** | Later |

## Files touched

- `AGENTS.md` — delegated autonomy, MEMORY L2/L3, SoT conflict rules, proactive work
- `HEARTBEAT.md` — Memory Maint Level-2 only
- `IDENTITY.md` — no hardcoded ADA (**identity edit — Jason notified**)
- `TOOLS.md` — dead browser doc pointer
- `MEMORY.md` — standing rule Proc 23 one-liner
- `memory/procedural-memory-v1.md` — Proc 12 path, 13/14 order, 15/21 porch, **Proc 23 new**
- `docs/harness/swarm-protocol-v0.md` — status, Proc 19 cite, menu 9
- `skills/verifier-pass-v1/SKILL.md` — Proc 5

## Not done (by design)

- git commit/push (needs Jason)
- porch write (no lock-in ordered)
- Full single-source audit (pack 9 later)
- Complexity score / freshness metadata schema

## Verify commands (chair)

```text
grep -n "Delegated autonomy\|Procedure 23\|157 ADA" AGENTS.md IDENTITY.md
grep -n "^## 1[2-5]\.\|^## 23\." memory/procedural-memory-v1.md
test ! -e docs/tools/browser-wsl2-windows-remote-cdp-troubleshooting.md
```
