# Coverage Packet — Worker A: SUPERSEDED + LIVE-TABLE Guards

**Run:** 2026-08-06-coverage · **Worker:** A (superseded-guards) · **Mode:** READ-ONLY
**Date:** 2026-08-06 · **Requester session:** agent:main:dashboard:e2272569

## status

COMPLETE — read-only inspection done; no files modified, no tests implemented.

## 1. Existing coverage (paths + what they assert)

| Path | What it asserts | Covers SUPERSEDED stubs? |
|------|-----------------|--------------------------|
| `scripts/test-session-startup.mjs` (13 tests, fixture-based) | Startup ritual: SOUL/USER/MEMORY load, WORLD_STATE freshness (7d), retrieval-degradation fallback, identity-check append, skip-on-rerun semantics, exit codes. Fixtures write `memory/procedural-memory-v1.md` as **empty placeholder** (`# Proc\n`) — content never asserted. | **No.** Loads the file, never checks its status/structure. |
| `scripts/test-claim-guard.mjs` (~21 tests) | Banned-word semantics (`done/fixed/verified/clean/working/pushed/live/shipped`), ±2 evidence window, placeholder-EVIDENCE rejection, fixture file scans. | **No.** Pure string/fixture semantics; no structural assertions on real docs, zero knowledge of "superseded" concept. |
| `scripts/test-memory-health.mjs` (~16 tests) + `scripts/memory-health-probe.mjs` | Infra health only: node ≥24.15 gate, sqlite "database is not open" / timeout classification, embed/search latency cliffs, status parsing. | **No.** Probes the memory stack, not doc structure. |
| `scripts/test-git-lockin-inventory.mjs`, `test-protected-settings-guard.mjs`, `test-error-doctor.mjs`, `test-nova-task-grade.mjs`, `test-trajectory-closeout.mjs`, `test-retrieval-eval.mjs`, `test-swv-dry-harness.mjs`, `test-active-memory-smoke.mjs`, `test-memory-before-speech.mjs` | Feature-specific unit tests (git state, config protection, grading, retrieval eval, etc.). | **No.** |

**Cross-cutting evidence:**
- `grep -rn -i "superseded" scripts/` → **zero hits.** No script in the repo knows the concept exists.
- `grep -rn "priority-dashboard" scripts/ memory/procedural-memory-v1.md AGENTS.md HEARTBEAT.md` → **zero hits.** Nothing reads the dashboard; if it silently came back to life, no code path would notice.
- No CI (.github absent), no cron/HEARTBEAT wiring runs the test suites; they run manually per the claim-ledger verification pattern (`node scripts/test-X.mjs` exit 0 + report to `memory/cursor-jobs/`).

**Current state of the two targets (verified clean today):**
- `memory/priority-dashboard.md` (1.4 KB, mtime 19:00): `**Status:** SUPERSEDED 2026-08-06`; no `| URGENT | N |`-style task rows (grep for table rows → none); the only URGENT/IMPORTANT words are prose explaining the file *used to be* that. Explicit "do not migrate/resurrect" language present.
- `memory/procedural-memory-v1.md` line 140: `## 3. Memory/Session Consolidation Closeout` → `**Status:** SUPERSEDED 2026-08-06`, superseded by Proc 15/21/23 + `memory/session-consolidation-v1.md`, with "Do not treat this heading as an active commit/push checklist." Numbering kept (section header still exists).
- Manual verification happened 2026-08-06 (daily note: "Chair verify: no Get-tomorrow/Active-buyer/etc rows") — human-in-the-loop, not automated.

**Important false-positive finding:** `node scripts/claim-guard.mjs --soft memory/priority-dashboard.md memory/procedural-memory-v1.md` → **6 violations** on the *currently clean* stubs (bare `live` at dashboard:6/10, proc:545/711/712, bare `working` at proc:684 — all legitimate prose like "Canonical live source" / "not a live dashboard"). ⇒ claim-guard **cannot** be repurposed as the stub guard; a stub guard needs its own structural assertions (status header present, no task-shaped table rows, no active checklist), not banned-word scanning.

## 2. Gaps (highest ROI first)

1. **No structural guard on `memory/priority-dashboard.md`** — the highest-risk doc: it *was* the live task table; its own text warns stale 6/23 rows must not be migrated/resurrected. A single restored `| URGENT | N | …` row (or a re-added `**Status:** LIVE` header) is invisible to every existing test. (ROI: high — it is the doc Jason explicitly feared regressing; daily 2026-08-06 confirms manual-only verify.)
2. **No structural guard on the Proc 3 SUPERSEDED stub in `procedural-memory-v1.md`** — if someone re-activates the commit/push checklist under heading 3 (removes SUPERSEDED status, adds `git commit` steps), no test catches it; the startup lib loads the file every session but asserts nothing. (ROI: high — same failure class, and startup reads it daily so a cheap in-suite check rides existing infra.)
3. **No automated wiring / regression hook** — verification is manual (claim-ledger pattern, human-gated). Nothing in session-startup, HEARTBEAT, or cron runs these suites, and claim-guard demonstrably false-positives on stub prose (6 violations on clean files), so "wire claim-guard over stubs" is a trap. (ROI: medium — closes the "silently" in the question; requires fixture-based tests so they run anywhere.)
4. **Lower ROI:** claim-guard has no banned-word for resurrection language ("resurrect", "re-activate", "restore from dashboard"); memory-health-probe checks infra not doc structure; no guard covers *other* past-superseded docs (MEMORY.md C7/C8 annotation, assumption-registry stale rows) — out of scope for this question.

## 3. Top-3 gap proposals (test file + cases + effort — NOT implemented)

### Gap 1 → `scripts/test-superseded-stubs.mjs` (or split: `test-priority-dashboard.mjs`) — Effort **S**
Fixture-based (pattern of `test-session-startup.mjs`): copy current stub into tmp workspace, assert structure.
- Case 1: file exists AND contains `**Status:** SUPERSEDED` on/near line 3. (Deletion or status flip → FAIL.)
- Case 2: no markdown table row matching `^\s*\|(URGENT|IMPORTANT|ONGOING|MONITORING)\s*\|` anywhere; also reject any `| … | N |` row with a bare number cell + task text (the old firehose shape).
- Case 3: no `**Status:** LIVE` / `**Status:** ACTIVE` header variant.
- Case 4: canonical-pointer block present (`WORLD_STATE.md` referenced as live ops source).

### Gap 2 → same file, `procedural-memory-v1.md` Proc 3 section — Effort **S**
- Case 1: section `## 3. Memory/Session Consolidation Closeout` exists (renumber/rename → FAIL) and contains `**Status:** SUPERSEDED`.
- Case 2: within the Proc 3 section (from its heading to next `## `), no `git commit` / `git push` / `CHECKLIST` of actionable steps (i.e., the stub must stay stub-shaped, not checklist-shaped).
- Case 3: superseded-by pointer present (mentions Proc 15, 21, 23 and `session-consolidation-v1.md`).
- Case 4: "do not treat as active commit/push checklist" warning line present.

### Gap 3 → fixture-based harness + runnable on real workspace — Effort **M**
- Case 1: real-workspace mode (`node scripts/test-superseded-stubs.mjs --workspace .`) exits 0 on the current clean stubs.
- Case 2: mutation fixture — inject `| URGENT | 1 | Vista license |` into a copied dashboard → exit 1.
- Case 3: mutation fixture — remove SUPERSEDED status + add `- git commit -m` to copied Proc 3 section → exit 1.
- Case 4: regression hook — add run to the session-startup suite invocation (or a documented claim-ledger entry + HEARTBEAT check), so the guard runs with the other memory suites rather than only on explicit request.

**Design note for Gap 3 (why fixture mode matters):** assertions must run against *copies* with injected mutations (like `test-session-startup.mjs` tmp workspaces), never require the real workspace to be dirty — keeps it runnable in any checkout and gives clean PASS/FAIL demos.

## evidence

- Direct reads: `memory/priority-dashboard.md` (full), `memory/procedural-memory-v1.md` lines 130–160 (Proc 3 stub) + 684/701/711–712 context.
- Executed: `grep -rn -i "superseded" scripts/` → 0 hits; `grep -rn "priority-dashboard" scripts/ …` → 0 hits; `grep -n "test(" scripts/test-memory-health.mjs`; `ls scripts/` (12 test-*.mjs); `ls .github` (absent); `crontab -l` (no test/guard jobs); `.openclaw/session-startup-state.json` shows only a one-off `test-session-startup` session.
- Executed: `node scripts/claim-guard.mjs --soft memory/priority-dashboard.md memory/procedural-memory-v1.md` → 6 violations / 49 cleared / 750 lines (false-positive proof).
- Read: `scripts/test-session-startup.mjs` (full), `scripts/test-claim-guard.mjs` (full), `scripts/claim-guard.mjs` CLI help (defaults: `--globs`, `--window 2`, strict exit 1), `scripts/lib/session-startup-lib.mjs` load set (line 18 includes procedural-memory-v1.md; no priority-dashboard; WORLD_STATE freshness only).
- Daily context: `memory/2026-08-06.md` lines 85/104 (Proc 3 → SUPERSEDED stub; dashboard → SUPERSEDED, chair verify manual).

## findings (summary)

1. Both target stubs are **currently clean** (SUPERSEDED status present, zero live task rows, no active checklist).
2. **Zero automated coverage exists** for superseded-stub integrity — no script mentions "superseded"; nothing reads priority-dashboard.md; startup loads procedural-memory-v1.md but never asserts its structure.
3. claim-guard **cannot** serve as the guard (6 false violations on clean stubs — bare "live"/"working" in prose).
4. Verification is manual-only (daily 2026-08-06 chair-verify note); no CI/cron wiring for any test suite.
5. Highest-risk resurrection vector: re-adding a firehose row to priority-dashboard.md (zero readers = zero detectors), then Proc 3 checklist re-activation.

## confidence

**High** on all factual claims (direct file reads + executed greps + live claim-guard run against the real stubs). **Medium-high** on risk ranking — the resurrection scenario is concrete (daily notes show Jason explicitly feared stale-row migration), but no historical re-lapse has occurred yet, so real-world frequency is unproven.

## scope_touched

- Read: `memory/priority-dashboard.md`, `memory/procedural-memory-v1.md` (Proc 3 region + related lines), `scripts/test-session-startup.mjs`, `scripts/test-claim-guard.mjs`, `scripts/claim-guard.mjs`, `scripts/memory-health-probe.mjs`, `scripts/test-memory-health.mjs`, `scripts/lib/session-startup-lib.mjs` (load set), `memory/2026-08-06.md` (lines 85/104), `memory/claim-ledger.md` (test-evidence entries), `.openclaw/session-startup-state.json`.
- Executed (read-only): grep scans of scripts/, docs, crontab; `node scripts/claim-guard.mjs --soft …` (no writes, soft mode).
- Wrote: this packet only.
- **No files modified; nothing implemented.**
