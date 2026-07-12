# Chamber #9 Verdict: Should We Integrate Obsidian?
**Date:** 2026-07-11
**Chair:** Nova (grok-4.5)
**Consultants:** Skeptic (grok-4.5), Structural (claude-opus-4-8), Research (glm-5.1)
**Consensus:** HOLD (unanimous)

---

## The Question
Should Jason/Nova integrate Obsidian into the OpenClaw workspace?

## What We Already Have (Verified)
- OpenClaw **memory-wiki plugin** with optional Obsidian render mode (config toggle)
- `openclaw wiki obsidian *` CLI helpers (status, search, open, command, daily)
- obsidian-vault-maintainer + wiki-maintainer skills (bundled, tested)
- Current vault: **isolated mode, native render, no Obsidian CLI, no Obsidian app**
- Vault contents: 12 sources, **0 entities, 0 concepts, 0 syntheses** (dormant since ~6/23)
- Nova's working memory: MEMORY.md + daily notes + memory_search (functional, proven)

## Why HOLD (All Three Consultants Converged)

1. **The vault is empty.** 0 entities, 0 concepts, 0 syntheses. Obsidian on an empty graph = prettier empty graph. This is a content/pipeline problem, not a viewer problem.

2. **MEMORY.md already works.** No RE-blocking retrieval failure has been shown. memory_search covers Nova's recall. Obsidian adds human ergonomics, not agent cognition.

3. **Chamber #6 freeze is active.** Cognitive infrastructure expansion is frozen. RE is priority #1. Obsidian integration is literally the kind of expansion that was frozen.

4. **SSOT risk is real.** MEMORY.md → wiki ingest creates a copy. Dual stores = guaranteed drift. wiki-maintainer skill itself warns: "Do not let wiki pages become the only source of truth."

5. **WSL2 friction.** No native Obsidian app. Windows-side install + WSL path mapping = setup/maintenance tax. ADHD context-switch magnet.

6. **False productivity signal.** "Setting up Obsidian" feels like systems work. It's infrastructure for infrastructure's sake while RE waits.

## The ONE Thing Allowed Now
**Jason can open the wiki vault folder in Obsidian on the Windows side** (read-only, at his discretion). This is human-viewport-only, zero repo change, fully reversible. No agent-side writers, no plugins that write, no schema adoption.

Path to point Obsidian at: `\\wsl$\Ubuntu\home\mrbig3\.openclaw\wiki\main` (or equivalent WSL path)

## Exit Criteria

**→ PROMOTE if ALL of these are true:**
1. ≥2 dated RE misses caused by MEMORY.md/search structure failure
2. Wiki vault has live synthesis flow (entities/concepts/syntheses > 0 and growing)
3. Agent-primary vault, no Windows app dependency for Nova
4. Single-writer SSOT enforced
5. Chamber #6 freeze formally lifted

**→ REJECT if ANY of these happen:**
- Dual-store conflict detected
- >2h/week vault maintenance with no RE output
- WSL sync proves painful
- Vault still dormant at re-evaluation

**Re-evaluation timeline:** Chamber #6 freeze lift OR +60 days, whichever first.

## Options Ranked (For When HOLD Lifts)

| Option | What | Cost | Value |
|--------|------|------|-------|
| D (status quo) | Keep native render, no Obsidian | Zero | Preserves option |
| B (render toggle) | Switch render mode to `obsidian` | Low (config) | Future-proof format |
| A (full app) | Install Obsidian, point at vault | High | High IF Jason uses it |
| C (bridge) | Enable bridge import | Medium | Enables human-side use |

Correct sequencing when time comes: D → B → A/C. Never skip steps.
