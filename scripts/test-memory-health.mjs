#!/usr/bin/env node
/**
 * Unit tests for memory-health-lib (offline — no network / no openclaw required).
 * Run: node scripts/test-memory-health.mjs
 */

import {
  parseNodeVersion,
  meetsMinNodeVersion,
  classifySearchFailure,
  parseMemoryStatus,
  rollupOverall,
  discoverMemoryRemediationCommands,
  tagsIncludeEmbedModel,
  overallToExitCode,
  formatHumanReport,
  DB_NOT_OPEN_RE,
} from "./lib/memory-health-lib.mjs";

let passed = 0;
let failed = 0;

/**
 * @param {string} name
 * @param {() => void} fn
 */
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * @param {boolean} cond
 * @param {string} msg
 */
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log("memory-health unit tests\n");

test("parseNodeVersion handles v-prefix", () => {
  const v = parseNodeVersion("v24.18.0");
  assert(v !== null && v.major === 24 && v.minor === 18 && v.patch === 0, "parse failed");
});

test("meetsMinNodeVersion gate ≥24.15", () => {
  assert(meetsMinNodeVersion("v24.15.0") === true, "24.15 should pass");
  assert(meetsMinNodeVersion("v24.18.0") === true, "24.18 should pass");
  assert(meetsMinNodeVersion("v24.14.0") === false, "24.14 should fail");
  assert(meetsMinNodeVersion("v22.11.0") === false, "22 should fail");
  assert(meetsMinNodeVersion("bogus") === false, "bogus should fail");
});

test("classifySearchFailure detects database is not open", () => {
  const r = classifySearchFailure("Error: database is not open\n");
  assert(r.isDbNotOpen === true, "expected isDbNotOpen");
  assert(r.failReason === "database is not open", `got ${r.failReason}`);
  assert(DB_NOT_OPEN_RE.test("SQLITE: Database is not open"), "regex case");
});

test("classifySearchFailure detects timeout", () => {
  const r = classifySearchFailure("timeout after 60000ms");
  assert(r.isTimeout === true, "expected timeout");
  assert(r.failReason === "timeout", `got ${r.failReason}`);
});

test("parseMemoryStatus extracts Indexed/Dirty/Store/FTS/Provider", () => {
  const fixture = `Memory Search (main)
Provider: ollama (requested: ollama)
Model: nomic-embed-text
Indexed: 354/354 files · 2233 chunks
Dirty: no
Store: ~/.openclaw/agents/main/agent/openclaw-agent.sqlite
FTS: ready
`;
  const p = parseMemoryStatus(fixture);
  assert(p.indexed === 354, `indexed ${p.indexed}`);
  assert(p.indexedTotal === 354, `total ${p.indexedTotal}`);
  assert(p.chunks === 2233, `chunks ${p.chunks}`);
  assert(p.dirty === false, "dirty should be false");
  assert(p.fts === "ready", `fts ${p.fts}`);
  assert(String(p.provider).includes("ollama"), `provider ${p.provider}`);
  assert(String(p.store).includes("openclaw-agent.sqlite"), `store ${p.store}`);
  assert(p.model === "nomic-embed-text", `model ${p.model}`);
});

test("parseMemoryStatus dirty yes", () => {
  const p = parseMemoryStatus("Indexed: 0/10 files\nDirty: yes\n");
  assert(p.indexed === 0, "indexed 0");
  assert(p.dirty === true, "dirty true");
});

test("rollupOverall pass/degraded/fail", () => {
  assert(
    rollupOverall([
      { id: "a", status: "pass", summary: "ok" },
      { id: "b", status: "skip", summary: "skip" },
    ]) === "pass",
    "pass",
  );
  assert(
    rollupOverall([
      { id: "a", status: "pass", summary: "ok" },
      { id: "b", status: "warn", summary: "soft" },
    ]) === "degraded",
    "degraded",
  );
  assert(
    rollupOverall([
      { id: "a", status: "warn", summary: "soft" },
      { id: "b", status: "fail", summary: "hard" },
    ]) === "fail",
    "fail wins over warn",
  );
});

test("overallToExitCode mapping", () => {
  assert(overallToExitCode("pass") === 0, "pass→0");
  assert(overallToExitCode("fail") === 1, "fail→1");
  assert(overallToExitCode("degraded") === 3, "degraded→3");
});

test("discoverMemoryRemediationCommands from help fixture", () => {
  const help = `
Usage: openclaw memory [options] [command]
Commands:
  index            Reindex memory files
  search           Search memory files
  status           Show memory search index status
Examples:
  openclaw memory status --fix
  openclaw memory status --deep
  openclaw memory index --force
  openclaw memory search "meeting notes"
`;
  const cmds = discoverMemoryRemediationCommands(help);
  assert(cmds.some((c) => c.includes("memory index")), `missing index: ${cmds}`);
  assert(cmds.some((c) => c.includes("status --fix")), `missing fix: ${cmds}`);
  assert(cmds.some((c) => c.includes("index --force")), `missing force: ${cmds}`);
});

test("tagsIncludeEmbedModel matches :latest suffix", () => {
  assert(tagsIncludeEmbedModel(["nomic-embed-text:latest"], "nomic-embed-text") === true, "latest");
  assert(tagsIncludeEmbedModel(["gemma2:9b"], "nomic-embed-text") === false, "missing");
});

test("parseMemoryStatus ignores Recall store line", () => {
  const fixture = `Indexed: 10/10 files · 1 chunks
Dirty: no
Store: ~/.openclaw/agents/main/agent/openclaw-agent.sqlite
FTS: ready
Recall store: 380 entries · 52 promoted
`;
  const p = parseMemoryStatus(fixture);
  assert(
    p.store === "~/.openclaw/agents/main/agent/openclaw-agent.sqlite",
    `store wrongly parsed as ${p.store}`,
  );
});

test("formatHumanReport includes FAIL for db-not-open style check", () => {
  const text = formatHumanReport({
    overall: "fail",
    startedAt: "t0",
    finishedAt: "t1",
    env: {},
    checks: [
      {
        id: "memory_search_smoke",
        status: "fail",
        summary: 'memory search: "database is not open"',
        remediation: ["openclaw memory status"],
      },
    ],
  });
  assert(/FAIL/.test(text), "expected FAIL mark");
  assert(/database is not open/.test(text), "expected error string");
  assert(/Remediation/.test(text), "expected remediation block");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
