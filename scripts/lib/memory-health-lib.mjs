/**
 * Pure-ish helpers for OpenClaw memory stack health probes.
 * Infra reliability only — not retrieval quality scoring.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";
import https from "node:https";
import os from "node:os";

/**
 * @typedef {object} CheckResult
 * @property {string} id
 * @property {'pass'|'warn'|'fail'|'skip'} status
 * @property {string} summary
 * @property {Record<string, unknown>} [detail]
 * @property {string[]} [remediation]
 */

/**
 * @typedef {object} ProbeOptions
 * @property {string} [workspace]
 * @property {string} [sqlitePath]
 * @property {string} [ollamaBase]
 * @property {string} [embedModel]
 * @property {string} [searchQuery]
 * @property {number} [timeoutMs]
 * @property {boolean} [skipSearch]
 * @property {boolean} [skipOllama]
 * @property {boolean} [allowEmptySearch]
 * @property {NodeJS.ProcessEnv} [env]
 */

/**
 * @typedef {object} ParsedMemoryStatus
 * @property {number|null} indexed
 * @property {number|null} indexedTotal
 * @property {number|null} chunks
 * @property {boolean|null} dirty
 * @property {string|null} store
 * @property {string|null} fts
 * @property {string|null} provider
 * @property {string|null} model
 * @property {string|null} workspace
 */

export const DEFAULT_SEARCH_QUERY = "Vista business license unincorporated";
export const DEFAULT_EMBED_MODEL = "nomic-embed-text";
export const DEFAULT_OLLAMA_BASE = "http://127.0.0.1:11434";
export const DEFAULT_TIMEOUT_MS = 60_000;
export const MIN_NODE_MAJOR = 24;
export const MIN_NODE_MINOR = 15;
export const DB_NOT_OPEN_RE = /database is not open/i;

export const CHECK_IDS = Object.freeze([
  "node_path",
  "openclaw_cli",
  "sqlite_store",
  "ollama_http",
  "embed_model",
  "memory_status",
  "memory_search_smoke",
  "workspace_memory_dir",
  "index_nonempty",
]);

/**
 * @param {string} [home]
 * @returns {string}
 */
export function defaultSqlitePath(home = process.env.HOME || os.homedir()) {
  return path.join(home, ".openclaw", "agents", "main", "agent", "openclaw-agent.sqlite");
}

/**
 * @param {string} [home]
 * @returns {string}
 */
export function defaultWorkspace(home = process.env.HOME || os.homedir()) {
  return path.join(home, ".openclaw", "workspace");
}

/**
 * Prefer nvm Node ≥24.15 when spawning openclaw (shebang uses env node).
 * @param {NodeJS.ProcessEnv} [base]
 * @returns {NodeJS.ProcessEnv}
 */
export function buildChildEnv(base = process.env) {
  const env = { ...base };
  const home = env.HOME || os.homedir();
  const candidates = [
    path.join(home, ".nvm", "versions", "node", "v24.18.0", "bin"),
    path.join(home, ".nvm", "versions", "node", "v24.15.0", "bin"),
  ].filter((d) => d && fs.existsSync(path.join(d, "node")));

  if (candidates.length) {
    env.PATH = `${candidates.join(path.delimiter)}${path.delimiter}${env.PATH || ""}`;
  }
  return env;
}

/**
 * @param {string} versionStr  e.g. "v24.18.0" or "24.18.0"
 * @returns {{ major: number, minor: number, patch: number } | null}
 */
export function parseNodeVersion(versionStr) {
  const m = String(versionStr || "")
    .trim()
    .replace(/^v/i, "")
    .match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
  };
}

/**
 * @param {string} versionStr
 * @param {number} [minMajor]
 * @param {number} [minMinor]
 * @returns {boolean}
 */
export function meetsMinNodeVersion(
  versionStr,
  minMajor = MIN_NODE_MAJOR,
  minMinor = MIN_NODE_MINOR,
) {
  const v = parseNodeVersion(versionStr);
  if (!v) return false;
  if (v.major > minMajor) return true;
  if (v.major < minMajor) return false;
  return v.minor >= minMinor;
}

/**
 * Classify search/status failure text. "database is not open" is always fail.
 * @param {string} text
 * @returns {{ isDbNotOpen: boolean, isTimeout: boolean, failReason: string | null }}
 */
export function classifySearchFailure(text) {
  const t = String(text || "");
  const isDbNotOpen = DB_NOT_OPEN_RE.test(t);
  const isTimeout = /timeout after \d+ms/i.test(t) || /\bETIMEDOUT\b/i.test(t);
  let failReason = null;
  if (isDbNotOpen) failReason = "database is not open";
  else if (isTimeout) failReason = "timeout";
  else if (/ENOENT|not found|command not found/i.test(t)) failReason = "cli missing";
  else if (t.trim()) failReason = "error";
  return { isDbNotOpen, isTimeout, failReason };
}

/**
 * @param {string} text
 * @returns {ParsedMemoryStatus}
 */
export function parseMemoryStatus(text) {
  const out = {
    indexed: null,
    indexedTotal: null,
    chunks: null,
    dirty: null,
    store: null,
    fts: null,
    provider: null,
    model: null,
    workspace: null,
  };
  const lines = String(text || "").split(/\r?\n/);
  for (const line of lines) {
    const indexed = line.match(/^Indexed:\s*(\d+)\s*\/\s*(\d+)\s*files(?:\s*·\s*(\d+)\s*chunks)?/i);
    if (indexed) {
      out.indexed = Number(indexed[1]);
      out.indexedTotal = Number(indexed[2]);
      if (indexed[3] != null) out.chunks = Number(indexed[3]);
    }
    const dirty = line.match(/^Dirty:\s*(yes|no|true|false)\b/i);
    if (dirty) {
      const d = dirty[1].toLowerCase();
      out.dirty = d === "yes" || d === "true";
    }
    // Anchor ^Store: so "Recall store:" does not overwrite the sqlite path.
    const store = line.match(/^Store:\s*(.+)$/i);
    if (store) out.store = store[1].trim();
    const fts = line.match(/^FTS:\s*(.+)$/i);
    if (fts) out.fts = fts[1].trim();
    const provider = line.match(/^Provider:\s*(.+)$/i);
    if (provider) out.provider = provider[1].trim();
    const model = line.match(/^Model:\s*(.+)$/i);
    if (model) out.model = model[1].trim();
    const workspace = line.match(/^Workspace:\s*(.+)$/i);
    if (workspace) out.workspace = workspace[1].trim();
  }
  return out;
}

/**
 * Extract reindex/repair-related commands from `openclaw memory --help` text.
 * Never executes — discovery only.
 * @param {string} helpText
 * @returns {string[]}
 */
export function discoverMemoryRemediationCommands(helpText) {
  const text = String(helpText || "");
  /** @type {string[]} */
  const cmds = [];
  const add = (c) => {
    if (!cmds.includes(c)) cmds.push(c);
  };

  if (/^\s*index\b/m.test(text) || /memory index/i.test(text)) {
    add("openclaw memory index");
    add("openclaw memory index --force");
  }
  if (/status --fix/i.test(text)) {
    add("openclaw memory status --fix");
  }
  if (/status --deep/i.test(text)) {
    add("openclaw memory status --deep");
  }
  if (/^\s*search\b/m.test(text) || /memory search/i.test(text)) {
    add('openclaw memory search "Vista business license" --json');
  }
  if (/^\s*status\b/m.test(text) || /memory status/i.test(text)) {
    add("openclaw memory status");
  }

  // Example lines often include full commands
  for (const m of text.matchAll(/^\s{2}(openclaw memory [^\n]+)$/gm)) {
    const line = m[1].trim().replace(/\s+$/, "");
    if (/index|status --fix|status --deep|search/i.test(line)) add(line);
  }

  return cmds;
}

/**
 * @param {CheckResult[]} checks
 * @returns {'pass'|'degraded'|'fail'}
 */
export function rollupOverall(checks) {
  let hasFail = false;
  let hasWarn = false;
  for (const c of checks) {
    if (c.status === "fail") hasFail = true;
    else if (c.status === "warn") hasWarn = true;
  }
  if (hasFail) return "fail";
  if (hasWarn) return "degraded";
  return "pass";
}

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ cwd?: string, env?: NodeJS.ProcessEnv, timeoutMs?: number }} [opts]
 * @returns {Promise<{ code: number | null, stdout: string, stderr: string, error: string | null, timedOut: boolean }>}
 */
export function spawnCapture(cmd, args, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return new Promise((resolve) => {
    /** @type {import('node:child_process').ChildProcessWithoutNullStreams} */
    let child;
    try {
      child = spawn(cmd, args, {
        cwd: opts.cwd,
        env: opts.env || buildChildEnv(),
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (err) {
      resolve({
        code: null,
        stdout: "",
        stderr: "",
        error: err instanceof Error ? err.message : String(err),
        timedOut: false,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        child.kill("SIGKILL");
      } catch {
        /* ignore */
      }
      resolve({
        code: null,
        stdout,
        stderr,
        error: `timeout after ${timeoutMs}ms`,
        timedOut: true,
      });
    }, timeoutMs);

    child.stdout.on("data", (buf) => {
      stdout += buf.toString("utf8");
    });
    child.stderr.on("data", (buf) => {
      stderr += buf.toString("utf8");
    });
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        code: null,
        stdout,
        stderr,
        error: err.message,
        timedOut: false,
      });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        code,
        stdout,
        stderr,
        error: null,
        timedOut: false,
      });
    });
  });
}

/**
 * Resolve a binary on PATH (augmented env).
 * @param {string} name
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Promise<string | null>}
 */
export async function resolveOnPath(name, env = buildChildEnv()) {
  const whichCmd = process.platform === "win32" ? "where" : "which";
  const r = await spawnCapture(whichCmd, [name], { env, timeoutMs: 10_000 });
  if (r.code !== 0 || !r.stdout.trim()) return null;
  return r.stdout.trim().split(/\r?\n/)[0] || null;
}

/**
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<{ ok: boolean, statusCode: number | null, body: string, error: string | null }>}
 */
export function httpGet(url, timeoutMs = 8_000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (err) {
      resolve({
        ok: false,
        statusCode: null,
        body: "",
        error: err instanceof Error ? err.message : String(err),
      });
      return;
    }
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      let body = "";
      res.on("data", (c) => {
        body += c;
        if (body.length > 2_000_000) {
          req.destroy();
        }
      });
      res.on("end", () => {
        const code = res.statusCode ?? null;
        resolve({
          ok: code != null && code >= 200 && code < 300,
          statusCode: code,
          body,
          error: null,
        });
      });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, statusCode: null, body: "", error: `timeout after ${timeoutMs}ms` });
    });
    req.on("error", (err) => {
      resolve({ ok: false, statusCode: null, body: "", error: err.message });
    });
  });
}

/**
 * Match embed model name against ollama tags (handles :latest suffix).
 * @param {string[]} modelNames
 * @param {string} want
 * @returns {boolean}
 */
export function tagsIncludeEmbedModel(modelNames, want) {
  const w = String(want || "").toLowerCase();
  if (!w) return false;
  return modelNames.some((n) => {
    const name = String(n || "").toLowerCase();
    if (name === w) return true;
    if (name.startsWith(`${w}:`)) return true;
    const base = name.split(":")[0];
    return base === w;
  });
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkNodePath(options = {}) {
  const env = buildChildEnv(options.env);
  const home = env.HOME || os.homedir();
  const preferredBin = path.join(home, ".nvm", "versions", "node", "v24.18.0", "bin", "node");
  const processOk = meetsMinNodeVersion(process.version);
  let preferredOk = false;
  let preferredVersion = null;
  if (fs.existsSync(preferredBin)) {
    const r = await spawnCapture(preferredBin, ["-v"], { env, timeoutMs: 5_000 });
    preferredVersion = (r.stdout || "").trim() || null;
    preferredOk = meetsMinNodeVersion(preferredVersion || "");
  }

  const detail = {
    processVersion: process.version,
    processOk,
    preferredBin,
    preferredExists: fs.existsSync(preferredBin),
    preferredVersion,
    preferredOk,
    minRequired: `${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}`,
  };

  if (processOk || preferredOk) {
    return {
      id: "node_path",
      status: "pass",
      summary: `Node ≥${MIN_NODE_MAJOR}.${MIN_NODE_MINOR} available (process ${process.version}${preferredOk ? `; preferred ${preferredVersion}` : ""})`,
      detail,
    };
  }

  return {
    id: "node_path",
    status: "fail",
    summary: `No Node ≥${MIN_NODE_MAJOR}.${MIN_NODE_MINOR} (process ${process.version}; preferred missing/too old)`,
    detail,
    remediation: [
      "Install Node ≥24.15 via nvm: nvm install 24.18.0",
      `Expected: ${preferredBin}`,
      'export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"',
    ],
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkOpenclawCli(options = {}) {
  const env = buildChildEnv(options.env);
  const resolved = await resolveOnPath("openclaw", env);
  if (!resolved) {
    return {
      id: "openclaw_cli",
      status: "fail",
      summary: "openclaw not found on augmented PATH",
      detail: { PATH: env.PATH },
      remediation: [
        'export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$HOME/.npm-global/bin:$PATH"',
        "which openclaw",
        "npm i -g openclaw  # only if intentionally installing",
      ],
    };
  }
  return {
    id: "openclaw_cli",
    status: "pass",
    summary: `openclaw at ${resolved}`,
    detail: { path: resolved },
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkSqliteStore(options = {}) {
  const sqlitePath = options.sqlitePath || defaultSqlitePath();
  const shm = `${sqlitePath}-shm`;
  const wal = `${sqlitePath}-wal`;
  /** @type {string[]} */
  const remediation = [
    `ls -la ${sqlitePath}*`,
    "Do NOT delete the sqlite DB — escalate / restore from backup if corrupt",
    "openclaw memory status",
  ];

  if (!fs.existsSync(sqlitePath)) {
    return {
      id: "sqlite_store",
      status: "fail",
      summary: `sqlite missing: ${sqlitePath}`,
      detail: { sqlitePath, exists: false },
      remediation,
    };
  }

  let st;
  try {
    st = fs.statSync(sqlitePath);
  } catch (err) {
    return {
      id: "sqlite_store",
      status: "fail",
      summary: `sqlite unreadable: ${err instanceof Error ? err.message : err}`,
      detail: { sqlitePath },
      remediation,
    };
  }

  if (!st.isFile() || st.size <= 0) {
    return {
      id: "sqlite_store",
      status: "fail",
      summary: `sqlite empty or not a file (size=${st.size})`,
      detail: { sqlitePath, size: st.size },
      remediation,
    };
  }

  // Readable check
  try {
    const fd = fs.openSync(sqlitePath, "r");
    fs.closeSync(fd);
  } catch (err) {
    return {
      id: "sqlite_store",
      status: "fail",
      summary: `sqlite not readable: ${err instanceof Error ? err.message : err}`,
      detail: { sqlitePath, size: st.size },
      remediation,
    };
  }

  const hasShm = fs.existsSync(shm);
  const hasWal = fs.existsSync(wal);
  /** @type {Record<string, unknown>} */
  const detail = {
    sqlitePath,
    size: st.size,
    shm: hasShm,
    wal: hasWal,
    integrity: "skipped",
  };

  const env = buildChildEnv(options.env);
  const sqlite3 = await resolveOnPath("sqlite3", env);
  if (sqlite3) {
    const r = await spawnCapture(
      sqlite3,
      [sqlitePath, "PRAGMA integrity_check;"],
      { env, timeoutMs: Math.min(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 30_000) },
    );
    const out = `${r.stdout}\n${r.stderr}`.trim();
    detail.integrity = out.split(/\r?\n/)[0] || out;
    detail.integrityExit = r.code;
    if (r.timedOut) {
      return {
        id: "sqlite_store",
        status: "warn",
        summary: `sqlite present (${st.size} bytes) but integrity_check timed out`,
        detail,
        remediation,
      };
    }
    if (!/ok/i.test(out) || r.code !== 0) {
      return {
        id: "sqlite_store",
        status: "fail",
        summary: `sqlite integrity_check failed: ${detail.integrity}`,
        detail,
        remediation,
      };
    }
  }

  return {
    id: "sqlite_store",
    status: "pass",
    summary: `sqlite ok (${st.size} bytes; shm=${hasShm} wal=${hasWal}; integrity=${detail.integrity})`,
    detail,
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkOllamaHttp(options = {}) {
  if (options.skipOllama) {
    return {
      id: "ollama_http",
      status: "skip",
      summary: "skipped (--skipOllama)",
    };
  }
  const base = (options.ollamaBase || DEFAULT_OLLAMA_BASE).replace(/\/$/, "");
  const url = `${base}/api/tags`;
  const r = await httpGet(url, 8_000);
  if (!r.ok) {
    return {
      id: "ollama_http",
      status: "fail",
      summary: `ollama unreachable at ${url}: ${r.error || `HTTP ${r.statusCode}`}`,
      detail: { url, statusCode: r.statusCode, error: r.error },
      remediation: [
        "curl -s localhost:11434/api/tags",
        "systemctl --user status ollama  # or: ollama serve",
        `OLLAMA_HOST=${base}`,
      ],
    };
  }
  return {
    id: "ollama_http",
    status: "pass",
    summary: `ollama reachable (${url})`,
    detail: { url, statusCode: r.statusCode, bodyBytes: r.body.length },
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkEmbedModel(options = {}) {
  if (options.skipOllama) {
    return {
      id: "embed_model",
      status: "skip",
      summary: "skipped (--skipOllama)",
    };
  }
  const want = options.embedModel || DEFAULT_EMBED_MODEL;
  const base = (options.ollamaBase || DEFAULT_OLLAMA_BASE).replace(/\/$/, "");
  const url = `${base}/api/tags`;
  const r = await httpGet(url, 8_000);
  if (!r.ok) {
    return {
      id: "embed_model",
      status: "fail",
      summary: `cannot list models: ${r.error || `HTTP ${r.statusCode}`}`,
      detail: { url, want },
      remediation: [
        "curl -s localhost:11434/api/tags",
        `ollama pull ${want}`,
      ],
    };
  }
  let names = [];
  try {
    const parsed = JSON.parse(r.body);
    names = Array.isArray(parsed?.models)
      ? parsed.models.map((m) => m?.name || m?.model).filter(Boolean)
      : [];
  } catch (err) {
    return {
      id: "embed_model",
      status: "fail",
      summary: `tags JSON parse failed: ${err instanceof Error ? err.message : err}`,
      detail: { url, want },
      remediation: [`curl -s ${url}`, `ollama pull ${want}`],
    };
  }
  const found = tagsIncludeEmbedModel(names, want);
  if (!found) {
    return {
      id: "embed_model",
      status: "fail",
      summary: `embed model missing: ${want}`,
      detail: { want, models: names },
      remediation: [`ollama pull ${want}`, `curl -s ${url} | grep ${want}`],
    };
  }
  return {
    id: "embed_model",
    status: "pass",
    summary: `embed model present: ${want}`,
    detail: { want, models: names },
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkMemoryStatus(options = {}) {
  const env = buildChildEnv(options.env);
  const workspace = options.workspace || defaultWorkspace();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const openclaw = await resolveOnPath("openclaw", env);
  if (!openclaw) {
    return {
      id: "memory_status",
      status: "fail",
      summary: "openclaw not on PATH; cannot run memory status",
      remediation: ['export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"', "which openclaw"],
    };
  }

  const r = await spawnCapture(openclaw, ["memory", "status"], {
    cwd: workspace,
    env,
    timeoutMs,
  });
  const combined = `${r.stdout}\n${r.stderr}`;
  const classified = classifySearchFailure(combined + (r.error || ""));

  if (r.timedOut || classified.isTimeout) {
    return {
      id: "memory_status",
      status: "fail",
      summary: `memory status timed out after ${timeoutMs}ms`,
      detail: { timedOut: true },
      remediation: ["openclaw memory status", "Check ollama + sqlite locks"],
    };
  }
  if (classified.isDbNotOpen) {
    return {
      id: "memory_status",
      status: "fail",
      summary: "memory status: database is not open",
      detail: { stdout: r.stdout.slice(0, 2000), stderr: r.stderr.slice(0, 1000) },
      remediation: [
        "openclaw memory status",
        "Check gateway/agent process; retry in new session",
        "Do not trust empty recall while DB is closed",
      ],
    };
  }
  if (r.error || r.code !== 0) {
    return {
      id: "memory_status",
      status: "fail",
      summary: `memory status failed (code=${r.code}): ${r.error || r.stderr.slice(0, 200) || "non-zero"}`,
      detail: { code: r.code, stderr: r.stderr.slice(0, 1500), stdout: r.stdout.slice(0, 1500) },
      remediation: ["openclaw memory status", "openclaw memory status --deep"],
    };
  }

  const parsed = parseMemoryStatus(r.stdout);
  return {
    id: "memory_status",
    status: "pass",
    summary: `status ok: Indexed ${parsed.indexed}/${parsed.indexedTotal} · Dirty ${parsed.dirty === null ? "?" : parsed.dirty ? "yes" : "no"} · FTS ${parsed.fts || "?"} · Provider ${parsed.provider || "?"}`,
    detail: { parsed, rawPreview: r.stdout.slice(0, 2500) },
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkMemorySearchSmoke(options = {}) {
  if (options.skipSearch) {
    return {
      id: "memory_search_smoke",
      status: "skip",
      summary: "skipped (--quick / skipSearch)",
    };
  }
  const env = buildChildEnv(options.env);
  const workspace = options.workspace || defaultWorkspace();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const query = options.searchQuery || DEFAULT_SEARCH_QUERY;
  const allowEmpty = Boolean(options.allowEmptySearch);
  const openclaw = await resolveOnPath("openclaw", env);
  if (!openclaw) {
    return {
      id: "memory_search_smoke",
      status: "fail",
      summary: "openclaw not on PATH; cannot run memory search",
      remediation: ['export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"'],
    };
  }

  const r = await spawnCapture(
    openclaw,
    ["memory", "search", query, "--json"],
    { cwd: workspace, env, timeoutMs },
  );
  const combined = `${r.stdout}\n${r.stderr}\n${r.error || ""}`;
  const classified = classifySearchFailure(combined);

  if (classified.isDbNotOpen) {
    return {
      id: "memory_search_smoke",
      status: "fail",
      summary: 'memory search: "database is not open"',
      detail: { query, classified },
      remediation: [
        'openclaw memory search "Vista business license" --json | head',
        "If CLI fails same way: check sqlite + ollama; do not claim memory healthy",
        "If CLI OK but agent tool fails: gateway/tool-path flake — new session; do not trust empty recall",
      ],
    };
  }
  if (r.timedOut || classified.isTimeout) {
    return {
      id: "memory_search_smoke",
      status: "fail",
      summary: `memory search timed out after ${timeoutMs}ms`,
      detail: { query, timedOut: true },
      remediation: [
        `openclaw memory search "${query}" --json`,
        "Check ollama embed latency / stuck index",
      ],
    };
  }
  if (r.error || r.code !== 0) {
    return {
      id: "memory_search_smoke",
      status: "fail",
      summary: `memory search failed (code=${r.code}): ${r.error || r.stderr.slice(0, 200) || "non-zero"}`,
      detail: {
        query,
        code: r.code,
        stderr: r.stderr.slice(0, 1000),
        stdout: r.stdout.slice(0, 1000),
      },
      remediation: [
        `openclaw memory search "${query}" --json`,
        "openclaw memory status",
      ],
    };
  }

  let resultCount = 0;
  let parseError = null;
  try {
    const json = JSON.parse(r.stdout);
    if (Array.isArray(json?.results)) resultCount = json.results.length;
    else if (Array.isArray(json)) resultCount = json.length;
    else if (Array.isArray(json?.hits)) resultCount = json.hits.length;
    else parseError = "JSON missing results/hits array";
  } catch (err) {
    parseError = err instanceof Error ? err.message : String(err);
  }

  if (parseError) {
    return {
      id: "memory_search_smoke",
      status: "fail",
      summary: `memory search JSON parse failed: ${parseError}`,
      detail: { query, stdoutPreview: r.stdout.slice(0, 500) },
      remediation: [`openclaw memory search "${query}" --json`],
    };
  }

  if (resultCount < 1 && !allowEmpty) {
    return {
      id: "memory_search_smoke",
      status: "fail",
      summary: `memory search returned 0 results for "${query}"`,
      detail: { query, resultCount },
      remediation: [
        "openclaw memory status",
        "Confirm index non-empty; try a broader query once",
        "If tool-path empty but CLI returns hits: gateway flake",
      ],
    };
  }

  if (resultCount < 1 && allowEmpty) {
    return {
      id: "memory_search_smoke",
      status: "warn",
      summary: `memory search empty (allowed) for "${query}"`,
      detail: { query, resultCount, allowEmpty: true },
    };
  }

  return {
    id: "memory_search_smoke",
    status: "pass",
    summary: `memory search smoke ok (${resultCount} result(s))`,
    detail: { query, resultCount },
  };
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkWorkspaceMemoryDir(options = {}) {
  const workspace = options.workspace || defaultWorkspace();
  const memoryDir = path.join(workspace, "memory");
  const memoryMd = path.join(workspace, "MEMORY.md");
  const hasMemoryMd = fs.existsSync(memoryMd);

  if (!fs.existsSync(memoryDir) || !fs.statSync(memoryDir).isDirectory()) {
    if (hasMemoryMd) {
      return {
        id: "workspace_memory_dir",
        status: "warn",
        summary: "MEMORY.md present but memory/ dir missing",
        detail: { workspace, memoryDir, hasMemoryMd },
        remediation: [`mkdir -p ${memoryDir}`],
      };
    }
    return {
      id: "workspace_memory_dir",
      status: "fail",
      summary: `memory/ missing under ${workspace}`,
      detail: { workspace, memoryDir, hasMemoryMd },
      remediation: [`ls -la ${workspace}`, `mkdir -p ${memoryDir}`],
    };
  }

  let dailyCount = 0;
  try {
    const names = fs.readdirSync(memoryDir);
    dailyCount = names.filter((n) => /^\d{4}-\d{2}-\d{2}\.md$/.test(n)).length;
  } catch (err) {
    return {
      id: "workspace_memory_dir",
      status: "fail",
      summary: `cannot read memory/: ${err instanceof Error ? err.message : err}`,
      detail: { memoryDir },
    };
  }

  if (dailyCount === 0 && !hasMemoryMd) {
    return {
      id: "workspace_memory_dir",
      status: "fail",
      summary: "memory/ exists but no YYYY-MM-DD.md or MEMORY.md",
      detail: { memoryDir, dailyCount, hasMemoryMd },
      remediation: ["Create memory/YYYY-MM-DD.md for today", "Ensure MEMORY.md exists for main sessions"],
    };
  }

  if (dailyCount === 0 && hasMemoryMd) {
    return {
      id: "workspace_memory_dir",
      status: "warn",
      summary: "MEMORY.md present but no daily YYYY-MM-DD.md files",
      detail: { memoryDir, dailyCount, hasMemoryMd },
    };
  }

  return {
    id: "workspace_memory_dir",
    status: "pass",
    summary: `workspace memory ok (${dailyCount} daily file(s)${hasMemoryMd ? "; MEMORY.md" : ""})`,
    detail: { memoryDir, dailyCount, hasMemoryMd },
  };
}

/**
 * Depends on memory_status parse when available.
 * @param {ProbeOptions} [options]
 * @param {ParsedMemoryStatus | null} [parsed]
 * @returns {Promise<CheckResult>}
 */
export async function checkIndexNonempty(options = {}, parsed = null) {
  let statusParsed = parsed;
  if (!statusParsed) {
    const statusCheck = await checkMemoryStatus(options);
    if (statusCheck.status === "fail" || statusCheck.status === "skip") {
      return {
        id: "index_nonempty",
        status: statusCheck.status === "fail" ? "fail" : "skip",
        summary:
          statusCheck.status === "fail"
            ? `cannot verify index (status failed): ${statusCheck.summary}`
            : "skipped (no status)",
        detail: { statusCheck: statusCheck.summary },
        remediation: statusCheck.remediation,
      };
    }
    statusParsed = /** @type {ParsedMemoryStatus} */ (statusCheck.detail?.parsed || null);
  }

  if (!statusParsed || statusParsed.indexed == null) {
    return {
      id: "index_nonempty",
      status: "fail",
      summary: "could not parse Indexed count from memory status",
      remediation: ["openclaw memory status", "openclaw memory index"],
    };
  }

  if (statusParsed.indexed < 1) {
    return {
      id: "index_nonempty",
      status: "fail",
      summary: `indexed files = ${statusParsed.indexed} (expected ≥ 1)`,
      detail: { parsed: statusParsed },
      remediation: [
        "openclaw memory status",
        "openclaw memory index   # print-only recommendation — do not auto-run from probe",
        "openclaw memory index --force  # only if Jason/Nova explicitly approve",
      ],
    };
  }

  if (statusParsed.dirty === true) {
    return {
      id: "index_nonempty",
      status: "warn",
      summary: `indexed ${statusParsed.indexed}/${statusParsed.indexedTotal} but Dirty=yes (may be stuck)`,
      detail: { parsed: statusParsed },
      remediation: [
        "openclaw memory status",
        "openclaw memory status --fix  # repairs stale recall locks (documented; confirm before use)",
        "openclaw memory index",
      ],
    };
  }

  return {
    id: "index_nonempty",
    status: "pass",
    summary: `indexed files ${statusParsed.indexed}/${statusParsed.indexedTotal ?? "?"} (dirty=${statusParsed.dirty === null ? "?" : statusParsed.dirty ? "yes" : "no"})`,
    detail: { parsed: statusParsed },
  };
}

/**
 * Discover print-only reindex remediation from live help (never executes index).
 * @param {ProbeOptions} [options]
 * @returns {Promise<string[]>}
 */
export async function collectRepairRecommendations(options = {}) {
  const env = buildChildEnv(options.env);
  const workspace = options.workspace || defaultWorkspace();
  const openclaw = await resolveOnPath("openclaw", env);
  if (!openclaw) {
    return [
      "openclaw not on PATH — fix node_path / openclaw_cli first",
      'export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"',
    ];
  }
  const r = await spawnCapture(openclaw, ["memory", "--help"], {
    cwd: workspace,
    env,
    timeoutMs: Math.min(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 20_000),
  });
  const fromHelp = discoverMemoryRemediationCommands(`${r.stdout}\n${r.stderr}`);
  if (fromHelp.length) return fromHelp;
  return [
    "openclaw memory status",
    "openclaw memory index",
    "openclaw memory index --force",
  ];
}

/**
 * @param {ProbeOptions} [options]
 * @returns {Promise<{
 *   checks: CheckResult[],
 *   overall: 'pass'|'degraded'|'fail',
 *   startedAt: string,
 *   finishedAt: string,
 *   env: Record<string, unknown>,
 * }>}
 */
export async function runAllChecks(options = {}) {
  const startedAt = new Date().toISOString();
  const workspace = options.workspace || defaultWorkspace();
  const sqlitePath = options.sqlitePath || defaultSqlitePath();
  const ollamaBase = options.ollamaBase || DEFAULT_OLLAMA_BASE;
  const embedModel = options.embedModel || DEFAULT_EMBED_MODEL;
  const searchQuery = options.searchQuery || DEFAULT_SEARCH_QUERY;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  /** @type {CheckResult[]} */
  const checks = [];

  checks.push(await checkNodePath(options));
  checks.push(await checkOpenclawCli(options));
  checks.push(await checkSqliteStore(options));
  checks.push(await checkOllamaHttp(options));
  checks.push(await checkEmbedModel(options));

  const statusCheck = await checkMemoryStatus(options);
  checks.push(statusCheck);

  const parsed =
    statusCheck.status === "pass" && statusCheck.detail?.parsed
      ? /** @type {ParsedMemoryStatus} */ (statusCheck.detail.parsed)
      : null;

  checks.push(await checkMemorySearchSmoke(options));
  checks.push(await checkWorkspaceMemoryDir(options));
  checks.push(await checkIndexNonempty(options, parsed));

  const finishedAt = new Date().toISOString();
  const overall = rollupOverall(checks);

  return {
    checks,
    overall,
    startedAt,
    finishedAt,
    env: {
      workspace,
      sqlitePath,
      ollamaBase,
      embedModel,
      searchQuery,
      timeoutMs,
      skipSearch: Boolean(options.skipSearch),
      skipOllama: Boolean(options.skipOllama),
      processVersion: process.version,
      platform: process.platform,
    },
  };
}

/**
 * @param {{
 *   checks: CheckResult[],
 *   overall: string,
 *   startedAt: string,
 *   finishedAt: string,
 *   env: Record<string, unknown>,
 * }} result
 * @param {{ remediation?: boolean, repairCommands?: string[] }} [opts]
 * @returns {string}
 */
export function formatHumanReport(result, opts = {}) {
  const lines = [];
  lines.push(`Memory health probe — overall: ${result.overall.toUpperCase()}`);
  lines.push(`Started:  ${result.startedAt}`);
  lines.push(`Finished: ${result.finishedAt}`);
  lines.push("");
  for (const c of result.checks) {
    const mark =
      c.status === "pass" ? "PASS" : c.status === "warn" ? "WARN" : c.status === "skip" ? "SKIP" : "FAIL";
    lines.push(`[${mark}] ${c.id}: ${c.summary}`);
  }

  const showRemediation =
    opts.remediation ||
    result.overall === "fail" ||
    result.overall === "degraded" ||
    (opts.repairCommands && opts.repairCommands.length > 0);

  if (showRemediation) {
    lines.push("");
    lines.push("Remediation (read-only recommendations — probe does not execute reindex):");
    /** @type {string[]} */
    const seen = [];
    for (const c of result.checks) {
      if (c.status === "fail" || c.status === "warn") {
        for (const step of c.remediation || []) {
          if (!seen.includes(step)) {
            seen.push(step);
            lines.push(`  - ${step}`);
          }
        }
      }
    }
    for (const cmd of opts.repairCommands || []) {
      if (!seen.includes(cmd)) {
        seen.push(cmd);
        lines.push(`  - ${cmd}`);
      }
    }
    if (!seen.length) {
      lines.push("  - (none — stack healthy)");
    }
  }

  return lines.join("\n");
}

/**
 * @param {{
 *   checks: CheckResult[],
 *   overall: string,
 *   startedAt: string,
 *   finishedAt: string,
 *   env: Record<string, unknown>,
 * }} result
 * @param {{ repairCommands?: string[] }} [opts]
 * @returns {string}
 */
export function formatMarkdownReport(result, opts = {}) {
  const lines = [];
  lines.push("# Memory Health Probe Report");
  lines.push("");
  lines.push(`- **Overall:** \`${result.overall}\``);
  lines.push(`- **Started:** ${result.startedAt}`);
  lines.push(`- **Finished:** ${result.finishedAt}`);
  lines.push(`- **Workspace:** \`${result.env.workspace}\``);
  lines.push(`- **Sqlite:** \`${result.env.sqlitePath}\``);
  lines.push(`- **Ollama:** \`${result.env.ollamaBase}\``);
  lines.push(`- **Embed model:** \`${result.env.embedModel}\``);
  lines.push(`- **Search query:** \`${result.env.searchQuery}\``);
  lines.push(`- **Timeout ms:** \`${result.env.timeoutMs}\``);
  lines.push("");
  lines.push("| Check | Status | Summary |");
  lines.push("|-------|--------|---------|");
  for (const c of result.checks) {
    const sum = c.summary.replace(/\|/g, "\\|");
    lines.push(`| \`${c.id}\` | ${c.status} | ${sum} |`);
  }
  lines.push("");
  lines.push("## Remediation (print-only)");
  lines.push("");
  /** @type {string[]} */
  const seen = [];
  for (const c of result.checks) {
    if ((c.status === "fail" || c.status === "warn") && c.remediation?.length) {
      lines.push(`### ${c.id}`);
      for (const step of c.remediation) {
        lines.push(`- \`${step}\``);
        seen.push(step);
      }
      lines.push("");
    }
  }
  if (opts.repairCommands?.length) {
    lines.push("### Discovered openclaw memory commands (not executed)");
    for (const cmd of opts.repairCommands) {
      lines.push(`- \`${cmd}\``);
    }
    lines.push("");
  }
  if (!seen.length && !opts.repairCommands?.length) {
    lines.push("_None required — overall pass._");
    lines.push("");
  }
  lines.push("## Notes");
  lines.push("");
  lines.push("- This probe does **not** modify the memory DB.");
  lines.push("- Recovery ladder: `memory/evals/memory-health-recovery-v0.md`");
  lines.push("- Procedure: Procedure 16 in `memory/procedural-memory-v1.md`");
  lines.push("");
  return lines.join("\n");
}

/**
 * Exit code mapping: 0 pass, 1 fail, 3 degraded, 2 reserved for CLI usage errors.
 * @param {'pass'|'degraded'|'fail'} overall
 * @returns {0|1|3}
 */
export function overallToExitCode(overall) {
  if (overall === "pass") return 0;
  if (overall === "degraded") return 3;
  return 1;
}
