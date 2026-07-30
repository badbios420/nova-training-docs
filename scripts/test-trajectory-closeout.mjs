#!/usr/bin/env node
/**
 * Unit tests for trajectory-closeout-lib (offline).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  normalizeOutcome,
  validateFields,
  formatEntry,
  planAppend,
  planScorecardTouch,
  listRecentEntries,
  countEntryLines,
  exceedsLineCap,
  ensureHeader,
  singleLine,
  writeFileAtomic,
  readMaybe,
} from "./lib/trajectory-closeout-lib.mjs";

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS  ${name}`);
}

console.log("trajectory-closeout unit tests\n");

test("normalizeOutcome accepts win|partial|fail and bold variants", () => {
  assert.equal(normalizeOutcome("win"), "win");
  assert.equal(normalizeOutcome("PARTIAL"), "partial");
  assert.equal(normalizeOutcome("**fail**"), "fail");
  assert.equal(normalizeOutcome("win (config-level)"), "win");
  assert.equal(normalizeOutcome("nope"), null);
});

test("validateFields requires core keys + outcome enum", () => {
  const bad = validateFields({ title: "x" });
  assert.equal(bad.ok, false);
  const good = validateFields({
    title: "T",
    goal: "G",
    actions: "A",
    evidence: "E",
    outcome: "win",
    lesson: "L",
    followUp: "F",
    date: "2026-07-30",
  });
  assert.equal(good.ok, true);
  if (good.ok) assert.equal(good.value.outcome, "win");
});

test("formatEntry includes required bullets and outcome bold", () => {
  const entry = formatEntry({
    title: "Alpha night",
    goal: "Ship C5",
    actions: "lib + CLI",
    evidence: "tests exit 0",
    outcome: "win",
    lesson: "Close loops fresh",
    followUp: "C6 later",
    date: "2026-07-30",
  });
  assert.match(entry, /^### 2026-07-30 — Alpha night/m);
  assert.match(entry, /- Outcome: \*\*win\*\*/);
  assert.match(entry, /- Follow-up: C6 later/);
  assert.ok(countEntryLines(entry) <= 20);
  assert.equal(exceedsLineCap(entry), false);
});

test("singleLine collapses newlines", () => {
  assert.equal(singleLine("a\nb\n\nc"), "a · b · c");
});

test("ensureHeader injects when empty", () => {
  const h = ensureHeader("");
  assert.match(h, /# Trajectory Log/);
  assert.match(h, /Outcome: win \| partial \| fail/);
});

test("planAppend adds entry after existing content", () => {
  const existing = ensureHeader("") + "### 2026-07-28 — old\n- Goal: x\n\n";
  const entry = formatEntry({
    title: "new",
    goal: "g",
    actions: "a",
    evidence: "e",
    outcome: "partial",
    lesson: "l",
    date: "2026-07-30",
  });
  const next = planAppend(existing, entry);
  assert.ok(next.indexOf("### 2026-07-28 — old") < next.indexOf("### 2026-07-30 — new"));
  assert.match(next, /Outcome: \*\*partial\*\*/);
});

test("listRecentEntries returns newest first limited", () => {
  const text = `
### 2026-07-27 — A
### 2026-07-28 — B
### 2026-07-29 — C
`;
  const recent = listRecentEntries(text, 2);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].title, "C");
  assert.equal(recent[1].title, "B");
});

test("planScorecardTouch appends trajectory section", () => {
  const sc = planScorecardTouch("# Harness Scorecard\n\n", {
    date: "2026-07-30",
    title: "C5",
    outcome: "win",
    note: "CLI live",
  });
  assert.match(sc, /### 2026-07-30 — Trajectory closeout/);
  assert.match(sc, /\|\s*Outcome\s*\|\s*\*\*win\*\*/);
  assert.match(sc, /CLI live/);
});

test("writeFileAtomic + readMaybe roundtrip", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "traj-"));
  const f = path.join(dir, "t.md");
  writeFileAtomic(f, "hello\n");
  assert.equal(readMaybe(f), "hello\n");
  assert.equal(readMaybe(path.join(dir, "missing.md")), "");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("invalid outcome fails validation", () => {
  const r = validateFields({
    title: "t",
    goal: "g",
    actions: "a",
    evidence: "e",
    outcome: "success",
    lesson: "l",
  });
  assert.equal(r.ok, false);
});

console.log(`\n${passed} passed, 0 failed`);
process.exit(0);
