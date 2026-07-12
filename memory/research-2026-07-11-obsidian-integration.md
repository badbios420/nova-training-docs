# Obsidian Integration Research Report
**Date:** 2026-07-11
**Question:** Should Jason/Nova integrate Obsidian with OpenClaw?
**Status:** Research only — no installs

---

## 1. Verified Claims About OpenClaw + Obsidian Capability

| # | Claim | Evidence | Verification |
|---|-------|----------|--------------|
| 1 | OpenClaw has a bundled memory-wiki plugin with optional Obsidian render mode | `openclaw wiki status` shows `Render mode: native` (switchable to `obsidian`) | ✅ Live verified |
| 2 | `openclaw wiki obsidian *` CLI helpers exist: `status`, `search`, `open`, `command`, `daily` | `openclaw wiki obsidian --help` confirmed 5 subcommands | ✅ Live verified |
| 3 | obsidian-vault-maintainer skill exists as plugin skill | Read from `~/.openclaw/plugin-skills/obsidian-vault-maintainer/SKILL.md` | ✅ Live verified |
| 4 | wiki-maintainer skill exists as plugin skill | Read from `~/.openclaw/plugin-skills/wiki-maintainer/SKILL.md` | ✅ Live verified |
| 5 | Current wiki vault is in **isolated** mode, **native** render, no Obsidian CLI | `openclaw wiki status` output | ✅ Live verified |
| 6 | Obsidian CLI is **not installed** on this system | `openclaw wiki obsidian status` → "Obsidian CLI is not available on PATH" | ✅ Live verified |
| 7 | Wiki vault has 12 sources, 0 entities, 0 concepts, 0 syntheses, 10 reports | `openclaw wiki status` + `index.md` inspection | ✅ Live verified |
| 8 | Wiki vault ingests from MEMORY.md and other workspace files as sources | `sources/memory.md` shows sourceType: local-file, path: MEMORY.md | ✅ Live verified |
| 9 | obsidian-vault-maintainer skill supports wikilinks, frontmatter, Dataview-compatible formatting, and deterministic managed sections | SKILL.md read | ✅ Live verified |
| 10 | wiki-maintainer skill supports managed markers, bridge import, unsafe-local import, lint, and compile cycle | SKILL.md read | ✅ Live verified |
| 11 | Obsidian render mode would change wiki output to use `[[Wikilinks]]`, stable filenames, and Obsidian-compatible frontmatter | obsidian-vault-maintainer SKILL.md | ✅ Live verified |
| 12 | Obsidian app (desktop) is **not installed** on this Linux/WSL2 system | No binary found via which/dpkg/snap/flatpak | ✅ Live verified |

---

## 2. Pros/Cons for THIS Setup Specifically

### Pros

- **Obsidian render mode is a config toggle, not an install.** Switching from `native` to `obsidian` render mode in the wiki vault is a low-cost change that makes wiki output more navigable if Jason ever opens the vault folder in Obsidian.
- **Wikilinks improve cross-referencing.** `[[Wikilinks]]` in wiki pages create discoverable connections between entities, concepts, and sources — better than flat markdown headings.
- **Dataview queries possible.** If frontmatter is consistent, Obsidian's Dataview plugin could provide dynamic dashboards over the wiki vault (e.g., "all sources older than 7 days", "entities with low provenance").
- **Daily note integration.** `openclaw wiki obsidian daily` could bridge Nova's daily notes into Obsidian's daily note structure, giving Jason a unified human-readable timeline.
- **Human-agent shared viewport.** If Jason opens the wiki vault in Obsidian, he can browse, search, and annotate the same knowledge base Nova uses — reducing the "black box" problem.
- **Skills already exist and are maintained.** Both obsidian-vault-maintainer and wiki-maintainer are plugin skills (not workspace/community), meaning they're bundled and tested with OpenClaw.

### Cons

- **No Obsidian app installed.** WSL2 environment makes Obsidian desktop app non-trivial (requires X11/Wayland forwarding or Windows-side install + WSL path mapping).
- **Wiki vault is barely used.** 0 entities, 0 concepts, 0 syntheses — the wiki vault is a skeleton. Adding Obsidian render mode to an empty vault adds complexity without value.
- **Nova's MEMORY.md already works.** The flat MEMORY.md + daily notes + `memory_search` pipeline is functional and well-established. Wiki vault is a parallel system that isn't being maintained.
- **Duplicate SSOT risk.** MEMORY.md → wiki source ingest creates a copy. If wiki pages diverge from MEMORY.md, which is truth? The wiki vault ingested MEMORY.md on 6/23 and hasn't been updated since.
- **Chamber #6 froze cognitive infrastructure expansion.** Adding Obsidian integration is literally the kind of expansion that was frozen. RE is priority #1.
- **Maintenance load.** Wiki vault requires `ingest → compile → lint` cycles. Obsidian adds `open → search → command → daily` on top. Neither is currently running on any cadence.
- **Jason's ADHD context.** A new tool/system to learn is a friction cost. Obsidian is powerful but has its own learning curve, plugin ecosystem, and configuration surface.

---

## 3. Decision Options

### Option A: Full Obsidian App Vault
- Install Obsidian on Windows side, point at WSL wiki vault path
- Switch render mode to `obsidian`
- Maintain `ingest → compile → lint` cycle
- Jason uses Obsidian as human viewport into Nova's knowledge base
- **Cost:** High (install, config, ongoing maintenance, SSOT discipline)
- **Value:** High IF Jason actually uses Obsidian regularly

### Option B: Memory-Wiki Obsidian Render Only
- Switch `openclaw wiki status` render mode from `native` to `obsidian`
- No Obsidian app install required
- Wiki output uses wikilinks + frontmatter format
- Nova can use `openclaw wiki obsidian search` and related helpers (they work without the app for file operations)
- **Cost:** Low (config change only, compatible with existing pipeline)
- **Value:** Medium — future-proofs vault format, no immediate benefit

### Option C: Bridge Mode
- Enable `openclaw wiki bridge import` to pull public memory artifacts into wiki
- Could sync wiki vault with external Obsidian vault (e.g., on Jason's personal machine)
- **Cost:** Medium (bridge config, sync cadence, conflict resolution)
- **Value:** Medium — enables human-side Obsidian use without full WSL integration

### Option D: Reject / Status Quo
- Keep wiki vault in `native` render mode, isolated, no Obsidian
- Continue using MEMORY.md + daily notes + memory_search as primary knowledge system
- Wiki vault remains available but dormant
- **Cost:** Zero
- **Value:** Preserves option value without adding complexity

---

## 4. Risks

### Duplicate SSOT
- **Severity: HIGH.** MEMORY.md is the current SSOT. Wiki vault already contains a stale copy (ingested 6/23, not updated since). Adding Obsidian compounds the problem: Jason reads wiki in Obsidian, Nova writes to MEMORY.md, divergence grows silently. The wiki-maintainer skill warns: "Do not let wiki pages become the only source of truth for new claims." This is already violated.

### Maintenance Load
- **Severity: MEDIUM.** Wiki vault maintenance requires `ingest → compile → lint` on cadence. Currently running at zero cadence. Obsidian adds `obsidian daily`, `obsidian search`, `obsidian command` — all require the CLI which isn't installed. If activated, these become heartbeat items that will rot without discipline.

### RE Opportunity Cost
- **Severity: HIGH.** Per Chamber #6, cognitive infrastructure expansion is frozen. Every hour spent on Obsidian integration is an hour NOT spent on Big House RE marketing, SEO, compliance, or content production. RE is priority #1 with confirmed revenue path.

### WSL2 Friction
- **Severity: MEDIUM.** Obsidian desktop app doesn't run natively in WSL2. Requires Windows-side install + WSL path access (`\\wsl$\...`) or X11 forwarding. This is a setup and maintenance friction that compounds.

### False Productivity Signal
- **Severity: MEDIUM.** "Setting up Obsidian" feels productive but isn't. It's infrastructure for infrastructure's sake. Nova's own principle: "Don't build the next system until the current one proves it helps reality." MEMORY.md has not been proven insufficient.

---

## 5. Recommended Verdict: HOLD

### Conditions for HOLD:

1. **Do NOT integrate Obsidian now.** The wiki vault is dormant, MEMORY.md works, and RE is priority #1.
2. **Do NOT switch render mode yet.** Switching to `obsidian` render on an empty vault adds formatting overhead with no reader. Wait until the wiki vault has actual entities/concepts/syntheses worth navigating.
3. **Revisit when ONE of these is true:**
   - Jason explicitly asks for a human-readable knowledge browser (then assess Option A or C)
   - Wiki vault reaches 50+ entities/concepts and native render becomes a navigation problem (then switch to Option B)
   - RE operations stabilize and cognitive infrastructure unfreezes (Chamber #6 reopened)
4. **One cheap action allowed now:** If desired, switch wiki vault render mode to `obsidian` as a future-proofing step. This costs nothing and makes any future transition easier. But do NOT install the Obsidian app, do NOT establish sync cadences, do NOT add Obsidian tasks to heartbeat.

### Rationale:
- The existing system (MEMORY.md + memory_search + daily notes) is functional and proven
- The wiki vault is underutilized (0 entities, 0 concepts) — adding Obsidian to an empty vault is premature optimization
- Chamber #6 explicitly freezes this category of work
- RE is the validated priority with revenue potential
- The option value is preserved: Obsidian integration can be done in <1 hour when actually needed
- "Don't build the next system until the current one proves it helps reality" — MEMORY.md hasn't failed yet

---

## Verification Notes

- All claims in section 1 verified live against the running OpenClaw instance
- Could NOT verify: whether Obsidian sync works reliably over WSL2 paths (no install to test)
- Could NOT verify: whether `openclaw wiki obsidian search` works without the Obsidian CLI (likely falls back to file search)
- Could NOT verify: Dataview plugin compatibility with OpenClaw's frontmatter format (would require Obsidian install)
- Memory search for "Obsidian integration" returned no relevant results — this topic has not been previously researched in Nova's memory corpus
