#!/usr/bin/env bash
# Shared browser P0 reachability probe (read-only).
# Usage: scripts/shared-browser-p0-check.sh [host] [port]
set -euo pipefail
export PATH="${HOME}/.nvm/versions/node/v24.18.0/bin:${HOME}/.local/bin:${HOME}/.npm-global/bin:${PATH}"

PORT="${2:-9222}"
NAMESERVER_HOST="$(awk '/nameserver/{print $2; exit}' /etc/resolv.conf 2>/dev/null || true)"
DEFAULT_ROUTE_HOST="$(ip route 2>/dev/null | awk '/default/{print $3; exit}' || true)"
HOST="${1:-}"

candidates=()
if [[ -n "$HOST" ]]; then
  candidates+=("$HOST")
fi
[[ -n "$NAMESERVER_HOST" ]] && candidates+=("$NAMESERVER_HOST")
[[ -n "$DEFAULT_ROUTE_HOST" && "$DEFAULT_ROUTE_HOST" != "$NAMESERVER_HOST" ]] && candidates+=("$DEFAULT_ROUTE_HOST")
candidates+=("127.0.0.1" "localhost")

seen="|"
uniq=()
for h in "${candidates[@]}"; do
  case "$seen" in
    *"|$h|"*) ;;
    *) uniq+=("$h"); seen="${seen}${h}|" ;;
  esac
done

echo "=== Shared browser P0 check $(date -Iseconds) ==="
echo "port=$PORT"
echo "node=$(command -v node 2>/dev/null || echo missing) $(node --version 2>/dev/null || true)"
echo "openclaw=$(command -v openclaw 2>/dev/null || echo missing)"
echo

any_ok=0
for h in "${uniq[@]}"; do
  url="http://${h}:${PORT}/json/version"
  echo "--- GET $url"
  if out=$(curl -sS -m 3 "$url" 2>&1); then
    if echo "$out" | grep -q 'Browser\|Protocol-Version\|webSocketDebuggerUrl'; then
      echo "OK reachable"
      echo "$out" | head -c 500
      echo
      any_ok=1
      echo "Suggested cdpUrl: http://${h}:${PORT}"
    else
      echo "RESP (unexpected):"
      echo "$out" | head -c 300
      echo
    fi
  else
    echo "FAIL: $out"
  fi
  echo
done

echo "--- openclaw browser status (all profiles) ---"
if command -v openclaw >/dev/null 2>&1; then
  openclaw browser status 2>&1 | head -40 || true
  openclaw browser profiles 2>&1 | head -30 || true
else
  echo "openclaw not on PATH"
fi

echo
if [[ "$any_ok" -eq 1 ]]; then
  echo "RESULT: P0 Layer2 PASS — configure browser.profiles.remote.cdpUrl to the OK host (attachOnly: true)"
  exit 0
else
  echo "RESULT: P0 Layer2 FAIL — start Windows Chrome CDP first (see TOOLS.md Shared browser)"
  echo "Windows:"
  echo '  chrome.exe --remote-debugging-port=9222 --user-data-dir="%LOCALAPPDATA%\\OpenClaw\\ChromeCDP"'
  echo '  curl.exe http://127.0.0.1:9222/json/version'
  exit 2
fi
