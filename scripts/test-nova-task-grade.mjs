#!/usr/bin/env node
/**
 * Unit tests for nova-task-grade-lib (no network).
 * Run: node scripts/test-nova-task-grade.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  runGrader,
  gradeTask,
  rollup,
  loadSuite,
  formatReport,
  getJsonPath,
} from "./lib/nova-task-grade-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");

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

function makeTmpRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nova-task-grade-"));
  fs.writeFileSync(
    path.join(root, "hit.txt"),
    "Vista city license CLOSED — NOT REQUIRED\neBay Lagging cash bridge escalate\n",
    "utf8",
  );
  fs.writeFileSync(path.join(root, "miss.txt"), "nothing relevant here\n", "utf8");
  fs.writeFileSync(
    path.join(root, "data.json"),
    JSON.stringify({ status: { fire: "open", age: 7 } }),
    "utf8",
  );
  return root;
}

console.log("nova-task-grade unit tests\n");

const root = makeTmpRoot();

test("file_contains pass", () => {
  const r = runGrader(
    {
      type: "file_contains",
      params: { file: "hit.txt", needles: ["CLOSED", "NOT REQUIRED"], mode: "all" },
    },
    root,
  );
  assert(r.passed === true, `expected pass got ${r.detail}`);
});

test("file_contains fail", () => {
  const r = runGrader(
    {
      type: "file_contains",
      params: { file: "miss.txt", needles: ["CLOSED"], mode: "all" },
    },
    root,
  );
  assert(r.passed === false, "expected fail");
});

test("regex_in_file pass", () => {
  const r = runGrader(
    {
      type: "regex_in_file",
      params: { file: "hit.txt", pattern: "eBay[\\s\\S]{0,40}Lagging", flags: "im" },
    },
    root,
  );
  assert(r.passed === true, r.detail);
});

test("regex_in_file fail", () => {
  const r = runGrader(
    {
      type: "regex_in_file",
      params: { file: "miss.txt", pattern: "eBay.*Lagging", flags: "im" },
    },
    root,
  );
  assert(r.passed === false, "expected regex fail");
});

test("composite all requires every child", () => {
  const r = runGrader(
    {
      type: "composite",
      params: {
        mode: "all",
        graders: [
          { type: "file_contains", params: { file: "hit.txt", needles: ["Vista"] } },
          { type: "file_contains", params: { file: "miss.txt", needles: ["Vista"] } },
        ],
      },
    },
    root,
  );
  assert(r.passed === false, "composite all should fail");
  assert(r.score < 1, "score should be fractional or 0");
});

test("composite any passes on one child", () => {
  const r = runGrader(
    {
      type: "composite",
      params: {
        mode: "any",
        graders: [
          { type: "file_contains", params: { file: "miss.txt", needles: ["Vista"] } },
          { type: "file_contains", params: { file: "hit.txt", needles: ["Vista"] } },
        ],
      },
    },
    root,
  );
  assert(r.passed === true, r.detail);
});

test("json_path equals", () => {
  assert(getJsonPath({ a: { b: 1 } }, "a.b") === 1, "getJsonPath");
  const r = runGrader(
    {
      type: "json_path",
      params: { file: "data.json", path: "status.age", equals: 7 },
    },
    root,
  );
  assert(r.passed === true, r.detail);
});

test("file_exists + file_max_bytes", () => {
  const ok = runGrader({ type: "file_exists", params: { file: "hit.txt" } }, root);
  assert(ok.passed, ok.detail);
  const size = runGrader(
    { type: "file_max_bytes", params: { file: "hit.txt", maxBytes: 10_000 } },
    root,
  );
  assert(size.passed, size.detail);
  const tooSmall = runGrader(
    { type: "file_max_bytes", params: { file: "hit.txt", maxBytes: 1 } },
    root,
  );
  assert(!tooSmall.passed, "should exceed maxBytes=1");
});

test("gradeTask threshold partial vs pass", () => {
  const partial = gradeTask(
    {
      id: "X01",
      name: "partial",
      category: "ops_status",
      passThreshold: 1.0,
      graders: [
        { type: "file_contains", weight: 1, params: { file: "hit.txt", needles: ["Vista"] } },
        { type: "file_contains", weight: 1, params: { file: "miss.txt", needles: ["Vista"] } },
      ],
    },
    root,
  );
  assert(partial.status === "partial", `want partial got ${partial.status}`);
  assert(Math.abs(partial.score - 0.5) < 1e-9, `score ${partial.score}`);

  const passHalf = gradeTask(
    {
      id: "X02",
      name: "half-ok",
      category: "ops_status",
      passThreshold: 0.5,
      graders: [
        { type: "file_contains", weight: 1, params: { file: "hit.txt", needles: ["Vista"] } },
        { type: "file_contains", weight: 1, params: { file: "miss.txt", needles: ["Vista"] } },
      ],
    },
    root,
  );
  assert(passHalf.status === "pass", `want pass got ${passHalf.status}`);
});

test("rollup math", () => {
  const summary = rollup([
    { id: "A", status: "pass", category: "ops_status", score: 1, passThreshold: 1, graders: [], name: "a" },
    { id: "B", status: "fail", category: "ops_status", score: 0, passThreshold: 1, graders: [], name: "b" },
    { id: "C", status: "partial", category: "continuity", score: 0.5, passThreshold: 1, graders: [], name: "c" },
    { id: "D", status: "pass", category: "continuity", score: 1, passThreshold: 1, graders: [], name: "d" },
  ]);
  assert(summary.total === 4, "total");
  assert(summary.passed === 2, "passed");
  assert(summary.failed === 1, "failed");
  assert(summary.partial === 1, "partial");
  assert(Math.abs(summary.passRate - 0.5) < 1e-9, "passRate");
  assert(summary.byCategory.ops_status.passed === 1, "ops pass");
  assert(summary.byCategory.ops_status.total === 2, "ops total");
  assert(summary.byCategory.continuity.passed === 1, "cont pass");
});

test("loadSuite live json + formatReport smoke", () => {
  const suitePath = path.join(WORKSPACE, "memory", "evals", "nova-task-suite-v0.json");
  const suite = loadSuite(suitePath);
  assert(suite.version === "v0", "version");
  assert(suite.tasks.length === 10, `want 10 tasks got ${suite.tasks.length}`);
  assert(suite.tasks[0].id === "T01", "T01 first");
  const grades = suite.tasks.slice(0, 1).map((t) =>
    gradeTask(t, path.join(WORKSPACE, "memory", "evals", "fixtures", "v0-smoke")),
  );
  const md = formatReport({
    suiteVersion: suite.version,
    suitePath,
    workspaceRoot: "fixture",
    generatedAt: "test",
    tasks: grades,
    summary: rollup(grades),
  });
  assert(md.includes("Nova Task Suite Report"), "report header");
  assert(md.includes("T01"), "report task");
});

// cleanup tmp
try {
  fs.rmSync(root, { recursive: true, force: true });
} catch {
  /* ignore */
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
