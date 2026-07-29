#!/usr/bin/env node
/**
 * Unit tests for retrieval-eval-lib (no openclaw / no network).
 * Exit 0 on pass.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseFacts,
  isNoisePath,
  filterHits,
  scoreFact,
  rollup,
  pathMatchesAccept,
  normalizePath,
} from "./lib/retrieval-eval-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const EVAL_SET = path.join(WORKSPACE, "memory", "retrieval-eval-set-v1.md");
const FIXTURE = path.join(__dirname, "fixtures", "retrieval-eval-sample.md");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

test("normalizePath strips ./ and leading slash", () => {
  assert.equal(normalizePath("./MEMORY.md"), "MEMORY.md");
  assert.equal(normalizePath("/memory/foo.md"), "memory/foo.md");
});

test("parseFacts returns ≥10 facts with categories from live eval set", () => {
  const md = fs.readFileSync(EVAL_SET, "utf8");
  const facts = parseFacts(md);
  assert.ok(facts.length >= 10, `expected ≥10 facts, got ${facts.length}`);
  for (const f of facts) {
    assert.ok(/^F\d+$/.test(f.id), `bad id ${f.id}`);
    assert.ok(f.query.length > 0, `${f.id} missing query`);
    assert.ok(f.acceptPaths.length > 0, `${f.id} missing accept paths`);
    assert.ok(f.category.length > 0, `${f.id} missing category`);
  }
  const cats = new Set(facts.map((f) => f.category));
  assert.ok(cats.has("durable_facts"));
  assert.ok(cats.has("current_ops"));
  assert.ok(cats.has("procedures"));
});

test("parseFacts reads fixture sample", () => {
  const facts = parseFacts(fs.readFileSync(FIXTURE, "utf8"));
  assert.equal(facts.length, 3);
  assert.equal(facts[0].id, "F01");
  assert.deepEqual(facts[0].acceptPaths, ["MEMORY.md", "WORLD_STATE.md"]);
  assert.equal(facts[1].category, "procedures");
});

test("isNoisePath true for dreaming, .dreams, DREAMS.md, candidates, eval-set self", () => {
  assert.equal(isNoisePath("memory/dreaming/light/2026-07-28.md"), true);
  assert.equal(isNoisePath("memory/.dreams/events.jsonl"), true);
  assert.equal(isNoisePath("DREAMS.md"), true);
  assert.equal(isNoisePath("./dreams.md"), true);
  assert.equal(isNoisePath("memory/candidates/foo.md"), true);
  assert.equal(isNoisePath("memory/retrieval-eval-set-v1.md"), true);
  assert.equal(isNoisePath("MEMORY.md"), false);
  assert.equal(isNoisePath("WORLD_STATE.md"), false);
  assert.equal(isNoisePath("memory/2026-07-28.md"), false);
});

test("filterHits drops noise and preserves order of keepers", () => {
  const hits = [
    { path: "memory/dreaming/deep/x.md", score: 0.9 },
    { path: "MEMORY.md", score: 0.8 },
    { path: "memory/retrieval-eval-set-v1.md", score: 0.7 },
    { path: "WORLD_STATE.md", score: 0.6 },
    { path: "DREAMS.md", score: 0.5 },
    { path: "memory/procedural-memory-v1.md", score: 0.4 },
  ];
  const kept = filterHits(hits);
  assert.deepEqual(
    kept.map((h) => h.path),
    ["MEMORY.md", "WORLD_STATE.md", "memory/procedural-memory-v1.md"],
  );
});

test("pathMatchesAccept equals or ends-with accept path", () => {
  assert.equal(pathMatchesAccept("MEMORY.md", ["MEMORY.md"]), true);
  assert.equal(pathMatchesAccept("./MEMORY.md", ["MEMORY.md"]), true);
  assert.equal(
    pathMatchesAccept("workspace/MEMORY.md", ["MEMORY.md"]),
    true,
  );
  assert.equal(pathMatchesAccept("OTHER.md", ["MEMORY.md"]), false);
});

test("scoreFact hit@1 true when gold at rank 1", () => {
  const fact = {
    id: "F01",
    query: "q",
    goldFact: "g",
    acceptPaths: ["MEMORY.md", "WORLD_STATE.md"],
    category: "durable_facts",
  };
  const hits = [
    { path: "MEMORY.md", snippet: "license unincorporated" },
    { path: "other.md", snippet: "x" },
  ];
  const s = scoreFact(fact, hits);
  assert.equal(s.hitAt1, true);
  assert.equal(s.hitAt3, true);
  assert.equal(s.supportAt3, true);
  assert.equal(s.hitRank, 1);
});

test("scoreFact hit@3 true when gold at rank 3; hit@1 false", () => {
  const fact = {
    id: "F02",
    query: "q",
    goldFact: "g",
    acceptPaths: ["WORLD_STATE.md"],
    category: "current_ops",
  };
  const hits = [
    { path: "noise.md", snippet: "a" },
    { path: "other.md", snippet: "b" },
    { path: "WORLD_STATE.md", snippet: "Hilltop weekly" },
    { path: "MEMORY.md", snippet: "c" },
  ];
  const s = scoreFact(fact, hits);
  assert.equal(s.hitAt1, false);
  assert.equal(s.hitAt3, true);
  assert.equal(s.supportAt3, true);
  assert.equal(s.hitRank, 3);
});

test("scoreFact support@3 false on miss or empty snippet", () => {
  const fact = {
    id: "F03",
    query: "q",
    goldFact: "g",
    acceptPaths: ["MEMORY.md"],
    category: "durable_facts",
  };
  assert.equal(scoreFact(fact, [{ path: "OTHER.md", snippet: "x" }]).supportAt3, false);
  assert.equal(
    scoreFact(fact, [{ path: "MEMORY.md", snippet: "   " }]).supportAt3,
    false,
  );
});

test("scoreFact after filterHits promotes gold past dream noise", () => {
  const fact = {
    id: "F09",
    query: "FBN",
    goldFact: "published",
    acceptPaths: ["WORLD_STATE.md", "MEMORY.md"],
    category: "current_ops",
  };
  const raw = [
    { path: "memory/dreaming/light/x.md", snippet: "dream FBN" },
    { path: "DREAMS.md", snippet: "dream" },
    { path: "WORLD_STATE.md", snippet: "FBN published" },
  ];
  const rawScore = scoreFact(fact, raw);
  assert.equal(rawScore.hitAt1, false);
  assert.equal(rawScore.hitAt3, true);
  const filt = filterHits(raw);
  const filtScore = scoreFact(fact, filt);
  assert.equal(filtScore.hitAt1, true);
  assert.equal(filtScore.hitAt3, true);
});

test("rollup overall and per category", () => {
  const rows = [
    {
      category: "durable_facts",
      raw: { hitAt1: true, hitAt3: true, supportAt3: true },
      filtered: { hitAt1: true, hitAt3: true, supportAt3: true },
    },
    {
      category: "durable_facts",
      raw: { hitAt1: false, hitAt3: true, supportAt3: true },
      filtered: { hitAt1: true, hitAt3: true, supportAt3: true },
    },
    {
      category: "procedures",
      raw: { hitAt1: false, hitAt3: false, supportAt3: false },
      filtered: { hitAt1: false, hitAt3: true, supportAt3: true },
    },
  ];
  const r = rollup(rows);
  assert.equal(r.overall.raw.n, 3);
  assert.equal(r.overall.raw.hitAt1, 1);
  assert.equal(r.overall.filtered.hitAt3, 3);
  assert.equal(r.byCategory.durable_facts.raw.hitAt1, 1);
  assert.equal(r.byCategory.procedures.filtered.hitAt3, 1);
});

console.log(JSON.stringify({ ok: true, tests: passed }));
