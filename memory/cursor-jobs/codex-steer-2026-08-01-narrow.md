# STEER — IMMEDIATE (do not cancel; re-prioritize now)

Jason + Nova: stop broad work. Current run continues under this narrowed objective only.

## STOP NOW
- Broad repository auditing
- UI bundle / HTML / JS inspection of Control UI source dumps
- Nonessential documentation, continuity notes, doctor rabbit holes
- Unrelated cleanup

## ONLY THESE 4 BLOCKERS

1) **Grok 4.5 dropdown**
- Explain why Control UI shows “Grok” instead of “Grok 4.5”
- Cause class: alias vs model ID vs provider catalog vs cache vs fallback
- Evidence required

2) **Explicit runtime proofs** (provider-transport logs / runtime metadata — NOT model prose)
- explicit `xai/grok-4.5`
- explicit `zai/glm-5.2`
- explicit `deepseek/deepseek-v4-flash`
For each: requested model → actual provider/model from logs

3) **Default subagent path**
- Spawn with **no model override**
- Prove actual execution is DeepSeek Flash **or** silent fallback to Grok
- Runtime/provider evidence only

4) **Write report immediately** when 1–3 done (optional work may remain):
`memory/cursor-jobs/codex-repair-report-2026-08-01-model-swarm.md`
Must include:
- root cause
- files changed
- redacted diff
- rollback commands
- remaining failures

## OUT OF SCOPE FOR NOW
Unrelated doctor warnings, continuity notes, docs, repo cleanup.

## DONE CRITERIA
If 1–4 complete → write report and exit even if other items open.
