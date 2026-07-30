/**
 * Pure helpers for Memory-before-speech meter v0 (harness scorecard meter #1).
 * Mechanical + light heuristics — not LLM grading.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/** @typedef {'hit'|'none'|'timeout'|'unknown'|null} AmStatus */

/**
 * @typedef {object} SampleTurn
 * @property {string} id
 * @property {string} [at]
 * @property {boolean} needsPriorFact
 * @property {boolean} memoryEvidence
 * @property {AmStatus} [amStatus]
 * @property {string} [notes]
 * @property {string} [prompt]
 * @property {string} [logExcerpt]
 */

/**
 * @typedef {object} SamplesDoc
 * @property {number} version
 * @property {'fixture'|'manual'|'log-scan'} source
 * @property {string} [generatedAt]
 * @property {SampleTurn[]} turns
 */

/**
 * @typedef {object} MeterResult
 * @property {number} totalTurns
 * @property {number} eligibleTurns
 * @property {number} withMemoryBeforeSpeech
 * @property {number|null} rate
 * @property {Record<string, number>} amStatusBreakdown
 * @property {Record<string, number>} eligibleAmStatusBreakdown
 * @property {string} [source]
 * @property {string} [label]
 * @property {string} measuredAt
 */

export const AM_STATUSES = Object.freeze(["hit", "none", "timeout", "unknown"]);

/** Keywords suggesting the turn needed a prior fact (LIGHT heuristic). */
export const PRIOR_FACT_KEYWORDS = Object.freeze([
  /\bremember\b/i,
  /\blast session\b/i,
  /\bopen fires?\b/i,
  /\bWORLD_STATE\b/i,
  /\beBay\b/i,
  /\bHilltop\b/i,
  /\bFBN\b/i,
  /\bopen issues?\b/i,
  /\bwhat were we doing\b/i,
  /\bprior (?:fact|context|status)\b/i,
  /\bops[- ]?first\b/i,
  /\bcontinuity\b/i,
]);

/** Markers suggesting memory / AM / ops-first fired before speech. */
export const MEMORY_EVIDENCE_MARKERS = Object.freeze([
  /\bmemory_search\b/i,
  /\bActive Memory\b/i,
  /\bAM status:\s*(hit|none|timeout)\b/i,
  /\bamStatus["']?\s*[:=]\s*["']?(hit|none|timeout)/i,
  /\bops[- ]?first\b/i,
  /\bWORLD_STATE\.md\b/i,
  /\bread(?:File|ing)?\s+.*memory\//i,
  /\bmemory\/\d{4}-\d{2}-\d{2}\.md\b/i,
  /\bMEMORY\.md\b/i,
  /\bprocedural-memory-v1\.md\b/i,
  /\btool call(?:s)?\s*:\s*memory/i,
]);

/**
 * @param {string} [home]
 * @returns {string}
 */
export function defaultWorkspace(home = process.env.HOME || os.homedir()) {
  return path.join(home, ".openclaw", "workspace");
}

/**
 * Heuristic: does text look like it needs a prior fact?
 * @param {string} text
 * @returns {boolean}
 */
export function heuristicNeedsPriorFact(text) {
  const t = String(text || "");
  if (!t.trim()) return false;
  return PRIOR_FACT_KEYWORDS.some((re) => re.test(t));
}

/**
 * Heuristic: does text show memory/AM/ops-first evidence before speech?
 * @param {string} text
 * @returns {boolean}
 */
export function heuristicMemoryEvidence(text) {
  const t = String(text || "");
  if (!t.trim()) return false;
  return MEMORY_EVIDENCE_MARKERS.some((re) => re.test(t));
}

/**
 * Parse AM status from free text (best-effort log scan).
 * @param {string} text
 * @returns {AmStatus}
 */
export function parseAmStatusFromText(text) {
  const t = String(text || "");
  const m =
    t.match(/\bAM status:\s*(hit|none|timeout|unknown)\b/i) ||
    t.match(/\bamStatus["']?\s*[:=]\s*["']?(hit|none|timeout|unknown)/i) ||
    t.match(/\bActive Memory\b[^\n]*\b(hit|none|timeout)\b/i);
  if (!m) return null;
  return /** @type {AmStatus} */ (m[1].toLowerCase());
}

/**
 * Normalize a single turn object; throws on invalid schema.
 * @param {unknown} raw
 * @param {number} [index]
 * @returns {SampleTurn}
 */
export function normalizeTurn(raw, index = 0) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`turn[${index}]: expected object`);
  }
  const t = /** @type {Record<string, unknown>} */ (raw);
  const id = t.id != null ? String(t.id) : `t${String(index + 1).padStart(2, "0")}`;

  let needsPriorFact = t.needsPriorFact;
  let memoryEvidence = t.memoryEvidence;

  if (typeof needsPriorFact !== "boolean") {
    if (typeof t.prompt === "string" || typeof t.logExcerpt === "string") {
      needsPriorFact = heuristicNeedsPriorFact(
        `${t.prompt || ""}\n${t.notes || ""}\n${t.logExcerpt || ""}`,
      );
    } else {
      throw new Error(`turn[${index}] (${id}): needsPriorFact must be boolean`);
    }
  }

  if (typeof memoryEvidence !== "boolean") {
    if (typeof t.logExcerpt === "string") {
      memoryEvidence = heuristicMemoryEvidence(t.logExcerpt);
    } else {
      throw new Error(`turn[${index}] (${id}): memoryEvidence must be boolean`);
    }
  }

  /** @type {AmStatus} */
  let amStatus = null;
  if (t.amStatus === null || t.amStatus === undefined) {
    amStatus = typeof t.logExcerpt === "string" ? parseAmStatusFromText(t.logExcerpt) : null;
  } else if (typeof t.amStatus === "string") {
    const s = t.amStatus.toLowerCase();
    if (!AM_STATUSES.includes(s)) {
      throw new Error(
        `turn[${index}] (${id}): amStatus must be one of ${AM_STATUSES.join("|")} or null`,
      );
    }
    amStatus = /** @type {AmStatus} */ (s);
  } else {
    throw new Error(`turn[${index}] (${id}): amStatus must be string or null`);
  }

  /** @type {SampleTurn} */
  const out = {
    id,
    needsPriorFact: Boolean(needsPriorFact),
    memoryEvidence: Boolean(memoryEvidence),
    amStatus,
  };
  if (typeof t.at === "string") out.at = t.at;
  if (typeof t.notes === "string") out.notes = t.notes;
  if (typeof t.prompt === "string") out.prompt = t.prompt;
  if (typeof t.logExcerpt === "string") out.logExcerpt = t.logExcerpt;
  return out;
}

/**
 * Validate and parse a samples document (object or JSON string).
 * @param {unknown} raw
 * @returns {SamplesDoc}
 */
export function parseSamplesDoc(raw) {
  let doc = raw;
  if (typeof raw === "string") {
    try {
      doc = JSON.parse(raw);
    } catch (err) {
      throw new Error(`samples JSON parse failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    throw new Error("samples root must be an object");
  }
  const d = /** @type {Record<string, unknown>} */ (doc);
  if (d.version !== 1 && d.version !== "1") {
    throw new Error(`samples.version must be 1 (got ${JSON.stringify(d.version)})`);
  }
  const source = d.source;
  if (source !== "fixture" && source !== "manual" && source !== "log-scan") {
    throw new Error(`samples.source must be fixture|manual|log-scan (got ${JSON.stringify(source)})`);
  }
  if (!Array.isArray(d.turns)) {
    throw new Error("samples.turns must be an array");
  }
  if (d.turns.length < 1) {
    throw new Error("samples.turns must be non-empty");
  }

  const turns = d.turns.map((t, i) => normalizeTurn(t, i));
  /** @type {SamplesDoc} */
  const out = {
    version: 1,
    source,
    turns,
  };
  if (typeof d.generatedAt === "string") out.generatedAt = d.generatedAt;
  return out;
}

/**
 * Load samples JSON from disk.
 * @param {string} filePath
 * @returns {SamplesDoc}
 */
export function loadSamplesFile(filePath) {
  const abs = path.resolve(filePath);
  let text;
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch (err) {
    throw new Error(`cannot read samples: ${err instanceof Error ? err.message : err}`);
  }
  return parseSamplesDoc(text);
}

/**
 * Compute meter rates from turns.
 * @param {SampleTurn[]} turns
 * @param {{ source?: string, label?: string, measuredAt?: string }} [meta]
 * @returns {MeterResult}
 */
export function computeMeter(turns, meta = {}) {
  const list = Array.isArray(turns) ? turns : [];
  let eligibleTurns = 0;
  let withMemoryBeforeSpeech = 0;
  /** @type {Record<string, number>} */
  const amStatusBreakdown = { hit: 0, none: 0, timeout: 0, unknown: 0, null: 0 };
  /** @type {Record<string, number>} */
  const eligibleAmStatusBreakdown = { hit: 0, none: 0, timeout: 0, unknown: 0, null: 0 };

  for (const t of list) {
    const key = t.amStatus == null ? "null" : String(t.amStatus);
    amStatusBreakdown[key] = (amStatusBreakdown[key] || 0) + 1;

    if (t.needsPriorFact) {
      eligibleTurns += 1;
      eligibleAmStatusBreakdown[key] = (eligibleAmStatusBreakdown[key] || 0) + 1;
      if (t.memoryEvidence) withMemoryBeforeSpeech += 1;
    }
  }

  const rate = eligibleTurns === 0 ? null : withMemoryBeforeSpeech / eligibleTurns;

  /** @type {MeterResult} */
  const result = {
    totalTurns: list.length,
    eligibleTurns,
    withMemoryBeforeSpeech,
    rate,
    amStatusBreakdown,
    eligibleAmStatusBreakdown,
    measuredAt: meta.measuredAt || new Date().toISOString(),
  };
  if (meta.source) result.source = meta.source;
  if (meta.label) result.label = meta.label;
  return result;
}

/**
 * Format rate for display (null → "n/a").
 * @param {number|null} rate
 * @param {number} [digits=2]
 * @returns {string}
 */
export function formatRate(rate, digits = 2) {
  if (rate == null || !Number.isFinite(rate)) return "n/a";
  return rate.toFixed(digits);
}

/**
 * Human-readable report.
 * @param {MeterResult} result
 * @param {{ title?: string }} [opts]
 * @returns {string}
 */
export function formatHumanReport(result, opts = {}) {
  const title = opts.title || "Memory-before-speech meter v0";
  const lines = [];
  lines.push(title);
  lines.push(`Measured: ${result.measuredAt}`);
  if (result.source) lines.push(`Source:   ${result.source}`);
  if (result.label) lines.push(`Label:    ${result.label}`);
  lines.push("");
  lines.push(`Total turns:              ${result.totalTurns}`);
  lines.push(`Eligible (needed fact):   ${result.eligibleTurns}`);
  lines.push(`With memory-before-speech:${result.withMemoryBeforeSpeech}`);
  lines.push(
    `Rate:                     ${formatRate(result.rate)}` +
      (result.eligibleTurns
        ? ` (${result.withMemoryBeforeSpeech}/${result.eligibleTurns})`
        : " (no eligible turns)"),
  );
  lines.push("");
  lines.push("AM status (all turns):");
  for (const [k, v] of Object.entries(result.amStatusBreakdown)) {
    if (v > 0) lines.push(`  ${k}: ${v}`);
  }
  lines.push("AM status (eligible only):");
  for (const [k, v] of Object.entries(result.eligibleAmStatusBreakdown)) {
    if (v > 0) lines.push(`  ${k}: ${v}`);
  }
  if (result.label === "fixture-baseline" || result.source === "fixture") {
    lines.push("");
    lines.push(
      "NOTE: fixture/manual baseline only — NOT a live production memory-before-speech rate.",
    );
  }
  return lines.join("\n");
}

/**
 * Machine-readable payload.
 * @param {MeterResult} result
 * @returns {Record<string, unknown>}
 */
export function formatJsonPayload(result) {
  return {
    meter: "memory-before-speech",
    version: 0,
    ...result,
    rateDisplay: formatRate(result.rate),
  };
}

/**
 * Best-effort: scan log lines into synthetic turns (optional; not required for v0).
 * Each non-empty line → one turn; heuristics fill needsPriorFact / memoryEvidence.
 * @param {string} text
 * @returns {SampleTurn[]}
 */
export function scanLogLines(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, i) => {
    const needsPriorFact = heuristicNeedsPriorFact(line);
    const memoryEvidence = heuristicMemoryEvidence(line);
    const amStatus = parseAmStatusFromText(line);
    return {
      id: `log-${String(i + 1).padStart(3, "0")}`,
      needsPriorFact,
      memoryEvidence,
      amStatus,
      logExcerpt: line,
      notes: "log-scan heuristic",
    };
  });
}

/**
 * Build a dated scorecard snapshot section for meter #1.
 * @param {MeterResult} result
 * @param {{ date?: string, fixturePath?: string }} [opts]
 * @returns {string}
 */
export function formatScorecardSection(result, opts = {}) {
  const date =
    opts.date ||
    (() => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    })();
  const label = result.label || (result.source === "fixture" ? "fixture-baseline" : result.source || "manual");
  const rateStr =
    result.rate == null
      ? "n/a"
      : `**${formatRate(result.rate)}** (${result.withMemoryBeforeSpeech}/${result.eligibleTurns})`;
  const lines = [
    ``,
    `### ${date} — Memory-before-speech meter v0 (${label})`,
    ``,
    `| Item | Value |`,
    `|------|-------|`,
    `| Meter | **#1 Memory-before-speech** |`,
    `| Value | ${rateStr} |`,
    `| Label | \`${label}\` — **not** live production rate |`,
    `| Eligible turns | ${result.eligibleTurns} / ${result.totalTurns} total |`,
    `| With memory evidence | ${result.withMemoryBeforeSpeech} |`,
    `| Source | \`${result.source || "unknown"}\` |`,
    opts.fixturePath ? `| Fixture | \`${opts.fixturePath}\` |` : null,
    `| Tool | \`node scripts/memory-before-speech-meter.mjs\` |`,
    `| Doc | \`memory/evals/memory-before-speech-meter-v0.md\` |`,
    `| Measured at | ${result.measuredAt} |`,
    ``,
  ].filter((x) => x !== null);
  return lines.join("\n");
}

/**
 * Append (or replace same-day meter #1 section) without wiping other scorecard content.
 * Replaces an existing "### YYYY-MM-DD — Memory-before-speech meter v0" block for the same date+label when present.
 * @param {string} existing
 * @param {MeterResult} result
 * @param {{ date?: string, fixturePath?: string }} [opts]
 * @returns {string}
 */
export function updateScorecard(existing, result, opts = {}) {
  const date =
    opts.date ||
    (() => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    })();
  const label = result.label || (result.source === "fixture" ? "fixture-baseline" : result.source || "manual");
  const section = formatScorecardSection(result, { ...opts, date });
  const headingRe = new RegExp(
    `\\n### ${date} — Memory-before-speech meter v0 \\(${escapeRegExp(label)}\\)\\n[\\s\\S]*?(?=\\n### |\\n## |$)`,
  );

  let base = existing && existing.trim() ? existing : "# Harness Scorecard\n";
  if (!base.endsWith("\n")) base += "\n";

  if (headingRe.test(base)) {
    return base.replace(headingRe, section.replace(/^\n/, "\n"));
  }
  return base + section;
}

/**
 * @param {string} s
 * @returns {string}
 */
function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Atomic-ish write (write temp then rename).
 * @param {string} filePath
 * @param {string} contents
 */
export function writeFileAtomic(filePath, contents) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, filePath);
}
