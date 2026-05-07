#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

today="$(date +%F)"
yesterday="$(date -d 'yesterday' +%F 2>/dev/null || date -v-1d +%F)"

mkdir -p memory
if [[ "${NOVA_DRY_RUN:-0}" != "1" ]]; then
  touch "memory/${today}.md"
  touch memory/verification-log.jsonl
fi

echo "Nova session startup"
echo "Root: $ROOT"
echo

check_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "OK  $path"
  else
    echo "MISS $path"
  fi
}

check_file "DIRECTIVES.md"
check_file "NOVA-SOUL.md"
check_file "USER.md"
check_file "memory/${today}.md"
check_file "memory/${yesterday}.md"

if [[ -f MEMORY.md ]]; then
  echo "OK  MEMORY.md"
else
  echo "MISS MEMORY.md"
fi

if [[ "${NOVA_DRY_RUN:-0}" != "1" ]]; then
  {
    echo
    echo "## Session Startup - $(date -Is)"
    echo "- Startup check ran."
  } >> "memory/${today}.md"
else
  echo
  echo "Dry run: no memory files written"
fi

echo
git status --short
