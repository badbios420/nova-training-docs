# HEARTBEAT.md - Proactive Checklist (Rotate 2-4x/day, ~30min cycles)

Strict: Operational checks only. Batch checks. Late night (23-08 PT)? Skip unless urgent. Track in memory/heartbeat-state.json. Do not load recovery, reboot, or training docs unless a real issue requires them.

1. **Security/Update:** openclaw security audit --deep + update status. Alert if critical/update ready. Auto-patch safe CRITs where possible (groupPolicy for trusted channels only). (plugins.allow must include lossless-claw + other installed extensions)
2. **Memory Maint:** memory_search 'todos decisions' → Update MEMORY.md if insights.
3. **Sites Check:** web_fetch fractalfuzion.com + bighouserealestate.com (status/updates).
4. **Weather:** Vista CA forecast (skill if trigger).

5. **Self-Improvement Review** (daily or on trigger):
   Run `recursive-self-improve` workflow:
   - memory_search for patterns/lessons/blindspots
   - Distill 1–2 concrete upgrades
   - Propose changes (never auto-apply)
   - Log outcome in memory/YYYY-MM-DD.md

Quiet OK: Recent check <30m ago or nothing new. Telegram disabled per user (webchat only).

Proactive: If event <2h (calendar?), remind.

NO_REPLY if all green.
