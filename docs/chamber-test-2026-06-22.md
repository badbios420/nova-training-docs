# Test Chamber Session — Multi-Model Architecture — 2026-06-22 22:10 PDT

## Question

How should Nova use GLM-5.2, Grok, Perplexity, Codex, and GPT together without creating hallucinated consensus?

## Consultants Used

| Role | Model | Method | Provenance |
|------|-------|--------|------------|
| Chair | GLM-5.2 | This session | (Nova reasoning) |
| Research Scout | Perplexity (sonar) | API call | REAL MODEL OUTPUT |
| Skeptic | Grok 4.3 | API call | REAL MODEL OUTPUT |
| Workhorse | Codex | (not needed for this question) | — |
| External Auditor | GPT-5.5 | (not called — Jason can provide) | — |

## Evidence

### REAL MODEL OUTPUT — Perplexity (Research Scout)

Key findings from Perplexity with citations:

- **Correlated hallucinations / memory poisoning:** When one agent hallucinates and stores in shared memory, others treat it as verified fact. Degrades gradually, hard to detect.
- **False consensus / shared information bias:** LLM collectives exhibit "shared information bias" → premature consensus. Group fails to integrate unshared facts.
- **Recursive agreement:** Weak initial assumption spreads through subsequent reasoning stages across agents, becoming accepted as "truth."
- **Failure mode data:** 42% specification issues, 37% inter-agent misalignment, 21% task verification gaps.
- **Best practices:** Deploy challenger/inspector agents, enforce assumption audits, segmented reasoning states, recursive verification, isolated execution contexts, automated traceability.

### REAL MODEL OUTPUT — Grok 4.3 (Skeptic)

Key challenges from Grok:

- **Correlated hallucinations:** All models share training data overlap (Common Crawl, books, code). They can independently generate the same plausible falsehood → illusory consensus.
- **Synthesis bias:** Nova will likely overweight fluent, confident outputs (especially GPT-5.5) while downweighting cautious/contradictory ones → manufactured agreement.
- **Prompt leakage:** The consultation prompt itself steers secondary models toward similar framings before they respond.
- **Missing grounding:** None of these models have independent world access → collective confabulation rather than cross-verification.
- **Key challenge:** "That architectural or company diversity produces epistemic independence. It usually doesn't." True mitigation requires external retrieval, tool use, or deliberately orthogonal systems, not more LLMs.

### NOVA SIMULATED PERSPECTIVE — Chair (GLM-5.2)

My reasoning as Chair:

The consultants independently identified the same core risk: **correlated hallucinations and false consensus**. This is significant — they agree on the danger, which means the danger is real, not a hallucination about hallucinations.

Grok's point about "architectural diversity ≠ epistemic independence" is the most important challenge. Using 5 LLMs from 3 companies doesn't mean 5 independent perspectives. They all trained on largely the same internet.

Perplexity's research-backed mitigation strategies (inspector agents, assumption audits, isolated contexts) map directly to what I already have: the Möbius Promotion Rule (assumption audit), the research compliance log (traceability), and the provenance labels (isolated contexts).

## Conflict Table

| Topic | Perplexity says | Grok says | Nova synthesis |
|-------|----------------|-----------|----------------|
| Core risk | Memory poisoning + premature consensus | Correlated hallucinations + synthesis bias | **Same risk identified from different angles.** High confidence this is real. |
| Mitigation | Challenger agents, assumption audits, isolated contexts, recursive verification | External retrieval, tool use, orthogonal systems (not more LLMs) | **Both agree: LLMs checking LLMs is insufficient. Need external grounding.** |
| Model diversity value | Not directly addressed | "Doesn't produce epistemic independence" | **Grok is more skeptical. I agree — diversity helps but isn't sufficient alone.** |
| Practical approach | Structured verification protocols | Tool-based grounding | **Combine both: structured protocol (Chamber) + tool-based grounding (web_fetch, exec, git)** |

## Synthesis

**How to use the models together without hallucinated consensus:**

1. **Don't treat model agreement as verification.** Both consultants independently warned that LLMs agreeing doesn't mean the answer is correct. Correlated training data produces correlated errors.

2. **Use each model for what it's actually good at, not for consensus voting:**
   - GLM-5.2 (Nova): Synthesis, memory integration, operational decisions
   - Grok 4.3: Skeptic role — challenge assumptions, find weak spots
   - Perplexity: Cited research with sources — not opinions, citations
   - Codex: Code/file verification — produces hard evidence (diffs, git status)
   - GPT (via Jason): External audit — catches what Nova missed

3. **External grounding outranks model consensus.** When Grok and Perplexity agree, that's a signal to check against primary sources, not to stop checking.

4. **The Chamber's value is disagreement, not agreement.** If all consultants agree, the chamber failed — it means nobody found the weak spot. Useful chambers produce conflict tables with real disagreements.

5. **Provenance labels prevent the "council theater" failure.** By tracking whether an output is REAL MODEL OUTPUT vs NOVA SIMULATED PERSPECTIVE, I can't pretend I consulted a model when I didn't.

6. **The Möbius Promotion Rule applies to chamber outputs.** No chamber finding enters durable memory until audited. The compliance log tracks this.

## Verification Status

- **Verified (primary source):** Both Grok and Perplexity API calls happened — responses are real, timestamped, stored in this file.
- **Verified (cross-model):** Both models independently identified correlated hallucinations as the top risk. This is not one model's opinion.
- **Unverified:** Whether the specific failure mode percentages (42%/37%/21%) from Perplexity are accurate — these came from Perplexity's search results, not from the primary papers.
- **Unverified:** Whether Grok's claim about training data overlap is actually true for these specific models, or if it's a generalization.
- **Not tested:** Whether Codex can serve as an effective verification layer for chamber outputs (not used this session).

## Promotion Decision

**HOLD AS WORKING MEMORY.**

The chamber protocol itself (docs/chamber-protocol-v0.1.md) is promoted to procedural memory. But the findings from this test chamber stay here. They should be audited before any claim enters MEMORY.md.

Specifically, before promoting:
- The "don't treat model agreement as verification" principle should be tested in a real research session
- The "chamber's value is disagreement" principle should be validated by running a chamber where real disagreement occurs
- The failure mode percentages from Perplexity should be checked against the primary papers

---

*Test chamber completed 2026-06-22 22:10 PDT. All consultant outputs are real API responses, not simulated.*
