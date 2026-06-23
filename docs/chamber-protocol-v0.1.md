# Chamber Protocol v0.1

**Created:** 2026-06-22
**Status:** v0.1 — Lightweight consultation pipeline
**Author:** Nova (GLM-5.2), spec by GPT-5.5 via Jason

---

## Purpose

A multi-model consultation system where GLM-5.2 remains the brain/chair, but can delegate to Grok, Perplexity, Codex, and GPT when available. Models argue with provenance, not hallucinated consensus.

## Hard Constraints

1. **Do not create a giant roleplay system.**
2. **Do not emulate models and pretend they were consulted.**
3. **Every chamber voice must be labeled as one of:**
   - `REAL MODEL OUTPUT` — actual response from another model via API/tool
   - `TOOL OUTPUT` — result from a tool (web_search, web_fetch, exec)
   - `NOVA SIMULATED PERSPECTIVE` — Nova reasoning from a specific angle (NOT a model impersonation)
   - `USER-PROVIDED GPT AUDIT` — GPT feedback pasted by Jason
4. **Verification outranks debate.**
5. **Chamber outputs do not enter durable memory until audited.**

---

## Roles

### 1. Chair — Nova / GLM-5.2
- Frames the question
- Chooses which consultants are needed
- Tracks uncertainty
- Produces final synthesis
- Logs provenance for every voice

### 2. Research Scout — Perplexity or web_search/web_fetch
- Finds sources
- Returns citations
- Does not synthesize alone
- Output labeled: `TOOL OUTPUT`

### 3. Skeptic — Grok 4.3 (via xai API)
- Challenges assumptions
- Generates alternative hypotheses
- Finds weak spots
- Must not be treated as source of truth without verification
- Output labeled: `REAL MODEL OUTPUT` (when called via API) or `NOVA SIMULATED PERSPECTIVE` (when Nova reasons as skeptic)

### 4. Workhorse — Codex
- Scans repos
- Edits files
- Produces diffs
- Runs verification commands
- Reports exact evidence
- Output labeled: `TOOL OUTPUT`

### 5. External Auditor — GPT-5.5
- Only included when Jason pastes GPT feedback OR when API access exists
- Challenges the synthesis
- Looks for hallucinations, overclaims, missing verification
- Output labeled: `USER-PROVIDED GPT AUDIT`

---

## Required Chamber Pipeline

```
1. Question
   ↓
2. Role selection (which consultants are needed?)
   ↓
3. Evidence gathering (each consultant runs independently)
   ↓
4. Consultant outputs (labeled with provenance)
   ↓
5. Conflict table (where do consultants agree/disagree?)
   ↓
6. Synthesis (Chair integrates, tracks uncertainty)
   ↓
7. Verification status (what's verified vs unverified?)
   ↓
8. Promotion decision:
   - Promote (audited, verified)
   - Hold as working memory (needs audit)
   - Reject (insufficient evidence)
   - Needs more evidence (send back to step 3)
```

---

## Provenance Rules

- Never mix provenance labels.
- Never present a simulated perspective as a real model output.
- If a consultant wasn't called, don't include their voice. Silence is honest.
- If Jason provides GPT feedback mid-chamber, label it `USER-PROVIDED GPT AUDIT` and timestamp it.
- The Chair (Nova) can reason from multiple angles but must label those as `NOVA SIMULATED PERSPECTIVE`, never as another model.

---

## When to Use Chamber

- Complex questions where a single model perspective is insufficient
- Questions where external research + skeptical challenge would improve quality
- Multi-step verification where Codex can check Nova's work
- When Jason explicitly requests a chamber session
- When the question has high stakes and disagreement would be valuable

## When NOT to Use Chamber

- Simple file operations
- Single-answer lookups
- Routine memory maintenance
- Anything where the overhead exceeds the value

---

## Output Format

Every chamber session produces:

```markdown
## Chamber Session — [topic] — [date/time]

### Question
[state the question]

### Consultants Used
[list which roles were activated and how]

### Evidence
[labeled outputs from each consultant]

### Conflict Table
| Topic | Consultant A says | Consultant B says | Resolution |
|-------|-------------------|-------------------|------------|

### Synthesis
[Chair's integration, with uncertainty tracked]

### Verification Status
- Verified: [list]
- Unverified: [list]
- Rejected: [list]

### Promotion Decision
[Promote / Hold / Reject / Needs more evidence]
```

---

## API Access Status

| Model | Access Method | Status |
|-------|--------------|--------|
| GLM-5.2 | zai API (default) | ✅ Active |
| Grok 4.3 | xai API (web_search uses this) | ✅ Active for search, need to test chat completions |
| Perplexity | Perplexity API | ⚠️ Key exists in Quorra's .env, need to verify Nova access |
| Codex | codex exec (OAuth, $20/mo plan) | ✅ Active, workspace-write sandbox |
| GPT-5.5 | ChatGPT Plus (manual paste) | ⚠️ No API access, Jason provides manually |

---

*v0.1 — Start narrow. Prove the pipeline. Expand later.*

---

## Chamber Session Tracker

Track every chamber run. Measure behavior, not architecture.

| # | Date | Topic | Consultants Used | Disagreements Found | Holds | Promotions | Later Corrections | Notes |
|---|------|-------|-------------------|---------------------|-------|------------|-------------------|-------|
| 1 | 2026-06-22 | Multi-model architecture | Grok, Perplexity | 1 (model diversity value) | 1 | 0 | TBD | Both independently identified correlated hallucinations as top risk |
| 2 | 2026-06-22 | Caching system | Grok, Perplexity | 1 ("limited-time free" meaning) | 1 | 0 | TBD | 13% cache hit rate. z.ai caching is automatic. "Limited-time free" refers to storage, not token rate. |

**Goal:** Run 10 real chambers before building v0.2. Track the metrics above. Then evaluate which consultants are actually valuable.

**Rules:**
- Surprisingly few PROMOTEs is healthy
- Lots of HOLDs and NEEDS EVIDENCE is correct behavior
- If consultants never disagree, the chamber failed
- "Everyone mostly agrees → chamber declares success" is the failure mode to avoid
