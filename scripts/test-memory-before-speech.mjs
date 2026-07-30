#!/usr/bin/env node
/**
 * Unit tests for memory-before-speech-lib (offline).
 * Run: node scripts/test-memory-before-speech.mjs
 */

import {
  heuristicNeedsPriorFact,
  heuristicMemoryEvidence,
  parseAmStatusFromText,
  normalizeTurn,
  parseSamplesDoc,
  computeMeter,
  formatRate,
  formatHumanReport,
  formatScorecardSection,
  updateScorecard,
  scanLogLines,
  AM_STATUSES,
} from "./lib/memory-before-speech-lib.mjs";

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

console.log("memory-before-speech unit tests\n");

test("heuristicNeedsPriorFact detects remember / WORLD_STATE / FBN", () => {
  assert(heuristicNeedsPriorFact("please remember last session") === true, "remember");
  assert(heuristicNeedsPriorFact("check WORLD_STATE open fires") === true, "WORLD_STATE");
  assert(heuristicNeedsPriorFact("what is FBN status") === true, "FBN");
  assert(heuristicNeedsPriorFact("hello how are you") === false, "greeting");
});

test("heuristicMemoryEvidence detects memory_search / ops-first / AM", () => {
  assert(heuristicMemoryEvidence("tool: memory_search query=Hilltop") === true, "memory_search");
  assert(heuristicMemoryEvidence("ops-first read WORLD_STATE.md") === true, "ops-first");
  assert(heuristicMemoryEvidence("AM status: hit") === true, "AM status");
  assert(heuristicMemoryEvidence("just chatting") === false, "none");
});

test("parseAmStatusFromText hit/none/timeout", () => {
  assert(parseAmStatusFromText("AM status: hit") === "hit", "hit");
  assert(parseAmStatusFromText("amStatus: none") === "none", "none");
  assert(parseAmStatusFromText("Active Memory verbose timeout") === "timeout", "timeout");
  assert(parseAmStatusFromText("no am markers") === null, "null");
});

test("normalizeTurn requires booleans or heuristics", () => {
  const t = normalizeTurn({
    id: "x",
    needsPriorFact: true,
    memoryEvidence: false,
    amStatus: "hit",
  });
  assert(t.id === "x" && t.needsPriorFact && !t.memoryEvidence && t.amStatus === "hit", "explicit");
});

test("normalizeTurn rejects bad amStatus", () => {
  let threw = false;
  try {
    normalizeTurn({ id: "bad", needsPriorFact: true, memoryEvidence: true, amStatus: "weird" });
  } catch {
    threw = true;
  }
  assert(threw, "expected throw");
});

test("parseSamplesDoc validates version/source/turns", () => {
  const doc = parseSamplesDoc({
    version: 1,
    source: "fixture",
    turns: [{ id: "t01", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" }],
  });
  assert(doc.turns.length === 1, "one turn");
  let threw = false;
  try {
    parseSamplesDoc({ version: 2, source: "fixture", turns: [] });
  } catch {
    threw = true;
  }
  assert(threw, "bad version/empty should throw");
});

test("computeMeter rate with eligible mix", () => {
  const r = computeMeter(
    [
      { id: "a", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" },
      { id: "b", needsPriorFact: true, memoryEvidence: false, amStatus: "none" },
      { id: "c", needsPriorFact: false, memoryEvidence: true, amStatus: "hit" },
    ],
    { source: "fixture", label: "fixture-baseline" },
  );
  assert(r.totalTurns === 3, "total");
  assert(r.eligibleTurns === 2, "eligible");
  assert(r.withMemoryBeforeSpeech === 1, "with");
  assert(r.rate === 0.5, `rate ${r.rate}`);
  assert(r.eligibleAmStatusBreakdown.hit === 1, "eligible hit");
  assert(r.eligibleAmStatusBreakdown.none === 1, "eligible none");
});

test("computeMeter rate null when no eligible", () => {
  const r = computeMeter([{ id: "z", needsPriorFact: false, memoryEvidence: false, amStatus: null }]);
  assert(r.eligibleTurns === 0, "eligible 0");
  assert(r.rate === null, "rate null");
  assert(formatRate(r.rate) === "n/a", "display n/a");
});

test("formatHumanReport notes fixture-baseline", () => {
  const r = computeMeter(
    [{ id: "a", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" }],
    { source: "fixture", label: "fixture-baseline" },
  );
  const text = formatHumanReport(r);
  assert(/fixture-baseline/.test(text) || /NOT a live production/.test(text), "disclaimer");
  assert(/Eligible/.test(text), "eligible line");
});

test("formatScorecardSection labels fixture-baseline", () => {
  const r = computeMeter(
    [
      { id: "a", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" },
      { id: "b", needsPriorFact: true, memoryEvidence: false, amStatus: "none" },
    ],
    { source: "fixture", label: "fixture-baseline", measuredAt: "2026-07-30T00:00:00.000Z" },
  );
  const sec = formatScorecardSection(r, { date: "2026-07-30", fixturePath: "memory/evals/fixtures/memory-before-speech/samples-v0.json" });
  assert(/Memory-before-speech meter v0 \(fixture-baseline\)/.test(sec), "heading");
  assert(/not\*\* live production/.test(sec) || /not.*live production/i.test(sec), "not live");
  assert(/0\.50/.test(sec), "rate 0.50");
});

test("updateScorecard appends without wiping other meters", () => {
  const existing = `# Harness Scorecard

## Meters

| # | Meter |
| 1 | Memory-before-speech |

## Snapshots

### 2026-07-28 baseline

| Meter | Value |
| 4 Retrieval | 0.60 |
`;
  const r = computeMeter(
    [{ id: "a", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" }],
    { source: "fixture", label: "fixture-baseline", measuredAt: "2026-07-30T00:00:00.000Z" },
  );
  const next = updateScorecard(existing, r, { date: "2026-07-30" });
  assert(/Retrieval \| 0\.60/.test(next), "kept other content");
  assert(/Memory-before-speech meter v0/.test(next), "appended section");
});

test("scanLogLines builds heuristic turns", () => {
  const turns = scanLogLines(
    "user: what is FBN status?\nagent: memory_search FBN; AM status: hit\nuser: hi\n",
  );
  assert(turns.length === 3, `got ${turns.length}`);
  assert(turns[0].needsPriorFact === true, "FBN line eligible");
  assert(turns[1].memoryEvidence === true, "memory_search evidence");
  assert(AM_STATUSES.includes("hit"), "AM_STATUSES");
});

test("fixture samples-v0 schema computes expected rate 5/8", () => {
  // Mirrors samples-v0.json: 8 eligible, 5 with evidence → 0.625
  const doc = parseSamplesDoc({
    version: 1,
    source: "fixture",
    turns: [
      { id: "t01", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" },
      { id: "t02", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" },
      { id: "t03", needsPriorFact: true, memoryEvidence: false, amStatus: "none" },
      { id: "t04", needsPriorFact: true, memoryEvidence: false, amStatus: "timeout" },
      { id: "t05", needsPriorFact: true, memoryEvidence: true, amStatus: "timeout" },
      { id: "t06", needsPriorFact: false, memoryEvidence: false, amStatus: null },
      { id: "t07", needsPriorFact: false, memoryEvidence: true, amStatus: "hit" },
      { id: "t08", needsPriorFact: true, memoryEvidence: true, amStatus: "none" },
      { id: "t09", needsPriorFact: true, memoryEvidence: false, amStatus: "unknown" },
      { id: "t10", needsPriorFact: true, memoryEvidence: true, amStatus: "hit" },
    ],
  });
  const r = computeMeter(doc.turns, { source: "fixture", label: "fixture-baseline" });
  assert(r.eligibleTurns === 8, `eligible ${r.eligibleTurns}`);
  assert(r.withMemoryBeforeSpeech === 5, `with ${r.withMemoryBeforeSpeech}`);
  assert(Math.abs(/** @type {number} */ (r.rate) - 0.625) < 1e-9, `rate ${r.rate}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
