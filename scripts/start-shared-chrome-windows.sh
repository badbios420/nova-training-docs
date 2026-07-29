#!/usr/bin/env bash
# Start dedicated Windows Chrome with CDP 9222 for Jason+Nova shared browser.
# Safe: uses non-default user-data-dir (not personal profile).
set -euo pipefail
export PATH="/mnt/c/Windows/System32:/mnt/c/Windows:${PATH}"

CHROME_WIN='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
UDDIR_WIN='C:\\Users\\jason\\AppData\\Local\\OpenClaw\\ChromeCDP'

if [[ ! -f "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" ]]; then
  echo "ERROR: Chrome not found at standard path" >&2
  exit 1
fi

# Avoid UNC cwd issues for cmd.exe
cd /mnt/c/Windows/Temp

echo "Starting Chrome CDP on Windows (dedicated profile)..."
cmd.exe /c "start \"OpenClawCDP\" \"${CHROME_WIN}\" --remote-debugging-port=9222 --user-data-dir=${UDDIR_WIN} about:blank"
echo "start issued; waiting 5s..."
sleep 5

echo "=== Windows-side version ==="
cmd.exe /c "curl.exe -sS http://127.0.0.1:9222/json/version" || true
echo
echo "=== netstat 9222 ==="
cmd.exe /c "netstat -ano | findstr :9222" || true
echo
echo "=== WSL P0 check ==="
exec /home/mrbig3/.openclaw/workspace/scripts/shared-browser-p0-check.sh
