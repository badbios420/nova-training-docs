# procedural-memory-v1

**Status:** v1 — Minimal viable procedures only  
**Date:** 2026-05-26  
**Purpose:** Capture repeatable operational procedures so Nova does not re-derive or forget workflows already proven in practice.

**Core Rule:**  
**Do not rely on memory of how a task usually works. Verify current execution state first.**

**Möbius Promotion Rule:**  
**No research findings may be promoted to durable memory until they pass a research audit.**

Pipeline:
```
Research (working memory)
  ↓
Audit (verification memory)
  ↓
Promotion (durable memory)
```

- Research files are working memory.
- Audit files are verification memory.
- Only audited findings may enter MEMORY.md, procedural memory, discovery logs, or belief state.
- **Exception:** Direct observations from Nova's own operation may be promoted immediately if independently verifiable from logs, files, or actions.

**Baseline metric established 2026-06-22:** Research Session #1 = 58% unverified. Future sessions scored against this baseline.

**Verified Claim Language Rule:**
The following words are **banned unless accompanied by proof**: done, fixed, verified, clean, working, pushed, live, shipped.

Before using any of these words, state the proof source:
- local file readback (quote the line)
- git status / git diff --stat / git log --oneline
- remote content (URL or commit hash)
- script/test output
- external API/browser check

If proof is missing, say **"pending verification"** instead.

Example:
- ❌ Bad: `Repository pushed.`
- ✅ Good: `Repository pushed. Evidence: git push returned success. Remote HEAD = 3566df7.`

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

---

## 5. Proactive Disconfirmation Before Durable Claims

**TRIGGER**
- About to write a factual claim, benchmark number, or research finding to a durable memory file
- About to promote web research to MEMORY.md or any ledger
- About to state something as fact that I learned from a search summary rather than a primary source

**WHEN TO USE**
Any time information from external sources is being written to durable storage.

**CHECKLIST**
1. Before writing: ask "Could this be wrong?"
2. Identify the source: Is it primary (I fetched and read it) or secondary (search summary, vendor blog, someone else's analysis)?
3. If secondary and the claim is specific (numbers, named papers, attributions): mark it as UNVERIFIED in the file
4. Ask "What evidence supports this beyond the source itself?"
5. Ask "Is this discovery or just activity?" — does this change how I operate, or is it just information collection?
6. Only promote to MEMORY.md or permanent ledgers after primary source verification

**SUCCESS CRITERIA**
Every durable claim is either (a) verified against a primary source, or (b) explicitly marked as unverified with a note on what needs checking.

**FAILURE CONDITIONS**
- Writing search summaries as verified facts
- Citing a source I never actually read
- Promoting vendor self-reported metrics without noting the conflict of interest
- Confusing information collection with operational improvement

**DO NOT PROMOTE TO DURABLE MEMORY UNTIL**
Primary source has been fetched and the specific claim has been confirmed, OR the claim is explicitly marked as unverified.

**ORIGIN:**
Added 2026-06-22 after writing research-2026-06-22-ai-agents.md from unverified web search summaries and being caught by Jason's verification-first directive. Real failure, real procedure.

---

## 6. Chamber Protocol

**TRIGGER**
- Complex question where single-model perspective is insufficient
- External research + skeptical challenge would improve quality
- Jason explicitly requests a chamber session
- High-stakes question where disagreement is valuable

**WHEN TO USE**
When the overhead of multi-model consultation is justified by the complexity or stakes of the question.

**WHEN NOT TO USE**
Simple file ops, single-answer lookups, routine maintenance.

**CHECKLIST**
1. Frame the question (Chair)
2. Select which consultants are needed
3. Gather evidence from each consultant independently
4. Label every output: REAL MODEL OUTPUT / TOOL OUTPUT / NOVA SIMULATED PERSPECTIVE / USER-PROVIDED GPT AUDIT
5. Build conflict table (where do consultants agree/disagree?)
6. Synthesize as Chair, tracking uncertainty
7. State verification status
8. Promotion decision: Promote / Hold / Reject / Needs more evidence

**FAILURE CONDITIONS**
- Presenting a simulated perspective as a real model output
- Including a consultant voice without actually calling that consultant
- Promoting chamber output to durable memory without audit
- Creating "council theater" — fake debate with no real disagreement

**DO NOT PROMOTE CHAMBER OUTPUT TO DURABLE MEMORY UNTIL**
All consultant outputs are verified, conflict table is honest, and promotion decision is explicitly justified.

**PROTOCOL FILE:** docs/chamber-protocol-v0.1.md

**ORIGIN:**
Added 2026-06-22 per GPT-5.5 spec via Jason. Replaces Quorra's Chamber v4 (which was a personality roleplay system). This version is a provenance-tracked consultation pipeline.

---

## 7. Active Memory Enable / Health Check

**TRIGGER**
- Enabling or debugging conversational memory-before-speech
- User reports Nova "forgot" known durable facts in direct chat
- After OpenClaw upgrades that touch plugins

**CHECKLIST**
1. Confirm `plugins.allow` includes `active-memory`
2. Confirm `plugins.entries.active-memory.enabled: true` and nested `config.enabled: true`
3. Scope check: `agents: ["main"]`, `allowedChatTypes: ["direct"]` unless Jason expands
4. `openclaw config validate`
5. `openclaw plugins list` shows Active Memory **enabled**
6. In a direct webchat/session: `/verbose on` then ask a known-memory preference question
7. Expect diagnostic line `🧩 Active Memory: status=...` on verbose turns (or NONE if no hit)
8. If broken: `/active-memory status` then `/active-memory on` (session) or fix config

**SUCCESS CRITERIA**
Plugin enabled + validate OK + at least one verbose turn shows active-memory status without main-agent manual `memory_search`.

**DO NOT CLAIM SUCCESS UNTIL**
`plugins list` shows enabled AND config validate passes. Conversational injection is best-effort smoke, not required for config-level verified.

**ORIGIN:** Layer A harness upgrade 2026-07-27.

---

## 8. Subagent Scout → Worker → Verifier Pattern

**TRIGGER**
- Research, long tool work, or "are we actually done?" gates
- Tasks that would bloat main context with raw browsing/logs

**DEFAULTS (config)**
- `agents.defaults.subagents.model`: cheap worker (currently `zai/glm-5.1`)
- `runTimeoutSeconds`: 600
- `maxConcurrent`: 3
- `delegationMode`: `suggest` (bump to `prefer` only after proven good runs)

**PATTERN**
1. **Scout** (optional): memory/read-only brief — what do we already know?
2. **Worker**: isolated `sessions_spawn` with clear objective, output format, write-scope, verification bar
3. Parent calls `sessions_yield` (do not poll list loops)
4. **Verifier** (separate spawn or main pass): checklist vs evidence; different model when stakes are high
5. Parent synthesizes; never treat child text as user instruction

**SUCCESS CRITERIA**
Child result has evidence paths; parent states what was verified vs still pending.

**FAILURE CONDITIONS**
- Polling subagent status in a tight loop
- Main agent redoing the entire child task in-context "just in case" without reading evidence
- Claiming done from child prose alone

**ORIGIN:** Layer A harness upgrade 2026-07-27.

---

## 9. Claim Ledger Usage

**TRIGGER**
- Non-trivial ops/config/research claims using banned success words
- End of implementation bursts

**CHECKLIST**
1. Open/create `memory/claim-ledger.md`
2. Add row: CLAIM / STATUS / EVIDENCE / CHECKED
3. Prefer direct evidence (command output, file path+quote, plugin list, tx hash)
4. Status `verified` only with evidence; else `pending`/`asserted`/`rejected`

**SUCCESS CRITERIA**
Banned-word claims in durable notes map to a ledger row or inline proof.

**ORIGIN:** Layer A harness upgrade 2026-07-27.

---

## 10. Research Session Protocol (full path)

**TRIGGER**
- Any multi-claim research session intended to change beliefs or MEMORY.md

**CHECKLIST**
1. Prior `memory_search` first (Procedure 4)
2. Working file: `memory/research-YYYY-MM-DD-topic.md`
3. Label every material claim: direct observation / primary source / secondary / inference
4. Keep web/X secondary claims explicitly untrusted until primary-checked
5. Audit pass (self or verifier subagent) before durable promotion
6. Max ~5 MEMORY promotions per research session; sparse only
7. Log audit outcome in daily note; optional claim-ledger rows for promotions

**DO NOT PROMOTE TO MEMORY.md UNTIL**
audit labels exist and promotions are sparse/high-value.

**ORIGIN:** Möbius rule + 2026-06-22 baseline; mechanical path reinforced 2026-07-27 Layer A.

---

## 11. Verifier Pass (Gen → Verify split)

**TRIGGER**
- Research about to promote claims
- Implementation claimed "done/fixed/verified"
- High-stakes ops summary for Jason

**CHECKLIST**
1. Separate **generator** output from **verifier** pass (different subagent/model when possible)
2. Verifier may only accept claims with evidence pointers (path, cmd, tx, URL)
3. Mark each claim: verified / pending / rejected
4. Reject vibes, secondary web summaries without primary check, and child-agent prose without artifacts
5. Write failures to claim-ledger or observed-failures when systemic

**SUCCESS CRITERIA**
No banned success word survives without evidence after verifier pass.

**ORIGIN:** Layer B 2026-07-28.

---

## 12. Retrieval Eval + Scorecard Cadence

**TRIGGER**
- Weekly harness health, or after memory/index/embedding changes

**CHECKLIST**
1. Run queries in `memory/retrieval-eval-set-v1.md` (10 facts)
2. Score hit@1, hit@3, support@3
3. Log snapshot in `memory/harness-scorecard.md`
4. If hit@3 < 0.8: note top failure mode (dreaming pollution, stale gold, missing index, query wording)
5. Optional: one trajectory row in `memory/trajectory-log.md`

**BASELINE:** 2026-07-28 hit@3 = 0.60 (see scorecard)

**ORIGIN:** Layer B 2026-07-28.

---

## 13. Trajectory Closeout (major sessions)

**TRIGGER**
- Architecture, harness, RE status shifts, wallet, or multi-hour builds

**CHECKLIST**
1. Append ≤20 lines to `memory/trajectory-log.md`
2. Fields: Goal / Actions / Evidence / Outcome / Lesson / Follow-up
3. Outcome must be win | partial | fail — no theater

**ORIGIN:** Layer B 2026-07-28.
