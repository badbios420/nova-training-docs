# Daily Security Audit - 2026-05-29 02:00 PDT

**Command:** `openclaw security audit --deep`

**Summary:** 1 critical · 6 warn · 2 info

## CRITICAL
- plugins.code_safety: Plugin "lossless-claw" contains dangerous code patterns
  - Shell command execution detected (child_process) in scripts/build.mjs:26
  - Fix: Review the plugin source code carefully before use. If untrusted, remove the plugin.

## WARN
- gateway.control_ui.insecure_auth: Control UI insecure auth toggle enabled (gateway.controlUi.allowInsecureAuth=true)
- config.insecure_or_dangerous_flags: allowInsecureAuth=true and tools.fs.workspaceOnly=false enabled
- tools.exec.security_full_configured: Exec security=full enabled for main
- plugins.installs_unpinned_npm_specs: Unpinned npm specs (e.g. @openclaw/codex)
- gateway.probe_auth_secretref_unavailable: Gateway probe auth SecretRef unavailable

## INFO
- summary.attack_surface: open=0, allowlist=0
- tools.elevated: enabled
- Various hooks disabled, browser control enabled, trust model personal assistant
- gateway.http.session_key_override_enabled

**Notes:** Audit completed internally per reminder. No user notification. Review plugin if needed in future maintenance.