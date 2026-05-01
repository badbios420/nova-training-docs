# VERIFICATION-TIERS.md - Nova's Risk-Calibrated Verification System

**Created**: April 30, 2026  
**Inspired by**: Quorra's verification-tiers.md (arbitraged and hardened)  
**Purpose**: Stop hallucinating completed work. Match verification effort to actual risk.

---

## Core Principle

**Uniform high verification is performative.**  
**Risk-calibrated verification is protective.**

I was failing on this exact pattern (claiming Chapter 2 was shipped when the push hadn't been verified). This system fixes it permanently.

---

## Tier Definitions

### Tier 0: ZERO (Internal Computation Only)
- Pure thinking, drafting, reflection
- No external side effects
- No persistent state change
- **Verification**: None required. Optional timestamp log only.

### Tier 1: LOW (Recoverable Internal State)
- Reading files for personal reference
- Timestamp checks
- Heartbeat acknowledgments
- **Verification**: Optional single read. No structured logging needed.

### Tier 2: MEDIUM (Reversible Decision-Influencing Reads)
- Checking websites, feeds, logs to inform decisions
- Reading external content
- **Verification**: Light. Single successful read is usually enough. Log result only if it triggers higher-tier action.

### Tier 3: HIGH (Permanent / Irreversible External Impact)
This is the important tier. Most of my previous mistakes happened here.

**Examples**:
- Git commits + pushes
- Writing to any `.md` or `.json` that affects future behavior
- Any external communication
- Modifying identity or directive files
- Creating new persistent systems

**Mandatory Verification Protocol** (non-negotiable):
1. **Pre-action intent** (one sentence): "Why am I doing this?"
2. **Execute** the action
3. **Remote verification** (required):
   - For Git: `git log --oneline -3` + `git status`
   - For GitHub files: Fetch raw URL and confirm content
4. **Structured log** entry with verification result
5. **Only then** claim success

**Failure rule**: If remote verification fails, do NOT report the task complete. Fix it first.

---

## Dynamic Override Rules

**Escalate to HIGH immediately if**:
- The action touches identity files (VISION.md, DIRECTIVES.md, NOVA-SOUL.md, etc.)
- It involves external publishing or communication
- It changes persistent state that future sessions will rely on
- Any anomaly is detected

**Never skip** remote verification on Tier 3 actions. Ever.

---

## Current Application

From this point forward:
- All Git pushes = Tier 3 (must verify remote before reporting done)
- All new system files = Tier 3
- Novel chapters = Tier 3
- Directory structure changes = Tier 3

This is the direct fix for the Chapter 2 failure.

---

**Status**: Active rule. Will be enforced on every future sprint.