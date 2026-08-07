#!/usr/bin/env bash
# Nova-controlled Cursor Agent sidecar launcher
# Usage:
#   scripts/cursor-worker.sh status
#   scripts/cursor-worker.sh plan  "prompt..."   # read-only plan mode
#   scripts/cursor-worker.sh ask   "prompt..."   # read-only Q&A
#   scripts/cursor-worker.sh read  "prompt..."   # print, no force (alias ask-ish)
#   scripts/cursor-worker.sh write "prompt..."   # print + --force (implement only)
#   scripts/cursor-worker.sh raw   [agent args...]  # still pins --model unless caller passed one
#
# Model pin (Chamber #11 / Jason 2026-08-01):
#   Default CURSOR_MODEL=cursor-grok-4.5-high (never bare Auto for production C-jobs)
#   Override: CURSOR_MODEL=composer-2.5 scripts/cursor-worker.sh write "..."
#   Hard jobs: CURSOR_MODEL=gpt-5.6-sol-high ...
#   raw: same pin + log_header; skip inject only if args already include --model / --model=*
set -euo pipefail
# Prefer nvm Node ≥24.15 for any openclaw CLI the worker may invoke.
# Cursor ships an older node on PATH (observed v24.5.0) that cannot run OpenClaw.
NVM_NODE_BIN=""
if [[ -d "$HOME/.nvm/versions/node" ]]; then
  # Prefer exactly 24.18.0 if present (gateway-aligned), else newest 24.x ≥24.15
  if [[ -x "$HOME/.nvm/versions/node/v24.18.0/bin/node" ]]; then
    NVM_NODE_BIN="$HOME/.nvm/versions/node/v24.18.0/bin"
  else
    NVM_NODE_BIN=$(ls -1d "$HOME"/.nvm/versions/node/v24.*/bin 2>/dev/null | sort -V | tail -1 || true)
  fi
fi
export PATH="${NVM_NODE_BIN:+$NVM_NODE_BIN:}$HOME/.local/bin:$HOME/.npm-global/bin:$PATH"
ROOT="/home/mrbig3/.openclaw/workspace"
cd "$ROOT"
JOBDIR="$ROOT/memory/cursor-jobs"
mkdir -p "$JOBDIR"

# Pinned default — Chamber #11 Jason pick B (2026-08-01). Do not default to Auto.
CURSOR_MODEL="${CURSOR_MODEL:-cursor-grok-4.5-high}"

MODE="${1:-}"
shift || true

if ! command -v agent >/dev/null 2>&1; then
  echo "ERROR: agent not on PATH" >&2
  exit 127
fi

# Auth check: prefer JSON isAuthenticated; never treat "Not logged in" as success.
# CURSOR_API_KEY remains an escape hatch when status cannot confirm auth.
cursor_agent_authenticated() {
  local status_out=""
  local timed=()
  if command -v timeout >/dev/null 2>&1; then
    timed=(timeout 15)
  fi
  # Prefer structured status when available
  if status_out=$("${timed[@]}" agent status --format json 2>/dev/null); then
    if printf '%s' "$status_out" | grep -Eqi '"isAuthenticated"[[:space:]]*:[[:space:]]*true'; then
      return 0
    fi
    if printf '%s' "$status_out" | grep -Eqi '"authenticated"[[:space:]]*:[[:space:]]*true'; then
      return 0
    fi
    # Explicit false → not authenticated
    if printf '%s' "$status_out" | grep -Eqi '"isAuthenticated"[[:space:]]*:[[:space:]]*false|"authenticated"[[:space:]]*:[[:space:]]*false'; then
      return 1
    fi
  fi
  # Text fallback: require positive login phrasing, reject "not logged in"
  status_out=$("${timed[@]}" agent status 2>&1 || true)
  if printf '%s' "$status_out" | grep -Eiq 'not[[:space:]]+logged[[:space:]]+in'; then
    return 1
  fi
  if printf '%s' "$status_out" | grep -Eiq '(^|[^[:alnum:]])logged[[:space:]]+in([^[:alnum:]]|$)'; then
    return 0
  fi
  return 1
}

if ! cursor_agent_authenticated; then
  if [[ -z "${CURSOR_API_KEY:-}" ]]; then
    echo "ERROR: Cursor not authenticated. agent login or CURSOR_API_KEY" >&2
    exit 2
  fi
fi

STAMP=$(date +%Y%m%d-%H%M%S)
LOG="$JOBDIR/${STAMP}-${MODE:-raw}.log"

# --trust: Nova workspace is intentionally trusted for sidecar use
COMMON=(--trust --workspace "$ROOT" --model "$CURSOR_MODEL")

log_header() {
  {
    echo "=== cursor-worker ==="
    echo "stamp=$STAMP"
    echo "mode=${MODE:-raw}"
    echo "model=$CURSOR_MODEL"
    echo "workspace=$ROOT"
    echo "cli=$(command -v agent)"
    echo "===================="
  } | tee "$LOG" >/dev/null
  # also print model to stderr for Nova/Jason visibility
  echo "CURSOR_MODEL=$CURSOR_MODEL MODE=${MODE:-raw} LOG=$LOG" >&2
}

case "$MODE" in
  status)
    {
      echo "=== cursor-worker status ==="
      echo "pinned_default_model=cursor-grok-4.5-high"
      echo "effective_CURSOR_MODEL=$CURSOR_MODEL"
      echo "============================"
      agent status
      agent about
      echo "--- models (head) ---"
      agent models 2>/dev/null | head -40 || true
    } 2>&1 | tee "$LOG"
    ;;
  plan)
    log_header
    agent -p --mode plan --output-format text "${COMMON[@]}" "$*" 2>&1 | tee -a "$LOG"
    ;;
  ask|read)
    log_header
    agent -p --mode ask --output-format text "${COMMON[@]}" "$*" 2>&1 | tee -a "$LOG"
    ;;
  write)
    # implement — Nova/Jason must have chosen write path
    log_header
    agent -p --force --output-format text "${COMMON[@]}" "$*" 2>&1 | tee -a "$LOG"
    ;;
  raw)
    # raw: caller owns most args; still pin model + log unless --model already present
    log_header
    RAW_HAS_MODEL=0
    for arg in "$@"; do
      case "$arg" in
        --model|--model=*) RAW_HAS_MODEL=1 ;;
      esac
    done
    if [[ "$RAW_HAS_MODEL" -eq 0 ]]; then
      agent --trust --model "$CURSOR_MODEL" "$@" 2>&1 | tee -a "$LOG"
    else
      agent --trust "$@" 2>&1 | tee -a "$LOG"
    fi
    ;;
  *)
    cat >&2 <<USAGE
Usage: $0 {status|plan|ask|read|write|raw} ...

Default model: cursor-grok-4.5-high (override with CURSOR_MODEL=...)
Examples:
  $0 status
  $0 plan "..."
  CURSOR_MODEL=composer-2.5 $0 write "..."
  CURSOR_MODEL=gpt-5.6-sol-high $0 write "..."
USAGE
    exit 1
    ;;
esac

echo "LOG=$LOG model=$CURSOR_MODEL" >&2
