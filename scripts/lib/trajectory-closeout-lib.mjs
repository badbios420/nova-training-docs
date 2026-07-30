/**
 * Trajectory closeout helpers — Procedure 13.
 * Pure formatting + append planning. No network.
 */

import fs from "node:fs";
import path from "node:path";

/** @typedef {'win'|'partial'|'fail'} Outcome */

export const OUTCOMES = Object.freeze(["win", "partial", "fail"]);

export const DEFAULT_TRAJECTORY_PATH = "memory/trajectory-log.md";

/**
 * @typedef {object} TrajectoryFields
 * @property {string} title
 * @property {string} goal
 * @property {string} actions
 * @property {string} evidence
 * @property {Outcome} outcome
 * @property {string} lesson
 * @property {string} [followUp]
 * @property {string} [date] YYYY-MM-DD local
 */

/**
 * Local calendar date YYYY-MM-DD.
 * @param {Date} [d]
 */
export function localYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Normalize outcome token.
 * @param {string} raw
 * @returns {Outcome | null}
 */
export function normalizeOutcome(raw) {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase().replace(/^\*+|\*+$/g, "");
  if (OUTCOMES.includes(s)) return /** @type {Outcome} */ (s);
  // allow "win (config-level)" → win
  for (const o of OUTCOMES) {
    if (s === o || s.startsWith(o + " ") || s.startsWith(o + "(") || s.startsWith(o + ":")) {
      return o;
    }
  }
  return null;
}

/**
 * @param {Partial<TrajectoryFields>} fields
 * @returns {{ ok: true, value: TrajectoryFields } | { ok: false, errors: string[] }}
 */
export function validateFields(fields) {
  /** @type {string[]} */
  const errors = [];
  const title = String(fields.title ?? "").trim();
  const goal = String(fields.goal ?? "").trim();
  const actions = String(fields.actions ?? "").trim();
  const evidence = String(fields.evidence ?? "").trim();
  const lesson = String(fields.lesson ?? "").trim();
  const followUp = String(fields.followUp ?? fields.follow_up ?? "").trim();
  const outcome = normalizeOutcome(String(fields.outcome ?? ""));
  const date = String(fields.date ?? localYmd()).trim();

  if (!title) errors.push("title required");
  if (!goal) errors.push("goal required");
  if (!actions) errors.push("actions required");
  if (!evidence) errors.push("evidence required");
  if (!lesson) errors.push("lesson required");
  if (!outcome) errors.push(`outcome must be one of: ${OUTCOMES.join(" | ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("date must be YYYY-MM-DD");

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      goal,
      actions,
      evidence,
      outcome,
      lesson,
      followUp: followUp || undefined,
      date,
    },
  };
}

/**
 * Format one trajectory entry (markdown). ≤20 lines target.
 * @param {TrajectoryFields} f
 */
export function formatEntry(f) {
  const lines = [
    `### ${f.date} — ${f.title}`,
    `- Goal: ${singleLine(f.goal)}`,
    `- Actions: ${singleLine(f.actions)}`,
    `- Evidence: ${singleLine(f.evidence)}`,
    `- Outcome: **${f.outcome}**`,
    `- Lesson: ${singleLine(f.lesson)}`,
  ];
  if (f.followUp) lines.push(`- Follow-up: ${singleLine(f.followUp)}`);
  lines.push(""); // trailing newline for append separation
  return lines.join("\n");
}

/**
 * Collapse newlines/ excess space for bullet body.
 * @param {string} s
 */
export function singleLine(s) {
  return String(s)
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Count non-empty lines in entry body.
 * @param {string} entry
 */
export function countEntryLines(entry) {
  return entry.split("\n").filter((l) => l.trim().length > 0).length;
}

/**
 * True if entry exceeds Procedure 13 soft cap.
 * @param {string} entry
 * @param {number} [max=20]
 */
export function exceedsLineCap(entry, max = 20) {
  return countEntryLines(entry) > max;
}

/**
 * Ensure trajectory file has header if missing.
 * @param {string} existing
 */
export function ensureHeader(existing) {
  const t = existing || "";
  if (t.includes("# Trajectory Log")) return t.endsWith("\n") || t.length === 0 ? t : t + "\n";
  const header = `# Trajectory Log

**Purpose:** Short graded trajectories after major sessions so the next session starts smarter.  
**Rule:** ≤20 lines per entry. Goal → actions → evidence → outcome → lesson.

## Template
\`\`\`
### YYYY-MM-DD — title
- Goal:
- Actions:
- Evidence:
- Outcome: win | partial | fail
- Lesson:
- Follow-up:
\`\`\`

---

`;
  if (!t.trim()) return header;
  return header + t.replace(/^\uFEFF/, "");
}

/**
 * Plan append: returns full new file contents.
 * @param {string} existing
 * @param {string} entry
 */
export function planAppend(existing, entry) {
  let base = ensureHeader(existing);
  if (base.length && !base.endsWith("\n")) base += "\n";
  // Ensure blank line before new entry if file doesn't end with blank
  if (!base.endsWith("\n\n") && base.trim().length) {
    if (!base.endsWith("\n")) base += "\n";
    if (!base.endsWith("\n\n")) base += "\n";
  }
  const body = entry.endsWith("\n") ? entry : entry + "\n";
  return base + body;
}

/**
 * Optional one-line scorecard note block.
 * @param {string} existingScorecard
 * @param {{ date: string, title: string, outcome: string, note?: string }} meta
 */
export function planScorecardTouch(existingScorecard, meta) {
  const stamp = meta.date;
  const block = [
    ``,
    `### ${stamp} — Trajectory closeout`,
    ``,
    `| Item | Value |`,
    `|------|-------|`,
    `| Title | ${singleLine(meta.title)} |`,
    `| Outcome | **${meta.outcome}** |`,
    `| Log | \`memory/trajectory-log.md\` |`,
    meta.note ? `| Note | ${singleLine(meta.note)} |` : null,
    ``,
  ]
    .filter((x) => x !== null)
    .join("\n");

  let base = existingScorecard || "# Harness Scorecard\n";
  if (!base.endsWith("\n")) base += "\n";
  return base + block;
}

/**
 * Parse last N trajectory headings from log text.
 * @param {string} text
 * @param {number} [n=5]
 * @returns {{ date: string, title: string }[]}
 */
export function listRecentEntries(text, n = 5) {
  const re = /^### (\d{4}-\d{2}-\d{2}) — (.+)$/gm;
  /** @type {{ date: string, title: string }[]} */
  const all = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    all.push({ date: m[1], title: m[2].trim() });
  }
  return all.slice(-n).reverse();
}

/**
 * Resolve path relative to workspace.
 * @param {string} workspace
 * @param {string} relOrAbs
 */
export function resolveLogPath(workspace, relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.join(workspace, relOrAbs);
}

/**
 * Read file or empty string if missing.
 * @param {string} filePath
 */
export function readMaybe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    const e = /** @type {NodeJS.ErrnoException} */ (err);
    if (e.code === "ENOENT") return "";
    throw err;
  }
}

/**
 * Atomic-ish write (write tmp + rename).
 * @param {string} filePath
 * @param {string} contents
 */
export function writeFileAtomic(filePath, contents) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, filePath);
}
