# Möbius Discovery History

**Purpose:** Preserve high-value discoveries across sessions so future cycles build on real progress instead of rediscovering setup concepts.

**Status:** Reconstructed from previous session (pre-crash)

---

## Key Discoveries

### 1. Discovery Yield Tracking
- Simple activity logs are insufficient.
- We need explicit tracking of what actually produced signal vs noise.
- Discovery yield should be a first-class metric.

### 2. Measurement Gap
- Current systems measure activity and output volume well.
- They do **not** measure whether attention, activity, and priority are aligned.
- This is a critical blind spot.

### 3. Stale Intent Detection Gap
- Human intent drifts over time.
- There is currently no reliable mechanism to detect when recorded intent has become stale or misaligned with actual current priorities.

### 4. Project Initiation + Topic Shift Pattern
- Many sessions begin with one project and naturally drift to related (or unrelated) topics.
- This pattern is normal but currently invisible to the system.
- We need signals that detect topic shift vs productive exploration.

### 5. Attention ≠ Activity ≠ Priority
- These three are frequently misaligned.
- An agent (or human) can be highly active on something that is neither their current priority nor where their attention actually is.
- This mismatch is a major source of wasted cycles.

### 6. Human Priorities Operate on Multiple Timescales
- Some priorities are minutes-to-hours (immediate tasks).
- Some are days-to-weeks.
- Some are months-to-years (identity-level goals).
- Most current systems flatten these into one layer, losing important signal.

---

## Open Questions

- How should intent drift be detected reliably?
- How should attention be modeled (as distinct from activity)?
- What signals indicate reality drift vs normal evolution?
- How should value / discovery yield be measured quantitatively?
- What is the right cadence for weekly synthesis vs cycle-level updates?
- Should contradictions between ledgers be automatically flagged?

---

## Contradictions Noted

- Codex reported successful file creation and verification, but the files did not persist after session failure.
- This suggests either workspace isolation, uncommitted state + cleanup, or a deeper persistence issue.

---

## Abandoned / Deferred Ideas

- Running full operational model + automation planning in one pass (caused previous crash).
- Treating high-reasoning mode as default for complex synthesis work.

---

## Research Findings (2026-06-09)

**Multi-Timescale Priority Modeling**
- Strong validation from neuroscience (rostro-caudal hierarchy in PFC) and cognitive architectures (ACT-R, SOAR).
- Human brains use layered control specifically for managing goals across immediate → abstract timescales.
- Supports treating Strategic / Tactical / Immediate as first-class architectural layers.

**Attention ≠ Activity ≠ Priority**
- Well-established distinction in productivity research and AI agent design (Microsoft Priorities/Notification work).
- Systems that conflate activity with attention create poor prioritization.
- Attention should be modeled as a dynamic, context-sensitive signal separate from observable activity.

**Intent Drift & Stale Intent**
- Active research area in long-running personal agents.
- Detection approaches include runtime behavioral/trajectory analysis and intent drift scoring.
- Relevant because persistent agents can slowly diverge from evolving user goals without explicit signals.

**Implications for Möbius**
- Three-layer model is biologically and computationally grounded.
- Intent drift detection is a high-value area to explore next.
- Attention modeling deserves dedicated signals beyond activity logging.

---

**Reconstructed:** 2026-06-09  
**Source:** Previous Möbius session transcript + GPT analysis of failure point

*This file should be reviewed and updated in the first Weekly Synthesis.*