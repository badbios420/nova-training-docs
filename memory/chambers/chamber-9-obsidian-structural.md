REAL MODEL OUTPUT | Chamber #9 | Role: Structural

## 1. Reversible vs Irreversible
- **Reversible (cheap exits):** enabling render-mode, adding a read-only bridge script, opening the vault in an Obsidian app for viewing. All are toggles or external readers; no data mutation, no schema commitment.
- **Semi-reversible:** letting Obsidian plugins rewrite files (frontmatter/link reformatting). Reformatting is sticky and can diverge from wiki-maintainer's canonical output.
- **Irreversible (avoid now):** adopting an Obsidian-specific link/tag convention as the *source of truth*, or restructuring the vault to fit Obsidian's model. This forks the memory graph and creates dual-writer conflicts with existing skills.

## 2. What problem does it actually solve?
- **Jason (human viewport):** a real gap. Graph view, backlinks, and fast browsing help a human *inspect* what Nova stored. This is a read/observability need.
- **Nova (agent recall):** ~zero gain. `memory_search` + MEMORY.md + daily notes already serve retrieval. Obsidian adds no recall capability; the graph is human ergonomics, not agent cognition.
- **Diagnosis:** the vault is dormant (12 sources, 0 entities/concepts/syntheses since ~6/23). That is a *content/pipeline* problem, not a *viewer* problem. A prettier front-end on an empty graph produces a prettier empty graph. Obsidian would decorate the symptom, not fix the cause.

## 3. Sequencing (Chamber #6-safe)
Chamber #6 froze cognitive-infrastructure *expansion*; RE is priority #1. Anything that adds a new writer/schema = expansion = blocked. Human-viewport-only, read-only moves are not expansion.
- **Step 0 (no-op, allowed):** none required now.
- **Step 1 (deferred, allowed later):** Jason opens the existing vault in a local Obsidian app to browse. Zero repo change, zero install by Nova, fully reversible. This satisfies the *only* real need (human inspection) without touching governance or pipelines.
- **Do NOT:** enable plugins that write, install CLI, or make Obsidian conventions canonical.

## 4. Vote
**HOLD** — with condition: permit *human-side, read-only* Obsidian viewing by Jason at his discretion; block any agent-side integration, writer, or schema adoption until the freeze lifts and the vault is non-dormant.

## 5. HOLD exit criteria
- **Evidence that flips to PROMOTE:** vault has live synthesis flow (entities/concepts/syntheses > 0 and growing) AND Jason reports memory_search-based inspection is insufficient for his review needs.
- **Timeline:** re-evaluate after Chamber #6 freeze is formally lifted, or +60 days, whichever first.
- **Kill criteria (→ REJECT):** vault still dormant at review, OR any trial reveals dual-writer churn/reformat conflicts with wiki-maintainer. If recall never needs Obsidian, kill the integration track permanently and keep viewing as a manual human option only.
