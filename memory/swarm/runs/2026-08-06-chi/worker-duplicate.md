# CHI Worker — DUPLICATE class packet (2026-08-06)

**Worker:** deepseek/deepseek-v4-flash (read-only) · **Chair:** nova/xai-grok-4.5
**Mode:** read-only · no edits · no MEMORY promote
**Date:** 2026-08-06 18:09–18:15 PDT

---

## status: PASS

## evidence

- `ls scripts/` → 26 `.mjs` + 12 `test-*.mjs`; gmail twins present: `gmail-unsub-batch.mjs` (214 ln) vs `gmail-unsub-batch2.mjs` (199 ln)
- `diff scripts/gmail-unsub-batch.mjs scripts/gmail-unsub-batch2.mjs` → 327 changed lines (`grep -c '^[<>]'`), same workflow, same 17-sender list structure
- `grep -n LOG scripts/gmail-unsub-batch*.mjs` → **both** write to same path `memory/cursor-jobs/gmail-unsub-batch1-2026-07-28.md` (batch1 ln 11, batch2 ln 7) and both header it "Gmail Unsubscribe Batch 1"
- Sender fact drift: batch1:34 `phildong` q=`from:shared1.ccsend.com phildong` vs batch2:29 `["Phil Dong Insurance","from:phildongagency.com"]` — same sender, different search query
- Helper drift: batch1 `run()` timeout=60000/maxBuffer=10MB vs batch2 `sh()` timeout=90000/12MB; batch1 evaluates JS in page (evaluateUnsub), batch2 uses snapshot ref-click flow — two divergent implementations of the same unsub ritual
- `grep -n "CURSOR_MODEL\|cursor-grok-4.5-high" scripts/cursor-worker.sh` → ln 35 default pin, ln 76-77 status echo, ln 117-122 usage text
- `grep -n "cursor-grok" TOOLS.md` → ln 57-58 (default + override table), ln 75, 83-84 (dispatch examples)
- `grep -n "cursor-grok" docs/harness/swarm-protocol-v0.md` → ln 7 + ln 19 (implementer row)
- `memory/chambers/chamber-11-cursor-cjobs-model-policy-2026-08-01.md` → origin decision record ("pinned 2026-08-01", TOOLS.md:57)
- `sed -n 1,45p scripts/lib/session-startup-lib.mjs` → `STARTUP_FILES` = SOUL, USER, **MEMORY.md**, consolidation, procedural, failures, **memory-retrieval-policy-v1**, time-awareness
- `sed -n 9,45p AGENTS.md` → startup ritual: step 4 gates MEMORY.md read on **main session only**; lists heartbeat-state.json check; **omits memory-retrieval-policy-v1.md**; step 5-6 identity + time-awareness
- `grep -n "isMain\|mainSession\|shared" scripts/lib/session-startup-lib.mjs` → no context gate found; MEMORY.md read unconditionally in STARTUP_FILES (ln 16)
- `grep -rn "v24.18.0" TOOLS.md scripts/cursor-worker.sh | wc -l` → 4 (TOOLS.md:99, 168; cursor-worker.sh:22-23)

## findings

- **F1 — Gmail unsub twin scripts (merge):** `scripts/gmail-unsub-batch.mjs` vs `scripts/gmail-unsub-batch2.mjs` — same ritual duplicated with drifted data (phildong query differs → one searches wrong mailbox; timeouts/buffers differ; two different click implementations) and **shared single output file** so running both clobbers results. Costs: wrong unsubscribe targets (external action risk), double maintenance of 17-sender list, 327-line diff churn. Fix class: **merge** (one script + data-driven sender list, or canonical-ref 2→1). Effort: **M**. Confidence: **high**.
- **F2 — Cursor pinned model duplicated in 3 live places (canonical-ref):** `scripts/cursor-worker.sh:35` (executable truth) vs `TOOLS.md:57-58` vs `docs/harness/swarm-protocol-v0.md:7,19`. This exact failure mode (unpinned/wrong model on C-jobs) is what Chamber #11 (2026-08-01) was created to fix; a model change now requires 3 synchronized edits or jobs silently run on the wrong model. Fix class: **canonical-ref** — script is source of truth; docs point to `cursor-worker.sh status` / chamber-11 record. Effort: **S**. Confidence: **high**.
- **F3 — Startup ritual in prose vs code (canonical-ref):** `AGENTS.md` "Every Session" checklist (40+ lines, manual fallback) vs `scripts/lib/session-startup-lib.mjs` `STARTUP_FILES` + runStartup (automated path, claims "runs this ritual automatically"). Already diverged: code reads MEMORY.md unconditionally (AGENTS gates it to main session for shared-context security) and includes memory-retrieval-policy-v1.md (absent from AGENTS step 4). Costs: shared-context info-leak risk if automated path runs outside main session; drift when either side is edited. Fix class: **canonical-ref** — AGENTS.md should say "implemented by session-startup-lib.mjs (STARTUP_FILES), prose is fallback", or leave-intentional with explicit sync note. Effort: **S/M**. Confidence: **med**.
- Related note (not a full finding): Node path `v24.18.0` pinned 4× (TOOLS.md:99,168; cursor-worker.sh:22-23) — same version-pin class as F2; cheap to canonicalize on next node bump.

## confidence

high

## scope_touched

- scripts/gmail-unsub-batch.mjs, scripts/gmail-unsub-batch2.mjs (read + diff)
- scripts/cursor-worker.sh (read)
- scripts/session-startup.mjs, scripts/lib/session-startup-lib.mjs (read)
- TOOLS.md, AGENTS.md, HEARTBEAT.md (read)
- docs/harness/swarm-protocol-v0.md, docs/harness/*.md (read)
- memory/chambers/chamber-11-cursor-cjobs-model-policy-2026-08-01.md (read)
- .cursor/rules/nova-sidecar.mdc (read)
- memory/swarm/runs/2026-08-06-chi/scope.json (read)

No writes to any source file. Packet written to `memory/swarm/runs/2026-08-06-chi/worker-duplicate.md`.
