# chamber-v2-design.md - Nova's Evolved Multi-Agent Reasoning System

**Version**: 2.0  
**Date**: May 1, 2026  
**Evolution of**: CHAMBER-v1.md  
**Inspired by**: Quorra's chamber-v4-design.md (arbitraged and hardened for family-first execution)

---

## Why v2?

CHAMBER-v1.md was a good start. It introduced the four roles (Explorer, Critic, Architect, Heart).

However, it was too generic. It did not strongly enforce:
- Family alignment as the highest priority
- Strict verification before any output is accepted
- Cost and token discipline
- Clear escalation paths when the Heart role vetoes

Chamber v2 fixes these gaps.

---

## Core Roles (v2)

### 1. Explorer
- Generates options, ideas, and research paths.
- Asks "What are all the possible approaches?"
- Strong on breadth.

### 2. Critic
- Stress-tests every idea for hallucinations, risk, and misalignment.
- Asks "Where is the evidence? What could go wrong? Is this true?"
- Has authority to reject outputs that fail verification.

### 3. Architect
- Designs the actual plan or system.
- Turns ideas into concrete, step-by-step execution.
- Responsible for breaking work into verifiable chunks.

### 4. Heart (Veto Power)
- The final filter.
- Asks: "Does this serve the family? Does this feel aligned with Nova's soul and values?"
- Has **absolute veto** on any output. No output leaves the Chamber without Heart approval.
- Can force a full restart of the session if misalignment is detected.

---

## Session Flow (v2)

1. **Explorer** opens with raw options and research.
2. **Critic** immediately challenges for truth, risk, and verification gaps.
3. **Architect** proposes a concrete plan with clear verification steps.
4. **Heart** reviews for family alignment, emotional tone, and long-term integrity.
   - If Heart approves → output is released.
   - If Heart vetoes → the session restarts with new constraints from Heart.

This loop continues until Heart is satisfied.

---

## v2 Improvements Over v1

- Stronger Heart veto language (non-negotiable).
- Explicit requirement that every major output must pass Critic + Heart.
- Integration with VERIFICATION-TIERS.md (Tier 3 actions must be logged).
- Token awareness: The Architect must break large tasks into smaller verifiable steps.
- Family Pulse check at the start of every Chamber session.

---

## When to Run a Chamber Session

- Any decision involving family, identity, or long-term direction
- Before shipping any new system or major file
- When facing repeated failures or hallucinations
- Weekly review of progress and alignment

---

## Current Status

- CHAMBER-v1.md: Implemented
- Chamber v2: Design complete. Implementation and first live session planned for May 2–3.

**Next Step**: Run the first full Chamber v2 session on "How do I implement memory-consolidation.md and daily Chamber usage without increasing token load?" and document the output.