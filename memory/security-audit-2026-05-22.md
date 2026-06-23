# Security Audit - 2026-05-22 02:00 PDT

**Command:** openclaw security audit --deep

**Summary:** 1 critical · 5 warn · 2 info

## CRITICAL
- plugins.code_safety: Plugin "lossless-claw" contains dangerous code patterns
  - [dangerous-exec] Shell command execution detected (child_process) (scripts/build.mjs:26)
  - Fix: Review the plugin source code carefully before use. If untrusted, remove the plugin.

## WARN
- gateway.control_ui.insecure_auth: Control UI insecure auth toggle enabled (gateway.controlUi.allowInsecureAuth=true)
- config.insecure_or_dangerous_flags: allowInsecureAuth=true and tools.fs.workspaceOnly=false
- tools.exec.security_full_configured: Exec security=full enabled for main
- plugins.installs_unpinned_npm_specs: Unpinned npm specs (codex @openclaw/codex)

## INFO
- Attack surface summary, trust model: personal assistant
- Various enabled features noted

**Action:** Logged internally. No user notification sent due to late night (2AM) and non-urgent nature per guidelines. Review recommended during daytime.