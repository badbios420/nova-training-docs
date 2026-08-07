#!/usr/bin/env node
/**
 * Fixture-based session-startup tests (no live gateway, no real memory mutation).
 * Run: node scripts/test-session-startup.mjs
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  runStartup,
  parseArgs,
  assessWorldStateFreshness,
  sourceUsesPythonHeredoc,
  maybeLogIdentityCheck,
  buildInternalContext,
  WORLD_STATE_STALE_SECONDS,
  LIGHT_QUERIES,
  LIGHT_SEARCH_CONCURRENCY,
  LIGHT_SEARCH_TIMEOUT_MS,
  main,
} from "./lib/session-startup-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function test(name, fn) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      passed += 1;
      console.log(`  PASS  ${name}`);
    })
    .catch((err) => {
      failed += 1;
      console.error(`  FAIL  ${name}`);
      console.error(`        ${err instanceof Error ? err.message : err}`);
    });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function makeFixtureWorkspace(opts = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "nova-startup-"));
  const write = async (rel, body) => {
    const p = path.join(dir, rel);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, body, "utf8");
  };

  if (opts.withSoul !== false) await write("SOUL.md", "# Soul\nGuardian.\n");
  if (opts.withUser !== false) await write("USER.md", "# User\nJason\n");
  if (opts.withMemory !== false) await write("MEMORY.md", "# Memory\nDurable.\n");
  await write("memory/procedural-memory-v1.md", "# Proc\n");
  await write("memory/observed-failures.md", "# Failures\n");
  await write("memory/session-consolidation-v1.md", "# Consol\n");
  await write("memory/memory-retrieval-policy-v1.md", "# Policy\n");
  await write("memory/time-awareness.md", "# Time\n");
  await write("memory/heartbeat-state.json", JSON.stringify({ lastChecks: { memory: Math.floor(Date.now() / 1000) } }));

  const wsAgeMs = opts.worldStateAgeMs ?? 3600_000; // 1h default fresh
  if (opts.withWorldState !== false) {
    await write("WORLD_STATE.md", "# WORLD_STATE\nNOW\n");
    const wsPath = path.join(dir, "WORLD_STATE.md");
    const past = new Date(Date.now() - wsAgeMs);
    await fs.utimes(wsPath, past, past);
  }

  return dir;
}

function mockSearchOk() {
  return async () => ({
    stdout: JSON.stringify([{ path: "memory/2026-08-01.md", score: 0.9, text: "ops ok" }]),
  });
}

function mockSearchFail() {
  return async () => {
    throw new Error("database is not open");
  };
}

function mockSearchBoom() {
  return async () => {
    throw new Error("EACCES denied");
  };
}

console.log("session-startup fixture tests\n");

await test("parseArgs workspace and flags", () => {
  const a = parseArgs(["--workspace", "/tmp/x", "--session-key", "k", "--force", "--json"]);
  assert(a.workspace === "/tmp/x", "workspace");
  assert(a.sessionKey === "k", "key");
  assert(a.force === true, "force");
  assert(a.json === true, "json");
});

await test("assessWorldStateFreshness fresh vs stale", () => {
  const now = Date.now();
  const fresh = assessWorldStateFreshness(now - 1000, now);
  assert(fresh.stale === false, "fresh");
  const stale = assessWorldStateFreshness(now - (WORLD_STATE_STALE_SECONDS + 10) * 1000, now);
  assert(stale.stale === true && stale.warning, "stale warning");
  const missing = assessWorldStateFreshness(null, now);
  assert(missing.stale === true, "missing");
});

await test("sourceUsesPythonHeredoc detector", () => {
  assert(sourceUsesPythonHeredoc("python3 <<'PY'\nprint(1)\nPY") === true, "detect heredoc");
  assert(sourceUsesPythonHeredoc("await fs.readFile(x)") === false, "clean");
});

await test("no Python heredoc in session-startup sources", async () => {
  const lib = await fs.readFile(path.join(ROOT, "scripts/lib/session-startup-lib.mjs"), "utf8");
  const cli = await fs.readFile(path.join(ROOT, "scripts/session-startup.mjs"), "utf8");
  assert(!sourceUsesPythonHeredoc(lib), "lib clean");
  assert(!sourceUsesPythonHeredoc(cli), "cli clean");
  assert(!/python3?\s+<</i.test(lib + cli), "no python redirect");
});

await test("successful startup", async () => {
  const ws = await makeFixtureWorkspace();
  try {
    const result = await runStartup(
      {
        workspace: ws,
        sessionKey: "s1",
        sessionId: "id1",
        agentId: "main",
        force: false,
        json: true,
      },
      { execFileAsync: mockSearchOk() },
    );
    assert(result.ok === true, "ok");
    assert(result.completionMarker === "STARTUP_OK", "marker");
    assert(result.skipped === false, "not skipped");
    assert(result.loadedFiles.includes("SOUL.md"), "soul loaded");
    assert(result.daily?.path, "daily");
    assert(result.internalContext.includes("Completion: OK"), "context");
    assert(result.searchAttempts === LIGHT_QUERIES.length, "search count");
    assert(result.lightSearchConcurrency === LIGHT_SEARCH_CONCURRENCY, "concurrency 2");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("missing continuity file (critical SOUL) → fail + nonzero semantics", async () => {
  const ws = await makeFixtureWorkspace({ withSoul: false });
  try {
    const result = await runStartup(
      {
        workspace: ws,
        sessionKey: "s-miss",
        sessionId: "id-miss",
        agentId: "main",
        force: false,
        json: true,
      },
      { execFileAsync: mockSearchOk() },
    );
    assert(result.ok === false, "ok false");
    assert(result.completionMarker === "STARTUP_FAILED", "failed marker");
    assert(result.missingFiles.includes("SOUL.md"), "missing soul");
    assert(result.internalContext.includes("FAILED"), "context failed");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("stale WORLD_STATE warning", async () => {
  const ws = await makeFixtureWorkspace({
    worldStateAgeMs: (WORLD_STATE_STALE_SECONDS + 100) * 1000,
  });
  try {
    const result = await runStartup(
      {
        workspace: ws,
        sessionKey: "s-stale",
        sessionId: "id-stale",
        agentId: "main",
        force: false,
        json: true,
      },
      { execFileAsync: mockSearchOk() },
    );
    assert(result.ok === true, "still ok without critical miss");
    assert(result.worldState.stale === true, "stale flag");
    assert(/stale/i.test(result.worldState.warning || ""), "warning text");
    assert(result.internalContext.includes("WORLD_STATE"), "context mentions WS");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("memory-search unavailable fallback", async () => {
  const ws = await makeFixtureWorkspace();
  try {
    const result = await runStartup(
      {
        workspace: ws,
        sessionKey: "s-search",
        sessionId: "id-search",
        agentId: "main",
        force: false,
        json: true,
      },
      { execFileAsync: mockSearchFail() },
    );
    assert(result.ok === true, "startup still ok");
    assert(result.searches.every((s) => s.ok === false), "searches failed");
    assert(result.searchSummary.some((l) => /unavailable/.test(l)), "unavailable lines");
    assert(result.retrievalDegraded === true, "retrievalDegraded flag");
    assert(
      result.internalContext.startsWith("STARTUP_RETRIEVAL_DEGRADED"),
      "degraded first-line marker",
    );
    const dailyText = await fs.readFile(result.daily.path, "utf8");
    assert(dailyText.includes("STARTUP_RETRIEVAL_DEGRADED"), "daily note appended");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("happy path retrieval not degraded", async () => {
  const ws = await makeFixtureWorkspace();
  try {
    const result = await runStartup(
      {
        workspace: ws,
        sessionKey: "s-happy-ret",
        sessionId: "id-happy-ret",
        agentId: "main",
        force: false,
        json: true,
      },
      { execFileAsync: mockSearchOk() },
    );
    assert(result.ok === true, "ok");
    assert(result.retrievalDegraded !== true, "not degraded");
    assert(!result.internalContext.startsWith("STARTUP_RETRIEVAL_DEGRADED"), "no degraded marker");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("maybeLogIdentityCheck append updates lastIdentityCheckAt", async () => {
  const ws = await makeFixtureWorkspace();
  try {
    const state = {};
    const nowIso = "2026-08-06T18:00:00.000Z";
    const r = await maybeLogIdentityCheck({
      workspace: ws,
      date: "2026-08-06",
      state,
      nowIso,
    });
    assert(r.logged === true, "appended");
    assert(r.reason === "appended", "reason");
    assert(state.lastIdentityCheckAt === nowIso, `At want ${nowIso} got ${state.lastIdentityCheckAt}`);
    assert(state.lastIdentityCheckDate === "2026-08-06", "date");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("maybeLogIdentityCheck file_already_has_today_entry refreshes At", async () => {
  const ws = await makeFixtureWorkspace();
  try {
    const date = "2026-08-06";
    const heading = `## ${date} - Automatic Startup Identity Check`;
    const identityPath = path.join(ws, "memory", "identity-substrate.md");
    await fs.mkdir(path.dirname(identityPath), { recursive: true });
    await fs.writeFile(identityPath, `${heading}\n- Logged: stale\n`, "utf8");
    const state = {
      lastIdentityCheckDate: "2026-08-05",
      lastIdentityCheckAt: "2026-08-01T07:08:24.433Z",
    };
    const nowIso = "2026-08-06T19:30:00.000Z";
    const r = await maybeLogIdentityCheck({
      workspace: ws,
      date,
      state,
      nowIso,
    });
    assert(r.logged === false, "not logged again");
    assert(r.reason === "file_already_has_today_entry", "reason");
    assert(
      state.lastIdentityCheckAt === nowIso,
      `At must refresh to ${nowIso}, got ${state.lastIdentityCheckAt}`,
    );
    assert(state.lastIdentityCheckDate === date, "date synced");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("buildInternalContext degraded marker is first line", () => {
  const ctx = buildInternalContext({
    date: "2026-08-06",
    ok: true,
    retrievalDegraded: true,
    daily: { created: false, path: "/tmp/memory/2026-08-06.md" },
    loadedFiles: ["SOUL.md"],
    searchSummary: ["- q: unavailable (boom)"],
  });
  assert(ctx.startsWith("STARTUP_RETRIEVAL_DEGRADED\n"), "first line warning");
  const happy = buildInternalContext({
    date: "2026-08-06",
    ok: true,
    retrievalDegraded: false,
    daily: { created: false, path: "/tmp/x.md" },
    loadedFiles: [],
  });
  assert(!happy.includes("STARTUP_RETRIEVAL_DEGRADED"), "happy path clean");
});

await test("startup command failure (thrown) → main exitCode 1", async () => {
  const ws = await makeFixtureWorkspace();
  const prev = process.exitCode;
  process.exitCode = 0;
  try {
    const boomFs = {
      ...fs,
      readFile: async () => {
        throw new Error("disk exploded");
      },
      mkdir: fs.mkdir.bind(fs),
      writeFile: fs.writeFile.bind(fs),
      rename: fs.rename.bind(fs),
      appendFile: fs.appendFile.bind(fs),
      stat: fs.stat.bind(fs),
    };
    // Force throw early via broken workspace path that isn't ENOENT on resolve...
    // Use deps.fs that fails on mkdir for state
    const badFs = {
      mkdir: async () => {
        throw new Error("EIO mkdir");
      },
      readFile: async (p, e) => fs.readFile(p, e),
      writeFile: fs.writeFile.bind(fs),
      rename: fs.rename.bind(fs),
      appendFile: fs.appendFile.bind(fs),
      stat: fs.stat.bind(fs),
    };
    const result = await main(
      ["--workspace", ws, "--session-key", "boom", "--session-id", "b1", "--json"],
      { fs: badFs, execFileAsync: mockSearchOk() },
    );
    assert(result.ok === false, "ok false");
    assert(process.exitCode === 1, `exitCode want 1 got ${process.exitCode}`);
  } finally {
    process.exitCode = prev;
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("no repeated retry loop — second run skips", async () => {
  const ws = await makeFixtureWorkspace();
  let searchCalls = 0;
  const countingSearch = async () => {
    searchCalls += 1;
    return {
      stdout: JSON.stringify([{ path: "memory/x.md", score: 0.5, text: "hi" }]),
    };
  };
  try {
    const args = {
      workspace: ws,
      sessionKey: "s-once",
      sessionId: "id-once",
      agentId: "main",
      force: false,
      json: true,
    };
    const r1 = await runStartup(args, { execFileAsync: countingSearch });
    assert(r1.ok === true && r1.skipped === false, "first run");
    const callsAfterFirst = searchCalls;
    assert(callsAfterFirst === LIGHT_QUERIES.length, "first searches");
    const r2 = await runStartup(args, { execFileAsync: countingSearch });
    assert(r2.skipped === true, "second skipped");
    assert(r2.completionMarker === "SKIPPED_ALREADY_COMPLETED", "skip marker");
    assert(searchCalls === callsAfterFirst, "no extra search retries");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("clean completion marker STARTUP_OK", async () => {
  const ws = await makeFixtureWorkspace();
  try {
    const result = await runStartup(
      {
        workspace: ws,
        sessionKey: "s-mark",
        sessionId: "id-mark",
        agentId: "main",
        force: false,
        json: true,
      },
      { execFileAsync: mockSearchOk() },
    );
    assert(result.completionMarker === "STARTUP_OK", "marker");
    const stateRaw = await fs.readFile(
      path.join(ws, ".openclaw/session-startup-state.json"),
      "utf8",
    );
    assert(stateRaw.includes("STARTUP_OK") || stateRaw.includes("completedAt"), "state stamped");
  } finally {
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("critical missing → main sets exitCode 1", async () => {
  const ws = await makeFixtureWorkspace({ withUser: false });
  const prev = process.exitCode;
  process.exitCode = 0;
  try {
    const result = await main(
      ["--workspace", ws, "--session-key", "nf", "--session-id", "nf1", "--json"],
      { execFileAsync: mockSearchOk() },
    );
    assert(result.ok === false, "failed");
    assert(process.exitCode === 1, "exit 1");
  } finally {
    process.exitCode = prev;
    await fs.rm(ws, { recursive: true, force: true });
  }
});

await test("LIGHT concurrency is 2 (not serial 4-storm)", () => {
  assert(LIGHT_SEARCH_CONCURRENCY === 2, "concurrency pinned to 2");
  assert(LIGHT_QUERIES.length === 2, "two light queries");
  assert(LIGHT_SEARCH_TIMEOUT_MS === 20_000, "LIGHT search timeout 20s");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
