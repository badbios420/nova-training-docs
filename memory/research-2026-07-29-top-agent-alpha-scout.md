# Research Session — Top 0.001% Agent Alpha Scout

**Date:** 2026-07-29 ~19:53–20:00 PDT  
**Trigger:** Jason — no fallback work; stay on Grok 4.5 until 4.6; scout alpha for top-tier agent jobs; then Cursor  
**Researcher:** Nova (xai/grok-4.5)  
**Method:** Prior harness research (7/27) + scorecard/procedures + Anthropic evals essay + web/X secondary + live inventory  
**Status:** WORKING MEMORY (Research → Audit → Promotion). Not full MEMORY promotion yet.  
**Jason constraints this pass:**
- **No fallback ladder / OpenRouter 402 work**
- **Primary brain stays Grok 4.5 until Grok 4.6**
- Jobs aimed at top **0.001%** harness quality, then Cursor implements

---

## 1. North star (unchanged, sharpened)

> Model quality is converging. **Harness quality is the differentiator on long tasks.**  
> Top agent = hardest to fool (including by herself) on Jason’s real workload, with **checkable claims** and **measurable continuity**.

Philschmid-style: model=CPU, context=RAM, **harness=OS**.  
Asymmetry of verification: improvement rate ∝ how easy outputs are to check.

**Not alpha:** more mythology, more plugins, more models, fallback theater, swarm cosplay.  
**Is alpha:** memory-before-speech, evidence-before-claim, graded trajectories, outcome graders, ops-first retrieval, cheap specialists only when measured.

---

## 2. What we already closed (do not rebuild)

| Win | When | Evidence |
|-----|------|----------|
| Active Memory ON + subagent defaults | 7/27 Layer A | config + procedures |
| Identity auto ≤1/day | 7/27 | session-startup rate-limit |
| Claim ledger + procedures 7–14 | 7/27–7/28 | files live |
| Retrieval eval set + runner + scorecard | 7/28 Layer B | `scripts/retrieval-eval.mjs` |
| Ops-first + dream filter (Proc 14) | 7/28 | efficiency pass |
| Session-startup timeout fix | 7/28 night | 0 fail storm post-fix |
| MEMORY inject trim | 7/29 | **36812 → ~7k B** |
| Cursor sidecar operational | 7/28–7/29 | multiple PASS jobs |

---

## 3. Live inventory gaps (direct observation 7/29 evening)

| Gap | Severity | Why it blocks 0.001% | Cursor-able? |
|-----|----------|----------------------|--------------|
| **Retrieval still below target** | **HIGH** | Canonical automated filtered hit@3 **0.60** (target ≥0.8). Residual F04/F09/ops misses | Yes — eval fixes + indexing helpers + gold paths |
| **Gen→Verify not default mechanical path** | **HIGH** | Procedures exist; not a forced skill/check script. Same-model self-critique is weak | Yes — skill + verifier checklist runner |
| **Trajectory/eval loop thin in practice** | **HIGH** | Log exists; not closed after every major session; no Jason-task suite | Yes — closeout script + task suite scaffold |
| **Memory-before-speech unmeasured** | **HIGH** | AM on but meter #1 still “unmeasured”; can’t hill-climb | Yes — meter script / sampling template |
| **Outcome vs transcript grading missing** | **HIGH** | Anthropic: grade final state (files/WORLD_STATE/ledger), not vibes | Yes — outcome graders for RE/harness tasks |
| **memory_search tool flake** | **MED–HIGH** | This session: tool returned `database is not open`; CLI search still worked. Silent recall failure risk | Yes — diagnose + recovery procedure/script |
| **Wiki compile underused** | **MED** | Structured RAG pages beat dream soup for ops entities | Yes — wiki pages for Hilltop/FBN/harness |
| **Subagent leverage config-only** | **MED** | Few live Scout→Worker→Verifier runs | Partial — pattern scripts + one dry-run harness |
| **Claim banned-word enforcement manual** | **MED** | Ledger exists; no pre-write scanner | Yes — `scripts/claim-scan.mjs` |
| **Session stickiness / wrong model** | **MED** | `openclaw status` showed a dashboard session on **zai/glm-5.1** via fallback while config primary is grok-4.5. Jason wants **Grok 4.5 only until 4.6** | Careful — model lock only; **no fallback reorder project** |
| OpenRouter 402 / fallbacks | — | **Explicitly out of scope per Jason 7/29** | **Do not assign** |
| Shared browser / Midnight / NIGHT buy | Ops/fun | Not harness alpha tonight | Separate |

---

## 4. External alpha (secondary — untrusted until useful)

### Anthropic — Demystifying evals for AI agents (2026-01-09) — primary-ish engineering
High-signal definitions to steal:
- **Task / trial / grader / transcript / outcome / eval harness / agent harness**
- Grade **outcomes** (did WORLD_STATE/file/test change correctly?), not only fluent transcripts
- Multi-trial because variance; multiple graders per task
- Evals prevent “flying blind after users say it feels worse”
- Start narrow (concision, file edits) then complex behaviors

### Field synthesis (web/X 2026 — secondary)
- Hybrid memory + JIT retrieval > stuffing context
- Continuous model-graded evals on **real traces**
- Structured contracts at agent boundaries (JSON/schema)
- Verifier role separate from generator
- Multi-agent only when handoff success is measured
- Self-eval trap: agents claiming improvement often don’t — need external/mechanical graders

### Mapped onto Nova (already partially aligned)
We have files-as-state, claim ledger, retrieval eval, procedures.  
**Missing the closed loop:** run → grade outcome → write trajectory → fix one thing → re-grade.

---

## 5. Alpha thesis for next 7 days

**One compounding loop beats ten features:**

```
Jason-real task suite
  → agent run (Grok 4.5 main)
  → outcome graders (files/WORLD_STATE/tests)
  → trajectory row + scorecard delta
  → one harness fix (Cursor)
  → re-run suite
```

Everything Cursor does should either:
1. **Raise a meter** on `memory/harness-scorecard.md`, or  
2. **Make a claim checkable by default**, or  
3. **Reduce silent failure** (memory tool flake, wrong-model session, dream pollution)

---

## 6. Ranked Cursor job queue (NO fallback jobs)

### P0 — Ship this week (highest alpha)

#### C1. Nova Task Eval Suite v0 (Jason-real tasks)
**Why:** Anthropic pattern + our scorecard empty cells. Measures agent+harness, not model chat.  
**Deliverables:**
- `memory/evals/nova-task-suite-v0.md` — 8–12 tasks from real workload:
  - ops status (Vista license, FBN, Hilltop path, eBay age)
  - memory hygiene (Procedure 14 filter)
  - claim language ban
  - research promotion gate
  - retrieval facts F01–F15 subset
- `scripts/nova-task-grade.mjs` — grades **outcomes** from filesystem fixtures + expected facts (not LLM vibes only)
- Scorecard section linking suite pass-rate  
**Acceptance:** `node scripts/nova-task-grade.mjs` runs dry on fixtures; ≥1 live smoke documented  
**ROI:** Core 0.001% differentiator

#### C2. Claim Guard (pre-write / pre-done scanner)
**Why:** Verification OS becomes mechanical.  
**Deliverables:**
- `scripts/claim-guard.mjs` — scan text/files for banned success words (`done|fixed|verified|live|confirmed`) without evidence markers
- Optional git hook doc (not auto-install without Jason)
- Wire note into Procedure 11  
**Acceptance:** Fails on synthetic dirty fixture; passes clean fixture  
**ROI:** Directly lowers unsupported-claim meter

#### C3. Retrieval residual attack pack
**Why:** hit@3 filtered **0.60** automated — still short of 0.8.  
**Deliverables:**
- Improve gold paths for F04 (Hilltop address), F09 (FBN/current ops), ops-category facts
- Ensure WORLD_STATE + today daily are index-visible / query-rewrites in eval runner
- Dream/eval-self exclusion hardened in `scripts/retrieval-eval.mjs` + report
- Re-run full 15-fact; update scorecard canonical row  
**Acceptance:** filtered hit@3 **≥0.70** first mile (stretch 0.80); no score theater  
**ROI:** Memory-before-truth reliability

#### C4. Memory-search reliability probe + recovery
**Why:** Tool `database is not open` while CLI works = silent main-session blindness.  
**Deliverables:**
- `scripts/memory-health-probe.mjs` — CLI search + sqlite presence + ollama embed ping; exit codes
- Procedure snippet: on tool fail → probe → reindex guidance (read-only recommend)
- Log one baseline probe result  
**Acceptance:** Probe green on healthy host; documents fail modes  
**ROI:** Stops invisible recall outages

### P1 — Compounding (next)

#### C5. Trajectory closeout CLI
- `scripts/trajectory-closeout.mjs` — prompts/template append to `trajectory-log.md` + optional scorecard touch
- Makes Procedure 13 one command

#### C6. Verifier skill (Skill Workshop proposal)
- `verifier-pass-v1` proposal: inputs claim list + evidence paths; outputs verified/pending/rejected table
- No auto-apply; workshop only

#### C7. Memory-before-speech meter v0
- Sampling method: N recent main turns / AM verbose logs if available
- Write meter into scorecard even if manual first week

#### C8. Wiki compile pack (ops entities)
- Deterministic pages: Hilltop, FBN/Vista license, Harness meters, Sister porch
- wiki-maintainer compatible frontmatter

#### C9. Scout→Worker→Verifier dry harness
- Scripted spawn brief templates + acceptance checklist (no production money paths)

### Explicitly deferred (Jason 7/29)
- OpenRouter 402 / fallback reorder
- encrypted_content sticky (unless it blocks Grok 4.5 primary — then diagnose only)
- AM timeout retune (unless probe proves it)
- Multi-model fallback “resilience” projects
- Embodiment / Optimus research
- Casino/prediction chambers

---

## 7. Model policy (Jason directive — operational)

| Rule | Value |
|------|--------|
| Primary brain | **xai/grok-4.5** |
| Until | **Grok 4.6 ships** |
| Fallback engineering | **Do not pursue** as a project |
| If session stuck on other model | Prefer `/model` lock / new session on grok-4.5; report stickiness; no fallback redesign |

Note: `openclaw status` observed at least one dashboard session on `zai/glm-5.1` (fallback selected). Treat as **stickiness incident**, not a reason to rebuild fallback ladder.

---

## 8. Recommended Cursor batch order

**Tonight batch (if energy):** **C1 → C2 → C4** (suite + claim guard + memory health)  
**Next session:** **C3** (retrieval attack) with fresh scorecard  
**Later:** C5–C9

Default if Jason says “go cursor alpha”: start **C1** (task eval suite) — highest unique alpha vs more memory prose.

---

## 9. Audit notes

| Claim class | Notes |
|-------------|-------|
| Direct observation | MEMORY size trim; scorecard rows; procedures; memory status 340/340; CLI search works; tool flake event; status model stickiness |
| Prior internal research | 7/27 top harness doc — still valid structure |
| Secondary web/X | Directional only; used for framing not durable facts |
| Not done | No config writes this research; no Cursor dispatch until Jason picks |

---

## 10. Success if we execute

In 7 days we can say with evidence:
1. Nova-task suite pass-rate exists and is non-theater  
2. Claim-guard catches bare “done/fixed/verified”  
3. Retrieval filtered hit@3 moved up from 0.60 with a new scorecard row  
4. Memory health probe is green on heartbeat path  
5. Still on Grok 4.5 — no fallback rabbit hole  

That is top-percentile harness behavior. Not hype.
