#!/usr/bin/env bash
# Smoke: cursor-worker raw mode pins cursor-grok-4.5-high and logs model=.
# Run: bash scripts/test-cursor-worker.sh
set -euo pipefail
ROOT="/home/mrbig3/.openclaw/workspace"
cd "$ROOT"
WORKER="$ROOT/scripts/cursor-worker.sh"
JOBDIR="$ROOT/memory/cursor-jobs"
PIN="cursor-grok-4.5-high"
MARKER="RAW_PIN_OK"

if [[ ! -x "$WORKER" ]]; then
  echo "FAIL: worker not executable: $WORKER" >&2
  exit 1
fi

# Dry structural check: raw branch must call log_header and inject --model
if ! grep -q 'log_header' "$WORKER"; then
  echo "FAIL: log_header missing from worker" >&2
  exit 1
fi
if ! grep -A20 '^  raw)' "$WORKER" | grep -q -- '--model'; then
  echo "FAIL: raw branch does not reference --model inject" >&2
  exit 1
fi
if grep -A15 '^  raw)' "$WORKER" | grep -q 'exec agent'; then
  echo "FAIL: raw still uses bare exec (prevents tee/log)" >&2
  exit 1
fi
echo "PASS  structural: raw pins --model + log_header (no bare exec)"

# Auth check must prefer JSON isAuthenticated — never naive grep -qi 'logged in' alone
# (that false-clears on "Not logged in").
if ! grep -q 'isAuthenticated' "$WORKER"; then
  echo "FAIL: worker missing isAuthenticated JSON auth check" >&2
  exit 1
fi
if ! grep -q 'cursor_agent_authenticated' "$WORKER"; then
  echo "FAIL: worker missing cursor_agent_authenticated helper" >&2
  exit 1
fi
if ! grep -qF 'not[[:space:]]+logged[[:space:]]+in' "$WORKER"; then
  echo "FAIL: worker must explicitly reject 'not logged in' in text fallback" >&2
  exit 1
fi
# Guard: must not use sole positive match grep -qi 'logged in' as auth gate
if grep -nE "grep[[:space:]]+-qi[[:space:]]+['\"]logged in['\"]" "$WORKER"; then
  echo "FAIL: naive grep -qi 'logged in' auth gate still present" >&2
  exit 1
fi
echo "PASS  structural: auth uses isAuthenticated/json + rejects not-logged-in"

# Live smoke (requires Cursor auth) — mirror worker helper (no naive logged-in grep)
test_agent_authenticated() {
  local status_out=""
  local timed=()
  if command -v timeout >/dev/null 2>&1; then
    timed=(timeout 15)
  fi
  if status_out=$("${timed[@]}" agent status --format json 2>/dev/null); then
    if printf '%s' "$status_out" | grep -Eqi '"isAuthenticated"[[:space:]]*:[[:space:]]*true'; then
      return 0
    fi
    if printf '%s' "$status_out" | grep -Eqi '"authenticated"[[:space:]]*:[[:space:]]*true'; then
      return 0
    fi
  fi
  status_out=$("${timed[@]}" agent status 2>&1 || true)
  if printf '%s' "$status_out" | grep -Eiq 'not[[:space:]]+logged[[:space:]]+in'; then
    return 1
  fi
  if printf '%s' "$status_out" | grep -Eiq '(^|[^[:alnum:]])logged[[:space:]]+in([^[:alnum:]]|$)'; then
    return 0
  fi
  return 1
}

if ! command -v agent >/dev/null 2>&1; then
  echo "FAIL: agent not on PATH (cannot run live raw smoke)" >&2
  exit 2
fi
if ! test_agent_authenticated; then
  if [[ -z "${CURSOR_API_KEY:-}" ]]; then
    echo "FAIL: Cursor not authenticated — agent login or CURSOR_API_KEY required for live raw smoke" >&2
    exit 2
  fi
fi

BEFORE=$(ls -1 "$JOBDIR"/*-raw.log 2>/dev/null | wc -l || true)
OUT=$("$WORKER" raw -p --mode ask --output-format text "Reply with exactly: ${MARKER}" 2>&1) || {
  echo "FAIL: raw worker exited non-zero" >&2
  echo "$OUT" >&2
  exit 1
}
echo "$OUT"

# Prefer LOG= path from stderr/stdout; else newest *-raw.log after run
LOG_PATH=""
if [[ "$OUT" =~ LOG=([^[:space:]]+) ]]; then
  LOG_PATH="${BASH_REMATCH[1]}"
fi
if [[ -z "$LOG_PATH" || ! -f "$LOG_PATH" ]]; then
  LOG_PATH=$(ls -1t "$JOBDIR"/*-raw.log 2>/dev/null | head -1 || true)
fi
if [[ -z "$LOG_PATH" || ! -f "$LOG_PATH" ]]; then
  echo "FAIL: could not locate raw job log (before_count=$BEFORE)" >&2
  exit 1
fi

if ! grep -q "model=${PIN}" "$LOG_PATH"; then
  echo "FAIL: log missing model=${PIN} in $LOG_PATH" >&2
  head -20 "$LOG_PATH" >&2
  exit 1
fi
echo "PASS  log header model=${PIN} in $LOG_PATH"

if ! grep -q "$MARKER" <<<"$OUT" && ! grep -q "$MARKER" "$LOG_PATH"; then
  echo "FAIL: output missing ${MARKER}" >&2
  exit 1
fi
echo "PASS  live raw reply contains ${MARKER}"
echo "ALL PASS"
exit 0
