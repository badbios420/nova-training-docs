# Worker Packet — DUPLICATE FACTS (Swarm Pack 9 · authority-audit)

- **Worker:** deepseek/deepseek-v4-flash (subagent, read-only)
- **Run:** 2026-08-06 · `memory/swarm/runs/2026-08-06-authority/`
- **Mode:** READ-ONLY. No edits. Recommendations only.
- **Scope:** Live root docs only (excluded: `memory/dreaming/**`, `nova-training-docs/`, `quorra-training-docs/`, `DREAMS.md`, skills/, git history).
- **Method:** Grep-sampled 9 fact classes across AGENTS.md · WORLD_STATE.md · MEMORY.md · TOOLS.md · IDENTITY.md · HEARTBEAT.md · NOVEL.md · memory/procedural-memory-v1.md · memory/ops-fact-cards-v1.md · docs/harness/swarm-protocol-v0.md · recent dailies (8/5, 8/6) + targeted `memory/*.md`.

## Findings (12, ranked by impact)

### F1 — Structural model role: Opus 4.8 vs GLM-5.2  ⚠️ REAL CONFLICT
- **Locations:**
  - `WORLD_STATE.md:108` — "Structural Thinker | **Claude Opus 4.8** | Decomposition"
  - `WORLD_STATE.md:109` — "Compare / **chamber structural** | **GLM-5.2**"
  - `MEMORY.md:94` + `MEMORY.md:122` — Chamber seat map v1 (8/1): **Structural = GLM-5.2** · Skeptic gpt-5.6-sol · Alternative Flash · Chair Grok 4.5
  - `memory/MEMORY-archive-pre-2026-07-29-inject-trim.md:412` — pre-trim table: "Structural | Claude Opus 4.8" ← likely source of the WORLD_STATE row
- **Values differ:** Opus 4.8 (WORLD_STATE:108, stale) vs GLM-5.2 (MEMORY 8/1 seat map + WORLD_STATE:109).
- **Canonical owner:** MEMORY.md chamber seat map v1 (verified 8/1 decision) — or WORLD_STATE Nova Architecture table with the Opus row corrected.
- **Action:** **point-to-canonical** — WORLD_STATE:108 row should be removed or relabeled (e.g., "Consultant (historical)"); the Opus-4.8-as-structural fact is superseded. Model-role table is architecture-adjacent → **needs-Jason** before editing.
- **Confidence:** high.

### F2 — eBay lag day count: "13d" copied forward past its anchor date
- **Locations:** `WORLD_STATE.md:16,49,73,95,134,142` (all "13d" @ 8/3) · `memory/2026-08-05.md:12,18` ("13d") · `memory/2026-08-06.md:14` ("13d+")
- **Values differ:** Anchored 13d on 8/3; by 8/6 it is 16d (7/21 intent). Dailies copy the 8/3 anchor instead of recomputing.
- **Canonical owner:** WORLD_STATE.md (Current Fires / eBay row) — but it is itself stale (last refresh 8/3).
- **Action:** **point-to-canonical** + refresh: single source (WORLD_STATE) computed from intent date 7/21; dailies should say "see WORLD_STATE", not carry the number. Needs a WORLD_STATE touch (L1 auto — allowed).
- **Confidence:** high (drift), med (blame).

### F3 — Nova wallet balance (30.950725 ADA + 7 NFTs)
- **Locations:** `WORLD_STATE.md:61-64` (canonical, 8/3 14:14 Koios) · `memory/2026-08-06.md:11` · `memory/2026-08-05.md:12` · `memory/self-improvement-log.md:128`
- **Values differ:** No — all copies agree (post 8/3 80% send, TX `881198e0…`).
- **Canonical owner:** WORLD_STATE.md wallet snapshot. IDENTITY.md already fixed (line 55: rule "live balances only in WORLD_STATE.md — never hardcode" — prior doc-audit's 157-ADA stale balance is GONE; verified clean).
- **Action:** **leave-historical** for dailies/logs; **point-to-canonical** rule already in IDENTITY. No edit needed.
- **Confidence:** high.

### F4 — Alpha harness stage: "C1–C6" vs "C1–C8"
- **Locations:** `MEMORY.md:36` — "Alpha harness **C1–C6** (7/29–7/30) LIVE" (stale header) vs `WORLD_STATE.md:51,121` — "**C1–C8 live**; next C9" and MEMORY body `:95-96` (C7 done 7/30, C8 PASS 7/31).
- **Values differ:** MEMORY header undercounts vs its own body + WORLD_STATE.
- **Canonical owner:** WORLD_STATE.md (Current Projects / harness status) for live stage.
- **Action:** **point-to-canonical** — MEMORY.md:36 header should read C1–C8 or defer to WORLD_STATE (Level-2 curation, verify-then-write OK per Proc 23).
- **Confidence:** high.

### F5 — Hilltop address + price path (incl. $550k)
- **Locations:** `WORLD_STATE.md:15,31,33,129` (address + −$5k/wk, −$10k cum, "exact MLS $ TBD") · `MEMORY.md:51` (pointer) · `memory/ops-fact-cards-v1.md:9` (F04 card) · `memory/wiki-ops-pack/entities/hilltop-listing.md:20,53,66` · `memory/jason-full-profile.md:47` ("**$550k**, 4-bed condo", 6/23) · `memory/jason-business-context.md:23-25` ("4-bed condo, $550k", 6/23)
- **Values differ:** Address/path consistent everywhere; **base price $550k appears only in the two 6/23 profile files** — WORLD_STATE carries no base price ("exact MLS $ TBD"), so $550k is unverified against the live listing.
- **Canonical owner:** WORLD_STATE.md (fires + listings tables) for path; base price needs Jason/MLS confirmation.
- **Action:** **leave-historical** for 6/23 profiles (they're context files, not live ops) + **needs-Jason** to confirm whether $550k is still the current base before any promotion.
- **Confidence:** med.

### F6 — Model defaults (brain / swarm / cursor pin / chamber seats) — consistent, high fan-out
- **Locations (7):** `WORLD_STATE.md:106-116` (Nova Architecture table) · `MEMORY.md:29-30,94,122` · `TOOLS.md:57` (cursor pin `cursor-grok-4.5-high`) · `IDENTITY.md:8` · `NOVEL.md:83` (narrative mirror) · `docs/harness/swarm-protocol-v0.md:7,19` · `scripts/cursor-worker.sh:35` (source of truth for the pin, verified by prior CHI run)
- **Values differ:** None — brain `xai/grok-4.5`, swarm `deepseek/deepseek-v4-flash`, pin `cursor-grok-4.5-high`, chamber Structural GLM-5.2 / Skeptic gpt-5.6-sol all agree. (GLM-5.1 refs in WORLD_STATE:76,110 are explained as documented fallback/alt rows — not conflicts.)
- **Canonical owner:** WORLD_STATE.md Nova Architecture table for role→model; `scripts/cursor-worker.sh` for the cursor pin; MEMORY.md for distilled history.
- **Action:** **leave** (consistent). Optionally NOVEL.md could point-to-canonical, but it's narrative — leave.
- **Confidence:** high.

### F7 — OpenClaw version 2026.7.1-2
- **Locations:** `WORLD_STATE.md:125` ("up to date, verified 8/3") · `MEMORY.md:106` (promotion block) · `memory/2026-08-05.md:10` · `memory/2026-08-06.md:5,49`
- **Values differ:** None. NB: `TOOLS.md:51` "2026.07.23-e383d2b" is the **Cursor agent** version, not OpenClaw — correctly labeled under the Cursor sidecar table; not a conflict but easy to confuse.
- **Canonical owner:** WORLD_STATE.md (or dailies when freshly verified).
- **Action:** **leave-historical** (dailies) / **point-to-canonical**. Low priority.
- **Confidence:** high.

### F8 — Retrieval meter filt hit@3 = 0.87
- **Locations:** `WORLD_STATE.md:51,122` (0.80/0.87) · `MEMORY.md:33,39,96` (same) · `memory/harness-scorecard.md:28-29` (0.60 = historical baseline, correctly labeled)
- **Values differ:** None (0.60 rows are labeled baseline/historical).
- **Canonical owner:** `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md` + `docs/harness/retrieval-eval-set-v1.md` (primary evidence).
- **Action:** **leave** — MEMORY already cites the report; WORLD_STATE summary row fine. Low priority.
- **Confidence:** high.

### F9 — xAI API-key fallback (blocked on Jason)
- **Locations:** `WORLD_STATE.md:23,91` · `memory/2026-08-03.md:34,69` · `memory/2026-08-05.md:22` · `memory/2026-08-06.md:18`
- **Values differ:** None — all "blocked, Jason `openclaw models auth paste-api-key --provider xai --profile-id xai:api-fallback`".
- **Canonical owner:** WORLD_STATE.md (Waiting On).
- **Action:** **leave-historical** for dailies; **point-to-canonical**. Low priority.
- **Confidence:** high.

### F10 — FBN (closed) + Vista license (not required) — by-design duplicates
- **Locations:** WORLD_STATE.md:11,36,128-131 · MEMORY.md:49-50 · `memory/ops-fact-cards-v1.md:18-21` (F09 card) · dailies 8/5:12, 8/6:20
- **Values differ:** None — all CLOSED/not-required, consistent.
- **Canonical owner:** WORLD_STATE.md (status) + MEMORY.md (durable). ops-fact-cards = retrieval-aid mirror by design (eval set F09/F11).
- **Action:** **leave** — duplicates are intentional (retrieval cards, distilled vs live layers). Do NOT delete cards.
- **Confidence:** high.

### F11 — Sister porch doc ID (`19xm8g0r0iNpvihAh_JnX8shUzfBLyIUZUpBqyTkESZI`)
- **Locations:** `TOOLS.md:117-118` · `MEMORY.md:69` · `memory/procedural-memory-v1.md:476` · `memory/wiki-ops-pack/entities/sister-porch.md:20,51` · `memory/cursor-jobs/c8-wiki-ops-entity-pack-2026-07-31.md:121`
- **Values differ:** None — stable identifier, 6 copies.
- **Canonical owner:** TOOLS.md (tooling) or MEMORY.md (durable) — both fine.
- **Action:** **leave** — stable non-volatile identifier; duplication harmless. Low priority.
- **Confidence:** high.

### F12 — Procedure numbers & pack menu counts — CLEAN (no dup found)
- **Locations:** `memory/procedural-memory-v1.md` has exactly **23 procedures** (## 1..## 23). References checked: AGENTS.md (Proc 14, 21, 23) · MEMORY.md (Proc 15, 16, 19, 20, 21, 23) · HEARTBEAT.md (Proc 21/23) · MEMORY.md:11 (Proc 5 = Proactive Disconfirmation). All resolve to existing procedure numbers.
- **Pack menu:** single full copy in `docs/harness/swarm-protocol-v0.md` (9 items, menu 9 queued per note); dailies reference menu numbers only — no competing copies.
- **Action:** **leave** — no duplicates to reconcile.
- **Confidence:** high.

## Status / Evidence / Confidence

- **Status:** ✅ complete (read-only, all 9 fact classes sampled, 12 findings, 0 edits).
- **Evidence:** greps + targeted reads of the 13 live docs listed in scope; prior-run cross-checks (`memory/swarm/runs/2026-08-06-doc-audit/report.md`, `memory/swarm/runs/2026-08-06-chi/worker-stale.md`) confirm IDENTITY balance fix landed and cursor pin integrity.
- **Confidence:** F1, F2, F3, F4, F6-F12 high; F5 med (price unverified vs live listing).
- **Scope touched:** none (read-only). Only files read: root docs + targeted memory/docs files listed above.

## Top recommendations for chair (no auto-edits)

1. **F1 (real conflict):** reconcile WORLD_STATE:108 Opus 4.8 "Structural Thinker" row with the 8/1 chamber seat map (Structural = GLM-5.2). Remove/relabel the Opus row; keep GLM-5.2 as chamber-structural. Tell Jason (architecture-adjacent).
2. **F2:** touch WORLD_STATE eBay rows to recompute day count from 7/21 (16d on 8/6) — L1 auto allowed; dailies should point, not carry.
3. **F4:** MEMORY.md:36 header "C1–C6" → "C1–C8" (Level-2 curation, verify-then-write OK).
4. **F5:** ask Jason if $550k (6/23 profiles) is still the current base price; if yes, optionally mirror as "base ~$550k, exact MLS $ TBD" in WORLD_STATE.
