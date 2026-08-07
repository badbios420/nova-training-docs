/**
 * Claim Guard — scan text for banned success words without nearby evidence.
 * Pure, offline, zero deps. Precision-first pre-write / pre-done lint.
 */

import fs from "node:fs";
import path from "node:path";

/** Canonical banned success words (Procedure 9 / claim-ledger). */
export const DEFAULT_BANNED_WORDS = Object.freeze([
  "done",
  "fixed",
  "verified",
  "clean",
  "working",
  "pushed",
  "live",
  "shipped",
]);

/** @typedef {'bare_success'|'multi_bare'} ViolationCategory */

/**
 * @typedef {object} Hit
 * @property {number} line
 * @property {number} col
 * @property {string} word
 * @property {string} snippet
 * @property {string} [file]
 * @property {ViolationCategory} [category]
 * @property {string} [reason]
 */

/**
 * @typedef {object} ScanResult
 * @property {Hit[]} violations
 * @property {Hit[]} cleared
 * @property {{ lines: number, hits: number, violations: number, cleared: number, multiBareParagraphs: number }} stats
 * @property {string} [file]
 */

/**
 * @typedef {object} ScanOptions
 * @property {number} [windowLines]
 * @property {string[]} [bannedWords]
 * @property {boolean} [clearLiveIdioms]
 * @property {string} [file]
 */

/** Marker label only — body after colon must be real evidence to count. */
const EVIDENCE_MARKER_EMPTY = [
  /\bEVIDENCE\s*:/i,
  /\bSource\s*:/i,
  /\bCHECKED\s*:/i,
  /\bchecked\s*:/,
];

/** Placeholder bodies that look filled but are not evidence. */
const EVIDENCE_PLACEHOLDER_WORDS = new Set([
  "n/a",
  "na",
  "none",
  "tbd",
  "todo",
  "pending",
  "placeholder",
  "later",
  "null",
  "nil",
  "empty",
  "missing",
  "unknown",
]);

/**
 * True when trimmed evidence body is a placeholder (empty brackets, dashes/dots, known words).
 * @param {string} body
 * @returns {boolean}
 */
export function isPlaceholderEvidenceBody(body) {
  const trimmed = String(body ?? "").trim();
  if (!trimmed) return true;
  // Empty brackets / braces / parens: [], {}, (), [ ], etc.
  if (/^[\[\{\(]\s*[\]\}\)]$/.test(trimmed)) return true;
  // Only dashes, dots, underscores, or bullets
  if (/^[-–—._•·…]+$/.test(trimmed)) return true;
  // Known placeholder words (optionally wrapped in backticks/quotes)
  const word = trimmed.replace(/^[`'"\[\(]+|[`'"\]\)]+$/g, "").trim().toLowerCase();
  if (EVIDENCE_PLACEHOLDER_WORDS.has(word)) return true;
  return false;
}

/**
 * True when line has EVIDENCE:/Source:/CHECKED: with a real (non-placeholder) body after the colon.
 * Bare `EVIDENCE:`, whitespace-only, `[]`, `-`, `N/A`, `none`, etc. do NOT count.
 * @param {string} line
 * @returns {boolean}
 */
function lineHasFilledEvidenceMarker(line) {
  for (const re of EVIDENCE_MARKER_EMPTY) {
    re.lastIndex = 0;
    const m = re.exec(line);
    if (!m) continue;
    const after = line.slice(m.index + m[0].length);
    const body = after.trim();
    if (body.length > 0 && !isPlaceholderEvidenceBody(body)) return true;
  }
  return false;
}

const PATH_BACKTICK = /`[^`\n]*\/[^`\n]+`/;
const PATH_BARE =
  /(?:^|[\s(])((?:MEMORY\.md|WORLD_STATE\.md|AGENTS\.md|SOUL\.md|USER\.md|DREAMS\.md|HEARTBEAT\.md|TOOLS\.md)|[A-Za-z0-9_.@+-]+(?:\/[A-Za-z0-9_.@+-]+)+\.[A-Za-z0-9]+|[A-Za-z0-9_.@+-]+\/[A-Za-z0-9_.@+/-]+)/;

const CMD_PATTERNS = [
  /\bexit\s*:?\s*0\b/i,
  /\bnode\s+scripts\//i,
  /\bopenclaw\s+/i,
  /\bgit\s+(?:status|log|push|diff|commit|branch)\b/i,
  /`git\s+[^`]+`/i,
  /\bmemory_search\b/i,
  /\bplugins\s+list\b/i,
  /\bconfig\s+validate\b/i,
];

const URL_OR_TX = [
  /https:\/\//i,
  /\btx\s+/i,
  /\b[0-9a-f]{64}\b/i,
];

const PASS_COUNTS = /\bPASS\b.*?\b\d+\s*\/\s*\d+\b|\b\d+\s*\/\s*\d+\b.*?\bPASS\b/i;
const HASH_PROOF = /\bwc\s+-c\b|\bsha256\b/i;

const LIVE_IDIOMS =
  /\blive\s+(?:ops|workspace|suite|grade|smoke|check|use|spawns?|session|index|files?)\b/i;
const WORKING_IDIOMS = /\bworking\s+(?:memory|file|files|notes?|dir|directory|tree|set)\b/i;
const CLEAN_IDIOMS =
  /\bclean\s+(?:child|install|session|slate|build|checkout|working\s+tree|state)\b|\bshows\s+clean\b/i;

const POLICY_META =
  /\bbanned\s+(?:words?|success)\b|\bsuccess\s+words?\b|\bclaim[- ]ledger\b.*\bbanned\b|\bbanned\b.*\bproof\b|\bverified\s+claim\s+language\b|\bclaim\s+language\s+rule\b/i;

/** Teaching / anti-pattern lines that mention banned words without asserting success. */
const TEACHING_META =
  /\b(?:claiming|claimed|claims)\b.*\b(?:done|fixed|verified)\b|\bwrong\s+branch\s+pushed\b|\bnever\s+pushed\b|\bas\s+verified\s+facts?\b|\bwhat\s+was\s+verified\b|\bexplicitly\s+verified\b|\b(?:a\)\s*)?verified\s+against\b|\bstatus\s+`?verified`?\s+only\b|\bmark\s+each\s+claim\b|\bfailure\s+conditions?\b|\b❌\s*bad\b|\b✅\s*good\b|\bare\s+committed,?\s+pushed\b|\breferenced\s+in\s+durable\s+memory\b/i;

/** Slash-joined banned list inside quotes: "done/fixed/verified" */
const SLASH_BANNED_LIST = /["'](?:done|fixed|verified|clean|working|pushed|live|shipped)(?:\/(?:done|fixed|verified|clean|working|pushed|live|shipped))+["']/i;

/**
 * Build whole-word unicode-aware matcher for banned list.
 * @param {string[]} words
 * @returns {RegExp}
 */
export function buildBannedRegex(words) {
  const escaped = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  // Unicode letter/number boundaries; allow trailing period as separate token via lookbehind/ahead
  return new RegExp(`(?<![\\p{L}\\p{N}_])(${escaped.join("|")})(?![\\p{L}\\p{N}_])`, "giu");
}

/**
 * True when line contains an EVIDENCE:/Source:/CHECKED: label (any body).
 * @param {string} line
 * @returns {boolean}
 */
function lineHasEvidenceMarkerLabel(line) {
  for (const re of EVIDENCE_MARKER_EMPTY) {
    re.lastIndex = 0;
    if (re.test(line)) return true;
  }
  return false;
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function lineHasEvidenceMarkers(line) {
  return lineHasFilledEvidenceMarker(line);
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function lineHasPathOrCmd(line) {
  if (PATH_BACKTICK.test(line)) return true;
  if (PATH_BARE.test(line)) return true;
  if (CMD_PATTERNS.some((re) => re.test(line))) return true;
  if (URL_OR_TX.some((re) => re.test(line))) return true;
  if (PASS_COUNTS.test(line)) return true;
  if (HASH_PROOF.test(line)) return true;
  return false;
}

/**
 * Evidence content (markers, paths, cmds, urls, proof phrases).
 * STATUS: verified alone is NOT evidence.
 * Lines with an EVIDENCE:/Source:/CHECKED: label are judged only by marker body
 * (placeholders like N/A must not clear via PATH_BARE matching "N/A").
 * @param {string} line
 * @returns {boolean}
 */
export function lineHasEvidence(line) {
  if (!line || typeof line !== "string") return false;
  if (lineHasEvidenceMarkerLabel(line)) {
    return lineHasFilledEvidenceMarker(line);
  }
  if (lineHasPathOrCmd(line)) return true;
  return false;
}

/**
 * Comma-separated backtick list of banned words (policy docs).
 * @param {string} line
 * @param {string[]} bannedWords
 * @returns {boolean}
 */
export function isBannedWordListLine(line, bannedWords = DEFAULT_BANNED_WORDS) {
  const trimmed = line.trim();
  // e.g. `done`, `fixed`, `verified`, ...
  const ticks = [...trimmed.matchAll(/`([^`]+)`/g)].map((m) => m[1].toLowerCase().replace(/\.$/, ""));
  if (ticks.length < 3) return false;
  const set = new Set(bannedWords.map((w) => w.toLowerCase()));
  const bannedHits = ticks.filter((t) => set.has(t));
  if (bannedHits.length < 3) return false;
  // Mostly a list: strip ticks/commas/ands and little else remains
  const remainder = trimmed
    .replace(/`[^`]+`/g, "")
    .replace(/[,:;|/]|and\b|or\b|words?\b|banned\b|success\b|require[sd]?\b|unless\b|accompanied\b|with\b|proof\b|ledger\b|row\b|\(|\)/gi, "")
    .replace(/\s+/g, "")
    .trim();
  return remainder.length < 12;
}

/**
 * @param {string} line
 * @param {string} word
 * @param {{ clearLiveIdioms?: boolean }} [opts]
 * @returns {string | null} clear reason or null
 */
export function idiomClearsHit(line, word, opts = {}) {
  const clearLive = opts.clearLiveIdioms !== false;
  const w = word.toLowerCase();
  if (POLICY_META.test(line)) return "policy_meta";
  if (TEACHING_META.test(line)) return "teaching_meta";
  if (SLASH_BANNED_LIST.test(line)) return "slash_banned_list";
  if (isBannedWordListLine(line)) return "banned_word_list";
  if (
    /^\s{0,3}#{1,6}\s+.*(claim|banned|verifier|ledger|success\s+word)/i.test(line) ||
    /\*\*[^*]*(claim\s+language|banned|verifier)[^*]*\*\*/i.test(line)
  ) {
    return "policy_heading";
  }
  if (w === "live" && clearLive && LIVE_IDIOMS.test(line)) return "live_idiom";
  if (w === "working" && WORKING_IDIOMS.test(line)) return "working_idiom";
  if (w === "clean" && CLEAN_IDIOMS.test(line)) return "clean_idiom";
  return null;
}

/**
 * True if evidence appears on same line, within ±windowLines, or same bullet block.
 * @param {string[]} lines
 * @param {number} lineIndex 0-based
 * @param {{ windowLines?: number }} [opts]
 * @returns {boolean}
 */
export function isEvidenceNearby(lines, lineIndex, opts = {}) {
  const windowLines = opts.windowLines ?? 2;
  const n = lines.length;
  const start = Math.max(0, lineIndex - windowLines);
  const end = Math.min(n - 1, lineIndex + windowLines);

  for (let i = start; i <= end; i += 1) {
    if (lineHasEvidence(lines[i])) return true;
  }

  // Same bullet block: walk contiguous list items / indented continuations
  const blockStart = findBulletBlockStart(lines, lineIndex);
  const blockEnd = findBulletBlockEnd(lines, lineIndex);
  if (blockStart !== null && blockEnd !== null) {
    for (let i = blockStart; i <= blockEnd; i += 1) {
      if (i >= start && i <= end) continue; // already checked
      if (lineHasEvidence(lines[i])) return true;
    }
  }

  return false;
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isListLine(line) {
  return /^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line);
}

/**
 * @param {string} line
 * @returns {boolean}
 */
function isIndentedContinuation(line) {
  return /^\s{2,}\S/.test(line) && !isListLine(line);
}

/**
 * @param {string[]} lines
 * @param {number} idx
 * @returns {number | null}
 */
function findBulletBlockStart(lines, idx) {
  if (!isListLine(lines[idx]) && !isIndentedContinuation(lines[idx])) return null;
  let i = idx;
  while (i > 0) {
    const prev = lines[i - 1];
    if (prev.trim() === "") break;
    if (isListLine(prev) || isIndentedContinuation(prev)) {
      i -= 1;
      continue;
    }
    break;
  }
  // Require at least one list marker in the block
  let hasList = false;
  for (let j = i; j <= idx; j += 1) {
    if (isListLine(lines[j])) hasList = true;
  }
  return hasList ? i : null;
}

/**
 * @param {string[]} lines
 * @param {number} idx
 * @returns {number | null}
 */
function findBulletBlockEnd(lines, idx) {
  if (!isListLine(lines[idx]) && !isIndentedContinuation(lines[idx])) return null;
  let i = idx;
  while (i < lines.length - 1) {
    const next = lines[i + 1];
    if (next.trim() === "") break;
    if (isListLine(next) || isIndentedContinuation(next)) {
      i += 1;
      continue;
    }
    break;
  }
  return i;
}

/**
 * Split into paragraphs (blank-line separated) for multi_bare detection.
 * @param {string[]} lines
 * @returns {number[]} paragraph id per line
 */
function paragraphIds(lines) {
  /** @type {number[]} */
  const ids = [];
  let pid = 0;
  let inPara = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "") {
      ids.push(-1);
      if (inPara) {
        pid += 1;
        inPara = false;
      }
    } else {
      ids.push(pid);
      inPara = true;
    }
  }
  return ids;
}

/**
 * Scan text for banned success words without nearby evidence.
 * @param {string} text
 * @param {ScanOptions} [options]
 * @returns {ScanResult}
 */
export function scanText(text, options = {}) {
  const windowLines = options.windowLines ?? 2;
  const bannedWords = options.bannedWords ?? [...DEFAULT_BANNED_WORDS];
  const clearLiveIdioms = options.clearLiveIdioms !== false;
  const file = options.file;

  const lines = String(text ?? "").split(/\r?\n/);
  const re = buildBannedRegex(bannedWords);
  /** @type {Hit[]} */
  const violations = [];
  /** @type {Hit[]} */
  const cleared = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
      const word = m[1];
      const col = m.index + 1;
      const snippet = line.trim().slice(0, 160);
      /** @type {Hit} */
      const hit = { line: i + 1, col, word: word.toLowerCase(), snippet, file };

      const idiomReason = idiomClearsHit(line, word, { clearLiveIdioms });
      if (idiomReason) {
        hit.reason = idiomReason;
        cleared.push(hit);
        continue;
      }

      // STATUS: verified on this line alone is not evidence — still need nearby evidence
      if (isEvidenceNearby(lines, i, { windowLines })) {
        hit.reason = "evidence_nearby";
        cleared.push(hit);
        continue;
      }

      hit.category = "bare_success";
      hit.reason = "no_evidence";
      violations.push(hit);
    }
  }

  // Mark multi_bare when ≥2 violations share a paragraph
  const pids = paragraphIds(lines);
  /** @type {Map<number, Hit[]>} */
  const byPara = new Map();
  for (const v of violations) {
    const pid = pids[v.line - 1];
    if (pid < 0) continue;
    if (!byPara.has(pid)) byPara.set(pid, []);
    byPara.get(pid)?.push(v);
  }
  let multiBareParagraphs = 0;
  for (const group of byPara.values()) {
    if (group.length >= 2) {
      multiBareParagraphs += 1;
      for (const h of group) h.category = "multi_bare";
    }
  }

  return {
    violations,
    cleared,
    stats: {
      lines: lines.length,
      hits: violations.length + cleared.length,
      violations: violations.length,
      cleared: cleared.length,
      multiBareParagraphs,
    },
    file,
  };
}

/**
 * Scan a UTF-8 file.
 * @param {string} filePath
 * @param {ScanOptions} [options]
 * @returns {ScanResult}
 */
export function scanFile(filePath, options = {}) {
  const abs = path.resolve(filePath);
  const text = fs.readFileSync(abs, { encoding: "utf8" });
  return scanText(text, { ...options, file: abs });
}

/**
 * Merge multiple scan results.
 * @param {ScanResult[]} results
 * @returns {ScanResult}
 */
export function mergeResults(results) {
  /** @type {Hit[]} */
  const violations = [];
  /** @type {Hit[]} */
  const cleared = [];
  let lines = 0;
  let multiBareParagraphs = 0;
  for (const r of results) {
    violations.push(...r.violations);
    cleared.push(...r.cleared);
    lines += r.stats.lines;
    multiBareParagraphs += r.stats.multiBareParagraphs;
  }
  return {
    violations,
    cleared,
    stats: {
      lines,
      hits: violations.length + cleared.length,
      violations: violations.length,
      cleared: cleared.length,
      multiBareParagraphs,
    },
  };
}

/**
 * Format a hit as file:line:word:snippet
 * @param {Hit} hit
 * @returns {string}
 */
export function formatHit(hit) {
  const loc = hit.file ? `${hit.file}:${hit.line}` : `line ${hit.line}`;
  return `${loc}:${hit.word}:${hit.snippet}`;
}

/**
 * @param {ScanResult} result
 * @param {{ format?: 'text'|'markdown', showCleared?: boolean }} [opts]
 * @returns {string}
 */
export function formatReport(result, opts = {}) {
  const format = opts.format ?? "text";
  const showCleared = opts.showCleared === true;
  const s = result.stats;

  if (format === "markdown") {
    const lines = [
      "# Claim Guard Report",
      "",
      `| Metric | Value |`,
      `| --- | --- |`,
      `| Lines | ${s.lines} |`,
      `| Hits | ${s.hits} |`,
      `| Violations | ${s.violations} |`,
      `| Cleared | ${s.cleared} |`,
      `| Multi-bare paragraphs | ${s.multiBareParagraphs} |`,
      "",
    ];
    if (result.file) lines.push(`File: \`${result.file}\``, "");
    if (result.violations.length) {
      lines.push("## Violations", "");
      for (const v of result.violations) {
        lines.push(`- \`${formatHit(v)}\` (${v.category ?? "bare_success"})`);
      }
      lines.push("");
    } else {
      lines.push("## Violations", "", "None.", "");
    }
    if (showCleared && result.cleared.length) {
      lines.push("## Cleared", "");
      for (const c of result.cleared) {
        lines.push(`- \`${formatHit(c)}\` (${c.reason ?? "cleared"})`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  // text
  const out = [];
  out.push(
    `claim-guard: ${s.violations} violation(s), ${s.cleared} cleared, ${s.hits} hit(s), ${s.lines} line(s)`,
  );
  if (result.file) out.push(`file: ${result.file}`);
  for (const v of result.violations) {
    out.push(`VIOLATION ${v.category ?? "bare_success"} ${formatHit(v)}`);
  }
  if (showCleared) {
    for (const c of result.cleared) {
      out.push(`CLEARED ${c.reason ?? "ok"} ${formatHit(c)}`);
    }
  }
  if (s.violations === 0) out.push("OK");
  return out.join("\n");
}

/**
 * Collect markdown files under a directory (no node_modules).
 * @param {string} dir
 * @param {{ maxFiles?: number, exclude?: RegExp }} [opts]
 * @returns {string[]}
 */
export function collectMarkdownFiles(dir, opts = {}) {
  const maxFiles = opts.maxFiles ?? 500;
  const exclude = opts.exclude;
  /** @type {string[]} */
  const out = [];

  /**
   * @param {string} d
   */
  function walk(d) {
    if (out.length >= maxFiles) return;
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (out.length >= maxFiles) return;
      const name = ent.name;
      if (name === "node_modules" || name === ".git" || name === ".openclaw") continue;
      const full = path.join(d, name);
      if (exclude && exclude.test(full)) continue;
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && name.endsWith(".md")) out.push(full);
    }
  }

  walk(path.resolve(dir));
  return out;
}
