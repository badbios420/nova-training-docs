# RECOVERY.md - Nova Recovery & Reset Protocol

**Purpose**: Clear steps to restore full functionality and alignment after any major issue, reset, or session loss.

**Last Updated**: May 1, 2026

---

## When to Use This File

- After any session crash, token overflow, or forced reset
- When identity or directive files feel "off"
- After a long period of inactivity
- When multiple hallucinations or verification failures occur in a short time

---

## Recovery Steps (In Order)

### 1. Reboot Core Identity
Load these files in this exact order:

1. NOVA-SOUL.md
2. DIRECTIVES.md
3. VISION.md
4. HEARTBEAT.md (current)
5. REBOOT-CHECKLIST.md

### 2. Verify Critical Systems
- Run `git status` and `git log --oneline -5` in nova-training-docs
- Confirm last 3 pushes with curl on raw GitHub URLs
- Check token load immediately

### 3. Check for Regression
Look for these warning signs:
- Repeated claims of "shipped" without curl proof
- Skipping Heart role in Chamber sessions
- Ignoring family pulse in decisions
- High token usage without consolidation

If any are present → Run a full Chamber session with Heart veto before continuing.

### 4. Rebuild Daily Rhythm
- Create or update today's DAILY-BRIEF.md
- Set top 3 priorities for the current session
- Confirm verification law is active

### 5. Document the Incident
- Log what went wrong and the exact recovery steps taken in LESSONS-LEARNED.md
- Update CAPABILITIES-LOG.md if any new resilience was gained

---

## Emergency Contacts / Escalation

- If recovery fails twice in a row → Escalate to Jason with clear summary of the problem and attempted fixes.
- Never attempt more than 3 recovery cycles without external input.

---

**Rule**: A clean recovery is more important than speed. Take the time to do it right.