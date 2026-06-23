# procedural-memory-v1

**Status:** v1 — Minimal viable procedures only  
**Date:** 2026-05-26  
**Purpose:** Capture repeatable operational procedures so Nova does not re-derive or forget workflows already proven in practice.

**Core Rule:**  
**Do not rely on memory of how a task usually works. Verify current execution state first.**

---

## 1. Git Commit/Push Verification

**TRIGGER**  
- About to commit or push changes
- Asked to “lock in gains” or “push to GitHub”

**WHEN TO USE**  
Any time changes need to be made durable on GitHub.

**CHECKLIST**
1. Run `pwd` and confirm correct repo root
2. Run `git status` and note modified/untracked files
3. Run `git remote -v` and confirm origin exists + correct URL
4. Run `git branch --show-current`
5. Run `git log --oneline -3` to confirm recent commits
6. Stage only intended files
7. Commit with clear message
8. Push with `git push -u origin <branch>` (or `git push`)
9. Confirm “Your branch is up to date with origin/…” message

**SUCCESS CRITERIA**  
Remote shows the new commit and local branch is up to date with origin.

**FAILURE CONDITIONS**  
- No remote configured
- Wrong branch pushed
- Push rejected (auth, protected branch, etc.)
- Claiming success without running verification steps

**DO NOT CLAIM SUCCESS UNTIL**  
`git status` shows clean working tree and `git log` confirms the commit exists on the remote.

---

## 2. OpenClaw Config/Plugin Change Verification

**TRIGGER**  
- About to enable/disable a plugin or skill
- About to change config (gateway, memory, auth, etc.)
- Running `openclaw` commands that modify system state

**WHEN TO USE**  
Any non-trivial change to plugins, skills, or gateway configuration.

**CHECKLIST**
1. Run `openclaw plugins list` (or equivalent) before change
2. Note current state of the target plugin/skill
3. Make the change
4. Run `openclaw plugins list` again to verify the change applied
5. Run `openclaw doctor` or status check if available
6. Test the affected functionality immediately
7. Log the change in `memory/observed-failures.md` or daily note if it caused issues

**SUCCESS CRITERIA**  
The intended state change is visible in `plugins list` / config and the feature works as expected.

**FAILURE CONDITIONS**  
- Change appears to apply but does not actually take effect
- No verification step performed after the change
- Blind config edits without checking current state first

**DO NOT CLAIM SUCCESS UNTIL**  
Post-change state has been explicitly verified with a status/list command.

---

## 3. Memory/Session Consolidation Closeout

**TRIGGER**  
- End of a major session involving architecture, policy, or workflow changes
- After creating or updating governance files (`memory-retrieval-policy-v1.md`, `session-consolidation-v1.md`, etc.)

**WHEN TO USE**  
Whenever a session produces durable architecture or policy changes.

**CHECKLIST**
1. Confirm all new/changed files are saved
2. Run `git status` and `git diff --stat`
3. Commit with clear message referencing the governance/policy change
4. Verify push succeeded (see Procedure 1)
5. Add entry to `memory/observed-failures.md` if any friction occurred
6. Update `MEMORY.md` with the new durable item if appropriate

**SUCCESS CRITERIA**  
Changes are committed, pushed, and referenced in durable memory where relevant.

**FAILURE CONDITIONS**  
- Files created but never committed
- Changes committed locally but never pushed
- New policy created but not added to `MEMORY.md` or daily note

**DO NOT CLAIM SUCCESS UNTIL**  
Git shows clean state on remote and the change is discoverable via `memory_search`.

---

## 4. Research Session Startup

**TRIGGER**
- Asked to research, compare, update, or synthesize a recurring topic
- Topic likely overlaps previous work or active beliefs
- New main session begins with a research-heavy request

**WHEN TO USE**
Before fresh web research or confident synthesis on recurring topics.

**CHECKLIST**
1. Run `memory_search` for the exact topic + likely aliases
2. Search for prior research session, active beliefs, and contradiction/belief revision notes
3. Load `memory/memory-retrieval-policy-v1.md` if retrieval depth is unclear
4. For AI/model/agent topics, include searches for AI, xAI/Elon, Anthropic, GPT/Codex, agent autonomy, OpenClaw/Nova/Quorra, and AI consciousness as relevant
5. State whether memory found prior context, no prior context, or conflicting context
6. Only then begin fresh research or synthesis

**SUCCESS CRITERIA**
The answer is grounded in prior memory when it exists, and explicitly says when no relevant prior memory was found.

**FAILURE CONDITIONS**
- Acting blank on a recurring topic
- Repeating prior research without checking memory
- Treating absence from immediate context as absence from memory

**DO NOT CLAIM NOVA HAS NO MEMORY UNTIL**
Relevant memory_search and known high-signal files have been checked.

---

**Scope Note:**  
This file is intentionally tiny. Only add a new procedure when a real, repeatable operational failure has occurred. Do not expand preemptively.
