# Worker Packet — DOC-SYNC audit (2026-08-06)

**Pack:** doc-sync+file-audit (menu 4) · **Mode:** read-only
**Worker:** deepseek/deepseek-v4-flash · **Date:** 2026-08-06 ~17:50 PDT
**Scope:** AGENTS.md · TOOLS.md · HEARTBEAT.md · WORLD_STATE.md · MEMORY.md · memory/procedural-memory-v1.md · docs/harness/swarm-protocol-v0.md · SOUL.md · IDENTITY.md · heartbeat-state.json · config spot-check (read-only grep)
**Hard bans honored:** no edits/deletes/git writes/MEMORY promotion/config change. Only write: this packet.

---

## Findings (ranked by blast radius)

### F1 — HIGH · MEMORY.md promotion gate: AGENTS/HEARTBEAT authorize what Procedure 21 gates
- **A:** AGENTS.md §Heartbeats: "**Proactive work you can do without asking:** … **Review and update MEMORY.md**" + §🧠: "You can **read, edit, and update** MEMORY.md freely in main sessions" + HEARTBEAT.md item 2: "Memory Maint: memory_search 'todos decisions' → Update MEMORY.md if insights."
- **B:** memory/procedural-memory-v1.md Proc 21: "REQUIRES EXPLICIT JASON REQUEST … **MEMORY.md durable promotion**" — and HEARTBEAT.md itself cites "See Procedure 21 (Workflow Completion Authority)".
- **Why it matters:** Auto-promotion to durable memory without Jason gate is the exact failure Proc 21 was created to stop (2026-08-01 memory_search-fix expansion, commit fee4a2d). HEARTBEAT's own item 2 contradicts the procedure it references. Startup ritual + heartbeat both load these files; a fresh agent gets opposing instructions on the same turn.
- **Resolution class:** needs-Jason (split "curation/cleanup of existing content" vs "new durable promotion"; re-scope HEARTBEAT item 2 and AGENTS heartbeat paragraph to reference Proc 21).

### F2 — HIGH · Approval-gate ambiguity: "Don't ask permission. Just do it." vs Trust Decay
- **A:** AGENTS.md §Pre-Task Ritual: "**Don't ask permission. Just do it.**" (immediately after "This ritual preserves the Jason approval gate").
- **B:** AGENTS.md §Safety: "**When in doubt, ask.**" + HEARTBEAT.md Trust Decay: "If >24h since last verification or decision feels high-risk → **Pause and confirm with Jason**" + SOUL.md: "When in doubt, ask before acting externally."
- **Why it matters:** AGENTS.md is "the single startup authority"; a literal read of the absolute sentence licenses skipping every approval gate — the exact failure mode Proc 21 / Trust Decay / swarm hard-bans exist to prevent. Worker-mode misreads here are costly (spend/wallet/external sends).
- **Resolution class:** update-A (scope the sentence: "don't ask permission for *internal* actions; external/risky actions keep the Jason gate" — or cross-ref Trust Decay).

### F3 — MED-HIGH · swarm-protocol §6 cites "Procedure 19 — Launch swarm protocol checklist"; actual Proc 19 is the Cursor gate
- **A:** docs/harness/swarm-protocol-v0.md §6 C10 ship list: "Procedure **19** — 'Launch swarm protocol' checklist".
- **B:** memory/procedural-memory-v1.md Proc 19 = "Cursor Implementation Completion Gate" (same doc's Milestone correctly says "Cursor completion gate = Procedure **19**").
- **Why it matters:** Wrong pointer on a numbered procedure. Operator/main searching Proc 19 for the launch checklist finds the Cursor gate; the launch checklist procedure was never added. Same file contradicts itself on what 19 means.
- **Resolution class:** update-A (fix §6 reference or add the missing launch-checklist procedure — needs-Jason if adding).

### F4 — MED · Sister porch: Proc 15 self-trigger vs Proc 21 explicit-request gate (same file)
- **A:** procedural-memory-v1.md Proc 15: "**Primary:** Jason says 'lock in gains' / **session close / major closeout** → read porch; reply if due" + MEMORY.md: "Check end of **each significant session**; Procedure 15" + TOOLS.md: "Procedure 15: check/reply **end of significant sessions**".
- **B:** procedural-memory-v1.md Proc 21: "REQUIRES EXPLICIT JASON REQUEST … **Sister porch read/reply** (except when Jason already ordered lock-in / Proc 15)".
- **Why it matters:** "Session close / significant session" is a self-activating trigger for a Drive write on shared state; Proc 21 says the same action needs an explicit request. Two procedures in one file govern the same action differently. Failure mode 2026-07-30 (skipped porch) is the under-side; over-triggering porch mid-session is the other side (Proc 15 also bans mid-session ping-pong).
- **Resolution class:** needs-Jason (define trigger precedence: does "session close / major closeout" count as explicit request? or must Jason say porch/lock-in?).

### F5 — MED · Procedure numbering out of order: 14 before 13
- **A:** procedural-memory-v1.md section order: … 12, **14, 13**, 15 … (grep `^## [0-9]+\.`).
- **B:** All numbers 1–22 present; every cross-ref resolves (AGENTS "Proc 14", MEMORY "Proc 15/16/19/20/21", HEARTBEAT "Proc 21", swarm "Proc 19/20", Proc 1 gate in swarm git-lockin). No *missing* procedure.
- **Why it matters:** Cosmetic but a doc-sync finding; ordered readers/extractors may treat order as authority and misread 13/14 content. Low operational risk.
- **Resolution class:** update-A (reorder 13 before 14; zero content change).

### F6 — MED · IDENTITY.md stale asset claim: "157 ADA" vs post-8/3 reality
- **A:** IDENTITY.md (mtime 7/11): "He trusts me with real assets (**157 ADA**, 7 NFTs…)".
- **B:** WORLD_STATE.md wallet snapshot (8/3 14:16): "**30.950725 ADA** + 7 NFTs" after 124.53 ADA (80%) sent to Jason for API funding.
- **Why it matters:** IDENTITY is loaded in startup persona context; a stale 5× balance feeds wrong spend-planning assumptions ("we have 157 ADA" when we have ~31). Model line ("xai/grok-4.5 current") is still correct — only the balance is stale.
- **Resolution class:** both-stale → update IDENTITY (drop hardcoded balance or point to WORLD_STATE) — identity edits require telling Jason per SOUL/IDENTITY convention.

### F7 — LOW · Startup ritual naming: "session-startup OpenClaw plugin" vs scripts/session-startup.mjs
- **A:** AGENTS.md §Every Session: "run this startup ritual automatically through the local `session-startup` **OpenClaw plugin**".
- **B:** MEMORY.md: "Identity-check rate-limit: ≤1 automatic append/day in **`scripts/session-startup.mjs`**" + Proc 17 "Session Startup File Stamps (no heredoc)" + config grep confirms plugin entries exist (session-startup ×2 in openclaw.json).
- **Why it matters:** Both are true (plugin wrapper runs the script), but AGENTS wording hides the script dependency; a reset/recovery agent looking only for a "plugin" could miss the script layer and its fixtures (13 tests).
- **Resolution class:** intentional-split — optionally update-A to name the script path once.

### F8 — LOW · Trust Decay ">24h since last verification" vs 30-min heartbeat cadence reality
- **A:** HEARTBEAT.md Trust Decay: pause if "**>24h since last verification**".
- **B:** HEARTBEAT.md header: rotate 2–4×/day ~30min cycles; heartbeat-state.json lastHeartbeat = 2026-08-03 14:36 (3d stale today; startup alert flags memory/sites/weather overdue; daily 8/6 notes "Heartbeat checks overdue since 8/3").
- **Why it matters:** Literal reading makes *every* routine action after a weekend require Jason confirmation, collapsing the safe-speed intent. "Verification" likely means "Jason last reviewed direction," not "last heartbeat ran" — wording conflates them.
- **Resolution class:** update-A (clarify: Jason review-of-direction vs heartbeat freshness).

### F9 — LOW · WORLD_STATE "Grok 4.6 window ~4d" stale by a day
- **A:** WORLD_STATE.md (8/3): fire row "**~4d** … All-day **2026-08-07**" + policy "keep brain on grok-4.5 until then".
- **B:** Today 2026-08-06 → 8/7 is ~1d away; daily 8/6 lists the same soft target.
- **Why it matters:** Monitoring cadence (through 8/7 smoke before default flip) depends on window accuracy; "~4d" misreads urgency. Policy itself (stay grok-4.5) is consistent across MEMORY/WORLD_STATE/IDENTITY.
- **Resolution class:** update-B (WORLD_STATE is the designated living doc; refresh on next heartbeat).

### F10 — LOW · MEMORY.md 7/31 line "subagents still zai/glm-5.1 until bake-off" — superseded in same file
- **A:** MEMORY.md "7/31: … subagents still `zai/glm-5.1` until bake-off".
- **B:** MEMORY.md "8/1: Swarm default **deepseek/deepseek-v4-flash** (runtime-proven…)" + config grep: deepseek ×2 present; glm-5.1 ×3 residual (consistent with WORLD_STATE stickiness/fallback row: agent:main:main fell back to zai/glm-5.1 while config primary is xai/grok-4.5).
- **Why it matters:** Not a live contradiction — dated chronology in one file; skim readers may anchor on the stale line. No action needed beyond optional "(superseded 8/1)" tag.
- **Resolution class:** intentional-split (dated entries); optional micro-update-A.

### F11 — LOW · swarm-protocol header "Working plan" vs its own "operational" milestone
- **A:** docs/harness/swarm-protocol-v0.md header: "**Status:** Working plan (Chair Nova · 2026-08-01)".
- **B:** Same file Milestone: "**Swarm Protocol operational.** First improvement cycle completed and regression green" + MEMORY.md 8/1 late: "Swarm Protocol v0 live".
- **Why it matters:** Status header misleads; operators may treat a live system as a proposal. Cosmetic but doc-sync-relevant.
- **Resolution class:** update-A (flip header to "Live v0 — operational").

### F12 — LOW · AGENTS generic heartbeat rotation vs HEARTBEAT actual checklist
- **A:** AGENTS.md: "Things to check (rotate 2–4×/day): **Emails, Calendar, Mentions, Weather**".
- **B:** HEARTBEAT.md actual list: 1 security/update · 2 memory maint · 3 sites (fractalfuzion.com + bighouserealestate.com) · 4 weather · 5 SI review. Telegram disabled (webchat only); email/calendar/mentions never actually in HEARTBEAT.
- **Why it matters:** AGENTS is generic template text; HEARTBEAT is the operative checklist. Low risk; doc-sync dust only.
- **Resolution class:** intentional-split (HEARTBEAT authoritative); optionally update-A to point at HEARTBEAT.md.

---

## Verified consistent (checked, no mismatch)
- **Plugins claim:** HEARTBEAT.md "(plugins.allow must include lossless-claw + other installed extensions)" ↔ config grep: lossless-claw ×2, session-startup ×2, active-memory ×2 in openclaw.json. Aligned.
- **Model defaults:** swarm-protocol (worker deepseek/deepseek-v4-flash · chair xai/grok-4.5 · cursor-grok-4.5-high) ↔ MEMORY.md (8/1 flips, Cursor pin) ↔ TOOLS.md (cursor pin, `CURSOR_MODEL` overrides) ↔ WORLD_STATE table. Aligned; residual glm-5.1 refs explained by documented stickiness/fallback row.
- **Source-of-truth map:** AGENTS.md (WORLD_STATE tier 2, "does not override AGENTS rules") ↔ MEMORY.md header ("Live ops NOW: WORLD_STATE.md"). Aligned.
- **Procedure refs:** AGENTS "Proc 14" · MEMORY "Proc 15/16/19/20/21" · HEARTBEAT "Proc 21" · swarm "Proc 1/19/20" — all exist in procedural-memory-v1.md. No missing numbered procedure (only F5 ordering anomaly).
- **Script paths:** session-startup.mjs, git-lockin-inventory.mjs, memory-health-probe.mjs, trajectory-closeout.mjs, claim-guard.mjs, cursor-worker.sh, error-doctor.mjs, swv-dry-harness.mjs — all present.
- **Startup compliance:** memory/2026-08-06.md contains mandated "## Open Issues (>24h)" (line 13) and "## Session-End Failure Check" (line 25); BOOTSTRAP.md absent; identity-substrate.md stamped today 17:46.
- **Doc-sync pack self-consistency:** scope.json pack=doc-sync+file-audit menu=4 matches swarm-protocol menu item 4.

---

## Confidence
**med** — reads were full-file; config check was read-only grep (not a full config schema audit); HEARTBEAT/WORLD_STATE freshness interplay (F8) inferred from mtimes + heartbeat-state.json.
