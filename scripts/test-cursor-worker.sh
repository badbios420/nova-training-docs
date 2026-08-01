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

# Live smoke (requires Cursor auth)
if ! command -v agent >/dev/null 2>&1; then
  echo "FAIL: agent not on PATH (cannot run live raw smoke)" >&2
  exit 2
fi
if ! agent status 2>&1 | grep -qi 'logged in'; then
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
