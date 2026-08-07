# Swarm Pack 5 — STALE MEMORY worker packet

**Date:** 2026-08-06 ~18:50 PDT
**Worker:** deepseek/deepseek-v4-flash (subagent, read-only)
**Scope:** STALE items in LIVE memory (MEMORY.md, WORLD_STATE.md, IDENTITY.md, TOOLS.md, dailies, memory/*.md). Dreaming/** excluded as truth. No edits/deletes made.
**Status:** PASS — 10 candidates found, 0 edits (read-only per scope.json)

## Method
- Cross-checked MEMORY.md / IDENTITY.md / dailies against WORLD_STATE.md (ops truth), claim-ledger, heartbeat-state.json, and filesystem (`ls`/`stat`).
- Dated every volatile figure vs 2026-08-06 (eBay intent 7/21 → **16d** today; Grok 4.6 window 8/7 → **~1d**).
- Verified file mtimes: priority-dashboard.md unchanged since **2026-06-23**; profit-research 6/23; time-awareness 8/6 17:47 (startup-era).

## Findings (ranked by blast)

### 1. memory/priority-dashboard.md — 6/23-era dashboard contradicts WORLD_STATE on ≥6 items
- **What's stale vs truth:** Never updated since 2026-06-23 00:39. Still says: Vista business license "Get tomorrow 6/23" (→ **CLOSED not required** 7/22/7/27); Sam "Active buyer" (→ **closed, renting**); IDX "installing tomorrow" (→ **LIVE** since 7/29); Insurance "$7,500 pending" (→ **~$3.6k paid 7/19**); SOI "Not started" (→ **parked, do not nag**); CV listing "Cancelling next week" (→ **active −$5k/week price path**).
- **Blast:** MEDIUM — index-visible memory file; retrieval can re-open closed items or nag parked ones (SOI, Vista).
- **Action:** needs-Jason (supersede banner → WORLD_STATE, or rewrite; no auto-delete).
- **Conf:** 0.85 (WORLD_STATE + MEMORY + dailies cross-check).

### 2. MEMORY.md:95 (7/31 compressed entry) — "subagents still zai/glm-5.1 until bake-off" + "Next alpha C9"
- **What's stale vs truth:** Superseded 8/1: swarm default flipped to `deepseek/deepseek-v4-flash` (MEMORY.md:30, 8/1 consolidations, WORLD_STATE Architecture table); C9 SWV dry harness shipped 8/1.
- **Blast:** LOW-MED — semantic retrieval can surface "glm-5.1 default" as current.
- **Action:** trim (strike/append "superseded 8/1" note) or leave-historical.
- **Conf:** 0.9.

### 3. WORLD_STATE.md — eBay age "13d" ×6 locations → **16d** as of 8/6 (intent 7/21)
- **What's stale vs truth:** Lines 5, 16, 49, 73, 95, 142 all say 13d (correct on 8/3, stale now). Matches CHI pack 2 chair-ranked item #10 (already on chair list).
- **Blast:** LOW-MED — escalation accuracy; chair already ranked.
- **Action:** pointer (L1 auto refresh per Proc 23 — Nova ops pass, no Jason).
- **Conf:** 1.0 (arithmetic).

### 4. WORLD_STATE.md — Grok 4.6 "~4d" → **~1d** (window = tomorrow 8/7)
- **What's stale vs truth:** "~4d" written 8/3; today 8/6 the 8/7 window is ~1d. Also "Updated: 2026-08-03 14:16" now ~3.1d (still <7d threshold, refresh due anyway with #3).
- **Blast:** LOW — calendar awareness for default-flip smoke.
- **Action:** pointer (L1 refresh, same pass as #3).
- **Conf:** 1.0.

### 5. Dailies copy eBay "13d+" without recompute (8/5 → should be 15d; 8/6 → should be 16d)
- **What's stale vs truth:** memory/2026-08-05.md:12,18 and memory/2026-08-06.md:14 repeat WORLD_STATE's 13d verbatim. Age is a derived number, not a snapshot to copy.
- **Blast:** LOW — dailies are L1 logs; only affects in-session urgency framing.
- **Action:** leave-historical (dailies); future dailies recompute from 7/21 intent date.
- **Conf:** 1.0.

### 6. IDENTITY.md — "Avatar: avatars/nova-galaxy.png (TBD)" → file is **nova-galaxy.svg** (exists 3/18)
- **What's stale vs truth:** `ls avatars/` shows only `nova-galaxy.svg`; `.png` path + "(TBD)" marker are stale leftovers (IDENTITY was touched today 18:00 for the ADA line but this survived).
- **Blast:** LOW — cosmetic pointer; broken path in identity file.
- **Action:** trim (L2 path microfix per Proc 23: fix to `.svg` or drop "(TBD)").
- **Conf:** 0.9 (filesystem-verified).

### 7. memory/time-awareness.md — "lastHeartbeat 8/3 14:36 (~3d overdue)" → actual lastHeartbeat **2026-08-06 18:38**
- **What's stale vs truth:** heartbeat-state.json shows `lastHeartbeat 2026-08-06T18:38:59` (HB ran 18:06/18:38 today); file also carries startup-era "Session Clock ~1–2 min". Written 17:47 today, before today's HB.
- **Blast:** LOW — temporal grounding file itself now misleads the clocks it exists to serve.
- **Action:** pointer (L1 refresh on next ops pass).
- **Conf:** 0.95 (heartbeat-state.json + daily 8/6 HB entry).

### 8. MEMORY.md:36 — "Alpha harness C1–C6 (7/29–7/30) LIVE" → current stage **C1–C8 live**, C9 SWV dry shipped 8/1
- **What's stale vs truth:** WORLD_STATE: "C1–C8 live (C8 wiki ops entity pack 7/31)"; 8/1 late consolidation: "C9 SWV dry harness shipped + C9b coverage PASS". MEMORY's alpha section stops at C6.
- **Blast:** LOW — harness stage readout in durable memory lags reality.
- **Action:** trim/pointer (sync header to C1–C8 + C9 dry; WORLD_STATE is live truth).
- **Conf:** 0.9.

### 9. memory/profit-research-2026-06-23.md — "Current balance | 157.83 ADA" (V1-era)
- **What's stale vs truth:** V1 wallet superseded by **V2** (6/23+); post-8/3 send balance **30.950725 ADA + 7 NFTs** (claim-ledger + WORLD_STATE verified). Doc is a 6/23 research snapshot with a "Current balance" label.
- **Blast:** LOW — could mislead staking/profit arithmetic if re-read as current.
- **Action:** leave-historical (research snapshot); optional pointer to wallet-v2 log.
- **Conf:** 0.95.

### 10. MEMORY.md (8/1 late) — "C9 SWV dry harness shipped" vs WORLD_STATE/daily "next alpha C9 when Jason opens" — label collision
- **What's stale vs truth:** "C9" is used for two different things: (a) the SWV dry harness shipped 8/1, (b) the next alpha item per WORLD_STATE (8/3) and 2026-08-06 daily. Retrieval can't tell which "C9" is meant.
- **Blast:** LOW — harness status ambiguity; not ops-critical.
- **Action:** needs-Jason (pick distinct label for SWV dry, e.g. "C9-SWV-dry", or mark SWV auxiliary) — naming decision, not a fact fix.
- **Conf:** 0.7 (both usages present in live memory).

## Excluded / verified-clean (checked, not stale)
- MEMORY.md:30 subagent default `deepseek/deepseek-v4-flash` — CURRENT (matches 8/1 flip + WORLD_STATE). The "Layer A was zai/glm-5.1" parenthetical is correct history.
- MEMORY.md:25 default brain `xai/grok-4.5`, alias `grok` — accurate (UI label "Grok 4.5" ≠ alias change).
- MEMORY.md wallet/RE facts (Hilltop −$10k cum, FBN closed, NIGHT cash-gated, Chamber #9 HOLD) — match WORLD_STATE.
- ops-fact-cards-v1.md (F04/F08/F09/F11/F12/F14) — all still true vs WORLD_STATE.
- TOOLS.md Cursor pin 2026.07.23-e383d2b — current (re-relinked 8/6 18:31 after self-update break).
- discovery-log / goal-evolution-ledger / human-intent-ledger "157 ADA" entries — accurate historical event records (6/23 receipt), not stale claims.
- heartbeat-state.json — internally consistent (8/6 18:38 lastHeartbeat).
- MEMORY.md:30 "runTimeout 600s / maxConcurrent 3 / delegation suggest" — unchanged in WORLD_STATE.

## Notes for chair
- #3/#4 (WORLD_STATE ages) duplicate CHI pack 2 ranked #10 — chair already knows; batch into one L1 refresh.
- #1 (priority-dashboard) is the only MEDIUM-blast item; whole-file, so Jason-gated per Proc 23 (L3 territory for restructure, or L2 supersede-banner if chair approves a minimal pointer).
- #2/#8 are MEMORY.md durable edits → L2 trim (verify-then-write) or leave-historical per chair call; no auto-edit this run.

## Confidence / scope
- **Overall confidence:** 0.9 (arithmetic + filesystem + WORLD_STATE verified; #10 label collision is interpretation).
- **Scope touched (read-only):** MEMORY.md, WORLD_STATE.md, IDENTITY.md, memory/priority-dashboard.md, memory/time-awareness.md, memory/profit-research-2026-06-23.md, memory/2026-08-05.md, memory/2026-08-06.md, memory/heartbeat-state.json, memory/ops-fact-cards-v1.md, TOOLS.md, avatars/ (ls only), memory/claim-ledger.md, memory/discovery-log.md, memory/goal-evolution-ledger.md, memory/human-intent-ledger.md.
- **Edits made:** none. **Evidence files written:** this packet only.
