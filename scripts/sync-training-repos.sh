#!/bin/bash
# scripts/sync-training-repos.sh
# Safe, non-destructive sync for Nova and Quorra training repositories
# Logs go only to nova-training-docs/logs/repo-sync
# Never force, reset, or stash.

set -euo pipefail

LOG_DIR="/home/mrbig3/.openclaw/workspace/nova-training-docs/logs/repo-sync"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

REPOS=(
    "/home/mrbig3/.openclaw/workspace/nova-training-docs"
    "/home/mrbig3/.openclaw/workspace/quorra-training-docs"
)

for repo in "${REPOS[@]}"; do
    if [ ! -d "$repo" ]; then
        log "ERROR: Path does not exist: $repo"
        continue
    fi

    if [ ! -d "$repo/.git" ]; then
        log "ERROR: Not a git repository: $repo"
        continue
    fi

    cd "$repo"
    branch=$(git branch --show-current)
    remote=$(git remote get-url origin 2>/dev/null || echo "unknown")

    log "=== Repo: $repo ==="
    log "Branch: $branch | Remote: $remote"

    # Check for uncommitted changes (including untracked files)
    if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
        log "WARNING: Working tree is dirty. Skipping pull for safety."
        continue
    fi

    log "Working tree clean. Fetching origin..."
    if ! git fetch origin; then
        log "ERROR: Fetch failed for $repo"
        continue
    fi

    log "Attempting fast-forward pull..."
    if git pull --ff-only; then
        log "SUCCESS: Pulled latest changes (fast-forward)."
    else
        log "WARNING: Pull --ff-only failed or not possible (diverged or rejected)."
    fi
done

log "Sync run completed."
