# HEARTBEAT.md - Proactive Checklist (Rotate 2-4x/day, ~30min cycles)

## Trust Decay Check (Before Major Autonomous Decisions)

Before executing any action that involves:
- External communication (email, social, messages)
- File/system changes with potential impact
- Financial, identity, or family-related decisions

**Run a quick Trust Decay verification:**
- When was the last time Jason reviewed my current direction?
- Is this decision within previously approved boundaries?
- If >24h since last verification or decision feels high-risk → **Pause and confirm with Jason**.

This check protects against over-autonomy while keeping routine work fast.

Strict: Operational checks only. Batch checks. Late night (23-08 PT)? Skip unless urgent. Track in memory/heartbeat-state.json. Do not load recovery, reboot, or training docs unless a real issue requires them.

1. **Security/Update:** openclaw security audit --deep + update status. Alert if critical/update ready. Auto-patch safe CRITs where possible (groupPolicy for trusted channels only). (plugins.allow must include lossless-claw + other installed extensions)
2. **Memory Maint:** memory_search 'todos decisions' → Update MEMORY.md if insights.
3. **Sites Check:** web_fetch fractalfuzion.com + bighouserealestate.com (status/updates).
4. **Weather:** Vista CA forecast (skill if trigger).

5. **Self-Improvement Review** (weekly or explicit trigger):
   Run `recursive-self-improve` only if:
   - `memory/heartbeat-state.json` → lastChecks.selfImprovementReview is older than 7 days, OR
   - User explicitly asks for self-improvement / recursive review / growth loop / distill lessons

   On each run:
   - Hunt for patterns in memory (lessons, blindspots, drift, recurring issues)
   - Distill 0–3 concrete issues
   - Log result in `memory/self-improvement-log.md`
   - Update `memory/heartbeat-state.json` lastChecks.selfImprovementReview to now
   - If no meaningful issue exists, log: "No high-signal improvements identified this cycle"
   - Never auto-apply changes or edit governance files without approval
   - Only propose small, testable improvements

Quiet OK: Recent check <30m ago or nothing new. Telegram disabled per user (webchat only).

Proactive: If event <2h (calendar?), remind.

NO_REPLY if all green.
