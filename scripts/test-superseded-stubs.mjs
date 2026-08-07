#!/usr/bin/env node
/**
 * Coverage: superseded stub hygiene (priority-dashboard + Procedure 3).
 * Offline only. Run: node scripts/test-superseded-stubs.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

/**
 * @param {string} rel
 * @returns {string}
 */
function readRequired(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    throw new Error(`MISSING required file: ${rel}`);
  }
  return fs.readFileSync(p, "utf8");
}

/**
 * Extract Procedure 3 body: from `## 3.` through (not including) next `## 4.`.
 * @param {string} text
 * @returns {string}
 */
function extractProc3(text) {
  const start = text.search(/^## 3\./m);
  assert(start >= 0, "procedural-memory-v1.md: missing ## 3. heading");
  const rest = text.slice(start);
  const next = rest.search(/^## 4\./m);
  assert(next > 0, "procedural-memory-v1.md: missing ## 4. after Procedure 3");
  return rest.slice(0, next);
}

/**
 * Live task-inventory rows: `| <number> | **...** |` (priority tables).
 * Canonical mapping tables (Need | Canonical) do not match this shape.
 * @param {string} text
 * @returns {string[]}
 */
function findLiveTaskTableRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (/^\|\s*\d+\s*\|\s*\*\*/.test(line)) rows.push(line);
  }
  return rows;
}

/**
 * Heuristic: multi-row URGENT/IMPORTANT task grid returning to life.
 * A stub may mention those words historically; fail only if several
 * pipe-table body rows also carry those priority labels.
 * @param {string} text
 * @returns {boolean}
 */
function hasLiveUrgentImportantGrid(text) {
  const bodyRows = text
    .split(/\r?\n/)
    .filter((l) => /^\|/.test(l) && !/^\|\s*-+/.test(l) && !/^\|\s*Need\s*\|/i.test(l));
  const labeled = bodyRows.filter((l) => /\bURGENT\b|\bIMPORTANT\b/i.test(l));
  return labeled.length >= 2;
}

/**
 * Active commit/push checklist instructions (not "do not" / gated / superseded).
 * @param {string} section
 * @returns {string[]}
 */
function findActiveCommitPushChecklist(section) {
  const hits = [];
  for (const line of section.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const lower = t.toLowerCase();
    // Allow explicit non-checklist / gate language
    if (
      /\bdo not\b/.test(lower) ||
      /\bdon't\b/.test(lower) ||
      /\bgated\b/.test(lower) ||
      /\bsuperseded\b/.test(lower) ||
      /\bunless jason\b/.test(lower) ||
      /\bnot\b.*\b(active|checklist)\b/.test(lower) ||
      /\bstop\b/.test(lower)
    ) {
      continue;
    }
    if (
      /^[-*]\s*commit with clear message\b/i.test(t) ||
      /^\d+\.\s*commit with clear message\b/i.test(t) ||
      /^commit with clear message\b/i.test(t) ||
      /^[-*]\s*verify push succeeded\b/i.test(t) ||
      /^\d+\.\s*verify push succeeded\b/i.test(t) ||
      /^verify push succeeded\b/i.test(t)
    ) {
      hits.push(t);
    }
  }
  return hits;
}

console.log("superseded-stubs coverage tests\n");

test("A1: priority-dashboard.md exists and contains SUPERSEDED", () => {
  const text = readRequired("memory/priority-dashboard.md");
  assert(/\bSUPERSEDED\b/i.test(text), "priority-dashboard.md must contain SUPERSEDED");
});

test("A2: priority-dashboard.md names WORLD_STATE.md as canonical live source", () => {
  const text = readRequired("memory/priority-dashboard.md");
  assert(
    /WORLD_STATE\.md/i.test(text),
    "priority-dashboard.md must mention WORLD_STATE.md",
  );
  assert(
    /canonical/i.test(text) || /live source/i.test(text) || /ops now/i.test(text),
    "priority-dashboard.md must frame WORLD_STATE as canonical/live",
  );
});

test("A3: priority-dashboard.md has no live numbered task-inventory rows", () => {
  const text = readRequired("memory/priority-dashboard.md");
  const rows = findLiveTaskTableRows(text);
  assert(
    rows.length === 0,
    `live task-inventory rows found:\n${rows.join("\n")}`,
  );
  assert(
    !hasLiveUrgentImportantGrid(text),
    "URGENT/IMPORTANT multi-row task grid appears live",
  );
});

test("B1: Procedure 3 section is SUPERSEDED stub", () => {
  const text = readRequired("memory/procedural-memory-v1.md");
  const proc3 = extractProc3(text);
  assert(
    /\bSUPERSEDED\b/i.test(proc3) ||
      /\bstub\b/i.test(proc3) ||
      /\bno longer (active|authoritative)\b/i.test(proc3),
    "Procedure 3 must contain SUPERSEDED (or equivalent stub status)",
  );
});

test("B2: Procedure 3 has no active commit/push checklist", () => {
  const text = readRequired("memory/procedural-memory-v1.md");
  const proc3 = extractProc3(text);
  const hits = findActiveCommitPushChecklist(proc3);
  assert(
    hits.length === 0,
    `active commit/push checklist lines:\n${hits.join("\n")}`,
  );
});

test("B3: Procedure 3 references Proc 21 and/or 15", () => {
  const text = readRequired("memory/procedural-memory-v1.md");
  const proc3 = extractProc3(text);
  const has21 = /Procedure\s*21\b|\bProc(?:edure)?\s*21\b/i.test(proc3);
  const has15 = /Procedure\s*15\b|\bProc(?:edure)?\s*15\b/i.test(proc3);
  assert(
    has21 || has15,
    "Procedure 3 must reference Procedure 21 and/or 15 (gate/order)",
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
