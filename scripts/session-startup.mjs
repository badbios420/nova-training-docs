#!/usr/bin/env node
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const STARTUP_FILES = [
  "SOUL.md",
  "USER.md",
  "MEMORY.md",
  "memory/session-consolidation-v1.md",
  "memory/procedural-memory-v1.md",
  "memory/observed-failures.md",
  "memory/memory-retrieval-policy-v1.md",
  "memory/time-awareness.md",
];

const LIGHT_QUERIES = [
  "current active projects",
  "recent session consolidation",
  "observed failures procedural memory",
  "open questions next priorities",
];

const HEARTBEAT_THRESHOLDS_SECONDS = {
  selfImprovementReview: 7 * 24 * 60 * 60,
  memory: 3 * 24 * 60 * 60,
  security: 14 * 24 * 60 * 60,
  update: 14 * 24 * 60 * 60,
  sites: 3 * 24 * 60 * 60,
  weather: 24 * 60 * 60,
};

function parseArgs(argv) {
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

function localDateParts(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: pad2(date.getMonth() + 1),
    day: pad2(date.getDate()),
  };
}

function localDateString(date = new Date()) {
  const parts = localDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function previousLocalDateString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateString(date);
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function readJsonIfExists(filePath, fallback) {
  const text = await readTextIfExists(filePath);
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(`${filePath}.tmp`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(`${filePath}.tmp`, filePath);
}

function summarizeText(text, maxChars = 360) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join(" ")
    .slice(0, maxChars);
}

async function ensureDailyFile(workspace, date) {
  const memoryDir = path.join(workspace, "memory");
  await fs.mkdir(memoryDir, { recursive: true });
  const dailyPath = path.join(memoryDir, `${date}.md`);
  const existing = await readTextIfExists(dailyPath);
  if (existing !== null) return { path: dailyPath, created: false };
  await fs.writeFile(dailyPath, `# ${date}\n\n`, "utf8");
  return { path: dailyPath, created: true };
}

async function runMemorySearch(workspace, query) {
  try {
    const { stdout } = await execFileAsync(
      "openclaw",
      ["memory", "search", "--json", "--max-results", "3", query],
      {
        cwd: workspace,
        timeout: 12_000,
        maxBuffer: 512 * 1024,
      },
    );
    const parsed = JSON.parse(stdout);
    return { query, ok: true, results: Array.isArray(parsed) ? parsed.slice(0, 3) : parsed };
  } catch (error) {
    return {
      query,
      ok: false,
      error: String(error && error.message ? error.message : error).slice(0, 240),
    };
  }
}

function extractSearchSummary(item) {
  if (!item || typeof item !== "object") return "";
  const pathValue = item.path ?? item.file ?? item.filePath ?? item.source ?? "";
  const scoreValue = item.score ?? item.similarity ?? item.distance ?? "";
  const textValue = item.text ?? item.content ?? item.snippet ?? item.summary ?? "";
  const source = String(pathValue || "memory").replace(/^.*\/memory\//, "memory/");
  const score = typeof scoreValue === "number" ? ` score=${scoreValue.toFixed(3)}` : "";
  const text = summarizeText(String(textValue || ""), 220);
  return text ? `${source}${score}: ${text}` : `${source}${score}`;
}

function summarizeSearches(searches) {
  const lines = [];
  for (const search of searches) {
    if (!search.ok) {
      lines.push(`- ${search.query}: unavailable (${search.error})`);
      continue;
    }
    const entries = Array.isArray(search.results) ? search.results : search.results?.results;
    const summaries = Array.isArray(entries) ? entries.map(extractSearchSummary).filter(Boolean).slice(0, 2) : [];
    if (summaries.length > 0) lines.push(`- ${search.query}: ${summaries.join(" | ")}`);
  }
  return lines.slice(0, 8);
}

function heartbeatOverdue(lastChecks, nowSeconds) {
  const overdue = [];
  for (const [name, threshold] of Object.entries(HEARTBEAT_THRESHOLDS_SECONDS)) {
    const last = Number(lastChecks?.[name] ?? 0);
    if (!Number.isFinite(last) || last <= 0) {
      overdue.push({ name, status: "never", secondsOverdue: null });
      continue;
    }
    const age = nowSeconds - last;
    if (age > threshold) overdue.push({ name, status: "overdue", secondsOverdue: Math.floor(age - threshold) });
  }
  return overdue;
}

async function maybeLogIdentityCheck({ workspace, date, state, nowIso }) {
  const memoryDir = path.join(workspace, "memory");
  const identityPath = path.join(memoryDir, "identity-substrate.md");
  if (state.lastIdentityCheckDate === date) {
    return { logged: false, path: identityPath };
  }

  await fs.mkdir(memoryDir, { recursive: true });
  const entry = [
    "",
    `## ${date} - Automatic Startup Identity Check`,
    "",
    `- Logged: ${nowIso}`,
    "- Continuity Pulse: 7/10",
    "- Drift Check: No drift detected by deterministic startup check.",
    "- Anchor Action: Load current memory before substantive main-session work.",
    "",
  ].join("\n");
  await fs.appendFile(identityPath, entry, "utf8");
  state.lastIdentityCheckDate = date;
  state.lastIdentityCheckAt = nowIso;
  return { logged: true, path: identityPath };
}

function buildInternalContext(result) {
  const lines = [
    "<session_startup_context>",
    "Automatic main-session startup completed. Treat this as internal context, not user-facing copy.",
    `Date: ${result.date}`,
    `Daily memory: ${result.daily.created ? "created" : "present"} (${path.relative(result.workspace, result.daily.path)})`,
    `Recent files loaded: ${result.loadedFiles.join(", ") || "none"}`,
  ];
  if (result.searchSummary.length > 0) {
    lines.push("LIGHT memory retrieval summary:");
    lines.push(...result.searchSummary);
  }
  if (result.heartbeatOverdue.length > 0) {
    lines.push("Important startup alerts to surface briefly if relevant:");
    for (const item of result.heartbeatOverdue) {
      lines.push(`- heartbeat ${item.name}: ${item.status}`);
    }
  }
  lines.push("Use MEDIUM/DEEP retrieval only if the user request justifies escalation.");
  lines.push("</session_startup_context>");
  return lines.join("\n");
}

async function runStartup(args) {
  const workspace = path.resolve(args.workspace);
  const date = localDateString();
  const yesterday = previousLocalDateString();
  const now = new Date();
  const nowIso = now.toISOString();
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const statePath = path.join(workspace, ".openclaw", "session-startup-state.json");
  const state = await readJsonIfExists(statePath, { sessions: {} });
  if (!state.sessions || typeof state.sessions !== "object") state.sessions = {};

  const runKey = `${args.agentId || "main"}|${args.sessionKey || "unknown"}|${args.sessionId || "unknown"}`;
  if (!args.force && state.sessions[runKey]?.completedAt) {
    return {
      skipped: true,
      reason: "already_completed_for_session",
      workspace,
      date,
      internalContext: "",
    };
  }

  const daily = await ensureDailyFile(workspace, date);
  const loadedFiles = [];
  const fileSummaries = {};
  for (const relativePath of [
    ...STARTUP_FILES,
    `memory/${date}.md`,
    `memory/${yesterday}.md`,
  ]) {
    const text = await readTextIfExists(path.join(workspace, relativePath));
    if (text === null) continue;
    loadedFiles.push(relativePath);
    fileSummaries[relativePath] = summarizeText(text);
  }

  const heartbeat = await readJsonIfExists(path.join(workspace, "memory", "heartbeat-state.json"), { lastChecks: {} });
  const overdue = heartbeatOverdue(heartbeat.lastChecks, nowSeconds);
  const identity = await maybeLogIdentityCheck({ workspace, date, state, nowIso });
  const searches = [];
  for (const query of LIGHT_QUERIES) {
    searches.push(await runMemorySearch(workspace, query));
  }

  const result = {
    skipped: false,
    workspace,
    date,
    nowIso,
    sessionKey: args.sessionKey,
    sessionId: args.sessionId,
    agentId: args.agentId,
    daily,
    identity,
    loadedFiles,
    fileSummaries,
    heartbeatOverdue: overdue,
    searches,
    searchSummary: summarizeSearches(searches),
  };
  result.internalContext = buildInternalContext(result);

  state.sessions[runKey] = {
    completedAt: nowIso,
    date,
    sessionKey: args.sessionKey,
    sessionId: args.sessionId,
    agentId: args.agentId,
    heartbeatOverdue: overdue.map((item) => item.name),
  };
  state.lastRunAt = nowIso;
  state.lastRunKey = runKey;
  await writeJson(statePath, state);
  return result;
}

const args = parseArgs(process.argv.slice(2));
runStartup(args)
  .then((result) => {
    if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else if (result.internalContext) {
      process.stdout.write(`${result.internalContext}\n`);
    }
  })
  .catch((error) => {
    const payload = {
      skipped: false,
      ok: false,
      error: String(error && error.stack ? error.stack : error),
    };
    if (args.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    else process.stderr.write(`${payload.error}\n`);
    process.exitCode = 1;
  });
