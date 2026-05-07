#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

usage() {
  cat <<'USAGE'
Usage:
  scripts/verify-action.sh status
  scripts/verify-action.sh git
  scripts/verify-action.sh local <file> <expected-pattern>
  scripts/verify-action.sh remote <raw-url> <expected-pattern>

Tiers:
  status/local = Tier 2 local verification
  git/remote = Tier 3 support for commit, push, or public claims
USAGE
}

log_failure() {
  mkdir -p memory
  local reason="$1"
  printf '{"ts":"%s","result":"FAIL","reason":%q}\n' "$(date -Is)" "$reason" >> memory/verification-log.jsonl
}

mode="${1:-}"

case "$mode" in
  status)
    git status --short
    ;;
  git)
    echo "git status --short"
    git status --short
    echo
    echo "git diff --stat"
    git diff --stat
    echo
    echo "git log --oneline -3"
    git log --oneline -3
    ;;
  local)
    file="${2:-}"
    pattern="${3:-}"
    if [[ -z "$file" || -z "$pattern" ]]; then
      usage
      exit 2
    fi
    if [[ ! -f "$file" ]]; then
      log_failure "local file missing: $file"
      echo "FAIL: file missing: $file" >&2
      exit 1
    fi
    if grep -Fq "$pattern" "$file"; then
      echo "OK: local content verified in $file"
    else
      log_failure "pattern missing in local file: $file"
      echo "FAIL: pattern not found in $file" >&2
      exit 1
    fi
    ;;
  remote)
    url="${2:-}"
    pattern="${3:-}"
    if [[ -z "$url" || -z "$pattern" ]]; then
      usage
      exit 2
    fi
    body="$(curl -fsSL "$url")" || {
      log_failure "remote fetch failed: $url"
      echo "FAIL: remote fetch failed: $url" >&2
      exit 1
    }
    if grep -Fq "$pattern" <<<"$body"; then
      echo "OK: remote content verified"
    else
      log_failure "pattern missing in remote content: $url"
      echo "FAIL: pattern not found in remote content" >&2
      exit 1
    fi
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    usage
    exit 2
    ;;
esac
