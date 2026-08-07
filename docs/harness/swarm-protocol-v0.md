# Swarm Protocol v0 — Labor, not brains

**Status:** Live v0 — operational (Chair Nova · first cycle 2026-08-01; authority pass 2026-08-06)  
**Aligns with:** Chamber #10 verdict · C9 SWV dry harness · GPT “operating system not advisors” note  
**Default worker:** `deepseek/deepseek-v4-flash`  
**Chair / brain:** Nova · `xai/grok-4.5`  
**Implementer (approved changes only):** Cursor `cursor-grok-4.5-high` or Codex  
**Chamber:** intelligence / forks only — not routine labor

---

## 1. Mental model (locked)

| Layer | Role | Models |
|-------|------|--------|
| **Swarm** | Labor OS — measure, search, test, compare, verify evidence | DeepSeek Flash (parallel) |
| **Chamber** | Intelligence — architecture forks, risk, promotion fights | GLM-5.2 · GPT-Skeptic · Flash alt · Chair Nova |
| **Chair** | Decompose, spot-check, synthesize, promote/reject | Grok 4.5 Nova |
| **Cursor/Codex** | Implement **only after** Chair acceptance | cursor-grok-4.5-high / Codex |

**Workers never:**
- Write architecture or set priorities
- Edit protected config / wallet / secrets
- Sole-verify irreversible actions
- Promote to MEMORY / WORLD_STATE
- Spend money or send external messages
- Dump full MEMORY into their context

**Workers always return:**
```
status: PASS | FAIL | PARTIAL | SKIP
evidence: [paths, commands, exits, quotes]
findings: [bullets]
confidence: high|med|low
scope_touched: [paths read only unless write-scope explicit]
```

---

## 2. Trigger (Jason → Nova) — keep it dumb-simple

### The only phrase you need to remember

> **Launch swarm protocol**

That’s it.

### What Nova does when you say it

1. Show a **numbered menu** of packs, **highest ROI first**
2. One line each: what it does + why it pays
3. You reply with a **number**, or **your call**, or **stop**
4. Nova runs that pack (Flash labor → Chair report)

### Optional extras (you don’t need these)

| If you say… | Nova does… |
|-------------|----------------|
| `swarm status` | Last run summary |
| `swarm stop` | Freeze new spawns |
| a number after the menu | Run that pack |

**Do not make Jason memorize pack codenames** (CHI, REGRESS, etc.). Those are internal labels on the menu only.

---

## 3. Pack catalog (labor jobs)

Priority = **efficient use first**. Build packs that raise existing meters before inventing new mythology.

### Menu order when Jason says “Launch swarm protocol”

Present **exactly this shape** (ROI top → bottom). Internal pack ids in backticks only for logs.

```
Swarm protocol — pick a number (highest ROI first):

1. Safety check after code changes     [regress]
   Run existing tests in parallel. Best right after Cursor/Codex work.

2. Find today’s best improvements      [chi]
   5 read-only workers: 1 duplicate, 1 stale thing, 1 missing test,
   1 regression risk, 1 optimization. Nova ranks. Nothing auto-edited.

3. What’s not tested?                  [coverage]
   Map holes in tests/acceptance/smoke/rollback.

4. Doc / procedure mess audit          [doc-sync + file-audit]
   Contradictions, duplicates, dead paths — report only.

5. Memory hygiene scan                 [mem-health]
   Stale/duplicate/conflict candidates — Nova decides; no auto-delete.

6. Quick security greps                [sec-scan]
   Secrets patterns, dangerous shell — report only.

7. Git lock-in inventory               [git-lockin-inventory]
   Read-only classify dirty paths (commit vs local vs secret vs gitignore).
   No stage/commit/push. Nova trims; Jason approves set.

8. Runtime error doctor                [error-doctor]
   Bounded logs → redact → cluster → family merge (≤5) → ledger → options.
   Read-only diagnosis; corpus self-reports excluded; no auto-fix.

9. Authority / single-source audit            [authority-audit] (P1)
   Duplicate facts, which-file-wins map, procedure overlap — report only.

Reply: 1–9 · your call · stop
```

**Note (2026-08-06):** Menu **9** is designed/queued after pack 4 authority pass; run Nova-manual until pack JSON exists. Do not auto-edit from authority audits.

### Pack details (internal)

#### `regress` — Safety check after code changes ⭐ usually #1 ROI
**When:** After any harness/script change  
**Workers:** up to maxConcurrent (3), subsystem split  
**Each:** run existing tests/probes → PASS/FAIL + evidence  
**Chair:** merge; block “done” if FAIL without waiver

#### `chi` — Find today’s best improvements ⭐ default if nothing just changed
**When:** On demand; optional nightly later (Jason gate)  
**Workers:** 5 Flash, read-only, one finding class each  
**Chair:** Rank top 3–5; 0–2 → Cursor brief only with Jason OK  
**Hard rule:** workers do not modify anything

#### `coverage` — What’s not tested?
**Workers:** 4 — startup holes, scripts w/o acceptance, unsmoked plugins, procedures w/o rollback

#### `git-lockin-inventory` — Git lock-in inventory (read-only)
**When:** Before lock-in / when dirty tree is large / after Jason connects GitHub tools  
**CLI:** `node scripts/git-lockin-inventory.mjs` (+ `--json`) · pack `memory/swarm/packs/git-lockin-inventory-v0.json`  
**Workers (optional Flash):** inventory / secret-surface / size-guard — **status porcelain + path classify only**  
**Classes:** `commit_candidate` · `intentional_local_only` · `generated_rebuildable` · `add_to_gitignore_candidate` · `archive_candidate` · `investigate` · `possible_secret`  
**Hard ban:** no `git add`, commit, push, reset, clean, rm, mv; **no** `.gitignore` edits; **no** `git add -A`; **no** background sync  
**Chair:** strip false positives → concise proposed lock-in set → **Jason approves** → Procedure 1 acceptance gate  
**Ownership model (Jason-approved):** Cursor/swarm are **not** librarians of the tree. Nova decides lock-in material; git writes only after explicit approval.

#### `error-doctor` — Runtime error doctor (read-only diagnosis)
**When:** Recurring failures, mystery flakes, post-incident triage, “what’s actually wrong?”  
**User phrase:** Launch swarm protocol → **Runtime error doctor** (menu **8**)  
**CLI:** `node scripts/error-doctor.mjs` · pack `memory/swarm/packs/error-doctor-v0.json` · ledger `memory/error-doctor-ledger.md`  
**Pipeline:** bounded evidence → redact → cluster/fingerprint → **family merge** → ledger NEW/KNOWN/REGRESSED/RESOLVED/NOISE → change correlation (not causation) → current probes → numbered options (L0–L4)  
**Default output:** ≤5 actionable **families** + appendix (unclassified / low-confidence / noise). High-severity is never buried by low count.  
**Corpus exclude:** do not ingest `memory/swarm/runs/**`, prior `error-doctor-report*`, chair/worker packets, ledger, or `memory/cursor-jobs/*error-doctor*` / nova-error-log-audit dumps (fixtures only with `--include-fixtures` / `NODE_ENV=test`).  
**Lanes:** A cluster · B root-cause · C risk/repair planning · **Chair Nova** adjudicates (v0.1 lanes in-process; optional Flash critique)  
**Hard ban:** no `doctor --fix`, no gateway restart, no config edits, no log deletion, no full-log dumps, no secrets, no auto-commit, no Level 2+ without Jason approval, no RESOLVED without current passing probe  
**First runs:** manual only (3–5×) before any nightly automation

### P1 — High value, schedule after P0 works

| Pack | Labor | Notes |
|------|-------|-------|
| **FILE-AUDIT** | dead code, duplicate procedures, contradictory docs, unused prompts | read-only; Chair prioritizes |
| **MEM-HEALTH** | duplicate beliefs, stale memories, obsolete procedures, conflicts, missing indexes, broken links | **no deletes**; Chair only promotes trash/edit |
| **DOC-SYNC** | AGENTS vs TOOLS vs WORLD_STATE vs procedures vs READMEs | mismatch table only |
| **SEC-SCAN** | secrets patterns, chmod 777, rm -rf, unsafe exec | report only; Jason for anything scary |
| **EXTRACT** | post-session: procedures, failures, metrics candidates | Möbius: research→audit→promote |

### P2 — Later (need meters first)

| Pack | Why wait |
|------|----------|
| **COST** | needs logging habit / batch cost rows |
| **REFACTOR-CANDIDATES** | noise without CHI discipline |
| **NOVA-BENCH** | weekly KPI composite — after REGRESS+CHI produce stable signals |

---

## 4. Execution pattern (every pack)

Uses **C9 SWV** where useful; pure labor packs can skip Scout if task is pure measure.

```
1. Chair picks pack + scope freeze (paths, max workers ≤3 unless Jason bumps)
2. Optional: swv-dry-harness init-run for complex packs
3. Spawn Flash workers in parallel (isolated; no MEMORY dump)
4. Each worker: measure/search/test only → structured return
5. Optional Verifier worker: checklist vs evidence (still not Chair)
6. Chair: synthesize, rank, reject junk, write swarm run report
7. IF implement: Cursor/Codex brief with acceptance tests — never silent auto-edit
8. Trajectory row + scorecard touch when pack changes harness truth
```

**Concurrency:** default 3 (config). Jason can approve 4–6 for REGRESS/CHI once stable.

**Cost sanity (Chamber #10 order of magnitude):** ~$0.10–0.20 per verified 10-task cycle if Chair actually verifies. Unverified swarm = fake savings.

---

## 5. What NOT to swarm (hard)

- Architecture / Nova design / business priorities  
- Protected config, wallet, spend, external send  
- “Improve the harness” without a measure pack  
- Self-verify then self-promote  
- Overnight auto-implement without Jason  

---

## 6. C10 recommendation (single next build)

**Name:** Continuous Harness Improvement pack v0  

**Ship:**
1. `docs/harness/swarm-protocol-v0.md` (this file) — DONE as plan  
2. `memory/swarm/packs/chi-v0.json` — worker task specs  
3. `memory/swarm/packs/regress-v0.json` — subsystem test map  
4. `scripts/swarm-pack-run.mjs` **or** Nova-manual first:  
   - list packs  
   - render N worker briefs from pack JSON  
   - write run dir under `memory/swarm/runs/`  
   - **does not** auto-spawn (same rule as C9) unless we later add a thin helper  
5. ~~Procedure 19 launch checklist~~ — **superseded:** Proc **19** = Cursor Implementation Completion Gate; launch UX is this doc §2 (one phrase + menu). Optional thin checklist may be added later under a **new** procedure number only.  
6. One live CHI run + one live REGRESS run with evidence  
7. Scorecard meter #7 (subagent leverage) + optional CHI findings count  

**Success:** Jason says **Launch swarm protocol** → picks a number → gets a ranked evidence report without a chamber.

---

## 7. Chamber decision

| Question | Decision |
|----------|----------|
| New chamber on “swarm as labor”? | **No** — Chamber #10 + this plan + GPT note agree |
| Chamber later? | **Yes** only if fork on: overnight auto-run, concurrency >3 default, auto-implement without Jason, or DeepSeek leaving worker tier |

---

## 8. Efficiency ranking (do in this order)

1. **REGRESS pack** — protects every Cursor/Codex change (uses tests we already have)  
2. **CHI pack** — daily/on-demand self-inspect (GPT’s “one capability”)  
3. **COVERAGE pack** — feeds CHI with missing tests  
4. **DOC-SYNC / FILE-AUDIT** — debt visibility  
5. **MEM-HEALTH** — careful; Chair-gated  
6. **NOVA-BENCH** — weekly KPI once 1–3 are boring  

---

## 9. Example (operator view)

```
Jason: Launch swarm protocol

Nova:
  Swarm protocol — pick a number (highest ROI first):
  1. Safety check after code changes
  2. Find today’s best improvements
  3. What’s not tested?
  …

Jason: 2

Nova:
  - freeze scope (harness + docs; no wallet)
  - spawn Flash workers
  - rank findings with evidence
  - ask: implement top items? | HOLD | stop
```

Nightly auto-report is fine **after** on-demand runs work three times without junk.

---

## 10. Relation to C9

C9 = **how** to brief Scout/Worker/Verifier.  
This protocol = **what packs** to run and **when**.  
Do not rebuild C9; reference it.

---

**Chair opinion:** GPT’s list is correct. UX for Jason = **one phrase + numbered ROI menu**. Internally REGRESS + CHI do the work. Skip philosophy chamber; build C10 pack runner when Jason says go.

---

## Milestone — 2026-08-01 first full cycle

**Swarm Protocol operational.** First improvement cycle completed and regression green:

`find (pack 2) → Jason approve 1–3 → Cursor implement → Chair catch/fix → pack 1 regress PASS`

Standing rule: Cursor completion gate = Procedure **19** + `.cursor/rules/nova-sidecar.mdc` (syntax + tests + diff before "done").

Next high-value pack when Jason launches: menu **3 — What’s not tested?**

### 2026-08-01 late — coverage cycle closed
- Pack 3 → implement 1+2 → regress PASS → **Jason ACCEPT + FREEZE**
- session-startup fixture suite + AM **offline** smoke shipped
- **Queued (not built):** controlled live active-memory injection smoke (no plugin config changes until Jason opens)
- **Role split (binding):** Nova chairs/dispatches/verifies; Cursor = ordinary code; Codex = protected OpenClaw infra; emergency Nova one-liners must be labeled + tool-reviewed

### 2026-08-01 midday — git lock-in inventory pack
- Jason: GitHub≠auto-sync; add read-only swarm menu item + lock-in acceptance rule (prior night agent failed mid-reply)
- Menu **7** `[git-lockin-inventory]` + CLI `scripts/git-lockin-inventory.mjs` + unit tests
- No automatic syncing by Cursor or swarm (ownership model approved)
