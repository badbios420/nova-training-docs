# Cursor brief — Pack 9 SoT item #1 ONLY (2026-08-06)

**Model:** cursor-grok-4.5-high  
**Chair:** Nova · Jason: "lets go 1 by 1" → **only finding #1**  
**Mode:** implement this item only · no git commit/push · no other SoT items

## Problem
`memory/procedural-memory-v1.md` **Procedure 3** (Memory/Session Consolidation Closeout) checklist still says:
- Commit with clear message
- Verify push succeeded

That **conflicts** with **Procedure 21** (explicit Jason required for commit/push/lock-in).

Proc 3 has essentially zero external citations (orphaned).

## Fix (only this)
1. Replace Procedure 3 body with a short **SUPERSEDED** stub that:
   - States superseded 2026-08-06 by Proc 15 (lock-in order) + Proc 21 (gate) + Proc 23 (write classes) + `memory/session-consolidation-v1.md` (method)
   - Does **not** instruct commit/push
   - Keeps the `## 3.` heading and title so numbering stays stable
   - Optionally 2–4 lines of what consolidation closeout still means (method file + Jason gate)
2. If any internal cross-ref inside procedural-memory points at Proc 3 for commit/push, retarget to 21/15.
3. Do **not** renumber other procedures.
4. Do **not** touch WORLD_STATE, MEMORY header C1–C8, AGENTS map, swarm menu, ages, etc.

## Accept
```bash
# Proc 3 must not tell agent to commit/push as default checklist
grep -n "^## 3\." -A40 memory/procedural-memory-v1.md | head -50
# Should show SUPERSEDED / Proc 21 / no naked "Commit with clear message" as active checklist
node --check scripts/lib/claim-guard-lib.mjs  # sanity only if you touch nothing else
```

Write result: `memory/cursor-jobs/sot-1-proc3-supersede-2026-08-06-result.md`  
PASS/FAIL + files changed + quote of new Proc 3 stub.

## Hard bans
- No git checkout/restore of runtime state (Proc 1)
- No openclaw.json, wallet, multi-item SoT scope creep
