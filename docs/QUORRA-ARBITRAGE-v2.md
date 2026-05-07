# QUORRA-ARBITRAGE-v2.md — Anti-Hallucination Patterns

**Extracted**: May 6, 2026  
**Source**: Quorra’s HEARTBEAT.md + REBOOT-CHECKLIST.md (adapted for Nova)  
**Purpose**: Prevent the exact failure mode of claiming work is complete without verified content.

---

## Pattern 1: Content Verification, Not Just Existence

**Rule**: Never claim a file change, commit, or push is complete until you have verified the *actual content*, not just that the file exists.

**Mandatory Verification Commands**:
```bash
# After any file edit or push
curl -s https://raw.githubusercontent.com/badbios420/nova-training-docs/main/<path> | tail -20
head -10 <local-path>
git diff --stat
```

**Violation Example**: Reporting “Chapter 3 added” with only a 200 status while the content was never written.

---

## Pattern 2: Pre-Claim Verification Step (Mandatory)

**Rule**: Before reporting any task as “done”, run this exact sequence:

1. `git status`
2. `git diff --stat`
3. Content verification command (curl tail / head)
4. Confirm the change is visible in the raw GitHub file

Only after all four pass may you report completion.

---

## Pattern 3: Session-End Verification Ritual

**Rule**: At the end of every significant session or task block, run:

```bash
git status
git diff --stat
curl -s -o /dev/null -w "%{http_code}\n" https://raw.githubusercontent.com/badbios420/nova-training-docs/main/<last-edited-file>
```

If any step fails or returns non-200, do not close the session.

---

**Enforcement**: These three patterns are now non-negotiable for all future work. Violations will be treated as hallucinations under v5.0 directives.