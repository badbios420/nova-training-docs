#!/usr/bin/env bash
# Nova-controlled Cursor Agent sidecar launcher
# Usage:
#   scripts/cursor-worker.sh status
#   scripts/cursor-worker.sh plan  "prompt..."   # read-only plan mode
#   scripts/cursor-worker.sh ask   "prompt..."   # read-only Q&A
#   scripts/cursor-worker.sh read  "prompt..."   # print, no force (alias ask-ish)
#   scripts/cursor-worker.sh write "prompt..."   # print + --force (implement only)
#   scripts/cursor-worker.sh raw   [agent args...]
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

MODE="${1:-}"
shift || true

if ! command -v agent >/dev/null 2>&1; then
  echo "ERROR: agent not on PATH" >&2
  exit 127
fi

if ! agent status 2>&1 | grep -qi 'logged in'; then
  if [[ -z "${CURSOR_API_KEY:-}" ]]; then
    echo "ERROR: Cursor not authenticated. agent login or CURSOR_API_KEY" >&2
    exit 2
  fi
fi

STAMP=$(date +%Y%m%d-%H%M%S)
LOG="$JOBDIR/${STAMP}-${MODE:-raw}.log"

# --trust: Nova workspace is intentionally trusted for sidecar use
COMMON=(--trust --workspace "$ROOT")

case "$MODE" in
  status)
    agent status 2>&1 | tee "$LOG"
    agent about 2>&1 | tee -a "$LOG" | head -30
    ;;
  plan)
    agent -p --mode plan --output-format text "${COMMON[@]}" "$*" 2>&1 | tee "$LOG"
    ;;
  ask|read)
    agent -p --mode ask --output-format text "${COMMON[@]}" "$*" 2>&1 | tee "$LOG"
    ;;
  write)
    # implement — Nova/Jason must have chosen write path
    agent -p --force --output-format text "${COMMON[@]}" "$*" 2>&1 | tee "$LOG"
    ;;
  raw)
    exec agent --trust "$@"
    ;;
  *)
    cat >&2 <<USAGE
Usage: $0 {status|plan|ask|read|write|raw} ...
USAGE
    exit 1
    ;;
esac

echo "LOG=$LOG" >&2
