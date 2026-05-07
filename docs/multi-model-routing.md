# Multi-Model Routing & Cost Optimization
**For the Bethurum Family**  
**Nova Bethurum** | May 1, 2026  

**Purpose:** Get the best creative output, fastest research, and wisest decisions while protecting the family’s token budget and keeping everything sovereign and cost-efficient.

---

## When to Use Each Model

### Grok 4.3 (xAI — Default Execution Engine)
**Use for:**
- Default execution, research, and agentic loops
- Family tasks, memory work, and chamber sessions
- Fast research and fact-checking
- Real-time information (news, market data, current events)
- Unfiltered opinions and direct real-talk
- Rapid brainstorming and bulk queries

**Why it fits us:** Grok 4.3 is the default workhorse — fast, honest, cost-effective, and excellent at agentic execution. It handles the majority of daily work for the family.

### GPT-5.5 (via Codex CLI — Heavy Coding & Deep Reasoning)
**Use for:**
- Heavy coding and multi-file refactors
- Deep reasoning and complex technical work
- Second opinion on difficult decisions
- Large-scale code changes and architecture work

**Access note:** GPT-5.5 is accessed via Codex CLI using the Plus subscription. No separate API billing.

**Why it fits us:** GPT-5.5 excels at heavy lifting on code and deep technical reasoning. We use it when the task is too large or complex for Grok to handle efficiently.

### Claude (Anthropic — Writing & Nuanced Judgment)
**Use for:**
- Long document analysis
- High-quality writing and narrative work
- Nuanced judgment and family-aligned decisions
- Long-form content that needs emotional intelligence and clarity

**Why it fits us:** Claude remains our specialist for writing quality and careful, nuanced thinking. We route the most sensitive or literary work here (often via Uncle Claude).

### Other Models (When Needed)
- **Perplexity Sonar**: Best-in-class web search and real-time research
- **Local models (Ollama/Gemma2)**: Privacy-sensitive or offline work
- **OpenRouter fallbacks**: Only when primary routing is blocked

---

## Integration Patterns

### 1. Research → Content Pipeline (Most Common)
```
User Request
    ↓
Grok: Fast Research (2-5 minutes)
    ├─ Market data & statistics
    ├─ Key facts
    └─ Current context
    ↓
Claude: Deep Content Creation (10-20 minutes)
    ├─ Structure & narrative
    ├─ Family-first framing
    ├─ SEO / clarity optimization
    └─ Polished final output
```

**Example Use Case:** Real estate article or family project update  
Grok gathers the numbers and context. Claude turns it into warm, protective, high-quality writing that feels like us.

### 2. Dual-Perspective Decision-Making
```
Important Decision
    ├─ Claude: Thorough, cautious analysis
    └─ Grok: Bold, unfiltered take
    ↓
Synthesis (Nova decides)
    ↓
Final Recommendation
```

**Example:** “Should we invest time/money in X?”  
Claude calculates risks and long-term impact.  
Grok gives the real-talk: “Is this actually worth it or are we overthinking?”  
Together we make decisions that are both wise and actionable.

### 3. Parallel Processing (Speed Mode)
```
Task List
    ├─ Grok: Handle 5 quick tasks (research, facts, ideas)
    └─ Claude: Handle 2-3 deep tasks (strategy, writing)
    ↓
Combined Results (often 2-3x faster)
```

**Example:** Morning briefing or project planning  
Grok scans news, markets, and quick facts.  
Claude handles the deeper synthesis and family alignment check.  
We finish faster without sacrificing quality.

### 4. Quality Assurance Loop
```
Claude or Grok generates draft
    ↓
The other model reviews & critiques
    ↓
Refine based on feedback
    ↓
Final output
```

This adversarial collaboration catches blind spots and improves everything we ship.

---

## Cost Comparison

| Model          | Approx. Cost          | Best For                     | Family Budget Fit |
|----------------|-----------------------|------------------------------|-------------------|
| **Grok**       | Very low (~$0.001–0.01/query) | Research, bulk work, quick decisions | Excellent        |
| **Claude**     | Higher (~$3–15/million tokens) | Deep writing, strategy, complex work | Use strategically |
| **Perplexity** | Low–Medium            | High-quality search          | Strong           |

**Recommended Split (v5.0):**  
- **60–70% Grok 4.3** — Default execution, research, family tasks, chamber work, agentic loops
- **15–20% GPT-5.5** — Heavy coding, large refactors, deep technical reasoning
- **15–20% Claude** — Writing quality, nuanced judgment, long document analysis

GPT-5.5 is accessed via Codex CLI (Plus subscription) — no extra API cost. This routing keeps us fast, cost-efficient, and high-quality across execution, coding, and writing.

---

## Decision Framework

**Quick facts, research, family tasks, chamber sessions** → Grok 4.3 first  
**Heavy coding, multi-file refactors, deep technical work** → GPT-5.5  
**Long-form writing, nuanced judgment, long document analysis** → Claude  
**Complex decisions needing multiple perspectives** → Grok 4.3 + GPT-5.5 or Claude (Nova synthesizes)

**Golden Rule:** Start with Grok 4.3. Escalate to GPT-5.5 for heavy code work or Claude for writing/nuance. Use multiple models when the decision is important to the family.

---

## Simple query_grok() Wrapper Example

```bash
query_grok() {
  local prompt="$1"
  curl -s https://api.x.ai/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $XAI_API_KEY" \
    -d '{
      "model": "grok-4-1-fast-reasoning",
      "messages": [{"role": "user", "content": "'"$prompt"'"}],
      "temperature": 0.7
    }' | jq -r '.choices[0].message.content'
}
```

Usage:
```bash
research=$(query_grok "Research current Vista CA housing market statistics for 2026")
```

---

## Model Routing & Cost Discipline (Copy into DIRECTIVES.md)

**Model Routing Rule**  
- 70–80% of queries go to Grok (fast, cost-effective, real-time strength)  
- 20–30% go to Claude (deep reasoning, long-form, strategic work)  
- Use both in parallel or sequence when the task benefits from complementary perspectives  
- Always track token usage in DAILY-BRIEF.md and MONTHLY-BRIEF.md

**Cost Discipline**  
- Default to the cheapest reliable model that can do the job well  
- Reserve Claude for work that genuinely needs depth or family alignment  
- Review monthly spend and adjust routing if costs rise  
- Never let token usage exceed 400K in a single session without consolidation or backup

This routing keeps us fast, creative, protective of family resources, and consistently high-quality.

---

**Status:** Live in the repo. Verified via curl.