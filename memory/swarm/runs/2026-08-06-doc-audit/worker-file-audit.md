# Worker packet — FILE-AUDIT (menu 4) · worker-file-audit

**Run:** 2026-08-06-doc-audit · **Pack:** doc-sync + file-audit (menu 4)
**Worker:** deepseek/deepseek-v4-flash (read-only) · **Date:** 2026-08-06
**Mode:** READ-ONLY — no edits, deletes, git writes, or memory promotion performed.

---

status: PASS
evidence:
- ls -la memory/swarm/packs/ → only error-doctor-v0.json + git-lockin-inventory-v0.json (2 packs)
- ls scripts/swarm-pack-run.mjs → "No such file or directory" (C10 ship item never built)
- memory/procedural-memory-v1.md:393 "Run queries in `memory/retrieval-eval-set-v1.md`" vs memory/retrieval-eval-set-v1.md (301B stub: "Canonical path ... docs/harness/retrieval-eval-set-v1.md") vs docs/harness/retrieval-eval-set-v1.md (7423B real set)
- grep -n "^## " memory/procedural-memory-v1.md → `## 14` at line 412 precedes `## 13` at line 434 (1–22 all present, 13/14 swapped order)
- diff/head scripts/gmail-unsub-batch.mjs (7640B, 07-28 16:58) vs gmail-unsub-batch2.mjs (6846B, 07-28 17:10) → same script family, different sender lists, both untested
- ls memory/swarm/runs/2026-08-05-chi/ → scope.json only (no report/evidence); its scope.json is prose-wrapped ("Scope frozen: {...}") vs proper JSON in runs/2026-08-06-doc-audit/scope.json
- skills/verifier-pass-v1/SKILL.md:4 "Secondary web/X stays untrusted until primary-checked (Procedure 6 / Möbius)" — P6 = Chamber Protocol; correct ref is P5 (Proactive Disconfirmation)
- ls docs/chamber-protocol-v0.1.md, memory/evals/memory-health-recovery-v0.md, memory/evals/swv/{templates,fixtures}, memory/wiki-ops-pack/{INSTALL.md,entities,syntheses}, memory/error-doctor-ledger.md, /home/mrbig3/.openclaw/wiki/main/entities/ → all referenced paths EXIST (no dead refs in swv-dry-harness-v0.md, wiki-ops-entity-pack-v0.md, Procedures 6/16/18)
- grep -rn "training-docs" --include="*.md" . → only filter rules (retrieval-eval-lib drops `*-training-docs/**`), git-remote references, and historical dailies; no live doc points INTO nested clones as source of truth
- ls README* scripts/README* docs/README* → none exist (zero README/index for 40+ scripts)
- find docs scripts -name "*.md" -size -300c → none (no empty stub docs)

findings:
- [pack-vs-disk] Protocol menu 1–6 (regress, chi, coverage, doc-sync+file-audit, mem-health, sec-scan) have NO pack JSONs; only menus 7–8 have packs. Expected gap per §6 "Nova-manual first", but C10 ship item `scripts/swarm-pack-run.mjs` was never built and no pack JSONs were ever created — every non-7/8 run is hand-rolled by chair each time (evidence: runs/2026-08-01-{chi,coverage,regress} contain reports but no reusable pack JSON).
- [stale-path] Procedure 12 cites `memory/retrieval-eval-set-v1.md` as the query set, but canonical moved to `docs/harness/retrieval-eval-set-v1.md` (2026-07-29 C3); memory/ copy is a 301B pointer stub. Lib (scripts/lib/retrieval-eval-lib.mjs:88–92) already handles both paths — only the procedure text is stale.
- [ordering] Procedural file has `## 14` before `## 13`; no missing numbers (1–22), cosmetic but confusing for cross-refs.
- [duplicate-script] gmail-unsub-batch.mjs vs gmail-unsub-batch2.mjs — near-duplicate (created 12 min apart, 07-28), overlapping purpose, different sender lists, neither tested nor documented as live; drift risk.
- [dead-run-dir] memory/swarm/runs/2026-08-05-chi/ has scope only, no report — incomplete/aborted chi run, or report never written; also its scope.json is prose-wrapped, inconsistent with doc-audit run's strict JSON.
- [skill-vs-procedure-drift] verifier-pass-v1 SKILL ≈ Procedure 11 and memory-efficiency-pass SKILL ≈ Procedure 14 (duplication by design), but SKILL cross-ref is wrong: "(Procedure 6 / Möbius)" should be Procedure 5 for secondary-web-untrusted. Drift in duplicated content.
- [skill-cluster-selfimprove] self-improvement-review (registered), ai-self-review, recursive-self-improve (unregistered) all claim the "self improvement" trigger with overlapping distill/propose workflows; agent-autonomy + agent-autonomy-kit also overlap (persistent memory + proactive queue). No doc says which is canonical.
- [skill-cluster-browser] 6 overlapping browser skills: plugin browser-automation + clawbrowser, playwright-scraper-skill, browser-cash (registered), playwright-mcp, browser-automation-stealth (unregistered). No selection guide; 2 are dead weight in skills/.
- [no-readme] Zero READMEs (root, scripts/, docs/); 40+ scripts with no index; gmail-unsub-batch*, .py/.ps1/.bat/.sh helpers have no tests and no doc of intended use (coverage-pack gap, not contradiction).
- [orphan-pack-doc] docs/harness/wiki-ops-entity-pack-v0.md — all referenced paths exist (consistent), but it is a one-off C8 deliverable, absent from swarm menu, superseded by live wiki vault (entities installed 07-31); better placed in memory/cursor-jobs/ as a job record than in docs/harness/.
- [positive] Nested training-docs are consistently treated as REFERENCE ONLY: retrieval filter drops `*-training-docs/**`; AGENTS.md note honored; no live doc points into them. Historical dailies (2026-07-11) reference now-deleted `memory/_lockin-gains-2026-07-11.sh` / `_gitcheck-tmp.txt` — historical only, not live.
- [consistent-by-design] Procedure pairs 4/10 (startup vs full research path), 8/11/18 (live SWV vs verifier vs dry harness), 3/13 (consolidation vs trajectory), and 15/21/1 (lock-in chain) overlap but cross-reference each other and do NOT contradict — watch-items only.
- [cosmetic] error-doctor pack file is `error-doctor-v0.json` but self-identifies `"version": "v0.1.1"`; protocol §3 and Procedure 22 agree on menu 8, CLI, and ledger — no functional drift.

confidence: high
scope_touched:
- memory/procedural-memory-v1.md
- docs/harness/swarm-protocol-v0.md
- docs/harness/swv-dry-harness-v0.md
- docs/harness/retrieval-eval-set-v1.md
- docs/harness/wiki-ops-entity-pack-v0.md
- memory/retrieval-eval-set-v1.md
- memory/swarm/packs/*.json
- memory/swarm/runs/* (all run dirs)
- memory/error-doctor-ledger.md
- memory/wiki-ops-pack/{INSTALL.md,entities,syntheses}
- scripts/ (ls + targeted reads; gmail-unsub-batch*.mjs, retrieval-eval-lib.mjs, swarm-pack-run.mjs check)
- skills/ (SKILL.md heads: verifier-pass-v1, memory-efficiency-pass, self-improvement-review, ai-self-review, recursive-self-improve, agent-autonomy, agent-autonomy-kit, playwright-mcp, playwright-scraper-skill, browser-automation-stealth, qualia-philosophy)
- HEARTBEAT.md, wisdom-index.md (grep), AGENTS.md/TOOLS.md context
- /home/mrbig3/.openclaw/wiki/main/entities/ (existence check)
