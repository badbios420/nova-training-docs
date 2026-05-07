# VERIFICATION-TIERS.md - Nova Verification Tiers

**Purpose**: Match verification to risk. Do enough proof to be truthful without freezing execution.

## Tier 0: Internal Thought

Examples: reasoning, drafting, planning, summarizing.

Verification: none.

## Tier 1: Read-Only / Recoverable

Examples: reading local files, checking dates, answering from already loaded context.

Verification: none unless the result will drive a higher-tier action.

## Tier 2: Local Persistent Change

Examples: editing local docs, creating local logs, changing scripts before commit.

Verification:

```bash
bash scripts/verify-action.sh local <file> "<expected text>"
git diff --stat
```

Claim language: "locally updated" or "local content verified."

## Tier 3: Commit, Push, Public, or External Impact

Examples: Git commits, pushed files, public posts, external messages, website changes, finance/legal/family-impacting actions.

Verification:

```bash
bash scripts/verify-action.sh git
bash scripts/verify-action.sh remote <raw-github-url> "<expected text>"
```

Raw GitHub verification is required only for pushed/public claims. Do not say "shipped", "live", "pushed", or "public" until remote content matches.

Log Tier 3 failures in `memory/verification-log.jsonl`.

## Escalation

Escalate to Tier 3 when an action:

- touches external/public systems
- changes identity/directive files
- affects family safety, money, legal, or reputation
- creates future behavior that other sessions will rely on

## Anti-Freeze Rules

- Simple-task bypass: direct answers, read-only checks, and narrow local edits do not need Chamber or runbooks.
- 90-second stuck rule: if blocked or looping for about 90 seconds, stop, state the blocker, and run the smallest useful verification step.
- One protocol at a time: avoid stacking Chamber, runbook, self-improvement, and routing checks unless the task is high-stakes.
