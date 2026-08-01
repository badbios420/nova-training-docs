#!/usr/bin/env node
/**
 * Unit tests for swv-dry-harness-lib (offline).
 * Run: node scripts/test-swv-dry-harness.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROLES,
  REQUIRED_TEMPLATE_VARS,
  validateTask,
  buildVars,
  renderTemplate,
  findLeftoverVars,
  findLeftoverRequiredVars,
  formatBulletList,
  renderRole,
  renderAll,
  planInitRun,
  writeInitRun,
  defaultRunId,
  loadTaskFile,
} from "./lib/swv-dry-harness-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const SAMPLE = path.join(WORKSPACE, "memory/evals/swv/fixtures/sample-task.json");
const TEMPLATES = path.join(WORKSPACE, "memory/evals/swv/templates");

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

console.log("swv-dry-harness unit tests\n");

test("ROLES are scout/worker/verifier", () => {
  assert.deepEqual([...ROLES], ["scout", "worker", "verifier"]);
});

test("REQUIRED_TEMPLATE_VARS includes brief minimum set", () => {
  for (const v of [
    "TASK_ID",
    "OBJECTIVE",
    "SCOPE_PATHS",
    "OUT_OF_SCOPE",
    "EVIDENCE_REQUIRED",
    "ACCEPTANCE",
    "MODEL_HINT",
    "PARENT_REF",
  ]) {
    assert.ok(REQUIRED_TEMPLATE_VARS.includes(v), `missing ${v}`);
  }
});

test("validateTask accepts sample shape", () => {
  const raw = JSON.parse(fs.readFileSync(SAMPLE, "utf8"));
  const r = validateTask(raw);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.taskId, "SWV-DRY-001");
});

test("validateTask rejects missing fields", () => {
  const r = validateTask({ taskId: "x" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errors.length >= 3);
});

test("validateTask requires forbidden outs", () => {
  const raw = JSON.parse(fs.readFileSync(SAMPLE, "utf8"));
  raw.outOfScope = ["MEMORY.md rewrite"];
  const r = validateTask(raw);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.some((e) => e.includes("openclaw.json")));
  }
});

test("loadTaskFile loads sample", () => {
  const r = loadTaskFile(SAMPLE);
  assert.equal(r.ok, true);
});

test("buildVars fills MODEL_HINT per role", () => {
  const raw = JSON.parse(fs.readFileSync(SAMPLE, "utf8"));
  const t = validateTask(raw);
  assert.equal(t.ok, true);
  if (!t.ok) return;
  const scout = buildVars(t.value, "scout");
  assert.equal(scout.TASK_ID, "SWV-DRY-001");
  assert.equal(scout.MODEL_HINT, "deepseek/deepseek-v4-flash");
  assert.match(scout.SCOPE_PATHS, /claim-guard/);
  assert.match(scout.ACCEPTANCE, /^1\./m);
});

test("renderTemplate replaces known vars; leaves unknown", () => {
  const out = renderTemplate("A={{TASK_ID}} B={{UNKNOWN}}", { TASK_ID: "T1" });
  assert.equal(out, "A=T1 B={{UNKNOWN}}");
});

test("findLeftoverRequiredVars detects required leftovers", () => {
  const leftovers = findLeftoverRequiredVars("x {{OBJECTIVE}} y {{TITLE}}");
  assert.deepEqual(leftovers, ["OBJECTIVE"]);
  assert.deepEqual(findLeftoverVars("{{TITLE}} {{FOO}}"), ["TITLE", "FOO"]);
});

test("formatBulletList", () => {
  assert.equal(formatBulletList(["a", "b"]), "- a\n- b");
  assert.equal(formatBulletList([]), "- (none)");
});

test("renderRole sample scout has no leftover required vars", () => {
  const raw = JSON.parse(fs.readFileSync(SAMPLE, "utf8"));
  const t = validateTask(raw);
  assert.equal(t.ok, true);
  if (!t.ok) return;
  const out = renderRole(t.value, "scout", TEMPLATES);
  assert.equal(out.leftoverRequired.length, 0, `leftover: ${out.leftoverRequired}`);
  assert.match(out.text, /Role:\*\* Scout/i);
  assert.match(out.text, /SWV-DRY-001/);
  assert.match(out.text, /Does not/);
  assert.doesNotMatch(out.text, /\{\{TASK_ID\}\}/);
});

test("renderAll all roles + checklist clean", () => {
  const raw = JSON.parse(fs.readFileSync(SAMPLE, "utf8"));
  const t = validateTask(raw);
  assert.equal(t.ok, true);
  if (!t.ok) return;
  const all = renderAll(t.value, TEMPLATES);
  for (const role of ROLES) {
    assert.equal(
      all.roles[role].leftoverRequired.length,
      0,
      `${role}: ${all.roles[role].leftoverRequired}`,
    );
    assert.match(all.roles[role].text, /Role definition/i);
  }
  assert.equal(all.checklist.leftoverRequired.length, 0);
  assert.match(all.checklist.text, /Chair \(Nova\)/);
});

test("planInitRun + writeInitRun creates briefs and evidence stubs", () => {
  const raw = JSON.parse(fs.readFileSync(SAMPLE, "utf8"));
  const t = validateTask(raw);
  assert.equal(t.ok, true);
  if (!t.ok) return;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "swv-dry-"));
  const runDir = path.join(tmp, defaultRunId(t.value, "testrun"));
  const plan = planInitRun({ task: t.value, runDir, templateDir: TEMPLATES });
  assert.equal(plan.leftoverRequired.length, 0, String(plan.leftoverRequired));
  const written = writeInitRun(runDir, plan.files);
  assert.ok(written.length >= 8);
  for (const role of ROLES) {
    const brief = fs.readFileSync(path.join(runDir, `${role}-brief.md`), "utf8");
    assert.equal(findLeftoverRequiredVars(brief).length, 0);
    assert.ok(fs.existsSync(path.join(runDir, "evidence", `${role}.md`)));
  }
  assert.ok(fs.existsSync(path.join(runDir, "checklist.md")));
  assert.ok(fs.existsSync(path.join(runDir, "task.json")));
  // cleanup
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("role templates mention does/does-not table content", () => {
  for (const role of ROLES) {
    const text = fs.readFileSync(path.join(TEMPLATES, `${role}-brief.md`), "utf8");
    assert.match(text, /Does not/i);
    assert.match(text, /\{\{TASK_ID\}\}/);
    assert.match(text, /\{\{OBJECTIVE\}\}/);
    assert.match(text, /\{\{MODEL_HINT\}\}/);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
