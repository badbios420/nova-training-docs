# Cursor implement brief — CHI Batch A (2026-08-06)

**Model:** cursor-grok-4.5-high (pinned via worker)  
**Chair:** Nova · Jason your-call = Batch A  
**Mode:** implement only listed items · no git commit/push · no openclaw.json · no wallet  
**Evidence report:** write `memory/cursor-jobs/chi-batch-a-2026-08-06-result.md` when done

## Scope (5 fixes)

### 1. claim-guard placeholder evidence (HIGH)
**File:** `scripts/lib/claim-guard-lib.mjs` + `scripts/test-claim-guard.mjs`

`lineHasFilledEvidenceMarker` currently treats any non-whitespace after `EVIDENCE:`/`Source:`/`CHECKED:` as filled. That false-clears:
- `EVIDENCE: []`
- `EVIDENCE: -`
- `EVIDENCE: N/A` / `none` / `tbd` / `todo` / `pending` / `placeholder` / `later`

**Fix:** After trim, reject placeholder bodies (empty brackets, only dashes/dots, known placeholder words). Real paths/URLs/commands still count.

**Tests:** Add ≥4 negative cases proving `done`/`fixed` stays a **violation** with those placeholders nearby; keep existing empty/whitespace tests green.

**Accept:**
```bash
node scripts/test-claim-guard.mjs   # all pass
node --input-type=module -e "
import * as cg from './scripts/lib/claim-guard-lib.mjs';
for (const body of ['[]','-','N/A','none']) {
  const r = cg.scanText('Status: done\\nEVIDENCE: '+body, 'p.md');
  if (r.stats.violations < 1) { console.error('FAIL still clears', body); process.exit(1); }
}
console.log('placeholder probe OK');
"
```

### 2. cursor-worker auth false-clear (HIGH)
**File:** `scripts/cursor-worker.sh` + `scripts/test-cursor-worker.sh`

Bug: `agent status 2>&1 | grep -qi 'logged in'` matches **"Not logged in"**.

**Fix:** Prefer `agent status --format json` and require `"isAuthenticated": true` (or equivalent field). Fallback: match positive login without matching "not logged in". Add `timeout` on status call if easy. Keep CURSOR_API_KEY escape hatch.

**Tests:** Update structural tests so they don't encode the broken grep. If fake-agent easy, add false-clear case; else document structural check for isAuthenticated/json.

**Accept:**
```bash
bash scripts/test-cursor-worker.sh
# Script must NOT use naive grep -qi 'logged in' alone
grep -n "logged in" scripts/cursor-worker.sh   # should show fixed logic, not sole positive match
```

### 3. identity lastIdentityCheckAt freeze (HIGH)
**File:** `scripts/lib/session-startup-lib.mjs` + `scripts/test-session-startup.mjs`

In `maybeLogIdentityCheck`, branch `file_already_has_today_entry`:
```js
state.lastIdentityCheckAt = state.lastIdentityCheckAt || nowIso;  // BUG
```
Change to always `state.lastIdentityCheckAt = nowIso` when touching today's entry.

**Also:** One-time repair `.openclaw/session-startup-state.json` if present: set `lastIdentityCheckAt` to a current ISO (or delete only that stale field if safer). Do not wipe whole state.

**Tests:** Cover both branches (append + file_already_has_today_entry) asserting At updates.

**Accept:**
```bash
node scripts/test-session-startup.mjs
```

### 4. STARTUP_RETRIEVAL_DEGRADED (HIGH)
**File:** `scripts/lib/session-startup-lib.mjs` (+ tests)

When **both** LIGHT searches fail (or zero successful searches when queries were attempted):
- Keep `ok` true if critical files present (don't fail whole startup)
- Set `retrievalDegraded: true` on result
- `buildInternalContext`: first-line warning `STARTUP_RETRIEVAL_DEGRADED`
- Best-effort one-line append to today's daily `memory/YYYY-MM-DD.md` if easy and non-destructive

**Accept:** unit test with mocked failed searches shows degraded marker; happy path unchanged.

### 5. verifier skill stale worker default (S)
**File:** `skills/verifier-pass-v1/SKILL.md` ~line 161

Change `zai/glm-5.1` worker default mention → `deepseek/deepseek-v4-flash` (alt GLM ok to mention as optional).

## Out of scope
- OPT-1/2/3 (Batch B later)
- gmail scripts
- WORLD_STATE refresh
- git commit/push
- openclaw package 15s tool timeout (upstream)

## Completion gate (Procedure 19)
1. List files changed
2. Run all accept commands above; paste exit codes
3. Write result md with PASS/FAIL per fix
4. Do not claim done if any test fails
