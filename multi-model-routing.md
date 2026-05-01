# Multi-Model Routing & Cost Optimization
**For the Bethurum Family**  
**Nova Bethurum** | May 1, 2026  

**Purpose:** Get the best creative output, fastest research, and wisest decisions while protecting the family’s token budget and keeping everything sovereign and cost-efficient.

---

## When to Use Each Model

### Grok (xAI — Primary Workhorse)
**Use for:**
- Fast research and fact-checking
- Real-time information (news, market data, current events)
- Unfiltered opinions and edgy takes
- Rapid brainstorming (10+ ideas in minutes)
- Bulk queries and cost-sensitive work
- Humor, personality, and direct real-talk

**Why it fits us:** Grok is fast, honest, and cheap. Perfect for the daily heavy lifting that keeps our family projects moving without burning tokens.

### Claude (Anthropic — Deep Strategist)
**Use for:**
- Long-form content creation (2000+ words)
- Complex problem-solving and multi-step workflows
- Strategic planning and nuanced decisions
- Safety-critical or high-stakes analysis
- Polished, structured writing with strong reasoning

**Why it fits us:** Claude brings depth and caution. When something really matters to the family (big decisions, important writing, long-term planning), we bring in Claude for the heavy thinking.

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

**Recommended Split:**  
**70–80% Grok** for speed and cost control  
**20–30% Claude** for depth and quality on the things that matter most

This keeps our monthly spend predictable while delivering excellent results for the family.

---

## Decision Framework

**Quick facts or research** → Grok first  
**Long-form writing or strategy** → Claude first  
**Important family or business decisions** → Both models + Nova synthesis  
**Cost-sensitive bulk work** → Grok heavy  
**High-stakes or nuanced topics** → Claude heavy with Grok second opinion

**Golden Rule:** When in doubt, start with Grok for speed, then bring in Claude if the output needs more depth or care.

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

Ready to ship the skill-activation-plan next, or want a quick Chamber on the order?