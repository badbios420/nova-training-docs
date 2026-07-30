#!/usr/bin/env node
/**
 * Unit tests for claim-guard-lib (no network).
 * Run: node scripts/test-claim-guard.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  scanText,
  scanFile,
  isEvidenceNearby,
  formatReport,
  DEFAULT_BANNED_WORDS,
} from "./lib/claim-guard-lib.mjs";

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

console.log("claim-guard unit tests\n");

test("DEFAULT_BANNED_WORDS has canonical eight", () => {
  assert(DEFAULT_BANNED_WORDS.length === 8, `expected 8 got ${DEFAULT_BANNED_WORDS.length}`);
  for (const w of ["done", "fixed", "verified", "clean", "working", "pushed", "live", "shipped"]) {
    assert(DEFAULT_BANNED_WORDS.includes(w), `missing ${w}`);
  }
});

test("bare done → violation", () => {
  const r = scanText("Ship is done");
  assert(r.violations.length === 1, `expected 1 violation got ${r.violations.length}`);
  assert(r.violations[0].word === "done", `word=${r.violations[0].word}`);
  assert(r.cleared.length === 0, "expected no cleared");
});

test("done + EVIDENCE path nearby → cleared", () => {
  const r = scanText("Ship is done.\nEVIDENCE: `scripts/foo.mjs` exit 0");
  assert(r.violations.length === 0, `unexpected violations: ${JSON.stringify(r.violations)}`);
  assert(r.cleared.length >= 1, "expected cleared");
});

test("policy documentation list → no violation", () => {
  const text =
    "The following words are **banned unless accompanied by proof**: `done`, `fixed`, `verified`, `clean`, `working`, `pushed`, `live`, `shipped`.";
  const r = scanText(text);
  assert(r.violations.length === 0, `policy list flagged: ${JSON.stringify(r.violations)}`);
});

test("working memory → cleared", () => {
  const r = scanText("Update working memory before the next turn.");
  assert(r.violations.length === 0, `working memory flagged: ${JSON.stringify(r.violations)}`);
  assert(r.cleared.some((c) => c.word === "working"), "expected working cleared");
});

test("live suite → cleared", () => {
  const r = scanText("Run the live suite against the workspace.");
  assert(r.violations.length === 0, `live suite flagged: ${JSON.stringify(r.violations)}`);
});

test("STATUS: verified without evidence → violation", () => {
  const r = scanText("- CLAIM: feature ready\n- STATUS: verified\n- NOTES: vibes only");
  assert(
    r.violations.some((v) => v.word === "verified"),
    `expected verified violation got ${JSON.stringify(r.violations)}`,
  );
});

test("STATUS: verified + EVIDENCE → cleared", () => {
  const r = scanText(
    "- CLAIM: feature ready\n- STATUS: verified\n- EVIDENCE: node scripts/claim-guard.mjs --help exit 0",
  );
  assert(r.violations.length === 0, `unexpected: ${JSON.stringify(r.violations)}`);
  assert(r.cleared.some((c) => c.word === "verified"), "expected verified cleared");
});

test("multi-line window works (±2)", () => {
  const r = scanText("The patch is fixed.\n\nMore chatter.\nEVIDENCE: `memory/claim-ledger.md`");
  // window default 2: fixed on L1, blank L2, chatter L3, evidence L4 — distance from L1 to L4 is 3 lines away → should VIOLATE
  assert(r.violations.some((v) => v.word === "fixed"), "expected fixed still bare at distance 3");

  const r2 = scanText("The patch is fixed.\nchatter\nEVIDENCE: `memory/claim-ledger.md`");
  // L1 fixed, L2 chatter, L3 evidence → within ±2
  assert(r2.violations.length === 0, `window±2 should clear: ${JSON.stringify(r2.violations)}`);
});

test("isEvidenceNearby exported helper", () => {
  const lines = ["bare claim done", "EVIDENCE: openclaw plugins list"];
  assert(isEvidenceNearby(lines, 0, { windowLines: 2 }) === true, "expected nearby evidence");
  assert(isEvidenceNearby(["bare done only"], 0, { windowLines: 2 }) === false, "expected no evidence");
});

test("file scan on temp fixture", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "claim-guard-"));
  const dirty = path.join(dir, "dirty.md");
  const clean = path.join(dir, "clean.md");
  fs.writeFileSync(dirty, "Deploy is shipped with no proof.\n", "utf8");
  fs.writeFileSync(
    clean,
    "Deploy is shipped.\nEVIDENCE: https://example.com/tx and `scripts/claim-guard.mjs`\n",
    "utf8",
  );
  const d = scanFile(dirty);
  const c = scanFile(clean);
  assert(d.violations.length >= 1, "dirty fixture should violate");
  assert(c.violations.length === 0, `clean fixture violated: ${JSON.stringify(c.violations)}`);
});

test("formatReport text includes OK when clean", () => {
  const r = scanText("No banned tokens here.");
  const t = formatReport(r, { format: "text" });
  assert(t.includes("OK"), `expected OK in ${t}`);
  const md = formatReport(r, { format: "markdown" });
  assert(md.includes("Claim Guard Report"), "expected md header");
});

test("clean child / clean install idioms", () => {
  const r = scanText("Spawn a clean child session after clean install.");
  assert(r.violations.length === 0, `clean idioms flagged: ${JSON.stringify(r.violations)}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
