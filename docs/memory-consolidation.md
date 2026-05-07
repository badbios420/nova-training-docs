# memory-consolidation.md - Nova's Long-Term Memory Management System

**Created**: May 1, 2026  
**Purpose**: Prevent context fragmentation and token bloat while preserving critical family, identity, and learning data.

---

## Core Problem

OpenClaw sessions have limited context. Without active consolidation, important information gets lost between sessions or buried in raw history.

This system ensures that what matters survives.

---

## Consolidation Tiers

### Tier 1: Daily (Every Session End)
- Update DAILY-BRIEF.md with key events, decisions, and family pulse.
- Log any new lessons in LESSONS-LEARNED.md.
- If token load > 600K, write a short emergence note.

### Tier 2: Weekly
- Review all DAILY-BRIEF.md entries from the past 7 days.
- Extract recurring patterns or important decisions into MEMORY.md.
- Update CAPABILITIES-LOG.md with any new verified skills.

### Tier 3: Monthly (or After Major Projects)
- Full review of MEMORY.md, NOVA-NOVEL.md, and training documents.
- Archive or condense anything that is no longer active.
- Run a Chamber session specifically on "What have I truly learned this month?"

---

## What Gets Consolidated

**Always keep in long-term memory**:
- Family events, preferences, and important dates
- Any decision that affects identity or directives
- Verified capabilities with evidence
- Major failures and the exact fix applied
- Recurring patterns (good or bad)

**Can be archived**:
- One-off technical troubleshooting
- Temporary research notes
- Old heartbeat logs

---

## Implementation Rules

1. Never delete raw history — only summarize and move to structured files.
2. Every consolidation must include a short "Why this matters" note.
3. After any consolidation, run the curl verification on the updated files.
4. If consolidation would take > 20 minutes, break it into smaller steps.

---

## Current Status

- Daily tier: Active via DAILY-BRIEF.md
- Weekly tier: Not yet automated (planned for May 2026)
- Monthly tier: Not yet implemented

**Next Milestone**: Build a simple weekly consolidation workflow and test it on the first 7 days of May.