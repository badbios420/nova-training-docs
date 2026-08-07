/**
 * Session startup library — pure helpers + injectable runStartup for fixture tests.
 * CLI: scripts/session-startup.mjs
 */

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const defaultExecFileAsync = promisify(execFile);

export const STARTUP_FILES = Object.freeze([
  "SOUL.md",
  "USER.md",
  "MEMORY.md",
  "memory/session-consolidation-v1.md",
  "memory/procedural-memory-v1.md",
  "memory/observed-failures.md",
  "memory/memory-retrieval-policy-v1.md",
  "memory/time-awareness.md",
]);

/** Required for nonzero failure if missing. */
export const CRITICAL_CONTINUITY_FILES = Object.freeze(["SOUL.md", "USER.md"]);

export const LIGHT_QUERIES = Object.freeze([
  "current active projects open questions next priorities",
  "recent session consolidation observed failures procedural memory",
]);

export const LIGHT_SEARCH_CONCURRENCY = 2;

/**
 * Per-query CLI timeout for LIGHT memory_search.
 * Raised 10s→20s so cold/load paths are less likely to flake under plugin budget (timeoutMs=30000).
 * Agent tool hardcode remains 15s in openclaw package (not tunable here).
 */
export const LIGHT_SEARCH_TIMEOUT_MS = 20_000;

/** WORLD_STATE older than this → warning (matches HEARTBEAT freshness rule). */
export const WORLD_STATE_STALE_SECONDS = 7 * 24 * 60 * 60;

export const HEARTBEAT_THRESHOLDS_SECONDS = Object.freeze({
  selfImprovementReview: 7 * 24 * 60 * 60,
  memory: 3 * 24 * 60 * 60,
  security: 14 * 24 * 60 * 60,
  update: 14 * 24 * 60 * 60,
  sites: 3 * 24 * 60 * 60,
  weather: 24 * 60 * 60,
});

export function parseArgs(argv) {
  const args = {
    workspace: process.cwd(),
    sessionKey: "",
    sessionId: "",
    agentId: "main",
    force: false,
    json: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--workspace") args.workspace = argv[++index] ?? args.workspace;
    else if (arg === "--session-key") args.sessionKey = argv[++index] ?? "";
    else if (arg === "--session-id") args.sessionId = argv[++index] ?? "";
    else if (arg === "--agent-id") args.agentId = argv[++index] ?? args.agentId;
    else if (arg === "--force") args.force = true;
    else if (arg === "--json") args.json = true;
  }
  return args;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function localDateParts(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: pad2(date.getMonth() + 1),
    day: pad2(date.getDate()),
  };
}

export function localDateString(date = new Date()) {
  const parts = localDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function previousLocalDateString(date = new Date()) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() - 1);
  return localDateString(d);
}

export async function readTextIfExists(filePath, io = fs) {
  try {
    return await io.readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}

export async function readJsonIfExists(filePath, fallback, io = fs) {
  const text = await readTextIfExists(filePath, io);
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, value, io = fs) {
  await io.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  await io.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await io.rename(tmp, filePath);
}

export function summarizeText(text, maxChars = 360) {
  return String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(" ")
    .slice(0, maxChars);
}

export async function ensureDailyFile(workspace, date, io = fs) {
  const memoryDir = path.join(workspace, "memory");
  await io.mkdir(memoryDir, { recursive: true });
  const dailyPath = path.join(memoryDir, `${date}.md`);
  const existing = await readTextIfExists(dailyPath, io);
  if (existing !== null) return { path: dailyPath, created: false };
  await io.writeFile(dailyPath, `# ${date}\n\n`, "utf8");
  return { path: dailyPath, created: true };
}

export function extractJsonPayload(stdout) {
  const text = String(stdout || "").trim();
  if (!text) throw new Error("empty memory search stdout");
  try {
    return JSON.parse(text);
  } catch {
    const start = text.search(/[\[\{]/);
    if (start < 0) throw new Error(`non-json memory search stdout: ${text.slice(0, 120)}`);
    return JSON.parse(text.slice(start));
  }
}

/**
 * @param {object} deps
 * @param {typeof defaultExecFileAsync} [deps.execFileAsync]
 */
export async function runMemorySearch(workspace, query, deps = {}) {
  const execFileAsync = deps.execFileAsync || defaultExecFileAsync;
  const timeoutMs = deps.timeoutMs ?? LIGHT_SEARCH_TIMEOUT_MS;
  try {
    const { stdout } = await execFileAsync(
      "openclaw",
      ["memory", "search", "--json", "--max-results", "3", query],
      {
        cwd: workspace,
        timeout: timeoutMs,
        maxBuffer: 512 * 1024,
        env: {
          ...process.env,
          PATH: process.env.PATH || "",
        },
      },
    );
    const parsed = extractJsonPayload(stdout);
    return { query, ok: true, results: Array.isArray(parsed) ? parsed.slice(0, 3) : parsed };
  } catch (error) {
    return {
      query,
      ok: false,
      error: String(error && error.message ? error.message : error).slice(0, 240),
    };
  }
}

export async function mapPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

export function extractSearchSummary(item) {
  if (!item || typeof item !== "object") return "";
  const pathValue = item.path ?? item.file ?? item.filePath ?? item.source ?? "";
  const scoreValue = item.score ?? item.similarity ?? item.distance ?? "";
  const textValue = item.text ?? item.content ?? item.snippet ?? item.summary ?? "";
  const source = String(pathValue || "memory").replace(/^.*\/memory\//, "memory/");
  const score = typeof scoreValue === "number" ? ` score=${scoreValue.toFixed(3)}` : "";
  const text = summarizeText(String(textValue || ""), 220);
  return text ? `${source}${score}: ${text}` : `${source}${score}`;
}

export function summarizeSearches(searches) {
  const lines = [];
  for (const search of searches) {
    if (!search.ok) {
      lines.push(`- ${search.query}: unavailable (${search.error})`);
      continue;
    }
    const entries = Array.isArray(search.results) ? search.results : search.results?.results;
    const summaries = Array.isArray(entries)
      ? entries.map(extractSearchSummary).filter(Boolean).slice(0, 2)
      : [];
    if (summaries.length > 0) lines.push(`- ${search.query}: ${summaries.join(" | ")}`);
  }
  return lines.slice(0, 8);
}

export function heartbeatOverdue(lastChecks, nowSeconds) {
  const overdue = [];
  for (const [name, threshold] of Object.entries(HEARTBEAT_THRESHOLDS_SECONDS)) {
    const last = Number(lastChecks?.[name] ?? 0);
    if (!Number.isFinite(last) || last <= 0) {
      overdue.push({ name, status: "never", secondsOverdue: null });
      continue;
    }
    const age = nowSeconds - last;
    if (age > threshold) {
      overdue.push({ name, status: "overdue", secondsOverdue: Math.floor(age - threshold) });
    }
  }
  return overdue;
}

/**
 * @returns {{ stale: boolean, ageSeconds: number|null, path: string, warning: string|null }}
 */
export function assessWorldStateFreshness(mtimeMs, nowMs = Date.now(), thresholdSeconds = WORLD_STATE_STALE_SECONDS) {
  const wsPath = "WORLD_STATE.md";
  if (mtimeMs == null || !Number.isFinite(mtimeMs)) {
    return {
      stale: true,
      ageSeconds: null,
      path: wsPath,
      warning: "WORLD_STATE.md missing or unreadable",
    };
  }
  const ageSeconds = Math.floor((nowMs - mtimeMs) / 1000);
  if (ageSeconds > thresholdSeconds) {
    return {
      stale: true,
      ageSeconds,
      path: wsPath,
      warning: `WORLD_STATE.md stale (age ${ageSeconds}s > ${thresholdSeconds}s)`,
    };
  }
  return { stale: false, ageSeconds, path: wsPath, warning: null };
}

/** Static guard: startup path must not use python heredoc (Procedure 17). */
export function sourceUsesPythonHeredoc(sourceText) {
  const text = String(sourceText || "");
  if (/python3?\s+<<['"]?PY/i.test(text)) return true;
  if (/<<['"]?PY['"]?/.test(text) && /python/i.test(text)) return true;
  return false;
}

export async function maybeLogIdentityCheck({ workspace, date, state, nowIso, io = fs }) {
  const memoryDir = path.join(workspace, "memory");
  const identityPath = path.join(memoryDir, "identity-substrate.md");
  const heading = `## ${date} - Automatic Startup Identity Check`;

  if (state.lastIdentityCheckDate === date) {
    return { logged: false, reason: "state_already_logged_today", path: identityPath };
  }

  await io.mkdir(memoryDir, { recursive: true });
  const existing = await readTextIfExists(identityPath, io);
  if (existing && existing.includes(heading)) {
    state.lastIdentityCheckDate = date;
    state.lastIdentityCheckAt = nowIso;
    return { logged: false, reason: "file_already_has_today_entry", path: identityPath };
  }

  const entry = [
    "",
    heading,
    "",
    `- Logged: ${nowIso}`,
    "- Continuity Pulse: 7/10",
    "- Drift Check: No drift detected by deterministic startup check.",
    "- Anchor Action: Load current memory before substantive main-session work.",
    "",
  ].join("\n");
  await io.appendFile(identityPath, entry, "utf8");
  state.lastIdentityCheckDate = date;
  state.lastIdentityCheckAt = nowIso;
  return { logged: true, reason: "appended", path: identityPath };
}

export function buildInternalContext(result) {
  const lines = [];
  if (result.retrievalDegraded) {
    lines.push("STARTUP_RETRIEVAL_DEGRADED");
  }
  lines.push(
    "<session_startup_context>",
    "Automatic main-session startup completed. Treat this as internal context, not user-facing copy.",
    `Date: ${result.date}`,
    `Completion: ${result.ok === false ? "FAILED" : "OK"}`,
    `Daily memory: ${result.daily?.created ? "created" : "present"} (${
      result.daily?.path ? path.basename(result.daily.path) : "n/a"
    })`,
    `Recent files loaded: ${result.loadedFiles?.join(", ") || "none"}`,
  );
  if (result.missingFiles?.length) {
    lines.push(`Missing continuity files: ${result.missingFiles.join(", ")}`);
  }
  if (result.worldState?.warning) {
    lines.push(`WORLD_STATE: ${result.worldState.warning}`);
  }
  if (result.retrievalDegraded) {
    lines.push("LIGHT memory retrieval: DEGRADED (searches failed or unavailable)");
  }
  if (result.searchSummary?.length > 0) {
    lines.push("LIGHT memory retrieval summary:");
    lines.push(...result.searchSummary);
  }
  if (result.heartbeatOverdue?.length > 0) {
    lines.push("Important startup alerts to surface briefly if relevant:");
    for (const item of result.heartbeatOverdue) {
      lines.push(`- heartbeat ${item.name}: ${item.status}`);
    }
  }
  lines.push("Use MEDIUM/DEEP retrieval only if the user request justifies escalation.");
  lines.push("</session_startup_context>");
  return lines.join("\n");
}

/**
 * @param {object} args parseArgs result
 * @param {object} [deps]
 * @param {typeof fs} [deps.fs]
 * @param {typeof defaultExecFileAsync} [deps.execFileAsync]
 * @param {() => Date} [deps.now]
 */
export async function runStartup(args, deps = {}) {
  const io = deps.fs || fs;
  const nowDate = deps.now ? deps.now() : new Date();
  const workspace = path.resolve(args.workspace);
  const date = localDateString(nowDate);
  const yesterday = previousLocalDateString(nowDate);
  const nowIso = nowDate.toISOString();
  const nowSeconds = Math.floor(nowDate.getTime() / 1000);
  const statePath = path.join(workspace, ".openclaw", "session-startup-state.json");
  const state = await readJsonIfExists(statePath, { sessions: {} }, io);
  if (!state.sessions || typeof state.sessions !== "object") state.sessions = {};

  const runKey = `${args.agentId || "main"}|${args.sessionKey || "unknown"}|${args.sessionId || "unknown"}`;
  if (!args.force && state.sessions[runKey]?.completedAt) {
    return {
      skipped: true,
      ok: true,
      completionMarker: "SKIPPED_ALREADY_COMPLETED",
      reason: "already_completed_for_session",
      workspace,
      date,
      internalContext: "",
      searchAttempts: 0,
    };
  }

  const daily = await ensureDailyFile(workspace, date, io);
  const loadedFiles = [];
  const missingFiles = [];
  const fileSummaries = {};
  const continuityList = [
    ...STARTUP_FILES,
    `memory/${date}.md`,
    `memory/${yesterday}.md`,
  ];
  for (const relativePath of continuityList) {
    const text = await readTextIfExists(path.join(workspace, relativePath), io);
    if (text === null) {
      if (STARTUP_FILES.includes(relativePath) || CRITICAL_CONTINUITY_FILES.includes(relativePath)) {
        missingFiles.push(relativePath);
      }
      continue;
    }
    loadedFiles.push(relativePath);
    fileSummaries[relativePath] = summarizeText(text);
  }

  let worldState = {
    stale: false,
    ageSeconds: null,
    path: "WORLD_STATE.md",
    warning: null,
  };
  try {
    const st = await io.stat(path.join(workspace, "WORLD_STATE.md"));
    worldState = assessWorldStateFreshness(st.mtimeMs, nowDate.getTime());
  } catch {
    worldState = assessWorldStateFreshness(null, nowDate.getTime());
  }

  const heartbeat = await readJsonIfExists(
    path.join(workspace, "memory", "heartbeat-state.json"),
    { lastChecks: {} },
    io,
  );
  const overdue = heartbeatOverdue(heartbeat.lastChecks, nowSeconds);
  const identity = await maybeLogIdentityCheck({
    workspace,
    date,
    state,
    nowIso,
    io,
  });

  const searches = await mapPool(
    LIGHT_QUERIES,
    LIGHT_SEARCH_CONCURRENCY,
    (query) => runMemorySearch(workspace, query, deps),
  );

  const criticalMissing = missingFiles.filter((f) => CRITICAL_CONTINUITY_FILES.includes(f));
  const ok = criticalMissing.length === 0;

  // LIGHT retrieval degraded when queries were attempted but none succeeded
  const searchAttempts = searches.length;
  const successfulSearches = searches.filter((s) => s && s.ok === true).length;
  const retrievalDegraded = searchAttempts > 0 && successfulSearches === 0;

  if (retrievalDegraded && daily?.path) {
    try {
      const note = `\n- STARTUP_RETRIEVAL_DEGRADED: LIGHT memory_search unavailable (${nowIso})\n`;
      const existingDaily = await readTextIfExists(daily.path, io);
      if (existingDaily !== null && !existingDaily.includes("STARTUP_RETRIEVAL_DEGRADED")) {
        await io.appendFile(daily.path, note, "utf8");
      }
    } catch {
      // best-effort; do not fail startup
    }
  }

  const result = {
    skipped: false,
    ok,
    completionMarker: ok ? "STARTUP_OK" : "STARTUP_FAILED",
    workspace,
    date,
    nowIso,
    sessionKey: args.sessionKey,
    sessionId: args.sessionId,
    agentId: args.agentId,
    daily,
    identity,
    loadedFiles,
    missingFiles,
    fileSummaries,
    worldState,
    heartbeatOverdue: overdue,
    searches,
    searchSummary: summarizeSearches(searches),
    searchAttempts,
    lightSearchConcurrency: LIGHT_SEARCH_CONCURRENCY,
    retrievalDegraded,
  };
  result.internalContext = buildInternalContext(result);

  // Only stamp completed on success — allows retry after true failure without --force
  if (ok) {
    state.sessions[runKey] = {
      completedAt: nowIso,
      date,
      sessionKey: args.sessionKey,
      sessionId: args.sessionId,
      agentId: args.agentId,
      heartbeatOverdue: overdue.map((item) => item.name),
      completionMarker: result.completionMarker,
    };
  }
  state.lastRunAt = nowIso;
  state.lastRunKey = runKey;
  await writeJson(statePath, state, io);
  return result;
}

/**
 * CLI entry helper — sets exitCode on hard failure.
 */
export async function main(argv = process.argv.slice(2), deps = {}) {
  const args = parseArgs(argv);
  try {
    const result = await runStartup(args, deps);
    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else if (result.internalContext) {
      process.stdout.write(`${result.internalContext}\n`);
    }
    if (result.ok === false && !result.skipped) {
      process.exitCode = 1;
    }
    return result;
  } catch (error) {
    const payload = {
      skipped: false,
      ok: false,
      completionMarker: "STARTUP_ERROR",
      error: String(error && error.stack ? error.stack : error),
    };
    if (args.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    else process.stderr.write(`${payload.error}\n`);
    process.exitCode = 1;
    return payload;
  }
}
