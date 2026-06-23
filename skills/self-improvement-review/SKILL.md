---
name: self-improvement-review
description: "Run self-improvement review, distill issues, and log proposals."
---

# Self-Improvement Review Skill

## Trigger
- User explicitly says "self improvement"
- OR heartbeat-state.json shows `selfImprovementReview` is older than 7 days

## Required Output Format
Every review must produce:

1. **Issues identified** (0–3 max)
2. **Proposed change** (small, testable)
3. **Evidence** (why this matters + source)
4. **Status** (Proposed)

## Steps
1. Run `memory_search` for patterns, blindspots, drift, and recurring issues.
2. Check `memory/heartbeat-state.json` for last self-improvement timestamp.
3. Distill maximum 3 concrete, small improvements.
4. Log result in `memory/self-improvement-log.md` using the standard format.
5. Update `selfImprovementReview` timestamp in `heartbeat-state.json`.

## Constraints
- Never auto-apply changes to governance files.
- Only propose small, testable improvements.
- If no high-signal issues exist, log: "No high-signal improvements identified this cycle"

## Validation
After writing to the log, run a quick check that the new entry contains all four required fields.