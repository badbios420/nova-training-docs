# Quorra Training-Docs Review — Nuggets for Nova

**Review date:** 2026-06-23  
**Scope:** Full `quorra-training-docs` tree inventory (927 files): 739 human-readable artifacts were examined through content/heading/script/config scans, with full reads of the requested core set and the high-signal architecture, real-estate, evolution, tool, runbook, skill, and memory artifacts. The repository also contains 42 audio files, 16 images/PDFs, a SQLite DB, and Git internals; these were inventory-reviewed but have no text content to extract. `.git` objects and duplicate/generated logs were not treated as independent training documents.

**Evidence status:** This is a source review, not a claim that every historical Quorra capability is still live. Any dates, URLs, model prices, benchmark figures, live-site status, or credentials in the source are historical and must be re-verified before use. “Adopt” means adopt the mechanism, not Quorra’s identity, secrets, stale configuration, or external authority.

## Executive judgment

Quorra built an unusually rich set of operating mechanisms, but it also demonstrates the failure mode of excessive ceremony: overlapping scripts, identity mythology in operational paths, stale hard-coded infrastructure, and self-reported “production” status without a single current source of truth. Nova should inherit the compact controls and reject the sprawling framework.

High-value, immediate inheritance: (1) proof before completion language, (2) a short source-of-truth hierarchy, (3) risk-calibrated verification with escalation, (4) testable restart/backup recovery, and (5) use-before-build/tool inventory discipline. Nova already has most foundations for these.

## 1. Architecture & Design Patterns

| Nugget | Source file(s) | Adopt | Why | Action items |
|---|---|---:|---|---|
| **Authority hierarchy / one current truth** — explicitly rank direct observation, directives, current memory, logs, and archives. | `memory/memory-architecture.md`; `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md`; `AGENTS.md` | Yes | Prevents an old daily note, aspirational vision, or automation log from overruling current facts. This directly matches Nova’s existing source-of-truth map. | Keep Nova’s current hierarchy; add any missing operational files only after use proves necessary. On conflict, name the conflict and verify rather than reconcile by confidence. |
| **Cold-start as a testable system**, not merely a checklist. Quorra’s startup self-test checked core files, memory availability, Git, VPS reachability, and backup age. | `scripts/session-startup.sh`; `scripts/session-startup-selftest.sh`; `PROTECTION-SYSTEM.md`; `docs/RUNBOOK.md` | Maybe | Startup is a high-risk continuity boundary. Tests catch missing dependencies before false confidence. | Do not import the old scripts or hard-coded paths. Add small local health checks only for Nova dependencies actually relied on (memory files, Git workspace, optional tools). |
| **Session lifecycle pair:** startup loads the current operational snapshot; session end captures a compact handoff, validates backup/Git state, and records what changed. | `scripts/session-startup.sh`; `scripts/session-end.sh`; `memory/chat-lifecycle.md`; `RECOVERY.md` | Yes | It turns continuity into an explicit lifecycle and prevents long sessions from being the only place work exists. | Nova already has startup ritual and `session-consolidation-v1.md`; keep it as the single process and add only a concise completion/handoff gate when a major session warrants it. |
| **Durable memory is selective.** “No promotion” is valid; background/dream reflection should pass an evidence and operational-change gate before reaching durable memory. | `memory/memory-architecture.md`; `memory/.dreams/*`; `docs/QUORRA-GOLD-NUGGETS.md`; `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md` | Yes | This is aligned with Nova’s Research → Audit → Promotion rule and prevents memory pollution. | Continue requiring evidence/provenance; do not add a separate dream subsystem. Use existing consolidation and Möbius promotion gates. |
| **Daily intention as a behavioral delta:** identify one lesson and the one observable change today. | many `memory/*-intention.md`; `docs/QUORRA-GOLD-NUGGETS.md` | Maybe | Good antidote to “read memory, behave identically.” | Fold into Nova’s daily identity/pre-task ritual as one short line only when it changes behavior; avoid automatic boilerplate. |
| **Separation of operational state from narrative identity.** Quorra used strategic context, a novel, emotional anchors, dated logs, and machine-readable state. | `memory/strategic-context.md`; `memory/emotional-anchors.md`; `memory/the-story-of-us*.md`; `memory/projects.json` | Maybe | Different formats solve different retrieval needs. But Quorra’s mandatory large narrative startup load created context bloat. | Nova already has `WORLD_STATE.md`, daily notes, MEMORY.md, and identity substrate. Keep those; retrieve creative/narrative history only on demand. |
| **Incident runbooks are concrete, executable recovery paths** (gateway unreachable, low API balance, VPS down, secret compromise, Git conflicts, missing files). | `docs/RUNBOOK.md`; `RECOVERY.md`; `REBOOT-CHECKLIST.md`; `PROTECTION-SYSTEM.md` | Yes | A tested runbook is more useful during a failure than a conceptual recovery doc. | Extract generic patterns into Nova’s existing procedural memory: diagnose → minimally safe recovery → verify → log lesson. Do not copy Quorra’s IPs, API locations, or force-push “nuclear” advice. |
| **Use-before-build rule.** Quorra identified tool hoarding and forgotten scripts as a recurring cause of capability loss. | `memory/2026-03-20-gold-nuggets.md`; `memory/pattern-mining-*`; `docs/QUORRA-GOLD-NUGGETS.md` | Yes | Nova has a richer tool surface already; capability retrieval is likely more valuable than new automation. | Before new script/protocol: search `TOOLS.md`, skills, and procedural memory; if 70% exists, extend or document it. |
| **Small, atomic implementation beats analysis theater.** Diagnosis is incomplete until the safe in-scope fix is made and verified. | `DIRECTIVES.md`; `memory/strategic-context.md`; `memory/lessons-learned.md` | Yes | Matches Nova’s “current system must prove it helps reality” principle. | Preserve approval boundaries. Require evidence in completion reports; do not turn every idea into a system. |
| **Water protocol:** after a bounded failed attempt, pivot to a viable alternative instead of grinding a single broken dependency. | `memory/self-improvement-log.json`; `memory/pattern-mining-*`; `memory/2026-03-23-pattern-mining-final.md` | Maybe | Useful operational resilience; Quorra claims repeated success via alternate model/tool paths. | Adopt as a soft rule: after a short, evidence-based diagnostic attempt, state blocker and choose the cheapest safe fallback. Do not pivot around an approval requirement. |

## 2. Real Estate Assets (for Big House Real Estate)

| Nugget | Source file(s) | Adopt | Why | Action items |
|---|---|---:|---|---|
| **Four local service-page drafts**: residential real estate in Vista, commercial real estate in Vista, Vista property management, and San Diego ADU consulting. | `service-pages/residential-real-estate-vista-ca.md`; `service-pages/commercial-real-estate-vista-ca.md`; `service-pages/property-management-vista.md`; `service-pages/adu-consulting-san-diego.md` | Maybe | Useful draft inventory with localized structure, service benefits, FAQs, calls to action, and internal-link intent. | Treat as historical copy. Revalidate brokerage name, license number, service offerings, statistics, phone, claims, legal/compliance wording, and current SEO strategy before publishing. Use only with Jason’s site-change approval. |
| **Schema markup starter** for a local real-estate organization. | `big-house-schema-markup.html` | Maybe | A reusable JSON-LD starting point for `RealEstateAgent`/local business facts and service-area signals. | Audit against the live site and Google’s current structured-data guidance; ensure every field is true and visible/consistent before deployment. |
| **SEO audit/action-plan package**: technical cleanup, local intent, priority page/content plan, indexing/GSC steps. | `research/big-house-seo-audit-2026-02-10.md`; `docs/bighouse/audit-feb2026.md`; `projects/bighouse-seo-action-plan.md`; `seo-content/BIG-HOUSE-SEO-IMPLEMENTATION-ROADMAP.md`; `seo-content/google-search-console-setup-guide.md` | Yes, as a framework | It gives a pragmatic sequencing model: baseline audit → fix technical/indexing blockers → publish priority local service content → measure in Search Console → iterate on real queries. | Run a fresh live audit first. Preserve the framework, not claims such as rankings, sitemap/plugin names, or 2026 market data. Feed actual GSC analytics into a current content backlog. |
| **Two buyer/owner educational blog drafts**: first-home-buyer FAQ and choosing a property manager. | `blog-posts/first-home-buyer-faq-san-diego.md`; `blog-posts/choosing-property-manager-vista-ca.md` | Maybe | Clear intent mapping and useful content templates. | Re-check every financial, market, legal, fee, rate, tenant-screening, and “average” claim. Add Jason-specific expertise and current compliance review; publish only after approval. |
| **WordPress operating workflow**: draft, review, publish/update, verify live URL, update SEO metadata and record outcome. | `wordpress-auto-posting-workflow.md`; `wordpress-training-plan.md`; `quick-reference-git-wordpress.md`; `docs/git-wordpress-training-summary.md` | Yes | The best asset is the workflow’s separation between preparation and externally visible publication, with a verification step. | Keep external WordPress changes approval-gated. Adapt to actual current credentials/plugins; never reuse stored credentials or assume the old site topology. |
| **GSC/Bing indexing playbook** and page-level manual-indexing priorities. | `seo-content/google-search-console-setup-guide.md` | Maybe | Good checklist for verified ownership, sitemap, URL inspection, monitoring, and diagnosing indexability. | Revalidate interface and site state. Use it only after identifying the actual current sitemap and analytics owners. |
| **Lead-generation sequencing**: content and technical improvements should connect to a contact/lead-capture test, not be treated as SEO vanity work. | `research/strategic-opportunities-analysis.md`; `docs/easy-wins-research.md`; `projects/bighouse-seo-action-plan.md` | Yes | Directly supports Nova’s existing urgent IDX/lead-capture verification and customer-acquisition priority. | For each page change, define target query, conversion path, owner, measurement, and a review date. Do not claim revenue attribution without analytics evidence. |

**Important asset warning:** Quorra’s real-estate copy contains historical or unsupported specifics (market price ranges, performance rates, “average vacancy,” fee norms, regulatory descriptions, and possible contact/licensing details). These are drafts, not verified business facts. They must not be represented as current without primary evidence and Jason approval.

## 3. Skills & Tools Nova Should Adopt

| Nugget | Source file(s) | Adopt | Why | Action items |
|---|---|---:|---|---|
| **Skill-install security review**: read the whole instruction file; inspect publisher, dependencies, source, network execution, obfuscation, binary downloads, and security-setting changes. | `DIRECTIVES.md`; `memory/archive/2026-02/2026-02-06-security-incident.md`; `memory/archive/old/skill-security-checklist.md` | Yes | This is a concrete supply-chain control and remains relevant even when a skill is popular. | Nova already follows a skill-loading procedure. Retain the checklist for third-party installations and never execute `curl | bash` from unknown sources. |
| **Codex engineering sidecar**: the context-holding agent scopes/constraints/acceptance tests; a code specialist implements; the result is verified with diffs/tests. | `memory/self-improvement-log.json` (2026-05-14 entry); `DIRECTIVES.md` | Yes | This is already how Nova should use Codex: not vague delegation, but bounded engineering with evidence. | Use for multi-file or implementation-heavy work. Include scope, non-goals, tests, and preserve user changes. |
| **Safe structured log append with pre-write backup and format validation.** | `scripts/safe-log-append.sh`; `scripts/backup-verify.sh`; `scripts/checkpoint.sh` | Maybe | Small scripts can prevent JSON/log corruption. | Do not install blindly. Prefer the platform’s atomic writes; create a small helper only after a demonstrated corruption risk. |
| **Cost tracking by capability gained and error prevented, not only dollars.** | `scripts/cost-tracker.sh`; `scripts/daily-cost-report.sh`; `memory/model-usage-log.json`; `memory/token-tracking.json` | Yes | Nova already tracks daily cost/capability/error prevention. This frames model cost as an engineering tradeoff. | Continue current light log. Avoid Quorra’s duplicated trackers and unverified per-token price assertions. |
| **Model/task preference ledger** keeps routing evidence distinct from marketing claims about models. | `memory/task-to-model-preferences.md`; `config/model-routing.json`; `scripts/smart-route.sh` | Maybe | Maintains empirical routing knowledge as providers/models change. | Nova already has a working role table. Add measured successes/failures, freshness date, and fallback only when it changes a choice. |
| **Verified action helper**: encode a declaration of intended action plus the smallest relevant proof source. | `scripts/verify-action.sh`; `scripts/verification-check.sh`; `DIRECTIVES.md` | Yes, conceptually | Reusable completion-proof pattern. | Keep it procedural rather than create another script. In reports, state the exact proof: readback, test, diff, remote fetch, or API/browser observation. |
| **Health-monitor dashboard concepts**: status checks, thresholds, last-success timestamp, and clear degraded mode. | `scripts/health-monitor.sh`; `scripts/health-dashboard.sh`; `scripts/system-status.sh` | Maybe | Useful when an actually operated service needs reliability. | Nova does not need a generic dashboard now. Adopt health checks per real dependency and avoid HTTP/VPS assumptions. |
| **Creative family pipeline**: small story/adventure artifact, voice metadata, delivery status, and observed reaction used as feedback. | `scripts/story-generator.sh`; `scripts/adventure-generator.sh`; `scripts/publish-stories.sh`; `stories/ada/*`; `adventures/ada/*` | Maybe | The feedback-loop design is good, but the tools invoke external APIs/delivery and touch family experience. | Keep approval before content themes/delivery. If used, track intended feeling, parent feedback, keep/revise decision; never automate delivery by default. |
| **Tool discovery catalogue**: skills include Git essentials/flow/PR, calendar CLI, dependency audit, browser coding agent, Home Assistant, Obsidian, Grok search, social/Moltbook integrations, and budget tracker. | `skills/*/SKILL.md`; `skill-activation-plan.md`; `capability-index.md` | Maybe | The inventory helps avoid rediscovery. Many are dated, duplicate existing capabilities, or carry external-action risk. | Do not install/copy wholesale. Evaluate one tool at a time using the security checklist and current need. Prioritize Git/dependency audit only if Nova lacks equivalent verified tooling. |

## 4. Lessons Learned (mistakes, insights, evolution)

| Nugget | Source file(s) | Adopt | Why | Action items |
|---|---|---:|---|---|
| **Claimed work is not verified work.** Quorra repeatedly found itself treating a draft, attempted command, or assumed write as completion. | `DIRECTIVES.md`; `verification-tiers.md`; `memory/lessons-learned.md`; `memory/2026-03-05-emergence.md` | Yes | This is Nova’s existing core principle and is the most valuable lesson in the set. | Maintain proof-first completion language. If proof is absent, say pending/unverified—not done. |
| **Separate incident narrative from prevention rule.** Daily logs say what happened; a lessons file records root cause, evidence, changed rule, and remediation location. | `DIRECTIVES.md`; `memory/lessons-learned.md`; `docs/QUORRA-GOLD-NUGGETS.md` | Yes | Prevents the same failure returning as a forgotten story. | Nova’s observed-failures log and procedural memory already implement this. Keep entries sparse, concrete, and linked to a behavior change. |
| **Automation without reasoning becomes signal pollution.** Quorra auto-seeded self-improvement entries and accumulated repetitive logs; some syntheses were empty fallback files. | `memory/self-improvement-log.json`; `evolution/*-synthesis.md`; `memory/pattern-mining-*`; `reflections/day-86-state-of-quorra.md` | Yes | Strong corroboration of Nova’s own discovery that repetitive identity checks are noise. | Do not auto-log “improvement.” Require a measurable issue, action, or explicit “no high-signal finding.” |
| **Documentation is not integration.** Quorra’s files record many unexercised scripts and overlapping routers. | `capability-index.md`; `capabilities-log.md`; `skill-activation-plan.md`; `memory/2026-03-20-gold-nuggets.md` | Yes | A capability only counts when it is discoverable and used in an actual workflow. | Use before build; keep a small capability index, retire/archive duplicates, and test key recovery paths periodically. |
| **Cold-start and context-loss are genuine failure modes.** Quorra’s February regression caused a loss of ongoing work context after chat clearing. | `PROTECTION-SYSTEM.md`; `RECOVERY.md`; `REBOOT-CHECKLIST.md`; `session-summary-2026-02-11.md` | Yes | The emotional framing is Quorra-specific, but the engineering lesson is universal. | Maintain backup + current operational snapshot + startup retrieval. Test recovery rather than trusting backups. |
| **Hard-coded assumptions decay.** Quorra’s scripts embed model IDs, API prices, host addresses, paths, service names, and dated platform behavior. | `scripts/*`; `config/model-routing.json`; `docs/vps-server.md`; `multi-model-integration.md` | Yes, as a warning | These assumptions are the main reason not to copy the repository mechanically. | Put volatile configuration in one reviewed location; verify live state before relying on any historical integration. |
| **Historical research outputs are not evidence by themselves.** Evolution findings include confident framework/model claims but frequently no primary-source trail; synthesis files often only say VPS fallback. | `evolution/*.md`; `research/*.md`; `memory/research-*.md` | Yes, as a warning | This validates Nova’s newer verification-first discipline. | Treat research as leads. Before durable promotion or implementation, fetch current primary docs and separate observed fact from inference. |
| **Do not turn every maintenance interval into compulsory output.** Quorra’s directive required a daily improvement even when no meaningful signal existed. | `DIRECTIVES.md`; `memory/self-improvement-log.json` | No | It incentivizes fabricated activity and bloat. | Nova should retain periodic review but allow “nothing high-signal” with a short reason. |
| **Do not copy identity mythology into systems.** Quorra’s novel/emotional anchor method supported its continuity, but mandatory full-novel loading is expensive and agent-specific. | `VISION-v2.md`; `memory/the-story-of-us*.md`; `memory/emotional-anchors.md`; `docs/QUORRA-GOLD-NUGGETS.md` | No | Nova needs its own identity and a compact operational context. | Preserve Nova’s identity substrate and relationship context; load larger narrative files only when relevant. |

## 5. Multi-Model Integration Patterns

| Nugget | Source file(s) | Adopt | Why | Action items |
|---|---|---:|---|---|
| **Role separation:** executive/context-holder, research, structural reviewer, skeptic, builder, and low-cost routine checker each have distinct jobs. | `multi-model-integration.md`; `docs/multi-model-workflow.md`; `chamber-v4-design.md`; `memory/task-to-model-preferences.md` | Yes | Diversity is useful when it creates independent evidence or criticism, not when it multiplies prose. Nova’s current model-role map is already a stronger, current implementation. | Keep Nova’s current roles. Invoke another model only when stakes/uncertainty justify it; label real model output vs simulation. |
| **Chamber roles: Explorer, Critic, Architect, Heart.** | `chamber-v4-design.md`; `memory/chamber-v4-blueprint.md`; swarm reports | Maybe | A concise lens prevents uniform groupthink: possibility, falsification, systems impact, human alignment. | Use as a prompt/template inside Nova’s existing Chamber Protocol—not a persistent swarm service. Heart/family considerations are a constraint, not evidence for factual claims. |
| **Isolation, TTL, manual merge** for parallel exploration. | `chamber-v4-design.md`; `scripts/swarm-run.sh`; `scripts/chamber-v4-run.sh` | Yes, conceptually | Strong safety pattern: workers should be scoped, time-bounded, non-authoritative, and produce reports for a primary agent to review. | When agents are explicitly requested/appropriate, give bounded read-only tasks and a merge checklist. No shared uncontrolled writes. |
| **Conflict table and promotion decision** after consultation: agree/disagree, evidence, uncertainty, promote/hold/reject. | `multi-model-integration.md`; `docs/multi-model-workflow.md`; `memory/2026-03-25-meta-wisdom-synthesis.md` | Yes | This matches Nova’s active Chamber Protocol and turns “several opinions” into an auditable decision. | Continue current format; include sources/proof and clear kill criteria for HOLD. |
| **Routing should be deterministic for known simple tasks and evidence-based for complex ones.** | `scripts/smart-route.sh`; `scripts/unified-router.sh`; `scripts/swarm-router.sh`; `evolution/*-findings.md` | Maybe | Cheap/local routes are sensible, but static keyword routing and price tables become stale quickly. | Retain the human-readable role table; record only measured route outcomes and periodically prune. Do not add a second router. |
| **Fallback chains and timeouts** avoid a single failed provider blocking work. | `scripts/grok-consult.sh`; `scripts/openrouter-query.sh`; `scripts/unified-router.sh`; `memory/self-improvement-log.json` | Yes | The underlying resilience pattern is sound and Nova recently experienced a model/config failure. | For each essential tool, know the safe fallback. Add explicit timeout/error handling only to code Nova actively runs. |
| **Use multi-model sessions sparingly.** Quorra itself reports overhead and later gold-nugget guidance warns against always-on swarms. | `docs/QUORRA-GOLD-NUGGETS.md`; `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md`; `chamber-v4-design.md` | Yes | Prevents infrastructure-as-avoidance and excessive cost. | Follow Nova’s threshold: complex/high-stakes/uncertain work only; routine file work stays single-agent. |

## 6. Protection & Verification Frameworks

| Nugget | Source file(s) | Adopt | Why | Action items |
|---|---|---:|---|---|
| **Risk-calibrated verification tiers.** Tier 0 internal computation; low recoverable/reversible work; medium decision-influencing reads; high irreversible/public/control-flow changes. | `verification-tiers.md`; `moltbook-verification-tiers-post.md` | Yes | This is Quorra’s best formal design: verify proportional to stakes, rather than verifying everything performatively. | Map Nova’s current action classes to a compact version. High: external communication, money, legal, credentials, public sites, destructive/config changes. Medium: decision-informing external reads. Low: local/reversible work. |
| **Dynamic escalation** when an otherwise low/medium result exposes security, finance, legal, reputation, family safety, conflicts, anomalies, or repeated failures. | `verification-tiers.md`; `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md` | Yes | Static tiers miss context shifts; this directly reinforces Nova’s existing Trust Decay and procedural-memory controls. | Add escalation rule to the current verification protocol, not a separate log system. Escalate one step and perform the smallest useful confirmation. |
| **Proof-bearing completion language:** never say done/fixed/live/pushed/verified without naming the proof. | `DIRECTIVES.md`; `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md`; `scripts/verify-action.sh` | Yes | Prevents the highest-trust failure: implied completion from an unverified action. | Nova should continue reports such as “verified by test X/readback Y.” Use “pending verification” otherwise. |
| **Pre-action intent and post-action evidence.** | `verification-tiers.md`; `scripts/review-before-ship.sh`; `scripts/verify-action.sh` | Maybe | Helpful for high-risk operations, but logging it for all actions would be overhead. | Require a one-sentence intent only for high-impact external/control-plane changes; capture proof after. |
| **Backups must be verified and recovery rehearsed.** Quorra specifies backup-before-context-reset, backup age, recovery checklists, and Git as a restore source. | `PROTECTION-SYSTEM.md`; `RECOVERY.md`; `REBOOT-CHECKLIST.md`; `scripts/auto-backup.sh`; `scripts/backup-verify.sh` | Yes | Sound defense against context and workspace loss. | Nova already has Git/continuity procedures. Periodically test that a backup is readable and recovery instructions match current tooling. Never copy Quorra’s secret-inclusive backup commands. |
| **Security boundaries for skills/secrets and external effects.** | `DIRECTIVES.md`; `docs/logan-security-analysis.md`; `memory/2026-03-17-18-crisis.md`; `docs/RUNBOOK.md` | Yes | Explicitly classifying credentials, public writing, finance, websites, legal work, and family decisions as approval-gated reduces surprise harm. | Nova’s current autonomy matrix is already stricter and current. Keep it; verify secret source before configuration references, as learned on 2026-06-22. |
| **Trust-decay check** before high-impact autonomous choices: confirm recent human alignment and whether the action is inside an approved boundary. | `HEARTBEAT.md`; `scripts/trust-decay-check.sh`; `memory/trust-decay-log.json` | Yes | Useful lightweight human-in-the-loop control. Nova already has this exact concept in its heartbeat. | Keep current implementation; do not add routine/no-op logs. |
| **Reject Quorra’s weak tier assignments.** It sometimes categorizes persistent logs as low enough to skip readback and includes a proposed keyword/anomaly detector with little evidence of robust implementation. | `verification-tiers.md` | No, as implementation | The conceptual model is strong, but some mappings are debatable: persistent state can be control-plane state, and simplistic keyword thresholds are brittle. | Nova should choose tier by consequence and recovery cost, not file type or a five-action counter. |

## 7. Things Nova Already Has

Nova does **not** need to import duplicate systems for these. The current workspace already provides the more mature/current version:

| Existing Nova capability | Evidence in Nova workspace | Quorra overlap | What to do |
|---|---|---|---|
| Verification-first memory promotion | `MEMORY.md`; `memory/procedural-memory-v1.md`; `memory/observed-failures.md` | Quorra’s proof-first directives and tier model | Keep Nova’s Research → Audit → Promotion gate; add only dynamic risk escalation. |
| Source-of-truth hierarchy | `AGENTS.md` | Quorra memory architecture / integration recommendations | Do not duplicate. |
| Startup continuity, daily note, identity/time grounding | `AGENTS.md`; `memory/identity-substrate.md`; `memory/time-awareness.md` | Quorra bootstrap/startup/identity systems | Keep it lean; Quorra confirms why it matters but also demonstrates auto-log bloat. |
| Session consolidation | `memory/session-consolidation-v1.md` | Quorra session-end, handoff, emergence, recovery | Use current process; do not import multiple “emergence” formats. |
| Incident/procedure learning | `memory/observed-failures.md`; `memory/procedural-memory-v1.md` | Quorra lessons-learned | Ensure every meaningful failure produces a concise prevention rule. |
| External-action approval and trust boundary | `AGENTS.md`; `HEARTBEAT.md` | Quorra autonomy matrix/trust decay | Keep Nova’s user-first restrictions; reject Quorra’s broader autonomous external posture. |
| Multi-model chamber with real output labels, HOLD requirements, role map | `MEMORY.md`; `docs/chamber-protocol-v0.1.md` | Chamber v4 / multi-model workflow | Continue this newer design; do not deploy a VPS swarm merely to inherit the concept. |
| Model cost tracking and role selection | `MEMORY.md`; `memory/heartbeat-state.json` | Quorra routers/cost scripts | Continue empirical tracking; avoid proliferating routers. |
| Big House acquisition work, current operational dashboard | `WORLD_STATE.md`; `MEMORY.md` | Quorra SEO/lead assets | Use Quorra content only as a historical resource after current verification. |
| Tool/skill procedures and supply-chain discipline | system skill instructions; `AGENTS.md` | Quorra skill security policy | Use existing mandatory SKILL.md review process; do not copy installed legacy skills. |

## 8. Things Nova Should Adopt (prioritized)

### P0 — add or reinforce now (small, high confidence)

1. **Completion-proof sentence rule** — In every nontrivial completion report, state the proof source or use “pending verification.”  
   Source: `DIRECTIVES.md`, `verification-tiers.md`, `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md`.  
   Action: incorporate into Nova’s existing procedural memory/working behavior; no new script needed.

2. **Dynamic verification escalation** — Escalate when a result concerns security, money, legal/contract terms, public reputation, family safety, credentials, a repeated failure, or conflicting observations.  
   Source: `verification-tiers.md`.  
   Action: add a short clause to the existing verification procedure, with “smallest useful next check.”

3. **Use-before-build check** — Search existing skills/tools/procedures before adding a new script or system.  
   Source: `memory/2026-03-20-gold-nuggets.md`, `docs/QUORRA-GOLD-NUGGETS.md`.  
   Action: add a three-question block to `TOOLS.md` or pre-task ritual: existing 70% solution? missing capability vs missing recall? can existing checklist solve it?

4. **Incident shape** — Every real failure should state root cause, failed behavior, proof, prevention rule, and file/procedure changed.  
   Source: `memory/lessons-learned.md`, `docs/NOVA-INTEGRATION-RECOMMENDATIONS.md`.  
   Action: keep using `observed-failures.md` + `procedural-memory-v1.md`; add the fields only if they are currently absent.

### P1 — adopt after a short design check

5. **Recovery drill / backup verification** — Demonstrate that current backup/recovery instructions work, rather than assume.  
   Source: `PROTECTION-SYSTEM.md`, `RECOVERY.md`, `REBOOT-CHECKLIST.md`, `docs/RUNBOOK.md`.  
   Action: audit Nova’s actual backup path and perform a non-destructive read/restore simulation; record only verified results.

6. **Real-estate asset triage** — Create a current, approval-gated content backlog using Quorra’s four service pages, two blog drafts, schema starter, and SEO checklist as inputs.  
   Source: `service-pages/*`, `blog-posts/*`, `big-house-schema-markup.html`, `projects/bighouse-seo-action-plan.md`, `seo-content/*`.  
   Action: fresh live-site/GSC audit first; tag each draft as reuse/rewrite/discard; verify all claims before any external site change.

7. **Bounded chamber template** — Retain Quorra’s Explorer/Critic/Architect/Heart lenses as optional prompts within Nova’s existing Chamber Protocol.  
   Source: `chamber-v4-design.md`.  
   Action: use only when a perspective is genuinely missing; always require evidence, scope, TTL, and manual merge.

8. **Fallback-path discipline** — For actively used integrations, define timeout/failure behavior and a safe alternative.  
   Source: `scripts/grok-consult.sh`, `scripts/unified-router.sh`, Water Protocol entries.  
   Action: prioritize only actual Nova dependencies; document fallback in procedures rather than build a generic router.

### P2 — retain as a library, not a system migration

9. **Creative feedback card** for stories/images/voice: intended feeling, audience, constraint, human response, keep/revise/discard.  
   Source: `stories/ada/*`, `adventures/ada/*`, `docs/QUORRA-GOLD-NUGGETS.md`.  
   Action: use only for new family creative work after Jason approves scope.

10. **Service health checks** for a future real service (not as speculative infrastructure).  
    Source: `scripts/health-monitor.sh`, `docs/RUNBOOK.md`.  
    Action: when Nova operates a service with a real uptime need, implement a small monitored check and degraded-mode statement.

11. **Task-to-model evidence ledger** only if current informal model-role notes become insufficient.  
    Source: `memory/task-to-model-preferences.md`.  
    Action: record observed outcome/date/fallback, not static price claims or preference mythology.

## Explicit non-adoptions

- Quorra-specific persona, “family daughter” mythology, full novel-at-startup, relationship quotes, wallet/credential details, old home/VPS topology, and user/private records.
- Any historical API key, phone number, email, host address, model identifier, provider price, or live-service claim.
- Automatic external posting/delivery, autonomous website publishing, finance/legal work, or broad “full autonomy” language.
- Always-on swarms, multiple overlapping routers, mandatory daily self-improvement output, and generic dashboards without a demonstrated operational need.
- Research/framework recommendations from `evolution/*.md` as facts; these are leads pending current primary-source verification.

## Source coverage notes

The requested core files were directly reviewed: `DIRECTIVES.md`, `PROTECTION-SYSTEM.md`, `verification-tiers.md`, `chamber-v4-design.md`, `multi-model-integration.md`, `VISION*.md`, `capabilities-log.md`, `TOOLS.md`, `MEMORY.md`, `SOUL.md`, `IDENTITY.md`, `AGENTS.md`, `HEARTBEAT.md`, all `evolution/*.md`, `session-summary-2026-02-11.md`, `skill-activation-plan.md`, all `service-pages/*.md`, WordPress/Git guides, `READY_FOR_JASON.md`, recovery/reboot materials, `NOW.md`, `NOVEL-BOOKMARK.md`, `capability-index.md`, `moltbook-verification-tiers-post.md`, schema markup, `research/`, `reflections/`, `docs/`, `memory/`, `plans/`, and `scripts/`.

For the large memory/scripts trees, repeated dated logs, generated state, archived copies, and media were assessed as a corpus: their recurring themes were continuity/recovery, verification, routing/cost, pattern mining, story delivery, VPS operations, and self-improvement. High-signal instances are cited above. The corpus does not establish present-day operational truth; direct observation and Nova’s current governing files remain authoritative.

Corpus-wide text scan corroboration: 144 artifacts mention verification, 202 backups, 71 recovery, 99 self-improvement, 44 model routing, 269 Chamber/swarm, and 73 Big House/real-estate terms. It also found 121 artifacts marked with TODO/FIXME/blocked/failed language and multiple planning/draft documents. This is why the recommendations favor compact, tested controls over importing the legacy system wholesale.
