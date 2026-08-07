#!/usr/bin/env node
/**
 * Coverage: present-tense architecture model claims vs authoritative runtime.
 * Offline only — reads local files; no provider API calls.
 * Run: node scripts/test-model-claims-vs-config.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

/** @type {string[]} */
const staleFindings = [];

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
 * @param {string} p
 * @returns {string}
 */
function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

/**
 * @param {string} rel
 * @returns {string}
 */
function readWorkspace(rel) {
  const p = path.join(ROOT, rel);
  assert(fs.existsSync(p), `missing workspace file: ${rel}`);
  return readFile(p);
}

/**
 * Resolve openclaw.json: ~/.openclaw/openclaw.json (workspace parent).
 * @returns {string}
 */
function resolveOpenclawJson() {
  const candidates = [
    path.join(os.homedir(), ".openclaw", "openclaw.json"),
    path.resolve(ROOT, "..", "openclaw.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(
    `openclaw.json not found (tried: ${candidates.join(", ")})`,
  );
}

/**
 * @param {string} id
 * @returns {string}
 */
function normalizeModelId(id) {
  return String(id || "")
    .trim()
    .toLowerCase()
    .replace(/^["'`]+|["'`]+$/g, "");
}

/**
 * Strip provider prefix: xai/grok-4.5 → grok-4.5
 * @param {string} id
 * @returns {string}
 */
function bareModel(id) {
  const n = normalizeModelId(id);
  const slash = n.lastIndexOf("/");
  return slash >= 0 ? n.slice(slash + 1) : n;
}

/**
 * Human labels that mean the same live seat as an id.
 * @param {string} text
 * @param {"brain"|"swarm"|"cursor"|"structural"|"skeptic"} role
 * @returns {boolean}
 */
function textMentionsExpected(text, role) {
  const t = text.toLowerCase();
  switch (role) {
    case "brain":
      return (
        /\bxai\/grok-4\.5\b/.test(t) ||
        /\bgrok-4\.5\b/.test(t) ||
        /\bgrok 4\.5\b/.test(t)
      );
    case "swarm":
      return (
        /\bdeepseek\/deepseek-v4-flash\b/.test(t) ||
        /\bdeepseek-v4-flash\b/.test(t) ||
        /\bdeepseek v4 flash\b/.test(t)
      );
    case "cursor":
      return /\bcursor-grok-4\.5-high\b/.test(t);
    case "structural":
      return (
        /\bzai\/glm-5\.2\b/.test(t) ||
        /\bglm-5\.2\b/.test(t) ||
        /\bglm 5\.2\b/.test(t)
      );
    case "skeptic":
      return (
        /\bopenai\/gpt-5\.6-sol\b/.test(t) ||
        /\bgpt-5\.6-sol\b/.test(t) ||
        /\bgpt 5\.6 sol\b/.test(t) ||
        /\bgpt-skeptic\b/.test(t)
      );
    default:
      return false;
  }
}

/**
 * Line/region looks explicitly historical — do not fail the suite on it.
 * @param {string} line
 * @returns {boolean}
 */
function isHistoricalLine(line) {
  const t = line.toLowerCase();
  if (
    /\btrue as of\b/.test(t) ||
    /\bsuperseded\b/.test(t) ||
    /\bflipped\b/.test(t) ||
    /\bwas\b/.test(t) ||
    /\bhistory:\b/.test(t) ||
    /\bhistorical\b/.test(t) ||
    /\bas of 7\/31\b/.test(t) ||
    /\buntil bake-off\b/.test(t) ||
    /\bLayer A was\b/i.test(line)
  ) {
    return true;
  }
  // Dated chronology bullets under Recent durable decisions
  if (/^\s*-\s*\*\*\d{1,2}\/\d{1,2}:\*\*/.test(line)) return true;
  if (/^\s*-\s*\*\*20\d{2}-\d{2}-\d{2}/.test(line)) return true;
  return false;
}

/**
 * Extract CURSOR_MODEL default from cursor-worker.sh
 * @param {string} sh
 * @returns {string}
 */
function parseCursorDefault(sh) {
  const m = sh.match(
    /CURSOR_MODEL\s*=\s*"\$\{CURSOR_MODEL:-([^}]+)\}"/,
  );
  assert(m, "cursor-worker.sh missing CURSOR_MODEL=${CURSOR_MODEL:-...} default");
  return m[1].trim();
}

/**
 * Slice MEMORY.md to Architecture & harness (current) only — not dated chronology.
 * @param {string} text
 * @returns {string}
 */
function memoryArchitectureRegion(text) {
  const start = text.search(/^## Architecture & harness \(current\)/m);
  assert(start >= 0, "MEMORY.md missing ## Architecture & harness (current)");
  const rest = text.slice(start);
  const next = rest.search(/^## (?!Architecture)/m);
  return next > 0 ? rest.slice(0, next) : rest;
}

/**
 * Slice WORLD_STATE Nova Architecture table region.
 * @param {string} text
 * @returns {string}
 */
function worldStateArchitectureRegion(text) {
  const start = text.search(/^## Nova Architecture \(Current\)/m);
  assert(start >= 0, "WORLD_STATE.md missing ## Nova Architecture (Current)");
  const rest = text.slice(start);
  const next = rest.search(/^## (?!Nova Architecture)/m);
  return next > 0 ? rest.slice(0, next) : rest;
}

/**
 * Header defaults block for swarm protocol (top of file through first --- or ## 1).
 * @param {string} text
 * @returns {string}
 */
function swarmHeaderDefaults(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    if (/^##\s+1\b/.test(line) || /^##\s+Role/.test(line)) break;
    out.push(line);
    if (out.length > 40) break;
  }
  return out.join("\n");
}

/**
 * TOOLS.md Cursor default model table region.
 * @param {string} text
 * @returns {string}
 */
function toolsCursorRegion(text) {
  const start = text.search(/^## Cursor Agent sidecar/m);
  if (start < 0) return text;
  const rest = text.slice(start);
  const next = rest.search(/^## (?!Cursor)/m);
  return next > 0 ? rest.slice(0, next) : rest;
}

/**
 * IDENTITY.md Model line(s).
 * @param {string} text
 * @returns {string}
 */
function identityModelLines(text) {
  return text
    .split(/\r?\n/)
    .filter((l) => /\*\*Model:\*\*/i.test(l) || /^-\s*\*\*Model:\*\*/i.test(l))
    .join("\n");
}

/**
 * Conflicting live brain claim (present-tense default/primary ≠ expected).
 * @param {string} line
 * @param {string} expectedBare
 * @returns {string|null}
 */
function conflictingBrainClaim(line, expectedBare) {
  if (isHistoricalLine(line)) return null;
  const t = line.toLowerCase();
  const isDefaultClaim =
    /\bdefault brain\b/.test(t) ||
    (/\bprimary\b/.test(t) && /\b(brain|model|xai\/|grok|glm|claude)\b/.test(t)) ||
    (/\bexecutive\b/.test(t) && /\|\s*[^|]+\s*\|/.test(line) && /\bdefault brain\b/i.test(line));
  if (!isDefaultClaim && !/^\|\s*executive\b/i.test(line)) return null;

  // Table row: Executive | MODEL |
  const table = line.match(/^\|\s*Executive[^|]*\|\s*([^|]+)\|/i);
  if (table) {
    const cell = table[1].trim();
    if (!textMentionsExpected(cell, "brain") && !cell.toLowerCase().includes(expectedBare)) {
      return `Executive row model "${cell}" ≠ ${expectedBare}`;
    }
    return null;
  }

  // Bullet: Default brain: `id`
  if (/\bdefault brain\b/i.test(line)) {
    if (textMentionsExpected(line, "brain")) return null;
    // Explicit wrong ids next to default brain
    const wrong = line.match(
      /(?:default brain|:)\s*`?([a-z0-9_./-]+)`?/i,
    );
    if (wrong) {
      const bare = bareModel(wrong[1]);
      if (bare && bare !== expectedBare && !textMentionsExpected(wrong[1], "brain")) {
        return `Default brain claim "${wrong[1]}" ≠ ${expectedBare}`;
      }
    }
    // If line mentions another full model id as the value
    if (
      /\b(zai\/glm-5\.[12]|glm-5\.[12]|claude|anthropic\/|openai\/gpt-5\.5)\b/i.test(line) &&
      !textMentionsExpected(line, "brain")
    ) {
      return `Default brain line conflicts with ${expectedBare}: ${line.trim()}`;
    }
  }
  return null;
}

/**
 * Conflicting swarm/subagent default claim.
 * @param {string} line
 * @param {string} expectedBare
 * @returns {string|null}
 */
function conflictingSwarmClaim(line, expectedBare) {
  if (isHistoricalLine(line)) return null;
  const t = line.toLowerCase();
  const isClaim =
    /\bsubagent defaults?\b/.test(t) ||
    /\bswarm default\b/.test(t) ||
    /\bcheap worker\s*\/\s*swarm default\b/.test(t) ||
    /^\|\s*cheap worker/i.test(line) ||
    (/\bdefault worker\b/.test(t) && !/\bchamber\b/.test(t));
  if (!isClaim) return null;

  if (textMentionsExpected(line, "swarm")) return null;

  // Explicit glm-5.1 / zai as live swarm default (not alt/bulk)
  if (
    /\b(zai\/glm-5\.1|glm-5\.1)\b/i.test(line) &&
    !/\b(alt|bulk|intentional|when used)\b/i.test(line) &&
    !isHistoricalLine(line)
  ) {
    return `Swarm/subagent default appears to claim glm-5.1 (expected ${expectedBare}): ${line.trim()}`;
  }

  const table = line.match(/^\|\s*Cheap worker[^|]*\|\s*([^|]+)\|/i);
  if (table) {
    const cell = table[1].trim();
    if (!textMentionsExpected(cell, "swarm") && !cell.toLowerCase().includes("deepseek")) {
      return `Cheap worker row "${cell}" ≠ ${expectedBare}`;
    }
  }
  return null;
}

/**
 * Conflicting Cursor default pin claim.
 * @param {string} line
 * @param {string} expected
 * @returns {string|null}
 */
function conflictingCursorClaim(line, expected) {
  if (isHistoricalLine(line)) return null;
  const t = line.toLowerCase();
  const isClaim =
    /\bdefault model\b/.test(t) ||
    /\bcursor sidecar pin\b/.test(t) ||
    /^\|\s*\*\*Default model\*\*/i.test(line) ||
    /^\|\s*Cursor sidecar pin\b/i.test(line) ||
    (/\bcursor\b/.test(t) && /\bpin(?:ned)?\b/.test(t) && /\bdefault\b/.test(t));
  if (!isClaim) return null;

  if (line.toLowerCase().includes(expected.toLowerCase())) return null;

  // Bare Auto as production default
  if (/\bbare auto\b/i.test(line) && /\bdefault\b/i.test(line) && !/\bnever\b/i.test(line)) {
    return `Cursor default claims bare Auto (expected ${expected})`;
  }

  const m = line.match(/cursor-[a-z0-9.-]+/i);
  if (m && normalizeModelId(m[0]) !== normalizeModelId(expected)) {
    return `Cursor pin "${m[0]}" ≠ ${expected}: ${line.trim()}`;
  }
  return null;
}

/**
 * Conflicting chamber Structural seat.
 * @param {string} line
 * @returns {string|null}
 */
function conflictingStructuralClaim(line) {
  if (isHistoricalLine(line)) return null;
  const isClaim =
    /^\|\s*Structural\b/i.test(line) ||
    (/\bstructural\b/i.test(line) && /\b(chamber|thinker|seat)\b/i.test(line));
  if (!isClaim) return null;
  // Consultant row that says "not chamber structural" is OK
  if (/\bnot chamber structural\b/i.test(line)) return null;
  if (textMentionsExpected(line, "structural")) return null;

  // Wrong structural seat models
  if (
    /\b(claude opus|opus 4\.|glm-5\.1|gpt-5\.6-sol|deepseek)\b/i.test(line) &&
    !/\b(compare|consultant|alt|skeptic)\b/i.test(line)
  ) {
    return `Structural seat conflict (expected GLM-5.2): ${line.trim()}`;
  }

  const table = line.match(/^\|\s*Structural[^|]*\|\s*([^|]+)\|/i);
  if (table) {
    const cell = table[1].trim();
    if (!textMentionsExpected(cell, "structural")) {
      return `Structural row "${cell}" ≠ GLM-5.2`;
    }
  }
  return null;
}

/**
 * Conflicting chamber Skeptic seat (only when Skeptic is asserted).
 * @param {string} line
 * @returns {string|null}
 */
function conflictingSkepticClaim(line) {
  if (isHistoricalLine(line)) return null;
  if (!/\bskeptic\b/i.test(line)) return null;
  // Mentions OK if expected
  if (textMentionsExpected(line, "skeptic")) return null;
  // Present-tense seat assignment to wrong model
  if (
    /\b(skeptic\s*[=:|]|\|\s*Skeptic)\b/i.test(line) &&
    /\b(glm-5\.|claude|grok-4\.|deepseek)\b/i.test(line) &&
    !textMentionsExpected(line, "skeptic")
  ) {
    return `Skeptic seat conflict (expected gpt-5.6-sol): ${line.trim()}`;
  }
  return null;
}

/**
 * Scan a text region for conflicting live claims.
 * @param {string} label
 * @param {string} text
 * @param {{ brain: string, swarm: string, cursor: string }} expected
 * @returns {string[]}
 */
function scanRegion(label, text, expected) {
  /** @type {string[]} */
  const conflicts = [];
  const brainBare = bareModel(expected.brain);
  const swarmBare = bareModel(expected.swarm);

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const checks = [
      conflictingBrainClaim(line, brainBare),
      conflictingSwarmClaim(line, swarmBare),
      conflictingCursorClaim(line, expected.cursor),
      conflictingStructuralClaim(line),
      conflictingSkepticClaim(line),
    ];
    for (const c of checks) {
      if (c) conflicts.push(`[${label}] ${c}`);
    }
  }
  return conflicts;
}

console.log("model-claims-vs-config coverage tests\n");

/** @type {{ brain: string, swarm: string, cursor: string, openclawPath: string }} */
const auth = {
  brain: "",
  swarm: "",
  cursor: "",
  openclawPath: "",
};

test("load authoritative openclaw.json brain + swarm", () => {
  auth.openclawPath = resolveOpenclawJson();
  const raw = readFile(auth.openclawPath);
  const cfg = JSON.parse(raw);
  const primary = cfg?.agents?.defaults?.model?.primary;
  const sub = cfg?.agents?.defaults?.subagents?.model;
  assert(typeof primary === "string" && primary.length > 0, "agents.defaults.model.primary missing");
  assert(typeof sub === "string" && sub.length > 0, "agents.defaults.subagents.model missing");
  auth.brain = primary;
  auth.swarm = sub;
  assert(
    normalizeModelId(primary) === "xai/grok-4.5",
    `expected primary xai/grok-4.5 got ${primary}`,
  );
  assert(
    normalizeModelId(sub) === "deepseek/deepseek-v4-flash",
    `expected subagents deepseek/deepseek-v4-flash got ${sub}`,
  );
  console.log(`        openclaw.json: ${auth.openclawPath}`);
  console.log(`        primary=${primary}`);
  console.log(`        subagents=${sub}`);
});

test("load authoritative cursor-worker.sh default pin", () => {
  const sh = readWorkspace("scripts/cursor-worker.sh");
  auth.cursor = parseCursorDefault(sh);
  assert(
    normalizeModelId(auth.cursor) === "cursor-grok-4.5-high",
    `expected cursor-grok-4.5-high got ${auth.cursor}`,
  );
  console.log(`        CURSOR_MODEL default=${auth.cursor}`);
});

test("WORLD_STATE Nova Architecture agrees (incl. Structural GLM-5.2)", () => {
  const region = worldStateArchitectureRegion(readWorkspace("WORLD_STATE.md"));
  const conflicts = scanRegion("WORLD_STATE", region, auth);
  for (const c of conflicts) staleFindings.push(c);
  assert(conflicts.length === 0, conflicts.join("\n        "));
  assert(
    textMentionsExpected(region, "structural"),
    "WORLD_STATE architecture must present Structural as GLM-5.2",
  );
  assert(
    textMentionsExpected(region, "brain"),
    "WORLD_STATE architecture must present brain as Grok 4.5",
  );
  assert(
    textMentionsExpected(region, "swarm"),
    "WORLD_STATE architecture must present swarm as DeepSeek V4 Flash",
  );
  assert(
    textMentionsExpected(region, "cursor"),
    "WORLD_STATE architecture must present cursor-grok-4.5-high",
  );
});

test("MEMORY.md architecture bullets (current) agree — skip dated chronology", () => {
  const region = memoryArchitectureRegion(readWorkspace("MEMORY.md"));
  // Drop obviously historical fragments inside the region (History: …)
  const filtered = region
    .split(/\r?\n/)
    .filter((l) => !isHistoricalLine(l))
    .join("\n");
  const conflicts = scanRegion("MEMORY architecture", filtered, auth);
  for (const c of conflicts) staleFindings.push(c);
  assert(conflicts.length === 0, conflicts.join("\n        "));
  assert(textMentionsExpected(region, "brain"), "MEMORY architecture missing grok-4.5 brain");
  assert(textMentionsExpected(region, "swarm"), "MEMORY architecture missing deepseek swarm default");
});

test("TOOLS.md Cursor default model table agrees", () => {
  const region = toolsCursorRegion(readWorkspace("TOOLS.md"));
  const conflicts = scanRegion("TOOLS", region, auth);
  for (const c of conflicts) staleFindings.push(c);
  assert(conflicts.length === 0, conflicts.join("\n        "));
  assert(
    textMentionsExpected(region, "cursor"),
    "TOOLS.md must pin Default model cursor-grok-4.5-high",
  );
});

test("swarm-protocol-v0.md header defaults agree", () => {
  const full = readWorkspace("docs/harness/swarm-protocol-v0.md");
  const header = swarmHeaderDefaults(full);
  // Also include the short role table near top (lines before ## 1 / packs)
  const roleTableMatch = full.match(
    /\| \*\*Layer\*\*.*?\n(?:\|.*\n){1,8}/s,
  );
  const region = header + "\n" + (roleTableMatch ? roleTableMatch[0] : "");
  const conflicts = scanRegion("swarm-protocol", region, auth);
  for (const c of conflicts) staleFindings.push(c);
  assert(conflicts.length === 0, conflicts.join("\n        "));
  assert(textMentionsExpected(header, "brain"), "swarm header missing brain xai/grok-4.5");
  assert(textMentionsExpected(header, "swarm"), "swarm header missing deepseek worker");
  assert(textMentionsExpected(header, "cursor"), "swarm header missing cursor pin");
});

test("IDENTITY.md Model line present-tense current agrees", () => {
  const text = readWorkspace("IDENTITY.md");
  const lines = identityModelLines(text);
  if (!lines.trim()) {
    console.log("        SKIP  no **Model:** line in IDENTITY.md");
    return;
  }
  // Only enforce if present-tense / current
  if (!/\bcurrent\b/i.test(lines) && !/\bxai\/grok-4\.5\b/i.test(lines)) {
    console.log("        SKIP  Model line not present-tense current");
    return;
  }
  if (isHistoricalLine(lines) && !/\bcurrent\b/i.test(lines)) {
    console.log("        SKIP  Model line marked historical");
    return;
  }
  assert(
    textMentionsExpected(lines, "brain"),
    `IDENTITY Model line should be xai/grok-4.5 (current): ${lines}`,
  );
  const conflicts = scanRegion("IDENTITY", lines, auth);
  for (const c of conflicts) staleFindings.push(c);
  assert(conflicts.length === 0, conflicts.join("\n        "));
});

test("chamber seats: Structural GLM-5.2; Skeptic only if asserted", () => {
  // Structural already required on WORLD_STATE; also check swarm protocol chamber line
  const swarm = readWorkspace("docs/harness/swarm-protocol-v0.md");
  const chamberLines = swarm
    .split(/\r?\n/)
    .filter((l) => /\bchamber\b/i.test(l) && /\b(glm|skeptic|structural)\b/i.test(l));
  for (const line of chamberLines) {
    if (isHistoricalLine(line)) continue;
    const c =
      conflictingStructuralClaim(line) || conflictingSkepticClaim(line);
    if (c) {
      staleFindings.push(`[swarm chamber] ${c}`);
      throw new Error(c);
    }
  }
  // Doc-architecture expected seats (not from openclaw.json)
  console.log("        chamber seats (doc): Structural=GLM-5.2 Skeptic=gpt-5.6-sol (when asserted)");
});

console.log(`\n${passed} passed, ${failed} failed`);
if (staleFindings.length) {
  console.log("\nStale/conflicting claims recorded:");
  for (const s of staleFindings) console.log(`  - ${s}`);
}
process.exit(failed > 0 ? 1 : 0);
