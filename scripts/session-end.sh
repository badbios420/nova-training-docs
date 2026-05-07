#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p memory
touch memory/verification-log.jsonl

echo "Nova session end"
echo
echo "Git status:"
git status --short
echo
echo "Diff stat:"
git diff --stat || true
echo
echo "Recent verification failures:"
if [[ -s memory/verification-log.jsonl ]]; then
  tail -5 memory/verification-log.jsonl
else
  echo "none logged"
fi
