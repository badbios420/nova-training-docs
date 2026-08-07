# Cursor brief — Pack 9 SoT item #2 ONLY (2026-08-06)

**Model:** cursor-grok-4.5-high  
**Jason:** 1-by-1 → **#2 only**  
**No git commit/push. No other SoT items.**

## Problem
`WORLD_STATE.md` Nova Architecture table has a conflict:
- One row: **Structural Thinker | Claude Opus 4.8**
- Nearby / chamber seat map (MEMORY 8/1, verified): **Structural = GLM-5.2** · Skeptic gpt-5.6-sol · Alternative Flash · Chair Grok 4.5
- WORLD_STATE may also list GLM-5.2 as "Compare / chamber structural"

## Fix
1. Read the Nova Architecture section in `WORLD_STATE.md` fully before editing.
2. Make the table consistent with chamber seat map v1:
   - **Structural (chamber) = GLM-5.2**
   - Do **not** claim Opus 4.8 is the current structural seat
3. Prefer: remove or relabel the Opus row (e.g. "Consultant / on-demand" or drop if redundant with existing Claude/Opus fallback rows). Keep useful model inventory without lying about chamber seats.
4. Touch **only** WORLD_STATE.md architecture/model rows needed for this fix. Do not refresh eBay ages, Grok 4.6 window, wallet, or MEMORY.md (those are other SoT numbers).
5. If you bump "Updated:" stamp, use a minimal note like architecture row only — or leave stamp if other ops rows stay stale (chair prefers honest stamp: note "architecture seat row only" in result).

## Accept
```bash
grep -n "Structural\|Opus\|GLM-5.2\|chamber" WORLD_STATE.md | head -40
# Must not present Opus 4.8 as current Structural seat
# Must present GLM-5.2 as chamber structural (or equivalent clear wording)
```

Result file: `memory/cursor-jobs/sot-2-ws-structural-2026-08-06-result.md`

## Hard bans
- No git checkout of runtime state
- No openclaw.json
- No SoT #3+ scope creep
