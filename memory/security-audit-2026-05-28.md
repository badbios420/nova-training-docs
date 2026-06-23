# Security Audit - 2026-05-28 02:00 PDT

**Command:** `openclaw security audit --deep`

**Summary:** 1 critical · 6 warn · 2 info

## CRITICAL
- plugins.code_safety: Plugin "lossless-claw" contains dangerous code patterns
  - Found 1 critical issue(s) in 69 scanned file(s):
  - [dangerous-exec] Shell command execution detected (child_process) (scripts/build.mjs:26)
  - Fix: Review the plugin source code carefully before use. If untrusted, remove the plugin from your OpenClaw extensions state directory.

## WARN
- gateway.control_ui.insecure_auth: Control UI insecure auth toggle enabled
  - gateway.controlUi.allowInsecureAuth=true
  - Fix: Disable it or switch to HTTPS (Tailscale Serve) or localhost.
- config.insecure_or_dangerous_flags: Insecure or dangerous config flag enabled (gateway.controlUi.allowInsecureAuth=true)
- config.insecure_or_dangerous_flags: Insecure or dangerous config flag enabled (tools.fs.workspaceOnly=false)
- tools.exec.security_full_configured: Exec security=full is configured for main.
  - Fix: Prefer tools.exec.security="allowlist" with ask prompts.
- plugins.installs_unpinned_npm_specs: Plugin index includes unpinned npm specs (codex @openclaw/codex)
  - Fix: Pin install specs to exact versions.
- gateway.probe_auth_secretref_unavailable: Gateway probe auth SecretRef is unavailable

## INFO
- summary.attack_surface: Attack surface summary (groups: open=0, allowlist=0)
- tools.elevated: enabled
- hooks.webhooks: disabled
- hooks.internal: disabled
- browser control: enabled
- trust model: personal assistant (one trusted operator boundary)
- gateway.http.session_key_override_enabled: HTTP API session-key override is enabled

**Notes:** Audit completed successfully (exit code 0). No user notification sent per internal handling policy. Review recommended for critical plugin issue.