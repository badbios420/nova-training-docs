/**
 * Runtime Error Doctor v0.1.1 — read-only diagnosis primitives (precision pass).
 * No repairs, no config edits, no gateway restart, no log deletion.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const DOCTOR_VERSION = "0.1.1";

export const REPAIR_LEVELS = Object.freeze({
  0: "observe",
  1: "safe_diagnostic",
  2: "cursor_workspace",
  3: "codex_infra",
  4: "jason_decision",
});

export const INCIDENT_STATUS = Object.freeze([
  "NEW",
  "KNOWN",
  "REGRESSED",
  "RESOLVED",
  "NOISE",
]);

export const DEFAULT_TOP_FAMILIES = 5;

/** @typedef {'NEW'|'KNOWN'|'REGRESSED'|'RESOLVED'|'NOISE'} IncidentStatus */

// --- Redaction ---

const REDACT_PATTERNS = [
  [/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]"],
  [/sk-[A-Za-z0-9]{10,}/g, "sk-[REDACTED]"],
  [/xai-[A-Za-z0-9]{10,}/g, "xai-[REDACTED]"],
  [/ghp_[A-Za-z0-9]{20,}/g, "ghp_[REDACTED]"],
  [/gho_[A-Za-z0-9]{20,}/g, "gho-[REDACTED]"],
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[JWT_REDACTED]"],
  [/(api[_-]?key|token|password|secret|authorization)\s*[:=]\s*["']?[^"'\s,}]{6,}/gi, "$1=[REDACTED]"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[PRIVATE_KEY_REDACTED]"],
  [/\b[0-9a-f]{64}\b/gi, "[HEX64]"],
];

/**
 * @param {string} text
 */
export function redactSecrets(text) {
  let out = String(text ?? "");
  for (const [re, rep] of REDACT_PATTERNS) {
    out = out.replace(re, rep);
  }
  return out;
}

// --- Corpus exclusion ---

/**
 * Diagnostic / self-report paths that must not re-enter evidence ingest.
 * @param {string} filePath
 * @param {{ includeFixtures?: boolean, workspace?: string }} [opts]
 */
export function isExcludedEvidencePath(filePath, opts = {}) {
  const raw = String(filePath || "").replace(/\\/g, "/");
  const lower = raw.toLowerCase();
  const base = path.basename(raw);
  const includeFixtures =
    opts.includeFixtures === true ||
    process.env.NODE_ENV === "test" ||
    process.env.ERROR_DOCTOR_INCLUDE_FIXTURES === "1";

  if (/\/memory\/swarm\/runs\//i.test(raw)) return true;
  if (/\/memory\/error-doctor-ledger\.md$/i.test(raw)) return true;
  if (/error-doctor-report/i.test(base)) return true;
  if (/chair-adjudication/i.test(base)) return true;
  if (/^worker-packet\.json$/i.test(base)) return true;
  if (/\/memory\/cursor-jobs\/[^/]*error-doctor/i.test(raw)) return true;
  if (/\/memory\/cursor-jobs\/nova-error-log-audit-/i.test(raw)) return true;
  if (!includeFixtures) {
    if (/\/(fixtures?|__fixtures__|testdata)\//i.test(raw)) return true;
    if (/\.fixture\./i.test(base)) return true;
  }
  // Prior doctor markdown dumps often land as *.md under cursor-jobs with "report"
  if (/\/memory\/cursor-jobs\/.*error.?doctor/i.test(lower)) return true;
  return false;
}

// --- Normalization / fingerprint ---

/**
 * Pull the human message out of OpenClaw JSON log lines when present.
 * @param {string} line
 */
export function extractLogMessage(line) {
  const raw = String(line ?? "");
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.includes('"1"')) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj && obj["1"] != null) {
        const m = obj["1"];
        if (typeof m === "string") return m;
        if (typeof m === "object") return JSON.stringify(m);
      }
    } catch {
      // fall through — partial JSON tails are common
      const m = trimmed.match(/"1":"((?:\\.|[^"\\])*)"/);
      if (m) {
        try {
          return JSON.parse(`"${m[1]}"`);
        } catch {
          return m[1];
        }
      }
    }
  }
  return raw;
}

/**
 * Extract correlation ids from a raw (pre-normalize) sample.
 * @param {string} text
 */
export function extractCorrelationIds(text) {
  const s = String(text || "");
  /** @type {Set<string>} */
  const ids = new Set();
  for (const m of s.matchAll(/\brunId[=:]\s*["']?([^\s"',}]+)/gi)) ids.add(m[1]);
  for (const m of s.matchAll(/\bsessionId[=:]\s*["']?([^\s"',}]+)/gi)) ids.add(m[1]);
  for (const m of s.matchAll(/"runId"\s*:\s*"([^"]+)"/gi)) ids.add(m[1]);
  for (const m of s.matchAll(/"sessionId"\s*:\s*"([^"]+)"/gi)) ids.add(m[1]);
  for (const m of s.matchAll(/\b(active-memory-[a-z0-9]+-[a-f0-9]+)\b/gi)) ids.add(m[1]);
  return [...ids];
}

/**
 * Strip volatile tokens so near-identical errors cluster.
 * @param {string} line
 */
export function normalizeErrorLine(line) {
  let s = extractLogMessage(line);
  s = redactSecrets(s);
  s = s.replace(/\u001b\[[0-9;]*m/g, "");
  // timestamps
  s = s.replace(/\d{4}-\d{2}-\d{2}T[\d:.+-]+Z?/g, "<TS>");
  s = s.replace(/\b\d{2}:\d{2}:\d{2}(\.\d+)?\b/g, "<TIME>");
  // ids
  s = s.replace(/\brunId[=:]\S+/gi, "runId=<ID>");
  s = s.replace(/\bsessionId[=:]\S+/gi, "sessionId=<ID>");
  s = s.replace(/"runId"\s*:\s*"[^"]+"/gi, '"runId":"<ID>"');
  s = s.replace(/"sessionId"\s*:\s*"[^"]+"/gi, '"sessionId":"<ID>"');
  s = s.replace(/\bsession=agent:[^\s"]+/g, "session=<SESS>");
  s = s.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<UUID>");
  s = s.replace(/\bactive-memory-[a-z0-9]+-[a-f0-9]+\b/gi, "<AM_RUN>");
  s = s.replace(/\bpid[=:]?\d+/gi, "pid=<N>");
  s = s.replace(/\belapsedMs[=:]?\d+/gi, "elapsedMs=<N>");
  s = s.replace(/\btimeoutMs[=:]?\d+/gi, "timeoutMs=<N>");
  s = s.replace(/\bdurationMs[=:]?\d+/gi, "durationMs=<N>");
  // numeric durations → <N>
  s = s.replace(/\bafter\s+\d+(\.\d+)?\s*(ms|s|sec|seconds?)\b/gi, "after <N>$2");
  s = s.replace(/\b\d+(\.\d+)?\s*(ms|s|sec|seconds?)\b/gi, "<N>$2");
  s = s.replace(/\b\d{4,}\b/g, "<N>");
  // absolute/home paths → basename only
  s = s.replace(/(?:file:\/\/)?(?:\/[\w.@-]+)+\/([\w.@-]+)/g, "<PATH>/$1");
  // hashes
  s = s.replace(/\b[0-9a-f]{32,}\b/gi, "<HASH>");
  // trailing punctuation (aborted. vs aborted)
  s = s.replace(/[.。!…]+$/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s.slice(0, 500);
}

/**
 * Stable short id from normalized text.
 * @param {string} normalized
 */
export function fingerprintOf(normalized) {
  const h = crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 12);
  const low = normalized.toLowerCase();
  let tag = "generic";
  if (
    (low.includes("memory_search") || low.includes("memory search")) &&
    (low.includes("timeout") || low.includes("timed out") || low.includes("unavailable"))
  ) {
    tag = "memory-search-timeout";
  } else if (low.includes("database is not open")) tag = "memory-db-not-open";
  else if (
    low.includes("active-memory") &&
    (low.includes("timeout") || low.includes("timed out"))
  ) {
    tag = "active-memory-timeout";
  } else if (low.includes("embedded abort settle") || low.includes("abort settle timed out")) {
    tag = "abort-settle-timeout";
  } else if (low.includes("request was aborted")) {
    tag = "request-aborted";
  } else if (
    low.includes("embedded_run_failover") ||
    (low.includes("failover") && low.includes("timeout") && low.includes("active-memory"))
  ) {
    tag = "embedded-failover-timeout";
  } else if (low.includes("embedded run timeout") || low.includes("embedded_run")) {
    tag = "embedded-run-timeout";
  } else if (low.includes("fetch timeout") || low.includes("timeout reached") || /\btts\b/.test(low)) {
    tag = "fetch-timeout";
  } else if (low.includes("402") || low.includes("insufficient credits")) tag = "billing-402";
  else if (low.includes("xai_api_key") || low.includes("secrets_reloader") || low.includes("secretrefresolution")) {
    tag = "secrets-env-missing";
  } else if (low.includes("gateway failed to start")) tag = "gateway-start-fail";
  else if (low.includes("failover")) tag = "model-failover";
  else if (low.includes("econnrefused") || low.includes("ollama")) tag = "ollama-or-conn";
  return `E-${tag}-${h}`;
}

/**
 * @param {string} line
 */
export function isErrorishLine(line) {
  const s = extractLogMessage(line);
  if (!s.trim()) return false;
  // Markdown / probe-report prose (memory-health tables, doctor writeups)
  if (/^\s*[-*]\s+\*\*[A-Za-z].*\*\*/.test(s)) return false;
  if (/^\s*\|/.test(s) && /timeout|error|fail/i.test(s)) return false;
  if (/wrote stability bundle/i.test(s)) return false;
  if (/^#{1,6}\s/.test(s)) return false;
  // Explicit noise: routine fetch starts that only mention timeoutMs=
  if (/\[model-fetch\]\s*start\b/i.test(s) && !/\b(error|fail|timed out)\b/i.test(s)) {
    return false;
  }
  if (/logLevelName":"INFO"/i.test(String(line)) && !/\b(error|fail|timed out|unavailable)\b/i.test(s)) {
    return false;
  }
  // Require real failure signals — not bare timeoutMs field names
  // Note: bare "timeout" matches "run timeout" / JSON values but NOT timeoutMs= (\b after timeout fails)
  if (
    /\b(error|ERROR|fail(?:ed|ure)?|timed out|timeout reached|timeout|unavailable|ECONN|ENOTFOUND|exception|traceback|critical|SecretRefResolutionError|SECRETS_RELOADER_DEGRADED|denied|insufficient credits|aborted)\b/i.test(
      s,
    ) ||
    /\b402\b/.test(s)
  ) {
    return true;
  }
  // status=timeout / status": "timeout" / failoverReason timeout patterns
  if (/status[=:\s"]+timeout\b/i.test(s)) return true;
  if (/failoverReason[=:\s"]+timeout\b/i.test(s)) return true;
  // WARN with recall timed out etc.
  if (/\bWARN\b/i.test(String(line)) && /timed out|timeout|fail|error/i.test(s)) return true;
  return false;
}

// --- Collection ---

/**
 * @param {string} filePath
 * @param {number} maxBytes
 * @param {number} maxLines
 */
export function readBoundedTail(filePath, maxBytes = 256_000, maxLines = 400) {
  if (!fs.existsSync(filePath)) {
    return { path: filePath, ok: false, error: "missing", lines: [] };
  }
  try {
    const st = fs.statSync(filePath);
    const size = st.size;
    const fd = fs.openSync(filePath, "r");
    const start = Math.max(0, size - maxBytes);
    const len = size - start;
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, start);
    fs.closeSync(fd);
    let text = redactSecrets(buf.toString("utf8"));
    let lines = text.split(/\r?\n/);
    if (lines.length > maxLines) lines = lines.slice(-maxLines);
    return {
      path: filePath,
      ok: true,
      sizeBytes: size,
      lines,
      truncated: start > 0 || text.split(/\r?\n/).length > maxLines,
    };
  } catch (e) {
    return { path: filePath, ok: false, error: String(e && e.message ? e.message : e), lines: [] };
  }
}

/**
 * @param {string} workspace
 * @param {{ now?: Date, logDir?: string, maxJobLogs?: number, includeFixtures?: boolean }} [opts]
 */
export function discoverEvidenceSources(workspace, opts = {}) {
  const now = opts.now || new Date();
  const day = now.toISOString().slice(0, 10);
  const y = new Date(now.getTime() - 864e5).toISOString().slice(0, 10);
  const logDir = opts.logDir || "/tmp/openclaw";
  const sources = [];
  const filterOpts = { includeFixtures: opts.includeFixtures, workspace };

  for (const d of [day, y]) {
    const p = path.join(logDir, `openclaw-${d}.log`);
    if (!isExcludedEvidencePath(p, filterOpts)) {
      sources.push({ kind: "openclaw_log", path: p });
    }
  }

  const jobDir = path.join(workspace, "memory/cursor-jobs");
  if (fs.existsSync(jobDir)) {
    const logs = fs
      .readdirSync(jobDir)
      .filter((f) => /\.log$/i.test(f))
      .filter((f) => !isExcludedEvidencePath(path.join(jobDir, f), filterOpts))
      .map((f) => ({
        f,
        m: fs.statSync(path.join(jobDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.m - a.m)
      .slice(0, opts.maxJobLogs ?? 8);
    for (const { f } of logs) {
      sources.push({ kind: "cursor_job", path: path.join(jobDir, f) });
    }
  }

  // recent memory-health reports — excluded (probe markdown pollutes fingerprints)
  // Prefer live openclaw logs + .log job tails only.

  // Prior audit is diagnostic corpus — excluded by default (pollutes fingerprints)
  return sources.filter((s) => !isExcludedEvidencePath(s.path, filterOpts));
}

/**
 * @param {{ kind: string, path: string }[]} sources
 * @param {{ includeFixtures?: boolean, workspace?: string }} [opts]
 */
export function collectEvidence(sources, opts = {}) {
  const bundles = [];
  for (const s of sources) {
    if (isExcludedEvidencePath(s.path, opts)) continue;
    const maxBytes = s.kind === "openclaw_log" ? 400_000 : 120_000;
    const maxLines = s.kind === "openclaw_log" ? 600 : 200;
    const tail = readBoundedTail(s.path, maxBytes, maxLines);
    bundles.push({ ...s, ...tail });
  }
  return bundles;
}

// --- Clustering (Lane A) ---

/**
 * @param {{ path: string, lines: string[], ok: boolean }[]} bundles
 */
export function clusterErrors(bundles) {
  /** @type {Map<string, { fingerprint: string, normalized: string, count: number, samples: string[], sources: Set<string>, ids: Set<string>, firstIdx: number, lastIdx: number }>} */
  const map = new Map();
  let idx = 0;
  for (const b of bundles) {
    if (!b.ok) continue;
    for (const raw of b.lines) {
      if (!isErrorishLine(raw)) continue;
      const normalized = normalizeErrorLine(raw);
      if (normalized.length < 12) continue;
      // drop pure info noise that matched "warn" lightly
      if (/^#|^\s*PASS|overall: PASS/i.test(normalized) && !/fail|error|timeout/i.test(normalized)) {
        continue;
      }
      const fp = fingerprintOf(normalized);
      const cur = map.get(fp) || {
        fingerprint: fp,
        normalized,
        count: 0,
        samples: [],
        sources: new Set(),
        ids: new Set(),
        firstIdx: idx,
        lastIdx: idx,
      };
      cur.count += 1;
      cur.lastIdx = idx;
      cur.sources.add(b.path);
      for (const id of extractCorrelationIds(raw)) cur.ids.add(id);
      if (cur.samples.length < 3) {
        cur.samples.push(redactSecrets(raw).slice(0, 400));
      }
      map.set(fp, cur);
      idx += 1;
    }
  }

  return [...map.values()]
    .map((c) => ({
      fingerprint: c.fingerprint,
      normalized: c.normalized,
      count: c.count,
      samples: c.samples,
      sources: [...c.sources],
      ids: [...c.ids],
      firstOrdinal: c.firstIdx,
      lastOrdinal: c.lastIdx,
    }))
    .sort((a, b) => b.count - a.count || a.fingerprint.localeCompare(b.fingerprint));
}

// --- Family merge (precision) ---

/**
 * Cascade / family role for a cluster. Unrelated timeouts return distinct roles.
 * @param {object} cluster
 */
export function cascadeRole(cluster) {
  const blob = `${cluster.normalized || ""} ${(cluster.samples || []).join(" ")} ${(cluster.ids || []).join(" ")}`.toLowerCase();
  const hasAmId = /active-memory-/.test(blob) || (cluster.ids || []).some((id) => /active-memory-/i.test(id));
  const isAmContext = hasAmId || /active-memory/i.test(blob);

  if (/\btts\b|fetch timeout|speech|elevenlabs/i.test(blob) && !isAmContext) {
    return "fetch-tts-timeout";
  }
  if (
    (blob.includes("memory_search") || blob.includes("memory search")) &&
    (blob.includes("timeout") || blob.includes("timed out") || blob.includes("unavailable"))
  ) {
    return "memory-search-timeout";
  }
  // Specific AM cascade stages before generic / billing (402 may appear inside provider error text)
  if (blob.includes("embedded abort settle") || blob.includes("abort settle timed out")) {
    return isAmContext ? "am-abort-settle" : "abort-settle";
  }
  if (blob.includes("embedded_run_failover") && (blob.includes("timeout") || blob.includes("aborted"))) {
    return isAmContext ? "am-failover" : "failover-timeout";
  }
  if (blob.includes("embedded run timeout") || blob.includes("embedded_run_agent_end")) {
    if (isAmContext && (blob.includes("timeout") || blob.includes("timed out") || blob.includes("aborted"))) {
      return "am-embedded";
    }
    if (isAmContext) return "am-embedded";
    return "embedded-run-timeout";
  }
  if (blob.includes("request was aborted")) {
    return "am-aborted";
  }
  if (
    isAmContext &&
    (blob.includes("timeout") ||
      blob.includes("timed out") ||
      blob.includes("failed") ||
      blob.includes("skipping memory") ||
      blob.includes("unavailable") ||
      /status[=:\s"]+(timeout|unavailable)\b/.test(blob))
  ) {
    return "am-timeout";
  }
  // Billing only when not an AM/embedded lifecycle line (avoid 402-in-error-string false merges)
  if (
    (/\b402\b/.test(blob) || /insufficient credits/i.test(blob)) &&
    !/embedded_run|embedded run|active-memory|abort settle/i.test(blob)
  ) {
    return "billing-402";
  }
  if (blob.includes("failover") || blob.includes("failovererror")) {
    return "model-failover";
  }
  return null;
}

const AM_CASCADE_ROLES = new Set([
  "am-timeout",
  "am-embedded",
  "am-abort-settle",
  "am-failover",
  "am-aborted",
]);

/**
 * Union-find helpers
 * @param {number[]} parent
 * @param {number} i
 */
function ufFind(parent, i) {
  while (parent[i] !== i) {
    parent[i] = parent[parent[i]];
    i = parent[i];
  }
  return i;
}

/**
 * @param {number[]} parent
 * @param {number} a
 * @param {number} b
 */
function ufUnion(parent, a, b) {
  const ra = ufFind(parent, a);
  const rb = ufFind(parent, b);
  if (ra !== rb) parent[rb] = ra;
}

/**
 * Merge raw clusters into incident families.
 * Keep child fingerprints on the parent; unrelated timeouts stay separate.
 * @param {ReturnType<typeof clusterErrors>} clusters
 */
export function mergeIncidentFamilies(clusters) {
  if (!clusters.length) return [];

  const n = clusters.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const roles = clusters.map((c) => cascadeRole(c));

  // Index by correlation id
  /** @type {Map<string, number[]>} */
  const byId = new Map();
  for (let i = 0; i < n; i++) {
    for (const id of clusters[i].ids || []) {
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id).push(i);
    }
  }

  // 1) Shared runId / sessionId → merge
  for (const idxs of byId.values()) {
    for (let k = 1; k < idxs.length; k++) ufUnion(parent, idxs[0], idxs[k]);
  }

  // 2) Known AM cascade roles: merge AM-linked stages; pull aborted when AM family exists
  const amCoreIdx = [];
  const abortedIdx = [];
  const failoverIdx = [];
  for (let i = 0; i < n; i++) {
    const r = roles[i];
    if (!r) continue;
    if (r === "am-aborted") abortedIdx.push(i);
    else if (AM_CASCADE_ROLES.has(r)) amCoreIdx.push(i);
    else if (r === "model-failover" || r === "failover-timeout") failoverIdx.push(i);
  }
  for (let k = 1; k < amCoreIdx.length; k++) ufUnion(parent, amCoreIdx[0], amCoreIdx[k]);
  if (amCoreIdx.length) {
    for (const i of abortedIdx) ufUnion(parent, amCoreIdx[0], i);
  } else if (abortedIdx.length > 1) {
    for (let k = 1; k < abortedIdx.length; k++) ufUnion(parent, abortedIdx[0], abortedIdx[k]);
  }
  // Collapse lane/model failover noise into one family
  for (let k = 1; k < failoverIdx.length; k++) ufUnion(parent, failoverIdx[0], failoverIdx[k]);

  // 3) Same cascade role + normalized message similarity (tight)
  //    Do NOT globally union all billing/failover solely by role — only tight similarity / shared ids.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!roles[i] || roles[i] !== roles[j]) continue;
      if (roles[i] === "fetch-tts-timeout" || roles[i] === "memory-search-timeout") {
        ufUnion(parent, i, j);
        continue;
      }
      if (roles[i] === "billing-402" || roles[i] === "model-failover") {
        const a = (clusters[i].normalized || "").toLowerCase().slice(0, 80);
        const b = (clusters[j].normalized || "").toLowerCase().slice(0, 80);
        if (a === b || a.slice(0, 50) === b.slice(0, 50)) ufUnion(parent, i, j);
        continue;
      }
      const a = (clusters[i].normalized || "").toLowerCase();
      const b = (clusters[j].normalized || "").toLowerCase();
      if (a === b || a.includes(b.slice(0, 40)) || b.includes(a.slice(0, 40))) {
        ufUnion(parent, i, j);
      }
    }
  }

  /** @type {Map<number, number[]>} */
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const r = ufFind(parent, i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(i);
  }

  const families = [];
  for (const idxs of groups.values()) {
    const members = idxs.map((i) => clusters[i]);
    members.sort((a, b) => b.count - a.count);
    const primary = members[0];
    const roleSet = new Set(idxs.map((i) => roles[i]).filter(Boolean));
    const isAmFamily = [...roleSet].some((r) => AM_CASCADE_ROLES.has(r) && r !== "am-aborted")
      || ([...roleSet].includes("am-aborted") && [...roleSet].some((r) => r.startsWith("am-") && r !== "am-aborted"));

    let familyId;
    let title;
    if (isAmFamily || (roleSet.has("am-timeout") || roleSet.has("am-embedded") || roleSet.has("am-abort-settle") || roleSet.has("am-failover"))) {
      familyId = "F-active-memory-timeout";
      title = "Active-memory child / embedded timeouts";
    } else if (roleSet.has("memory-search-timeout")) {
      familyId = "F-memory-search-timeout";
      title = "memory_search tool timeout";
    } else if (roleSet.has("billing-402")) {
      familyId = "F-billing-402";
      title = "Provider billing / credits (402)";
    } else if (roleSet.has("fetch-tts-timeout")) {
      familyId = "F-fetch-tts-timeout";
      title = "Fetch / TTS timeout";
    } else if (roleSet.has("model-failover") || roleSet.has("failover-timeout")) {
      familyId = "F-model-failover";
      title = "Model failover / lane error";
    } else if (roleSet.has("am-aborted") && members.length >= 1 && !isAmFamily) {
      // orphan aborted without AM core — keep as aborted family, not forced into AM
      familyId = "F-request-aborted";
      title = "Request aborted (transport)";
    } else {
      const tag = primary.fingerprint.replace(/^E-/, "").replace(/-[a-f0-9]{12}$/i, "");
      familyId = `F-${tag}`;
      title = primary.normalized.slice(0, 80);
    }

    const allIds = new Set();
    const allSources = new Set();
    const samples = [];
    let count = 0;
    for (const m of members) {
      count += m.count;
      for (const id of m.ids || []) allIds.add(id);
      for (const s of m.sources || []) allSources.add(s);
      for (const s of m.samples || []) {
        if (samples.length < 5) samples.push(s);
      }
    }

    families.push({
      familyId,
      title,
      fingerprint: primary.fingerprint,
      normalized: primary.normalized,
      count,
      samples,
      sources: [...allSources],
      ids: [...allIds],
      children: members.map((m) => ({
        fingerprint: m.fingerprint,
        normalized: m.normalized,
        count: m.count,
      })),
      cascadeRoles: [...roleSet],
      firstOrdinal: Math.min(...members.map((m) => m.firstOrdinal ?? 0)),
      lastOrdinal: Math.max(...members.map((m) => m.lastOrdinal ?? 0)),
    });
  }

  families.sort((a, b) => b.count - a.count || a.familyId.localeCompare(b.familyId));
  return families;
}

// --- Ledger ---

/**
 * @param {string} text
 */
export function parseLedger(text) {
  /** @type {Record<string, Record<string, string>>} */
  const incidents = {};
  const chunks = String(text || "").split(/^## /m).slice(1);
  for (const chunk of chunks) {
    const lines = chunk.split(/\r?\n/);
    const id = (lines[0] || "").trim();
    if (!id.startsWith("E-") && !id.startsWith("F-")) continue;
    /** @type {Record<string, string>} */
    const fields = { id };
    for (const line of lines.slice(1)) {
      const m = line.match(/^- (\w[\w_]*):\s*(.*)$/);
      if (m) fields[m[1]] = m[2].trim();
    }
    incidents[id] = fields;
  }
  return incidents;
}

/**
 * Match cluster/family to ledger by exact fingerprint, family id, or tag prefix.
 * @param {string} fingerprint
 * @param {Record<string, Record<string, string>>} ledger
 * @param {string} [familyId]
 */
export function matchLedgerIncident(fingerprint, ledger, familyId) {
  if (familyId && ledger[familyId]) return { ...ledger[familyId], id: familyId };
  if (ledger[fingerprint]) return { ...ledger[fingerprint], id: fingerprint };
  const tag2 = fingerprint.replace(/-[a-f0-9]{12}$/i, "");
  if (ledger[tag2]) return { ...ledger[tag2], id: tag2 };

  for (const [id, row] of Object.entries(ledger)) {
    if (id === fingerprint) return { ...row, id };
    if (fingerprint.startsWith(id + "-") || fingerprint.startsWith(id)) return { ...row, id };
    if (row.fingerprint && fingerprint.includes(String(row.fingerprint).slice(0, 20))) {
      return { ...row, id };
    }
  }
  if (/memory-search-timeout/i.test(fingerprint + (familyId || "")) && ledger["E-memory-search-timeout"]) {
    return { ...ledger["E-memory-search-timeout"], id: "E-memory-search-timeout" };
  }
  if (/active-memory-timeout/i.test(fingerprint + (familyId || "")) && ledger["E-active-memory-timeout"]) {
    return { ...ledger["E-active-memory-timeout"], id: "E-active-memory-timeout" };
  }
  if (/memory-db-not-open/i.test(fingerprint) && ledger["E-memory-db-not-open"]) {
    return { ...ledger["E-memory-db-not-open"], id: "E-memory-db-not-open" };
  }
  if (/secrets-env-missing|gateway-start-fail/i.test(fingerprint) && ledger["E-secrets-env-missing"]) {
    return { ...ledger["E-secrets-env-missing"], id: "E-secrets-env-missing" };
  }
  return null;
}

/**
 * @param {object} cluster
 * @param {Record<string, string>|null} prior
 * @param {{ probePass?: boolean|null }} [ctx]
 * @returns {IncidentStatus}
 */
export function classifyIncidentStatus(cluster, prior, ctx = {}) {
  if (!prior) return "NEW";
  const priorStatus = (prior.status || "").toUpperCase();
  if (priorStatus === "NOISE" || priorStatus === "NOISY" || priorStatus === "NONACTIONABLE") {
    return "NOISE";
  }
  if (priorStatus === "RESOLVED") {
    if (ctx.probePass === false) return "REGRESSED";
    if (ctx.probePass === true) return "KNOWN";
    return "REGRESSED";
  }
  if (priorStatus === "MITIGATED" || priorStatus === "KNOWN" || priorStatus === "OPEN") {
    return "KNOWN";
  }
  return "KNOWN";
}

// --- Lane B/C heuristics ---

/**
 * @param {object} cluster
 */
export function hypothesizeRootCause(cluster) {
  const n = `${cluster.normalized || ""} ${(cluster.familyId || "")}`.toLowerCase();
  /** @type {{ cause: string, confidence: string, competing: string, procedure?: string }[]} */
  const hyps = [];

  if (
    (n.includes("memory_search") || n.includes("memory search") || n.includes("f-memory-search")) &&
    (n.includes("timeout") || n.includes("timed out") || n.includes("unavailable"))
  ) {
    hyps.push({
      cause: "Agent memory_search tool hard timeout (15s) and/or cooldown; may wrap as embedding/provider error",
      confidence: "high",
      competing: "True ollama/embed outage (check CLI search + embed ping)",
      procedure: "Procedure 16 + warmup",
    });
  }
  if (n.includes("xai_api_key") || n.includes("secretrefresolution") || n.includes("required secrets")) {
    hyps.push({
      cause: "Gateway SecretRef expects env XAI_API_KEY but runtime uses auth profile / other secret source",
      confidence: "medium",
      competing: "Transient env missing during restart",
      procedure: "Jason/Codex secrets — do not paste keys in chat",
    });
  }
  if (n.includes("database is not open")) {
    hyps.push({
      cause: "Memory sqlite/manager not open on tool path (flake or path/Node issue)",
      confidence: "medium",
      competing: "Corrupt DB (do not delete; probe integrity)",
      procedure: "Procedure 16",
    });
  }
  if (n.includes("active-memory") || n.includes("f-active-memory")) {
    hyps.push({
      cause:
        "Active Memory child/embedded path timing out under run budget; cascade produces abort-settle + aborted transport (budget inversion hypothesis)",
      confidence: "medium",
      competing: "Provider latency / xAI slow / scheduler nesting",
      procedure: "AM config is protected — Codex if changing",
    });
  }
  if (n.includes("embedded run timeout") && !n.includes("active-memory") && !n.includes("f-active-memory")) {
    hyps.push({
      cause: "Embedded agent run exceeded timeout",
      confidence: "medium",
      competing: "Upstream model stall",
    });
  }
  if ((n.includes("fetch timeout") || n.includes("tts") || n.includes("f-fetch-tts")) && !n.includes("active-memory")) {
    hyps.push({
      cause: "Outbound fetch/TTS timeout to provider",
      confidence: "medium",
      competing: "Network / provider side",
    });
  }
  if (n.includes("402") || n.includes("insufficient") || n.includes("f-billing")) {
    hyps.push({
      cause: "Billing/credits exhausted on provider",
      confidence: "high",
      competing: "Mis-routed fallback",
      procedure: "Jason billing",
    });
  }
  if (n.includes("failover") && !n.includes("active-memory") && !n.includes("f-active-memory")) {
    hyps.push({
      cause: "Model failover path engaged after primary error",
      confidence: "medium",
      competing: "Primary provider blip (symptom of another root)",
    });
  }

  if (!hyps.length) {
    hyps.push({
      cause: "Unclassified error cluster — needs Chair review",
      confidence: "low",
      competing: "Log noise / one-off",
    });
  }
  return hyps[0];
}

/**
 * @param {object} cluster
 * @param {ReturnType<typeof hypothesizeRootCause>} hyp
 * @param {IncidentStatus} status
 */
export function planRepairs(cluster, hyp, status) {
  /** @type {{ level: number, label: string, owner: string, action: string }[]} */
  const options = [];
  options.push({
    level: 0,
    label: "Observe / monitor",
    owner: "Nova",
    action: "No change; re-run doctor later if recurrence rises",
  });
  options.push({
    level: 1,
    label: "Safe diagnostic probes",
    owner: "Nova",
    action: "Run memory-health --quick, openclaw status/doctor --lint, embed warmup; compare current probe",
  });

  const key = `${cluster.fingerprint || ""} ${cluster.familyId || ""}`;
  if (/memory-search|memory-db|active-memory/i.test(key)) {
    options.push({
      level: 1,
      label: "Warm memory path",
      owner: "Nova",
      action: "node scripts/memory-embed-warmup.mjs (read-only side effect: warm embed)",
    });
    options.push({
      level: 2,
      label: "Workspace harden / tests",
      owner: "Cursor",
      action: "Extend probes/tests/docs only — no openclaw.json",
    });
    options.push({
      level: 3,
      label: "Configurable tool timeout / package fix",
      owner: "Codex",
      action: "Upstream/package: memory_search timeoutMs config (see codex brief if present)",
    });
  }

  if (/billing|402/i.test(key + (cluster.normalized || ""))) {
    options.push({
      level: 4,
      label: "Billing / credits",
      owner: "Jason",
      action: "Top up or disable broken provider route",
    });
  }

  if (status === "NOISE") {
    return options.filter((o) => o.level <= 1).slice(0, 2);
  }

  if (!options.some((o) => o.level === 4)) {
    options.push({
      level: 4,
      label: "Hold for Jason",
      owner: "Jason",
      action: "Approve any Level 2+ repair explicitly",
    });
  }

  return options;
}

/**
 * @param {object} cluster
 */
export function estimateBlastRadius(cluster) {
  const n = `${cluster.normalized || ""} ${cluster.familyId || ""}`.toLowerCase();
  if (n.includes("memory_search") || n.includes("memory search") || n.includes("database is not open") || n.includes("f-memory-search")) {
    return {
      severity: "medium",
      summary: "Main-session recall / startup LIGHT retrieval degraded; ops-first files still work",
    };
  }
  if (n.includes("active-memory") || n.includes("f-active-memory")) {
    return {
      severity: "low-medium",
      summary: "Active Memory pre-turn context may miss; core chat continues",
    };
  }
  if (n.includes("gateway failed to start") || n.includes("eaddrinuse")) {
    return { severity: "high", summary: "Gateway availability risk" };
  }
  if (n.includes("secretrefresolution") || n.includes("required secrets")) {
    return {
      severity: "medium",
      summary: "Secret resolution degraded at reload/restart; confirm gateway currently up",
    };
  }
  if (n.includes("402") || n.includes("billing") || n.includes("f-billing")) {
    return { severity: "high", summary: "Provider calls may fail until credits restored" };
  }
  return { severity: "low", summary: "Localized or unclear impact — verify before repair" };
}

// --- Change correlation ---

/**
 * @param {string} workspace
 * @param {number} [maxCommits]
 */
export function collectChangeMetadata(workspace, maxCommits = 15) {
  const out = {
    commits: /** @type {{ hash: string, date: string, subject: string }[]} */ ([]),
    error: /** @type {string|null} */ (null),
  };
  try {
    const text = execFileSync(
      "git",
      ["log", `-n`, String(maxCommits), "--format=%h|%cI|%s"],
      { cwd: workspace, encoding: "utf8" },
    );
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const [hash, date, ...rest] = line.split("|");
      out.commits.push({ hash, date, subject: rest.join("|") });
    }
  } catch (e) {
    out.error = String(e && e.message ? e.message : e);
  }
  return out;
}

/**
 * @param {object} cluster
 * @param {{ commits: { hash: string, date: string, subject: string }[] }} changes
 */
export function correlateChanges(cluster, changes) {
  const n = `${cluster.normalized || ""}`.toLowerCase();
  const hits = [];
  for (const c of changes.commits || []) {
    const s = c.subject.toLowerCase();
    let score = 0;
    if (n.includes("memory") && /memory|search|startup|embed/.test(s)) score += 2;
    if (n.includes("timeout") && /timeout|memory|startup|swarm/.test(s)) score += 1;
    if (n.includes("active-memory") && /active.?memory|am /.test(s)) score += 2;
    if (score > 0) hits.push({ ...c, score });
  }
  hits.sort((a, b) => b.score - a.score);
  if (!hits.length) {
    return {
      note: "No strong subject-keyword correlation in recent commits. Not proof of absence.",
      candidates: [],
    };
  }
  return {
    note: "Possible correlation only — not causation.",
    candidates: hits.slice(0, 5).map((h) => ({
      hash: h.hash,
      date: h.date,
      subject: h.subject,
      confidence: h.score >= 3 ? "medium" : "low",
    })),
  };
}

// --- Probes (Level 1 safe) ---

/**
 * @param {string} workspace
 * @param {{ skipLive?: boolean }} [opts]
 */
export function runSafeProbes(workspace, opts = {}) {
  /** @type {{ id: string, ok: boolean|null, detail: string }[]} */
  const probes = [];
  if (opts.skipLive) {
    return { probes, skipped: true };
  }

  try {
    const r = execFileSync("curl", ["-sS", "-m", "3", "http://127.0.0.1:11434/api/tags"], {
      encoding: "utf8",
    });
    const ok = r.includes("nomic-embed-text") || r.includes("models");
    probes.push({ id: "ollama_tags", ok, detail: ok ? "reachable" : redactSecrets(r).slice(0, 120) });
  } catch (e) {
    probes.push({
      id: "ollama_tags",
      ok: false,
      detail: String(e && e.message ? e.message : e).slice(0, 160),
    });
  }

  const probeScript = path.join(workspace, "scripts/memory-health-probe.mjs");
  if (fs.existsSync(probeScript)) {
    try {
      const out = execFileSync(
        process.execPath,
        [probeScript, "--quick"],
        {
          cwd: workspace,
          encoding: "utf8",
          timeout: 45_000,
          env: process.env,
        },
      );
      const ok = /overall:\s*PASS/i.test(out);
      probes.push({
        id: "memory_health_quick",
        ok,
        detail: redactSecrets(out).split(/\r?\n/).slice(0, 8).join(" | ").slice(0, 300),
      });
    } catch (e) {
      probes.push({
        id: "memory_health_quick",
        ok: false,
        detail: String(e && e.message ? e.message : e).slice(0, 200),
      });
    }
  }

  return { probes, skipped: false };
}

/**
 * @param {{ id: string, ok: boolean|null }[]} probes
 * @param {object} cluster
 */
export function probeRelevantPass(probes, cluster) {
  const n = `${cluster.normalized || ""}`.toLowerCase();
  if (n.includes("memory") || n.includes("embed") || n.includes("ollama") || /active-memory/i.test(cluster.familyId || "")) {
    const mh = probes.find((p) => p.id === "memory_health_quick");
    const ol = probes.find((p) => p.id === "ollama_tags");
    if (mh && mh.ok === false) return false;
    if (ol && ol.ok === false) return false;
    if (mh && mh.ok === true) return true;
  }
  if (probes.some((p) => p.ok === false) && /timeout|unavailable|econn/i.test(n)) return false;
  if (probes.length && probes.every((p) => p.ok === true)) return true;
  return null;
}

// --- Synthesis ---

const SEV_RANK = { high: 4, medium: 3, "low-medium": 2, low: 1 };
const ST_RANK = { REGRESSED: 5, NEW: 4, KNOWN: 3, RESOLVED: 2, NOISE: 1 };

/**
 * @param {object} familyOrCluster
 * @param {object} params
 */
function buildIncidentFromUnit(unit, params) {
  const { ledger, changes, probeList } = params;
  const prior = matchLedgerIncident(unit.fingerprint, ledger || {}, unit.familyId);
  const probePass = probeRelevantPass(probeList, unit);
  const status = classifyIncidentStatus(unit, prior, { probePass });
  const hyp = hypothesizeRootCause(unit);
  const blast = estimateBlastRadius(unit);
  const options = planRepairs(unit, hyp, status);
  const correlation = correlateChanges(unit, changes || { commits: [] });

  const stableId =
    unit.familyId ||
    prior?.id ||
    (unit.fingerprint.includes("memory-search-timeout")
      ? "E-memory-search-timeout"
      : unit.fingerprint.includes("active-memory-timeout")
        ? "E-active-memory-timeout"
        : unit.fingerprint.includes("memory-db-not-open")
          ? "E-memory-db-not-open"
          : unit.fingerprint);

  return {
    id: stableId,
    familyId: unit.familyId || null,
    title: unit.title || unit.normalized?.slice(0, 80) || stableId,
    fingerprint: unit.fingerprint,
    status,
    count: unit.count,
    evidence: {
      normalized: unit.normalized,
      samples: unit.samples,
      sources: unit.sources,
    },
    children: unit.children || [],
    cascadeRoles: unit.cascadeRoles || [],
    currentProbePass: probePass,
    rootCause: hyp.cause,
    confidence: hyp.confidence,
    competingHypothesis: hyp.competing,
    procedure: hyp.procedure || null,
    blastRadius: blast,
    correlation,
    options: options.map((o, i) => ({
      n: i + 1,
      level: o.level,
      levelName: REPAIR_LEVELS[o.level] || String(o.level),
      owner: o.owner,
      label: o.label,
      action: o.action,
    })),
    prior: prior
      ? {
          status: prior.status,
          mitigation: prior.mitigation || prior.current_mitigation || null,
          permanent_repair: prior.permanent_repair || null,
          owner: prior.owner || null,
        }
      : null,
  };
}

/**
 * Rank key: never bury high-severity solely due to low count.
 * @param {object} a
 * @param {object} b
 */
function compareIncidents(a, b) {
  const sevA = SEV_RANK[a.blastRadius?.severity] || 0;
  const sevB = SEV_RANK[b.blastRadius?.severity] || 0;
  // Pin high severity above low-count demotion
  if (sevA >= 4 || sevB >= 4) {
    if (sevB !== sevA) return sevB - sevA;
  }
  const dr = (ST_RANK[b.status] || 0) - (ST_RANK[a.status] || 0);
  if (dr) return dr;
  if (sevB !== sevA) return sevB - sevA;
  return b.count - a.count;
}

/**
 * Split into top families (≤maxTop) + appendix. High-severity always eligible for top.
 * Reserves slots for high-count watch items so low-medium recurring families are not buried.
 * @param {object[]} incidents
 * @param {number} [maxTop]
 */
export function selectTopFamilies(incidents, maxTop = DEFAULT_TOP_FAMILIES) {
  const ranked = [...incidents].sort(compareIncidents);
  const isHigh = (inc) => (SEV_RANK[inc.blastRadius?.severity] || 0) >= 4 && inc.status !== "NOISE";
  const high = ranked.filter(isHigh);
  const watch = ranked
    .filter((i) => !isHigh(i) && i.status !== "NOISE" && i.confidence !== "low")
    .sort((a, b) => b.count - a.count || compareIncidents(a, b));
  const lowConf = ranked.filter((i) => !isHigh(i) && !watch.includes(i));

  const families = [];
  // Reserve at least 2 slots for watch/actionable when present
  const watchReserve = Math.min(2, watch.length, Math.max(0, maxTop - 1));
  const highBudget = Math.max(1, maxTop - watchReserve);

  for (const inc of high) {
    if (families.filter(isHigh).length >= highBudget) break;
    if (families.length >= maxTop) break;
    families.push(inc);
  }
  for (const inc of watch) {
    if (families.length >= maxTop) break;
    families.push(inc);
  }
  // Spill remaining high-sev if slots left
  for (const inc of high) {
    if (families.includes(inc)) continue;
    if (families.length >= maxTop) break;
    families.push(inc);
  }
  // Low-confidence / noise stay in appendix by default (user-facing precision)
  if (!families.length) {
    for (const inc of lowConf) {
      if (families.length >= maxTop) break;
      families.push(inc);
    }
  }

  const familySet = new Set(families);
  const appendix = ranked.filter((i) => !familySet.has(i));
  return { families: families.sort(compareIncidents), appendix };
}

/**
 * @param {object[]} families
 * @param {object[]} appendix
 * @param {{ probes?: { probes?: { ok: boolean|null }[], skipped?: boolean } }} [ctx]
 */
export function computeHealthLabel(families, appendix = [], ctx = {}) {
  const all = [...families, ...appendix];
  const highFail = all.some(
    (i) =>
      (SEV_RANK[i.blastRadius?.severity] || 0) >= 4 &&
      (i.status === "REGRESSED" || i.currentProbePass === false),
  );
  if (highFail) return "UNHEALTHY";

  const degraded = all.some(
    (i) =>
      ((SEV_RANK[i.blastRadius?.severity] || 0) >= 3 && i.status === "REGRESSED") ||
      (i.currentProbePass === false && i.status !== "NOISE"),
  );
  if (degraded) return "DEGRADED";

  const watch = families.filter(
    (i) =>
      i.status !== "NOISE" &&
      i.status !== "RESOLVED" &&
      (i.status === "KNOWN" || i.status === "NEW") &&
      i.currentProbePass !== false,
  );
  if (watch.length) return `HEALTHY WITH ${watch.length} WATCH ITEM${watch.length === 1 ? "" : "S"}`;
  return "HEALTHY";
}

/**
 * @param {object} params
 */
export function synthesizeIncidents(params) {
  const {
    clusters,
    families: preFamilies,
    ledger,
    changes,
    probes,
    maxIncidents = 12,
    maxTopFamilies = DEFAULT_TOP_FAMILIES,
  } = params;

  const probeList = probes?.probes || [];
  const units = preFamilies || mergeIncidentFamilies(clusters || []);
  const incidents = units.map((u) =>
    buildIncidentFromUnit(u, { ledger, changes, probeList }),
  );

  incidents.sort(compareIncidents);
  const { families, appendix } = selectTopFamilies(incidents, maxTopFamilies);

  // Legacy `incidents` = top families (compat with older callers/tests)
  return {
    incidents: families.slice(0, maxIncidents),
    families,
    appendix,
    allIncidents: incidents,
  };
}

/**
 * Recommendation one-liner for user card.
 * @param {object} inc
 */
function recommendationFor(inc) {
  if (inc.status === "NOISE") return "Ignore operationally while current probes stay healthy.";
  if (inc.status === "REGRESSED") return "Re-open: prior resolved/mitigated path failed current probe.";
  const obs = (inc.options || []).find((o) => o.level === 0);
  if (inc.currentProbePass === true && inc.status === "KNOWN") {
    return obs ? `${obs.label}.` : "Observe; re-run doctor if recurrence rises.";
  }
  const preferred = (inc.options || []).find((o) => o.level <= 1) || (inc.options || [])[0];
  return preferred ? `${preferred.label} — ${preferred.action}` : "Chair review required.";
}

/**
 * @param {object} report
 */
export function formatDoctorReportMarkdown(report) {
  const lines = [];
  const families = report.families || report.incidents || [];
  const appendix = report.appendix || [];
  const health = report.health || computeHealthLabel(families, appendix, { probes: report.probes });

  lines.push(`Runtime Error Doctor`);
  lines.push("");
  lines.push(`Current health: ${health}`);
  lines.push("");
  lines.push(`_v${report.version} · ${report.generatedAt} · READ-ONLY (no repairs executed)_`);
  lines.push(`Sources ok/fail: ${report.sourcesOk}/${report.sourcesFail} · Raw clusters: ${report.clusterCount} · Families shown: ${families.length}`);
  lines.push("");

  if (!families.length) {
    lines.push("_No actionable error families in bounded evidence._");
    lines.push("");
  }

  let n = 1;
  for (const inc of families) {
    const probe =
      inc.currentProbePass === true ? "PASS" : inc.currentProbePass === false ? "FAIL" : "n/a";
    lines.push(`${n}. ${inc.title || inc.id}`);
    lines.push(`   Status: ${inc.status}${inc.count ? ` · count=${inc.count}` : ""}${inc.prior ? ` · ledger=${inc.prior.status}` : ""}`);
    lines.push(`   Risk: ${inc.blastRadius?.severity || "?"} — ${inc.blastRadius?.summary || ""}`);
    lines.push(`   Probe: ${probe}`);
    lines.push(`   Recommendation: ${recommendationFor(inc)}`);
    lines.push(`   Confidence: ${inc.confidence}`);
    if (inc.children?.length > 1) {
      lines.push(`   Children: ${inc.children.length} fingerprints (see JSON rawClusters / children)`);
    }
    lines.push("");
    n += 1;
  }

  const unclassified = appendix.filter((i) => i.confidence === "low");
  const noise = appendix.filter((i) => i.status === "NOISE");
  const lowConf = appendix.filter((i) => i.confidence !== "low" && i.status !== "NOISE");
  lines.push(`Appendix: unclassified / low-confidence / noise`);
  lines.push(`- unclassified/low-confidence: ${unclassified.length}`);
  lines.push(`- other deferred: ${lowConf.length}`);
  lines.push(`- noise: ${noise.length}`);
  const shortList = appendix.slice(0, 12);
  if (shortList.length) {
    for (const a of shortList) {
      lines.push(`  - ${a.id} (${a.status}, sev=${a.blastRadius?.severity || "?"}, n=${a.count})`);
    }
    if (appendix.length > shortList.length) {
      lines.push(`  - … +${appendix.length - shortList.length} more`);
    }
  } else {
    lines.push(`  - (empty)`);
  }
  lines.push("");

  lines.push(`Hard bans honored`);
  for (const b of report.hardBans || []) lines.push(`- ${b}`);
  lines.push("");

  if (report.probes?.skipped) {
    lines.push(`Probes: skipped (offline/test mode)`);
  } else if (report.probes?.probes?.length) {
    lines.push(`Probes:`);
    for (const p of report.probes.probes) {
      lines.push(`- ${p.id}: ${p.ok === true ? "PASS" : p.ok === false ? "FAIL" : "n/a"} — ${p.detail}`);
    }
  }
  lines.push("");
  lines.push(`Chair: pick family + option number to approve a repair brief. No auto-fix / no doctor --fix / no gateway restart.`);
  lines.push("");
  return lines.join("\n");
}

/**
 * Full pipeline for CLI.
 * @param {object} opts
 */
export function runErrorDoctor(opts) {
  const workspace = opts.workspace;
  const skipLiveProbes = !!opts.skipLiveProbes;
  const includeFixtures = !!opts.includeFixtures;
  const ledgerPath =
    opts.ledgerPath || path.join(workspace, "memory/error-doctor-ledger.md");

  let ledgerText = "";
  if (fs.existsSync(ledgerPath)) ledgerText = fs.readFileSync(ledgerPath, "utf8");
  const ledger = parseLedger(ledgerText);

  const sources =
    opts.sources ||
    discoverEvidenceSources(workspace, { ...opts, includeFixtures });
  const bundles = collectEvidence(sources, { includeFixtures, workspace });
  const sourcesOk = bundles.filter((b) => b.ok).length;
  const sourcesFail = bundles.filter((b) => !b.ok).length;

  const rawClusters = clusterErrors(bundles);
  const mergedFamilies = mergeIncidentFamilies(rawClusters);
  const changes = collectChangeMetadata(workspace);
  const probes = runSafeProbes(workspace, { skipLive: skipLiveProbes });

  const synthesized = synthesizeIncidents({
    clusters: rawClusters,
    families: mergedFamilies,
    ledger,
    changes,
    probes,
    maxIncidents: opts.maxIncidents ?? 12,
    maxTopFamilies: opts.maxTopFamilies ?? DEFAULT_TOP_FAMILIES,
  });

  const hardBans = [
    "no openclaw doctor --fix / --repair",
    "no gateway restart",
    "no config edits",
    "no log deletion",
    "no full-log model dumps (bounded tails only)",
    "no secret exposure (redaction applied)",
    "no auto-commit or push",
    "no resolved claim without current passing probe",
    "no auto-repair (diagnosis only)",
  ];

  const health = computeHealthLabel(synthesized.families, synthesized.appendix, { probes });

  const report = {
    version: DOCTOR_VERSION,
    generatedAt: new Date().toISOString(),
    workspace,
    ledgerPath,
    sourcesOk,
    sourcesFail,
    sourcePaths: bundles.map((b) => ({ path: b.path, ok: b.ok, error: b.error || null })),
    clusterCount: rawClusters.length,
    familyCount: mergedFamilies.length,
    health,
    // User-facing
    families: synthesized.families,
    appendix: synthesized.appendix,
    // Compat
    incidents: synthesized.families,
    // Optional detail
    rawClusters: opts.includeRawClusters === false ? undefined : rawClusters.slice(0, 80),
    clusters: rawClusters.slice(0, 30),
    probes,
    changes,
    hardBans,
    sideEffects: {
      repaired: false,
      doctorFix: false,
      configWritten: false,
      gatewayRestarted: false,
      logsDeleted: false,
    },
    laneModel: {
      A: "normalize/fingerprint/cluster + family merge (in-process v0.1.1)",
      B: "root-cause heuristics + procedure map (in-process; Flash optional later)",
      C: "blast radius + repair options + owners (in-process; Flash optional later)",
      chair: "Nova ranks and waits for approval",
    },
  };

  return report;
}

/**
 * Seed ledger markdown if missing.
 */
export function defaultLedgerMarkdown() {
  return `# Error Doctor Incident Ledger

Read-only diagnoses update this file only when Nova/Jason explicitly asks to record dispositions.
v0.1 CLI does **not** auto-write repairs; optional \`--write-ledger-draft\` may append NEW fingerprints as open drafts.

## E-memory-search-timeout
- status: KNOWN
- first_seen: 2026-08-01
- last_seen: 2026-08-01
- occurrences: 3
- fingerprint: memory_search + 15s timeout + 60s cooldown
- root_cause_confidence: high
- mitigation: embed warmup + CLI/file fallback + LIGHT CLI 20s
- permanent_repair: configurable upstream MEMORY_SEARCH_TOOL_TIMEOUT_MS
- owner: Codex/upstream
- regression_test: scripts/test-memory-health.mjs + memory-embed-warmup + startup suites

## E-active-memory-timeout
- status: KNOWN
- first_seen: 2026-07-28
- last_seen: 2026-08-01
- occurrences: many
- fingerprint: active-memory status=timeout
- root_cause_confidence: medium
- mitigation: accept soft-fail; strict prompt; timeoutMs 12000
- permanent_repair: retune only with Jason/Codex (protected config)
- owner: Codex/Jason
- regression_test: active-memory offline smoke (live inject queued)

## E-memory-db-not-open
- status: KNOWN
- first_seen: 2026-07-29
- last_seen: intermittent
- occurrences: intermittent
- fingerprint: database is not open
- root_cause_confidence: medium
- mitigation: Procedure 16 probe + CLI trust over empty tool
- permanent_repair: manager lifecycle / tool path harden (upstream if needed)
- owner: Nova/Codex
- regression_test: scripts/memory-health-probe.mjs
`;
}
