/**
 * Read-only git lock-in inventory classifier.
 * Never stages, commits, pushes, deletes, moves, or edits .gitignore.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** @typedef {'commit_candidate'|'intentional_local_only'|'generated_rebuildable'|'add_to_gitignore_candidate'|'archive_candidate'|'investigate'|'possible_secret'} LockinClass */

export const LOCKIN_CLASSES = Object.freeze([
  "commit_candidate",
  "intentional_local_only",
  "generated_rebuildable",
  "add_to_gitignore_candidate",
  "archive_candidate",
  "investigate",
  "possible_secret",
]);

/** Soft size cliff for "oversized log / blob" warnings (bytes). */
export const OVERSIZE_BYTES = 1_000_000;

/**
 * @param {string} relPath
 * @param {{ sizeBytes?: number|null, statusCode?: string }} [meta]
 * @returns {{ class: LockinClass, reasons: string[] }}
 */
export function classifyLockinPath(relPath, meta = {}) {
  const p = String(relPath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  const base = path.posix.basename(p);
  const lower = p.toLowerCase();
  const reasons = [];
  const size = meta.sizeBytes == null ? null : Number(meta.sizeBytes);

  // --- possible secrets (highest priority) ---
  const secretHints = [
    /(^|\/)\.env(\.|$)/i,
    /\.pem$/i,
    /\.key$/i,
    /\.p12$/i,
    /\.pfx$/i,
    /id_rsa/i,
    /mnemonic/i,
    /seed[_\-]?phrase/i,
    /wallet.*\.(json|txt|md)$/i,
    /credentials?\//i,
    /secret/i,
    /api[_-]?key/i,
    /oauth.*status\.json$/i,
    /openclaw\.json$/i,
    /openclaw\.json\.bak/i,
    /\.enc$/i,
    /keyring/i,
    /password/i,
    /private[_-]?key/i,
  ];
  for (const re of secretHints) {
    if (re.test(p) || re.test(base)) {
      reasons.push(`secret-pattern:${re}`);
      return { class: "possible_secret", reasons };
    }
  }

  // Nested training clones / submodules noise
  if (
    p === "nova-training-docs" ||
    p === "quorra-training-docs" ||
    p.startsWith("nova-training-docs/") ||
    p.startsWith("quorra-training-docs/")
  ) {
    reasons.push("nested-training-clone");
    return { class: "intentional_local_only", reasons };
  }

  // Runtime / session state
  if (
    p.startsWith(".openclaw/") ||
    /session-startup-state\.json$/i.test(p) ||
    /heartbeat-state\.json$/i.test(p) ||
    /\/__pycache__\//.test(p) ||
    base === "__pycache__"
  ) {
    reasons.push("runtime-or-cache-state");
    return { class: "intentional_local_only", reasons };
  }

  // Dream / dream corpus — local by policy
  if (
    p === "DREAMS.md" ||
    p.startsWith("memory/.dreams/") ||
    p.startsWith("memory/dreaming/") ||
    /\/\.dreams\//.test(p)
  ) {
    reasons.push("dream-corpus-local-policy");
    return { class: "intentional_local_only", reasons };
  }

  // Generated rebuildable reports/logs
  if (
    /^memory\/cursor-jobs\/memory-health-\d/.test(p) ||
    /^memory\/cursor-jobs\/\d{8}-\d{6}-(status|write|ask|raw|plan)\.log$/i.test(p) ||
    /\.stdout\.log$/i.test(p) ||
    /codex-.*\.stdout\.log$/i.test(p) ||
    p.startsWith("memory/swarm/runs/") && /\/tmp\//.test(p)
  ) {
    reasons.push("generated-job-log-or-probe-report");
    return { class: "generated_rebuildable", reasons };
  }

  // Cursor job logs / one-off scratch often gitignore candidates
  if (
    /^memory\/cursor-jobs\/.*\.(log|tmp|bak)$/i.test(p) ||
    /^memory\/tmp-/i.test(p) ||
    /\/_error_log_parse\.py$/i.test(p) ||
    /\/_hb_tick\.py$/i.test(p) ||
    /fix-.*\.py$/i.test(base)
  ) {
    reasons.push("scratch-or-log-pattern");
    // oversized → archive/gitignore emphasis
    if (size != null && size >= OVERSIZE_BYTES) {
      reasons.push(`oversize>=${OVERSIZE_BYTES}`);
      return { class: "add_to_gitignore_candidate", reasons };
    }
    return { class: "add_to_gitignore_candidate", reasons };
  }

  // Config backups under cursor-jobs — treat as secret-adjacent local
  if (/\/backups\/openclaw\.json/i.test(p) || /openclaw\.json\.bak/i.test(p)) {
    reasons.push("config-backup-local");
    return { class: "possible_secret", reasons };
  }

  // SWV / swarm evidence runs — often commit candidates if small verified reports
  if (p.startsWith("memory/swarm/runs/") || p.startsWith("memory/cursor-jobs/swv-runs/")) {
    if (size != null && size >= OVERSIZE_BYTES) {
      reasons.push("swarm-run-oversize");
      return { class: "archive_candidate", reasons };
    }
    reasons.push("swarm-or-swv-evidence");
    return { class: "commit_candidate", reasons };
  }

  // Durable / harness / scripts / novel — commit candidates when intentionally modified
  if (
    p === "MEMORY.md" ||
    p === "NOVEL.md" ||
    p === "AGENTS.md" ||
    p === "HEARTBEAT.md" ||
    p === "WORLD_STATE.md" ||
    p === "SOUL.md" ||
    p === "USER.md" ||
    p === "TOOLS.md" ||
    p.startsWith("docs/") ||
    p.startsWith("scripts/") ||
    p.startsWith("skills/") ||
    p.startsWith("memory/procedural-memory") ||
    p.startsWith("memory/observed-failures") ||
    p.startsWith("memory/session-consolidation") ||
    p.startsWith("memory/evals/") ||
    p.startsWith("memory/swarm/packs/") ||
    /^memory\/\d{4}-\d{2}-\d{2}.*\.md$/.test(p) ||
    /^memory\/cursor-jobs\/.*-(brief|report|fix)-.*\.md$/i.test(p) ||
    /^memory\/cursor-jobs\/codex-brief-.*\.md$/i.test(p) ||
    /^memory\/\d{4}-\d{2}-\d{2}-session-consolidation.*\.md$/.test(p)
  ) {
    if (size != null && size >= OVERSIZE_BYTES) {
      reasons.push("durable-path-but-oversize");
      return { class: "investigate", reasons };
    }
    reasons.push("durable-or-harness-path");
    return { class: "commit_candidate", reasons };
  }

  // identity / time awareness — often local continuity noise; Chair decides
  if (
    p === "memory/identity-substrate.md" ||
    p === "memory/time-awareness.md"
  ) {
    reasons.push("continuity-stamp-often-local");
    return { class: "intentional_local_only", reasons };
  }

  if (size != null && size >= OVERSIZE_BYTES) {
    reasons.push(`oversize>=${OVERSIZE_BYTES}`);
    return { class: "archive_candidate", reasons };
  }

  reasons.push("unclassified");
  return { class: "investigate", reasons };
}

/**
 * Parse `git status --porcelain=v1 -uall` lines.
 * @param {string} text
 * @returns {{ statusCode: string, path: string, origPath?: string }[]}
 */
export function parsePorcelain(text) {
  const out = [];
  for (const line of String(text || "").split(/\r?\n/)) {
    if (!line) continue;
    // rename: R  old -> new  or R100 old -> new
    if (/^R/.test(line) && line.includes(" -> ")) {
      const body = line.slice(3).trim();
      const [a, b] = body.split(" -> ");
      out.push({ statusCode: "R", path: (b || "").trim(), origPath: (a || "").trim() });
      continue;
    }
    const statusCode = line.slice(0, 2);
    let filePath = line.slice(3);
    // untracked: "?? path"
    if (statusCode === "??") filePath = line.slice(3);
    // quote paths
    if (filePath.startsWith('"') && filePath.endsWith('"')) {
      try {
        filePath = JSON.parse(filePath);
      } catch {
        filePath = filePath.slice(1, -1);
      }
    }
    out.push({ statusCode: statusCode.trim() || statusCode, path: filePath });
  }
  return out;
}

/**
 * @param {string} workspace
 * @param {string} relPath
 * @returns {number|null}
 */
export function safeStatSize(workspace, relPath) {
  try {
    const full = path.join(workspace, relPath);
    const st = fs.statSync(full);
    if (st.isDirectory()) return null;
    return st.size;
  } catch {
    return null;
  }
}

/**
 * @param {object} opts
 * @param {string} opts.workspace
 * @param {() => string} [opts.statusTextFn]
 * @param {(ws: string, p: string) => number|null} [opts.sizeFn]
 */
export function buildLockinInventory(opts) {
  const workspace = opts.workspace;
  const statusText =
    opts.statusTextFn?.() ??
    execFileSync("git", ["status", "--porcelain=v1", "-uall"], {
      cwd: workspace,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    });
  const sizeFn = opts.sizeFn || safeStatSize;
  const entries = parsePorcelain(statusText);
  /** @type {Record<string, object[]>} */
  const byClass = Object.fromEntries(LOCKIN_CLASSES.map((c) => [c, []]));
  const items = [];

  for (const e of entries) {
    const sizeBytes = sizeFn(workspace, e.path);
    const { class: cls, reasons } = classifyLockinPath(e.path, {
      sizeBytes,
      statusCode: e.statusCode,
    });
    const item = {
      path: e.path,
      statusCode: e.statusCode,
      origPath: e.origPath,
      sizeBytes,
      class: cls,
      reasons,
    };
    items.push(item);
    byClass[cls].push(item);
  }

  const counts = Object.fromEntries(
    LOCKIN_CLASSES.map((c) => [c, byClass[c].length]),
  );

  return {
    workspace,
    generatedAt: new Date().toISOString(),
    total: items.length,
    counts,
    byClass,
    items,
    hardRules: [
      "READ-ONLY: do not stage, commit, push, delete, move, or edit .gitignore",
      "Nova reviews and removes false positives before proposing a lock-in set",
      "Jason approves staged set before any git write",
      "Never git add -A / never background sync",
    ],
  };
}

/**
 * @param {ReturnType<typeof buildLockinInventory>} inv
 */
export function formatLockinInventoryMarkdown(inv) {
  const lines = [];
  lines.push(`# Git lock-in inventory (read-only)`);
  lines.push("");
  lines.push(`- Generated: ${inv.generatedAt}`);
  lines.push(`- Workspace: \`${inv.workspace}\``);
  lines.push(`- Total dirty paths: **${inv.total}**`);
  lines.push("");
  lines.push(`## Counts`);
  lines.push("");
  for (const c of LOCKIN_CLASSES) {
    lines.push(`- \`${c}\`: ${inv.counts[c]}`);
  }
  lines.push("");
  lines.push(`## Hard rules`);
  lines.push("");
  for (const r of inv.hardRules) lines.push(`- ${r}`);
  lines.push("");

  for (const c of LOCKIN_CLASSES) {
    const list = inv.byClass[c];
    if (!list.length) continue;
    lines.push(`## ${c} (${list.length})`);
    lines.push("");
    for (const it of list.slice(0, 200)) {
      const sz = it.sizeBytes == null ? "" : ` · ${it.sizeBytes}B`;
      const why = (it.reasons || []).join(", ");
      lines.push(`- \`${it.statusCode}\` \`${it.path}\`${sz}${why ? ` — ${why}` : ""}`);
    }
    if (list.length > 200) lines.push(`- … +${list.length - 200} more`);
    lines.push("");
  }

  lines.push(`## Chair next steps`);
  lines.push("");
  lines.push(`1. Strip false positives from \`commit_candidate\``);
  lines.push(`2. Present concise proposed lock-in set to Jason`);
  lines.push(`3. On approval only: stage listed files → Procedure 1 acceptance gate`);
  lines.push("");
  return lines.join("\n");
}
