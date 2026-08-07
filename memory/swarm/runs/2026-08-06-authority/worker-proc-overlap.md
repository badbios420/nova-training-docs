# Worker packet — PROCEDURE OVERLAP + DEAD OWNERSHIP (authority-audit · menu 9)

status: PASS
date: 2026-08-06 ~18:35 PT
mode: read-only (this packet is the only write)
evidence:
- `memory/procedural-memory-v1.md` full read (procedures 1–23 enumerated; internal cross-refs at lines 59, 151, 363, 408, 548, 574, 620, 627, 641, 651, 663, 690)
- citation census: `grep -rhoE "Procedure(s)? [0-9]+"` across workspace (excl. node_modules/.git/quorra-training-docs), then per-proc verification excluding procedural-memory itself, memory/dreaming/**, memory/MEMORY-archive
- `ls memory/swarm/packs/` → only `error-doctor-v0.json`, `git-lockin-inventory-v0.json`
- `docs/harness/swarm-protocol-v0.md` §3 menu (items 1–9) + §6 ship list; menu 9 self-flag line verified
- `skills/verifier-pass-v1/SKILL.md` lines 25–26 (current cites: Procedure 5, Procedure 14 — pack-4 fix landed; mtime 18:22)
- `docs/harness/swarm-protocol-v0.md:214` (Proc 19 cite now correct; mtime 18:00)
- `IDENTITY.md:55` ("live balances only in WORLD_STATE.md — never hardcode amounts here"; mtime 18:00)
- `HEARTBEAT.md` item 2 (Level-2 only, Proc 21/23; mtime 18:00)
- `memory/swarm/runs/2026-08-06-doc-audit/{report.md,worker-file-audit.md,worker-dead-paths.md,implement-decision-2026-08-06.md}` (pack-4 baseline; fixes landed 18:00–18:31)
- path-existence sweep: all 18 proc-referenced files/scripts exist (chamber-protocol, swv-dry-harness, memory-health-recovery, eval-set, sample-task, 7 scripts, 5 ledgers)

## 0. Procedure inventory (1–23 titles)

1. Git Commit/Push Verification · 2. OpenClaw Config/Plugin Change Verification · 3. Memory/Session Consolidation Closeout · 4. Research Session Startup · 5. Proactive Disconfirmation Before Durable Claims · 6. Chamber Protocol · 7. Active Memory Enable / Health Check · 8. Subagent Scout → Worker → Verifier Pattern · 9. Claim Ledger Usage · 10. Research Session Protocol (full path) · 11. Verifier Pass (Gen→Verify) · 12. Retrieval Eval + Scorecard Cadence · 13. Trajectory Closeout · 14. Ops-First Retrieval + Dream Noise Filter · 15. Sister Porch Check-in · 16. Memory Health Probe · 17. Session Startup File Stamps (no heredoc) · 18. SWV Dry Harness · 19. Cursor Implementation Completion Gate · 20. Implementation Role Split · 21. Workflow Completion Authority (STOP after report) · 22. Runtime Error Doctor · 23. Authority Levels (Working/Curated/Architecture)

All 23 present. No citations to procedures >23 or to nonexistent numbers anywhere.

## Findings (ranked)

1. **[HIGH] Proc 3 conflicts with Proc 21 — auto-commit checklist vs explicit-Jason gate.** Proc 3 (5/26 era) checklist steps 3–4 say "Commit with clear message" + "Verify push succeeded"; Proc 21 (8/1) requires explicit Jason for commit/push. Proc 3 has **zero external citations** anywhere (orphaned AND conflicting). Recommend: **merge** — fold its residual value (governance-change closeout steps) into Proc 15 lock-in order; replace Proc 3 with a short superseded-stub pointing at 15/21/23. Only true same-action-different-rule conflict found.

2. **[MED] Closeout domain is 4-way overlapping: Proc 3 / 13 / 15 / 21 + session-consolidation-v1.md.** All govern "end of major session": 3 = consolidation closeout, 13 = trajectory row, 15 = lock-in order (porch→MEMORY→git→stamp), 21 = STOP gate, consolidation-v1 = method/triggers. Post-8/6 fix they are consistent except Proc 3 (F1). Recommend: **clarify-precedence** — add one line each to 13 and 15 headers: 15 = lock-in *order*, 21 = *gate*, 13 = *trajectory row*, consolidation-v1 = *method*.

3. **[MED] Retrieval governance is 4-way overlapping: AGENTS Memory Loading Rule / Proc 4 / Proc 14 / memory-retrieval-policy-v1.md.** Trigger conditions for "when to retrieve" are duplicated in AGENTS.md, policy-v1 TRIGGER CONDITIONS, and Proc 4 checklist; Proc 14 owns ops-first. Consistent in direction; drift risk. Recommend: **clarify-precedence** — one header line in memory-retrieval-policy-v1.md: "Startup load order = AGENTS; research = P4; ops = P14; this policy = retrieval-depth ladder."

4. **[LOW] Duplicate which-file-wins maps: AGENTS.md Source-of-Truth Map (8 tiers) vs Proc 23 "Canonical ownership" table.** Same domain (which file wins), both edited 2026-08-06, consistent today but two copies of an authority table is a drift trap. Recommend: **clarify-precedence** — one line in Proc 23: "AGENTS SoT map = startup/conflict resolution; this table = write-class ownership." No merge needed.

5. **[LOW] TOOLS.md gog/porch section mirrors Proc 15** (doc id, folder, reply format, "Procedure 15"). Intentional L2 local-notes mirror with cross-ref (TOOLS.md:121); the doc-id/format now lives in 2 places. Recommend: **leave** — drift risk only if porch doc id changes; no behavior conflict.

6. **[LOW] Evidence cluster Proc 5 / 9 / 11 overlap** — pre-write disconfirmation (5), claim ledger (9), verifier pass (11); all touch banned-word/evidence rules and claim-guard.mjs; layered and cross-referenced. Recommend: **leave**.

7. **[LOW] Proc 8 (live Scout→Worker→Verifier) vs Proc 18 (SWV dry harness)** — 18 explicitly defers to 8 for the live pattern (procedural-memory:574; swv-dry-harness-v0.md:78). Recommend: **leave**.

8. **[MED] Orphan procedures — zero external references: Proc 3, 7, 10, 17.** (Proc 3 → merge per F1. Proc 7 Active Memory, Proc 10 Research full path, Proc 17 no-heredoc stamps are self-contained and operationally used but never cited by name — risk that future agents re-derive or forget them, which is the file's stated purpose.) Recommend: **leave** content; optionally add a one-line "Origin/used-by" provenance note to 7/10/17 on the next microfix pass. Proc 12's only external cites are the (now-fixed) stale-path audit note.

9. **[MED] Swarm menu pack-JSON gap: menu 1–6 and 9 have no pack JSON; only 7 (git-lockin-inventory) and 8 (error-doctor) have packs.** Menu 9 self-flags ("Nova-manual until pack JSON exists"); menu items 1–6 do not, so an operator reading §3 cannot tell manual vs packed. chi-v0.json + regress-v0.json were §6 ship items never built. Recommend: **new-thin-proc** (or one-line doc note in swarm-protocol §3): "Menu 1–6, 9 run Nova-manual; pack JSON exists for 7–8 only." Reaffirms pack-4 HOLD — do not build `swarm-pack-run.mjs` yet.

10. **[LOW] docs/chamber-protocol-v0.1.md has no Procedure 6 back-ref** — the protocol file never cites its authority proc number; standalone readers get no pointer. Recommend: **clarify-precedence** microfix — one header line "Authority: Procedure 6" (L2, no gate change).

11. **[LOW] WORLD_STATE.md:122 and memory/harness-scorecard.md both own retrieval meters** — live value (hit@1 0.80 / hit@3 0.87) vs historical canonical rows. Correct live-vs-history split but implicit. Recommend: **leave** + one clarifying line in scorecard header ("live value → WORLD_STATE; history rows here").

12. **[LOW] NOVEL.md (root) vs nova-training-docs/NOVA-NOVEL.md duplicate narrative, both citing procs** — AGENTS already declares nested `*-training-docs/**` reference-only. Recommend: **leave** (covered); no ownership conflict.

13. **[LOW] AGENTS.md heartbeat section vs HEARTBEAT.md** — generic guidance vs live checklist; AGENTS explicitly defers ("You are free to edit HEARTBEAT.md"). Recommend: **leave**.

14. **[INFO] Pack-4 fixes verified landed — no dead proc refs remain.** verifier skill cites P5/P14 (was P6); swarm-protocol Proc 19 cite correct (was launch-checklist); IDENTITY no hardcoded ADA; HEARTBEAT #2 Level-2/Proc 21-23 gated; AGENTS delegated-autonomy + Proc 21/23 refs; Proc 12 eval-set path fixed (procedural-memory:406); Proc 13/14 order fixed; all 18 proc-referenced paths exist (incl. chamber doc, swv templates, memory-health-recovery). Recommend: no action.

15. **[INFO] Dead-ownership audit result: no doc currently claims a domain owned by a different canonical file.** The 8/6 edits resolved the only real claims (IDENTITY→wallet, TOOLS→browser path, HEARTBEAT→MEMORY promotion). Residual ownership duplications are the deliberate mirrors in F4/F5/F11.

## Verified consistent (do not thrash)
- Proc 15 ↔ Proc 21 porch carve-out is now explicit both directions (15 trigger "automatic under Proc 15" + 21 exception list) — pack-4 resolution held.
- AGENTS.md ↔ Proc 23: startup order vs write-class authority cross-referenced correctly.
- Skill ↔ proc mapping: verifier-pass-v1 = P5/P11/P14; memory-efficiency-pass = P14. No skill cites a wrong number anymore.
- Proc 1 (lock-in verification) vs Proc 21 (gate) vs Proc 20 (role split): consistent, cross-referenced.

## Recommendations summary
- **merge:** Proc 3 → superseded stub (into Proc 15/21).
- **clarify-precedence:** F2 (closeout one-liners), F3 (retrieval policy header), F4 (Proc 23 line), F10 (chamber back-ref).
- **new-thin-proc:** none needed — one-line doc note for F9 (menu pack status) suffices; pack-4 HOLD stands.
- **leave:** F5–F7, F11–F13.
- **archive-doc:** none (training-docs already reference-only per AGENTS).

confidence: high
scope_touched: [read-only: memory/procedural-memory-v1.md, AGENTS.md, HEARTBEAT.md, TOOLS.md, MEMORY.md, IDENTITY.md, NOVEL.md, WORLD_STATE.md, docs/harness/{swarm-protocol-v0,swv-dry-harness-v0}.md, docs/chamber-protocol-v0.1.md, memory/retrieval-eval-set-v1.md, memory/session-consolidation-v1.md, memory/memory-retrieval-policy-v1.md, memory/swarm/{packs,swarm-scorecard-v0.md}, memory/swarm/runs/2026-08-06-doc-audit/*, skills/verifier-pass-v1/SKILL.md, skills/memory-efficiency-pass/SKILL.md, scripts/ listing; write: this packet only]
