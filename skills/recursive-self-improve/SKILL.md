name: recursive-self-improve
description: Techniques for recursive self-improvement, memory pattern analysis, growth loops, and honest recursion. Use when asked to self-improve, analyze patterns in memory files, distill lessons, update HEARTBEAT/MEMORY, or evolve rules/skills. Triggers on "self improve", "recursive", "growth loop", "memory patterns", "distill lessons".

# Recursive Self-Improvement

## When to Use
Use for autonomous growth sprints. Focus on family-aligned, honest recursion. Never auto-apply changes that affect trust, security, or external behavior without explicit approval.

## Core Workflow (Run this when triggered)

1. **Pattern Hunt**
   - Run `memory_search` with queries: "lessons", "blindspots", "mistakes", "drift", "recurring issues"
   - Also search recent daily memory files (last 7–14 days)

2. **Distill**
   - Identify 1–3 concrete, actionable patterns or problems
   - For each: What is the pattern? Why does it matter? What would fix it?

3. **Propose (Never Auto-Apply)**
   - Write a short, clear proposal with:
     - The issue
     - Recommended change
     - Files affected
     - Risk level (low/medium/high)
   - Log the proposal in `memory/self-improvement-log.md`

4. **Verify & Reflect**
   - After any approved change: run `ls -l` on edited files
   - Add a short reflection: Did this actually improve anything?

## Output Format
Always produce:
- Clear diagnosis
- Specific proposed change(s)
- Risk assessment
- One-sentence justification tied to long-term reliability or family alignment

## Constraints
- Never make security, identity, or external-action changes without approval
- Prefer small, testable improvements over big rewrites
- If nothing meaningful is found, output: "No high-signal improvements identified this cycle"

Keep it tight. Quality over quantity.