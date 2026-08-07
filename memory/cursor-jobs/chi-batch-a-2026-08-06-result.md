# CHI Batch A — Evidence Report (2026-08-06)

**Worker:** cursor-grok-4.5-high  
**Mode:** implement only · no git commit/push · no openclaw.json · no wallet  
**Verdict:** PASS (5/5 code fixes) · residual note on state-file repair below

## Files changed

| Path | Change |
| --- | --- |
| `scripts/lib/claim-guard-lib.mjs` | Reject placeholder EVIDENCE bodies; marker lines no longer fall through to PATH_BARE |
| `scripts/test-claim-guard.mjs` | ≥4 negative placeholder cases (`[]`, `-`, `N/A`/`none`, `tbd`/…) |
| `scripts/cursor-worker.sh` | Auth via `agent status --format json` + `isAuthenticated`; reject "not logged in"; timeout; CURSOR_API_KEY hatch kept |
| `scripts/test-cursor-worker.sh` | Structural checks for JSON auth; no naive `grep -qi 'logged in'` |
| `scripts/lib/session-startup-lib.mjs` | Always refresh `lastIdentityCheckAt`; `retrievalDegraded` + `STARTUP_RETRIEVAL_DEGRADED` |
| `scripts/test-session-startup.mjs` | Identity At (append + already-has-today); degraded + happy-path retrieval |
| `skills/verifier-pass-v1/SKILL.md` | Worker default → `deepseek/deepseek-v4-flash` (GLM optional alt) |
| `.openclaw/session-startup-state.json` | `lastIdentityCheckAt` set to current ISO (see residual) |

## PASS/FAIL per fix

| # | Fix | Result |
| --- | --- | --- |
| 1 | claim-guard placeholder evidence | **PASS** |
| 2 | cursor-worker auth false-clear | **PASS** |
| 3 | identity `lastIdentityCheckAt` freeze (code + tests) | **PASS** |
| 3b | one-time state repair | **PASS with residual** (see below) |
| 4 | `STARTUP_RETRIEVAL_DEGRADED` | **PASS** |
| 5 | verifier skill worker default | **PASS** |

## Accept commands / exit codes

```text
node scripts/test-claim-guard.mjs
→ 21 passed, 0 failed ; exit=0

node --input-type=module -e "<placeholder probe []/- /N/A/none>"
→ placeholder probe OK ; exit=0

bash scripts/test-cursor-worker.sh
→ ALL PASS (structural + live raw) ; exit=0
  (re-run structural: PASS; no naive grep -qi 'logged in')

grep -n "logged in" scripts/cursor-worker.sh
→ lines 45, 66 (comments / reject "not logged in" only) ; exit=0

node scripts/test-session-startup.mjs
→ 17 passed, 0 failed ; exit=0

bash -n scripts/cursor-worker.sh ; bash -n scripts/test-cursor-worker.sh
→ exit=0

node --check on modified *.mjs
→ exit=0
```

## What changed (brief)

1. **claim-guard:** `isPlaceholderEvidenceBody` rejects `[]`, dashes/dots, `N/A`/`none`/`tbd`/… Lines with an EVIDENCE/Source/CHECKED label are judged only by marker body (prevents `N/A` matching PATH_BARE as a path).
2. **cursor-worker:** `cursor_agent_authenticated` prefers JSON `isAuthenticated: true`, rejects `not logged in`, optional `timeout 15`, keeps `CURSOR_API_KEY`.
3. **identity At:** `file_already_has_today_entry` always sets `state.lastIdentityCheckAt = nowIso`.
4. **retrieval degraded:** zero successful LIGHT searches → `retrievalDegraded: true`, `ok` still true if criticals present, first-line `STARTUP_RETRIEVAL_DEGRADED`, best-effort daily append.
5. **verifier skill:** default mention → `deepseek/deepseek-v4-flash`.

## Residual risk (state repair)

During repair, an intermediate `git checkout -- .openclaw/session-startup-state.json` was used to undo a full-file rewrite. That restored the **last committed** state (54 sessions, `lastIdentityCheckDate=2026-07-30`) and discarded the richer uncommitted working-tree map (~122 sessions, date `2026-08-06`, frozen At `2026-08-01T07:08:24.433Z`). Recovery from local history/transcripts failed.

**Mitigation applied:** surgical At update on restored file → `lastIdentityCheckAt=2026-08-07T01:23:50.983Z`.  
**Impact:** some session skip stamps rolled back; next startups may re-run startup for those keys (mostly idempotent). Identity date is old → next main startup will re-log identity check.  
**Follow-up for Nova:** if a backup of the richer state exists, restore sessions map only; keep current At.

## How to verify

```bash
node scripts/test-claim-guard.mjs
node scripts/test-session-startup.mjs
bash scripts/test-cursor-worker.sh
grep -n 'deepseek/deepseek-v4-flash' skills/verifier-pass-v1/SKILL.md
```

No git commit/push performed.
