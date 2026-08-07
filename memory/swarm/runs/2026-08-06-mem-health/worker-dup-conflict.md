# Worker Packet — DUPLICATE / CONFLICT Memory (Swarm Pack 5 · mem-health)

- **Worker:** deepseek/deepseek-v4-flash (subagent, read-only)
- **Run:** 2026-08-06 · `memory/swarm/runs/2026-08-06-mem-health/`
- **Mode:** READ-ONLY. No edits. Recommendations only. (scope.json hard_bans honored)
- **Scope:** MEMORY.md · WORLD_STATE.md · memory/procedural-memory-v1.md · memory/ops-fact-cards-v1.md · memory/wiki-ops-pack/** (entities + syntheses) · recent dailies (8/1, 8/3, 8/5, 8/6) · HEARTBEAT.md · IDENTITY.md · TOOLS.md · prior pack packets (authority/doc-audit/chi). Excluded per scope: dreaming/**, training-docs, DREAMS.md, skills, git history.
- **Focus:** conflicts that could change agent behavior (not harmless porch-id / fact-card mirrors).

## Findings (10, ranked)

### F1 — MEMORY.md internal contradiction: "subagents still zai/glm-5.1" vs flipped deepseek default ⚠️ HIGH (behavior)
- **A:** `MEMORY.md:95` (promoted 7/31 block): "subagents still `zai/glm-5.1` until bake-off"
- **B (winner):** `MEMORY.md:29-30` "Subagent defaults: `deepseek/deepseek-v4-flash` (Layer A was `zai/glm-5.1`; flipped 8/1)"; `MEMORY.md:122` (8/1 KEY UPGRADES: `agents.defaults.subagents.model` = deepseek-v4-flash); `memory/procedural-memory-v1.md:293` (Proc 8: currently deepseek-v4-flash); WORLD_STATE.md Nova Architecture table.
- **Also:** historical `memory/2026-08-01.md:35` "Default subagent model still zai/glm-5.1 (no config change needed)" — pre-flip same-day, superseded by 8/1 00:48 Codex repair closeout (`memory/cursor-jobs/codex-repair-report-2026-08-01-model-swarm.md`, live spawn transcripts).
- **Behavior impact:** an agent landing on the promoted block could misreport/act on a stale subagent default (cost/routing decisions).
- **Winner per Proc 23 / SoT:** deepseek/deepseek-v4-flash — config truth (openclaw.json, Codex-owned) + live smokes 8/1.
- **Action:** L2 curation (verify-then-write, no Jason needed): annotate the stale subclaim inside the promoted block with "(superseded 8/1 — subagent default flipped to deepseek/deepseek-v4-flash)" or trim just that subclaim; keep the block as promotion record. Dailies: leave-historical.
- **Confidence:** high.

### F2 — MEMORY.md:36 header "Alpha harness C1–C6" vs body + WORLD_STATE "C1–C8" (MED)
- **A:** `MEMORY.md:36` — "Alpha harness **C1–C6** (7/29–7/30) LIVE:"
- **B (winner):** `MEMORY.md:96` (C7 meter done 7/30), `MEMORY.md:95` (C8 wiki ops entity pack PASS 7/31), `WORLD_STATE.md:51,121` — "C1–C8 live; next C9".
- **Action:** L2 microfix — header → "Alpha harness C1–C8 (7/29–7/31) LIVE". (Pack 9 F4 — still open; SoT-A #5 not yet applied.)
- **Confidence:** high.

### F3 — WORLD_STATE eBay age "13d" stale; dailies copy the number ⚠️ MED (behavior — understates escalation)
- **A:** `WORLD_STATE.md:16,49,73,95,134,142` — all "13d" (anchored 8/3); dailies copy: `memory/2026-08-05.md:12,18` ("13d"), `memory/2026-08-06.md:14` ("13d+").
- **B (winner):** true age from intent date 7/21 = **16d on 8/6** (17d on 8/7).
- **Behavior impact:** the #1 cash fire reads as less urgent than it is; escalation softness.
- **Action:** L1 (auto, Proc 23): WORLD_STATE refresh — **date-anchor "since 7/21"** instead of day-count; dailies should point to WORLD_STATE, not carry the number. Already queued by pack 9 chair ("L1 ages only") — this confirms it.
- **Confidence:** high (drift).

### F4 — WORLD_STATE Grok 4.6 "~4d" stale (MED)
- **A:** `WORLD_STATE.md:21` — "~4d" (computed 8/3).
- **B (winner):** event = **2026-08-07** (tomorrow; Google cal `jc9jn2h759aodts3mrkpaici78`; dailies 8/5:15, 8/6:16 agree on 8/7).
- **Action:** same L1 refresh — date-anchor "window 8/7; smoke before default flip; keep grok-4.5 until then".
- **Confidence:** high.

### F5 — WORLD_STATE self-staleness (volatility drift, LOW-MED)
- `WORLD_STATE.md` "Updated: 2026-08-03 14:16" — 3.1d old at 8/6 heartbeat; ≤7d freshness rule not yet violated, but the file's own day-counts (F3/F4) already drifted. Heartbeat 8/6 deferred refresh to "next main ops pass" (by design, not mid-workflow).
- **Action:** L1 refresh when the main ops pass opens; no file conflict — this is single-owner volatility drift.
- **Confidence:** high.

### F6 — wiki-ops-pack undercount: "C1–C7" vs "C1–C8" (LOW)
- **A:** `memory/wiki-ops-pack/entities/harness-meters.md` (frontmatter claim `claim.harness.alpha-c1-c7` + summary "Alpha tools C1–C7 live") and `memory/wiki-ops-pack/syntheses/ops-now.md` ("alpha C1–C7").
- **B (winner):** `WORLD_STATE.md:51,121` "C1–C8 live"; `MEMORY.md:95` "C8 PASS 7/31". The pack itself is the C8 deliverable (created 7/31 22:45) yet lists C1–C7.
- **Action:** L2 microfix — entity + synthesis → "C1–C8 live; next C9".
- **Confidence:** high.

### F7 — Dual SoT maps: AGENTS.md source-of-truth rank vs Proc 23 canonical ownership (LOW, informational)
- AGENTS.md "Source-of-Truth Map" (conflict rank: observation > WORLD_STATE > AGENTS > Proc > MEMORY > dailies) and Proc 23 "Canonical ownership" (volatile → WORLD_STATE; how-to-act → procedural; startup → AGENTS) are **complementary, not conflicting** — one is precedence on conflict, the other is write-class owner.
- **Action:** pending pack-9 #8 one-liner ("SoT = conflict rank; 23 = write class") when SoT-A resumes. No behavior conflict today.
- **Confidence:** med (interpretive).

### F8 — Hilltop base price $550k only in 6/23 profiles (LOW, leave-historical)
- `memory/jason-full-profile.md:47` + `memory/jason-business-context.md:23-25` carry "$550k, 4-bed condo" (6/23). WORLD_STATE: "exact MLS $ TBD" — no live base price anywhere current.
- **Action:** leave-historical (context files, not live ops); needs Jason/MLS confirmation before any promotion. Do not invent. (Pack 9 F5.)
- **Confidence:** med.

### F9 — Already resolved 8/6 — do not re-queue (INFO)
- **Proc 3 vs Proc 21:** stub in place (`memory/procedural-memory-v1.md:140` "SUPERSEDED 2026-08-06"); grep for "Proc 3"/"Procedure 3" in AGENTS/HEARTBEAT/MEMORY/TOOLS/IDENTITY/procedural = **0 dangling refs**.
- **WORLD_STATE structural seat:** duplicate row removed — line 108 "Structural Thinker (chamber) | GLM-5.2", line 109 "Consultant / on-demand | Claude Opus 4.8". Verified by readback (SoT #2 landed 18:45).
- **Action:** none — closed.

### F10 — Consistent by design — leave (INFO)
- **FBN/Vista closed cards:** WORLD_STATE + MEMORY + ops-fact-cards (F09) + wiki entities all agree (CLOSED / NOT REQUIRED). Retrieval-aid mirrors are intentional (eval F09/F11).
- **Porch doc ID:** `19xm8g0r0iNpvihAh_JnX8shUzfBLyIUZUpBqyTkESZI` — 6 copies, stable non-volatile identifier; harmless.
- **Wallet:** 30.950725 ADA + 7 NFTs agrees across WORLD_STATE + dailies 8/3–8/6 + self-improvement-log; IDENTITY clean of hardcoded balances (157-ADA line gone, verified).
- **Retrieval meters:** filt hit@1 0.80 / hit@3 0.87 consistent; 0.60 rows correctly labeled historical.
- **Model defaults:** brain `xai/grok-4.5` · swarm `deepseek/deepseek-v4-flash` · cursor pin `cursor-grok-4.5-high` · chamber GLM-5.2 / GPT-5.6-sol — agree across WORLD_STATE/MEMORY/TOOLS/`scripts/cursor-worker.sh`.
- **OpenClaw 2026.7.1-2** consistent (8/3, 8/5, 8/6). TOOLS.md `2026.07.23-e383d2b` is Cursor-agent version, correctly labeled.
- **Action:** leave — dedupe would break eval-set cards / retrieval anchors.
- **Confidence:** high.

## Status / Evidence / Confidence

- **Status:** ✅ complete — read-only; 10 findings (4 action-needed, 3 drift/refresh, 1 informational, 1 leave, 1 resolved); 0 edits.
- **Evidence:** direct reads of the 9 files in scope + greps (glm-5.1 refs, C1–Cx refs, Proc-3 refs, stale ADA) + cross-check vs pack-9 dup-facts packet (aligned; added F1 promotion-block contradiction and F6 wiki-entity undercount not covered there) + readback confirming SoT #1/#2 landed.
- **Confidence:** F1–F6, F9, F10 high; F7, F8 med.

## Top recommendations for chair (no auto-edits)

1. **L2 microfixes (Cursor or Nova verify-then-write):** F1 annotate/trim stale "glm-5.1 until bake-off" subclaim in MEMORY.md:95 promoted block; F2 MEMORY.md:36 header → C1–C8; F6 wiki entity + synthesis → C1–C8.
2. **L1 refresh (Nova auto, when main ops pass opens):** F3 eBay date-anchor (7/21, 16d on 8/6) + F4 Grok 8/7 anchor + F5 Updated stamp — one WORLD_STATE touch (pack-9 "L1 ages only" path).
3. **Dailies rule:** dailies should say "see WORLD_STATE" for ages/balances, not copy numbers (F3, F10).
4. **Jason ask (when convenient):** F8 confirm Hilltop base price vs live MLS before any promotion.
5. **F7:** fold into pending SoT-A #8 one-liner when that batch resumes.
