# Worker packet — REGRESSION-RISK class (Swarm CHI · 2026-08-06)

**Worker:** deepseek/deepseek-v4-flash (subagent) · **Mode:** read-only · **Class:** regression-risk
**Scope:** harness scripts (session-startup, claim-guard, cursor-worker, memory-health) + their tests
**Live probes run:** `node scripts/test-session-startup.mjs` (13/13 PASS) · claim-guard `--text` probes (2) · `agent status --format json` · bundle string grep of cursor-agent 2026.07.23-e383d2b
**Note re task hint:** "empty-evidence false clears already fixed?" → **YES, confirmed fixed.** `claim-guard-lib.mjs:51-65` requires non-whitespace body after `EVIDENCE:`/`Source:`/`CHECKED:`; unit tests `test-claim-guard.mjs:141-160` cover bare + whitespace-only (violation) and filled (cleared). Fixed in 8/1 CHI pack (fix-123 report). A **different, unfixed claim-guard hole** is reported below.

---

## Finding 1 — claim-guard: bullet-block evidence walk bypasses the ±window entirely (live evasion, untested path)

- **Failure mode:** A bare banned word ("done", "fixed", …) anywhere in a long bullet list is auto-cleared by any evidence-bearing line *anywhere* in the same bullet block — no distance cap. `isEvidenceNearby` (`claim-guard-lib.mjs:212-240`) first checks ±windowLines, then walks the full contiguous bullet block (`findBulletBlockStart/End`, `:262-300`) with **no length limit**; blank line alone terminates the block. Evidence itself is loose: `lineHasPathOrCmd` (`:140-148`) counts `\bopenclaw\s+`, any bare path, `sha256`, `https://` as evidence.
- **Trigger (live-probed, reproduced):** `node scripts/claim-guard.mjs --json --window 2 --text '<11-line bullet list, "harness is done" at line 1, "EVIDENCE: `scripts/test-session-startup.mjs` exit 0" at line 11>'` → **violations: 0, cleared: 1, reason `evidence_nearby`** at distance 9 (window=2). Same input as plain paragraphs → violation at distance 3 (tested at `test-claim-guard.mjs:102-104` — but that test uses plain lines, so the bullet-block path is **not covered by any test**).
- **Current mitigation:** None. The 8/1 fix only closed the empty-`EVIDENCE:` variant. `isIndentedContinuation` (`:253`) also treats 2+-space indented blocks (code fences, indented lists) as part of the walk, widening it further.
- **Blast radius:** This is the harness's own anti-false-claim gate; swarm reports and trajectory closeouts written as long bullet lists get false "clean" verdicts — the exact silent regression the gate exists to prevent.
- **Proposed guard:** Cap block walk to `windowLines` from the claim line (or require evidence within min(block, window) of claim); add unit test: bullet list, claim at top, EVIDENCE at distance > window → expect violation; add test that `openclaw`-mention alone 6+ lines away does not clear.
- **Effort:** S–M · **Confidence:** High (live-reproduced)

## Finding 2 — session-startup: total memory_search outage is design-baked to look green, stamps completedAt, never retries, no durable trace

- **Failure mode:** `runStartup` sets `ok = criticalMissing.length === 0` (`session-startup-lib.mjs:431`) — search results are **excluded from ok**. `runMemorySearch` (`:161-186`) swallows every error (timeout, CLI failure, JSON parse error) into `{ok:false, error}`. On `ok` the state stamps `completedAt` (`:457-468`) → same session re-run returns `SKIPPED_ALREADY_COMPLETED` (`:355-363`) → **no retry**. Failure only surfaces as "unavailable (error)" lines inside `<session_startup_context>` (internal context, not user-visible, not logged to a file).
- **Trigger:** `openclaw memory search` CLI flag/shape change (parse break in `extractJsonPayload`, `:139-152`), ollama/embed outage, slow cold start (CLI budget 20s/query ×2 concurrent ≈ up to 20s wall, vs agent tool's hardcoded 15s — comment at `:31-33`).
- **Current mitigation:** `searchSummary` lines in injected internal context (weak — invisible to user and to any log the user reads); heartbeat's memory check runs `memory-health-probe --quick` (see Finding 3 note) which skips the search path entirely.
- **Evidence it's baked in, not a bug:** `test-session-startup.mjs:202-218` "memory-search unavailable fallback" **asserts `result.ok === true` when every search fails**. So the design treats retrieval as optional with no alert channel.
- **Blast radius:** After any search-infra outage, every main session silently runs without LIGHT retrieval; nobody sees it until mid-session retrieval actually matters. (Side note: `.openclaw/session-startup-state.json` is 51KB and grows unboundedly with one entry per session incl. test sessions — every startup rewrites the whole JSON.)
- **Proposed guard:** (a) on any search failure, write a one-line warning to the daily memory file and/or stderr: "LIGHT retrieval degraded: N/2 failed (<err>)" — durable, user-visible trace; (b) add a CLI contract test: run `runMemorySearch` against the real `openclaw` binary asserting JSON shape `[{path,score,text}]` (guards against silent flag-rename breaks); (c) keep ok=true (don't fail startup on retrieval) but expose `searchFailures` in the marker. 
- **Effort:** S (guard) · **Confidence:** High (code + test evidence)

## Finding 3 — cursor-worker auth gate false-clears when logged out: substring grep matches "Not logged in"

- **Failure mode:** `scripts/cursor-worker.sh:45`: `if ! agent status 2>&1 | grep -qi 'logged in'; then` — "Not logged in" **contains** "logged in", so a logged-out status passes the gate; the `CURSOR_API_KEY` fallback branch (exit 2 + clear guidance) is skipped and the worker proceeds to run `agent` unauthenticated → confusing error or hang, with no timeout on the `agent status` call. Identical grep duplicated in `scripts/test-cursor-worker.sh:37` (so the test gate has the same false-clear).
- **Trigger:** token expiry/revocation between runs (refresh-token loss, credential-store reset).
- **Evidence:** Verified in the installed CLI bundle (`~/.local/share/cursor-agent/versions/2026.07.23-e383d2b/*.js`): "Not logged in" ×7, "not logged in" ×1, "Logged in as" ×12 — i.e., the logged-out text output does contain the substring. Robust field exists: `agent status --format json` → `{"status":"authenticated","isAuthenticated":true,...}` (live-probed). Model pin itself is intact (default `cursor-grok-4.5-high`, raw-mode pinning covered by test-cursor-worker structural checks) — the auth gate is the brittle part.
- **Current mitigation:** None beyond the grep; worker `set -euo pipefail` propagates the downstream agent failure exit code, but the actionable "not authenticated" path is bypassed.
- **Proposed guard:** parse JSON: `agent status --format json` → assert `"isAuthenticated": true` (or `"status":"authenticated"`); wrap in `timeout 10`; add test with a fake `agent` on PATH emitting "Not logged in" → expect exit 2 + guidance, not a run attempt.
- **Effort:** S · **Confidence:** High (bundle strings verified; JSON field live-probed)

---

## Note (folded, not a separate finding)

- `memory-health-probe --quick` (the only mode the heartbeat uses — `memory/heartbeat-state.json` checkResults.memory today: "memory-health-probe --quick PASS; embed 224ms; Indexed 489/489") **skips search smoke, latency, and concurrent checks** (`memory-health-probe.mjs:38,54,172`). So the monitoring path never exercises the same `memory_search` path Finding 2 depends on; full probe exists but is on-demand only. Suggested: run the full probe (with search smoke) at least 1×/day in heartbeat rotation; document the 0/1/3 exit-code contract (`overallToExitCode`, `memory-health-lib.mjs:1748-1752`) for scripted consumers.

---

## Status / Evidence / Confidence / Scope

- **Status:** COMPLETE — 3 findings, all with concrete file evidence; 2 live-probed, 1 mechanism-verified against installed CLI bundle.
- **Evidence:** `scripts/lib/claim-guard-lib.mjs:212-240,262-300` + live probe output (violations 0 / cleared 1 at distance 9); `scripts/lib/session-startup-lib.mjs:161-186,431,457-468` + `scripts/test-session-startup.mjs:202-218`; `scripts/cursor-worker.sh:45` + `scripts/test-cursor-worker.sh:37` + bundle strings + `agent status --format json`.
- **Confidence:** F1 High · F2 High · F3 High (overall High)
- **Scope touched:** read-only; wrote only this packet. Ran: `test-session-startup.mjs` (13/13 PASS, fixture-safe), 2 claim-guard `--text` probes (no file writes), `agent status` probes (no auth change). No edits, no config, no git writes.
- **Harness green-lines confirmed while probing:** test-session-startup 13/13 PASS; claim-guard empty/whitespace-EVIDENCE fix present + tested; cursor model pin intact (cursor-grok-4.5-high); memory-health --quick PASS today (489/489).
