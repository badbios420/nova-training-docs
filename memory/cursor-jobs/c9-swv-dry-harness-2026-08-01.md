# C9 — Scout→Worker→Verifier dry harness (2026-08-01)

**Status:** PASS (Nova chair closeout 2026-08-01 ~02:01 PDT)  
**Priority:** P1 (alpha queue next after C8)  
**Jason:** go C9  
**Cursor model:** `cursor-grok-4.5-high` (pinned worker — Chamber #11 B)  
**Constraint:** No openclaw.json · no wallet/secrets · no money paths · no fallback ladder · no mass C1–C8 redo

## Why
C1–C8 shipped meters/guards. Swarm default (DeepSeek Flash) is runtime-proven. Missing piece: **repeatable Scout→Worker→Verifier (SWV) templates + mechanical acceptance** so multi-agent work is measured, not cosplay.

## Goal
Ship a **v0 dry harness** that:
1. Provides fill-in brief templates for Scout / Worker / Verifier
2. Validates brief structure mechanically
3. Emits ready-to-paste spawn task text (for OpenClaw `sessions_spawn`)
4. Records dry-run reports with evidence paths
5. Unit tests green; one checklist dry-run documented

**Does NOT** auto-spawn live agents from Node (OpenClaw session tools are agent-runtime). CLI prepares + grades; Nova/Cursor runs the live swarm.

## Deliverables (create/update)

### A. Spec
- `docs/harness/swv-dry-harness-v0.md` — purpose, roles, forbidden scopes, how to run, acceptance

### B. Templates (workspace-tracked)
Under `memory/evals/swv/`:
- `templates/scout-brief.md`
- `templates/worker-brief.md`
- `templates/verifier-brief.md`
- `templates/acceptance-checklist.md`
- `fixtures/sample-task.json` — one harmless dry task (e.g. audit claim-guard fixture gaps — read-only)

Template variables use `{{VAR}}` style at minimum:
`{{TASK_ID}}` `{{OBJECTIVE}}` `{{SCOPE_PATHS}}` `{{OUT_OF_SCOPE}}` `{{EVIDENCE_REQUIRED}}` `{{ACCEPTANCE}}` `{{MODEL_HINT}}` `{{PARENT_REF}}`

### C. CLI + lib
- `scripts/lib/swv-dry-harness-lib.mjs`
- `scripts/swv-dry-harness.mjs`
- `scripts/test-swv-dry-harness.mjs`

**CLI commands (required):**
```bash
node scripts/swv-dry-harness.mjs --help
node scripts/swv-dry-harness.mjs validate --task memory/evals/swv/fixtures/sample-task.json
node scripts/swv-dry-harness.mjs render --task ... --role scout|worker|verifier
node scripts/swv-dry-harness.mjs render-all --task ... [--out-dir memory/cursor-jobs/swv-runs/<id>/]
node scripts/swv-dry-harness.mjs checklist --task ... [--report memory/cursor-jobs/swv-runs/<id>/checklist.md]
node scripts/swv-dry-harness.mjs init-run --task ...   # creates run dir + rendered briefs + empty evidence stubs
```

Exit codes: `0` ok · `1` validation fail · `2` usage/infra

### D. Sample task (harmless)
`memory/evals/swv/fixtures/sample-task.json` fields:
```json
{
  "taskId": "SWV-DRY-001",
  "title": "Claim-guard fixture gap scout",
  "objective": "Read-only: list missing adversarial cases for claim-guard fixtures; propose test names only; no code edits.",
  "scopePaths": ["scripts/claim-guard.mjs", "scripts/lib/claim-guard-lib.mjs", "memory/evals/fixtures/claim-guard/", "scripts/test-claim-guard.mjs"],
  "outOfScope": ["openclaw.json", "wallet", "secrets", "MEMORY.md rewrite", "live send/spend", "C1-C8 mass redo"],
  "evidenceRequired": ["paths read", "proposed missing cases list", "no file writes claim"],
  "acceptance": ["3+ concrete missing cases OR explicit none-found with rationale", "each case maps to a test name", "no production money paths"],
  "modelHints": { "scout": "deepseek/deepseek-v4-flash", "worker": "deepseek/deepseek-v4-flash", "verifier": "deepseek/deepseek-v4-flash" },
  "parentRef": "C9 dry harness"
}
```

### E. Hooks
- Append Procedure **18** (or extend Proc 8) in `memory/procedural-memory-v1.md` — short SWV dry checklist pointing at CLI
- Alpha queue C9 → update status when PASS
- Optional one scorecard row for meter #7 subagent leverage (dry harness shipped)

### F. Job evidence
Update **this file** with PASS/FAIL table + command outputs.

## Role definitions (must appear in docs + templates)

| Role | Does | Does not |
|------|------|----------|
| **Scout** | Read-only inventory, prior art, risks, open questions | Edit product code; claim done |
| **Worker** | Implement only within scopePaths; produce evidence paths | Expand scope; touch forbidden paths; sole-verify |
| **Verifier** | Checklist vs evidence; mark verified/pending/rejected | Rewrite worker output as truth without checks; chair synthesis |

**Chair (Nova)** always synthesizes live runs. Verifier is mechanical/checklist, not final promote.

## Acceptance (Nova will re-run)

1. All deliverable paths exist  
2. `node scripts/test-swv-dry-harness.mjs` → all pass exit 0  
3. `validate` sample-task → exit 0  
4. `render-all` + `init-run` produce briefs with no leftover `{{` required vars  
5. `checklist` writes a report  
6. No openclaw.json / wallet / secrets touched  
7. Docs state clearly: CLI does not auto-spawn agents  

## Out of scope
- Live gateway spawn from Node
- Money/browser/wallet
- Redesign of C1–C8
- Changing swarm default model in config

## Verify commands
```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/test-swv-dry-harness.mjs
node scripts/swv-dry-harness.mjs --help
node scripts/swv-dry-harness.mjs validate --task memory/evals/swv/fixtures/sample-task.json
node scripts/swv-dry-harness.mjs init-run --task memory/evals/swv/fixtures/sample-task.json
```

## Evidence (Cursor worker 2026-08-01)

**Worker status:** deliverables A–F shipped · **pending Nova verify** before DONE  
**Alpha queue:** C9 → IN PROGRESS

### PASS/FAIL table

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Deliverable paths exist | **PASS** | docs + templates + fixtures + lib/CLI/tests |
| 2 | `node scripts/test-swv-dry-harness.mjs` | **PASS** exit 0 | 14/14 unit tests |
| 3 | `validate` sample-task | **PASS** exit 0 | SWV-DRY-001 |
| 4 | `render-all` / `init-run` no leftover required `{{VAR}}` | **PASS** | all roles + checklist clean |
| 5 | `checklist` writes report | **PASS** | `swv-runs/SWV-DRY-001-c9-verify/checklist-report.md` |
| 6 | No openclaw.json / wallet / secrets | **PASS** | git status clean on those paths |
| 7 | Docs: CLI does not auto-spawn | **PASS** | stated in doc + CLI help + Procedure 18 |

### Commands run (exits)

```text
$ export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"

$ node scripts/test-swv-dry-harness.mjs
# 14 passed, 0 failed
# exit=0

$ node scripts/swv-dry-harness.mjs --help
# Usage: node scripts/swv-dry-harness.mjs <command> [options]
# exit=0

$ node scripts/swv-dry-harness.mjs validate --task memory/evals/swv/fixtures/sample-task.json
# swv-dry-harness: validate OK — SWV-DRY-001
# exit=0

$ node scripts/swv-dry-harness.mjs init-run --task memory/evals/swv/fixtures/sample-task.json --run-id SWV-DRY-001-c9-verify
# swv-dry-harness: init-run OK — SWV-DRY-001-c9-verify
# runDir: memory/cursor-jobs/swv-runs/SWV-DRY-001-c9-verify
# exit=0

$ node scripts/swv-dry-harness.mjs checklist --task memory/evals/swv/fixtures/sample-task.json \
    --report memory/cursor-jobs/swv-runs/SWV-DRY-001-c9-verify/checklist-report.md
# exit=0
```

### Hooks

- Procedure **18** appended to `memory/procedural-memory-v1.md`
- Alpha queue C9 → **IN PROGRESS** (pending Nova verify)
- Optional scorecard meter #7 touch: `memory/harness-scorecard.md` (dry-harness-v0)

### Residual risks

- Live SWV spawn still manual (by design)
- Sample task is dry/read-only only — does not prove live DeepSeek swarm quality
- Nova must re-run acceptance before marking alpha-queue DONE

---

## Nova chair closeout — 2026-08-01 ~02:01 PDT

### Acceptance re-run

| # | Check | Result |
|---|-------|--------|
| 1 | Deliverables exist | PASS |
| 2 | Unit tests | PASS 14/14 exit 0 |
| 3 | validate sample | PASS |
| 4 | init-run SWV-DRY-001-nova-verify | PASS; rendered briefs clean |
| 5 | checklist/report | PASS |
| 6 | No openclaw.json/wallet/secrets | PASS |
| 7 | Docs: no auto-spawn | PASS |
| 8 | Live SWV dry run | PASS — Scout+Worker+Verifier all `deepseek/deepseek-v4-flash` |

### Live SWV-DRY-001
- Run dir: `memory/cursor-jobs/swv-runs/SWV-DRY-001-nova-verify/`
- Scout: inventory + 20 gap proposals (read-only)
- Worker: `evidence/worker.md` — 18 cases with test names; product paths untouched
- Verifier: `evidence/verifier.md` — overall PASS; 3/3 independent re-probes match
- Chair spot-check: empty `EVIDENCE:` still clears bare `done` (exit 0) — real scanner gap, not theater
- Cursor implement model: `cursor-grok-4.5-high` (log 20260801-015129-write.log)

### Queue / trajectory
- Alpha queue C9 → **DONE 8/1**
- Trajectory: win — C9 SWV dry harness + live Flash SWV-DRY-001
- Follow-up (optional C10): claim-guard adversarial tests cases 1–8 + 9–10; not auto-implement tonight

### Chair verdict
**C9 PASS.** Harness alpha loop closed: pin Cursor → implement templates → swarm SWV → chair grade.
