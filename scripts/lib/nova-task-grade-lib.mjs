/**
 * Pure helpers for Nova Task Suite grading (offline, no LLM).
 * Outcome graders over workspace files — Anthropic-style task → outcome.
 */

import fs from "node:fs";
import path from "node:path";

/** @typedef {'ops_status'|'memory_hygiene'|'claim_discipline'|'harness_config'|'continuity'} TaskCategory */
/** @typedef {'pass'|'fail'|'partial'|'error'} GradeStatus */

/**
 * @typedef {object} GraderSpec
 * @property {string} type
 * @property {Record<string, unknown>} [params]
 * @property {number} [weight]
 */

/**
 * @typedef {object} TaskSpec
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} [prompt]
 * @property {GraderSpec[]} graders
 * @property {number} [passThreshold]
 * @property {string} [notes]
 * @property {string} [severity]
 */

/**
 * @typedef {object} SuiteSpec
 * @property {string} version
 * @property {string} [updated]
 * @property {TaskSpec[]} tasks
 */

/**
 * @typedef {object} GraderResult
 * @property {string} type
 * @property {number} weight
 * @property {boolean} passed
 * @property {number} score
 * @property {string} detail
 */

/**
 * @typedef {object} TaskGrade
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {GradeStatus} status
 * @property {number} score
 * @property {number} passThreshold
 * @property {GraderResult[]} graders
 * @property {string} [notes]
 * @property {string} [severity]
 * @property {string} [error]
 */

export const CATEGORIES = Object.freeze([
  "ops_status",
  "memory_hygiene",
  "claim_discipline",
  "harness_config",
  "continuity",
]);

export const GRADER_TYPES = Object.freeze([
  "file_contains",
  "file_not_contains",
  "json_path",
  "regex_in_file",
  "world_state_fire",
  "procedure_rule",
  "composite",
  "file_exists",
  "file_max_bytes",
]);

/**
 * Resolve workspace root (absolute).
 * @param {string} [root]
 * @returns {string}
 */
export function resolveWorkspaceRoot(root) {
  if (root && typeof root === "string" && root.trim()) {
    return path.resolve(root.trim());
  }
  return process.cwd();
}

/**
 * Pad number to 2 digits.
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Local YYYY-MM-DD for today daily substitution.
 * @param {Date} [d]
 * @returns {string}
 */
export function localDateStamp(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Expand path tokens relative to workspace root.
 * Supports `{{today}}` → memory/YYYY-MM-DD.md fragment or date stamp in path.
 * @param {string} fileRel
 * @param {string} workspaceRoot
 * @param {{ today?: string }} [opts]
 * @returns {string} absolute path
 */
export function resolveSuitePath(fileRel, workspaceRoot, opts = {}) {
  const today = opts.today ?? localDateStamp();
  let rel = String(fileRel ?? "").trim();
  if (!rel) throw new Error("empty file path");
  rel = rel.replaceAll("{{today}}", today);
  if (path.isAbsolute(rel)) return path.normalize(rel);
  return path.resolve(workspaceRoot, rel);
}

/**
 * Read UTF-8 file; return null if missing.
 * @param {string} absPath
 * @returns {string | null}
 */
export function readUtf8(absPath) {
  try {
    return fs.readFileSync(absPath, { encoding: "utf8" });
  } catch (err) {
    if (err && /** @type {NodeJS.ErrnoException} */ (err).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

/**
 * Load and validate suite JSON from disk.
 * @param {string} suitePath
 * @returns {SuiteSpec}
 */
export function loadSuite(suitePath) {
  const abs = path.resolve(suitePath);
  const raw = readUtf8(abs);
  if (raw == null) throw new Error(`suite not found: ${abs}`);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`invalid suite JSON: ${abs}: ${err instanceof Error ? err.message : err}`);
  }
  if (!parsed || typeof parsed !== "object") throw new Error("suite must be an object");
  if (!Array.isArray(parsed.tasks)) throw new Error("suite.tasks must be an array");
  for (const t of parsed.tasks) {
    if (!t?.id || !Array.isArray(t.graders)) {
      throw new Error(`invalid task: ${JSON.stringify(t?.id ?? "?")}`);
    }
  }
  return /** @type {SuiteSpec} */ (parsed);
}

/**
 * @param {unknown} needles
 * @returns {string[]}
 */
function asStringList(needles) {
  if (Array.isArray(needles)) return needles.map((n) => String(n));
  if (needles == null) return [];
  return [String(needles)];
}

/**
 * Case-aware includes check.
 * @param {string} hay
 * @param {string} needle
 * @param {boolean} ci
 * @returns {boolean}
 */
function includesNeedle(hay, needle, ci) {
  if (!ci) return hay.includes(needle);
  return hay.toLowerCase().includes(needle.toLowerCase());
}

/**
 * Run file_contains grader.
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeFileContains(params, root, ctx) {
  const file = String(params.file ?? "");
  const needles = asStringList(params.needles ?? params.needle);
  const mode = String(params.mode ?? "all").toLowerCase() === "any" ? "any" : "all";
  const ci = Boolean(params.caseInsensitive ?? true);
  const abs = resolveSuitePath(file, root, ctx);
  const text = readUtf8(abs);
  if (text == null) {
    return {
      type: "file_contains",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing file: ${file}`,
    };
  }
  const hits = needles.map((n) => ({ n, ok: includesNeedle(text, n, ci) }));
  const passed =
    needles.length === 0
      ? false
      : mode === "any"
        ? hits.some((h) => h.ok)
        : hits.every((h) => h.ok);
  const missing = hits.filter((h) => !h.ok).map((h) => h.n);
  return {
    type: "file_contains",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: passed
      ? `found (${mode}) in ${file}`
      : `missing needles in ${file}: ${missing.join(" | ")}`,
  };
}

/**
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeFileNotContains(params, root, ctx) {
  const file = String(params.file ?? "");
  const needles = asStringList(params.needles ?? params.needle);
  const mode = String(params.mode ?? "all").toLowerCase() === "any" ? "any" : "all";
  const ci = Boolean(params.caseInsensitive ?? true);
  const abs = resolveSuitePath(file, root, ctx);
  const text = readUtf8(abs);
  if (text == null) {
    return {
      type: "file_not_contains",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing file: ${file}`,
    };
  }
  const present = needles.filter((n) => includesNeedle(text, n, ci));
  // all: none of the banned needles present; any: at least one absence (odd) — use all default
  const passed =
    mode === "any" ? present.length < needles.length : present.length === 0;
  return {
    type: "file_not_contains",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: passed
      ? `clean of banned needles in ${file}`
      : `forbidden present in ${file}: ${present.join(" | ")}`,
  };
}

/**
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeRegexInFile(params, root, ctx) {
  const file = String(params.file ?? "");
  const pattern = String(params.pattern ?? "");
  const flags = String(params.flags ?? "im");
  const abs = resolveSuitePath(file, root, ctx);
  const text = readUtf8(abs);
  if (text == null) {
    return {
      type: "regex_in_file",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing file: ${file}`,
    };
  }
  let re;
  try {
    re = new RegExp(pattern, flags);
  } catch (err) {
    return {
      type: "regex_in_file",
      weight: 1,
      passed: false,
      score: 0,
      detail: `bad regex: ${err instanceof Error ? err.message : err}`,
    };
  }
  const passed = re.test(text);
  return {
    type: "regex_in_file",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: passed ? `regex matched in ${file}` : `regex no match in ${file}: /${pattern}/${flags}`,
  };
}

/**
 * Dot-path JSON lookup (simple; no array filters).
 * @param {unknown} obj
 * @param {string} dotted
 * @returns {unknown}
 */
export function getJsonPath(obj, dotted) {
  const parts = String(dotted ?? "")
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = /** @type {Record<string, unknown>} */ (cur)[p];
  }
  return cur;
}

/**
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeJsonPath(params, root, ctx) {
  const file = String(params.file ?? "");
  const jpath = String(params.path ?? params.jsonPath ?? "");
  const abs = resolveSuitePath(file, root, ctx);
  const text = readUtf8(abs);
  if (text == null) {
    return {
      type: "json_path",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing file: ${file}`,
    };
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return {
      type: "json_path",
      weight: 1,
      passed: false,
      score: 0,
      detail: `invalid JSON ${file}: ${err instanceof Error ? err.message : err}`,
    };
  }
  const value = getJsonPath(data, jpath);
  let passed = false;
  let detail = "";
  if (Object.prototype.hasOwnProperty.call(params, "equals")) {
    passed = JSON.stringify(value) === JSON.stringify(params.equals);
    detail = passed
      ? `${jpath} === ${JSON.stringify(params.equals)}`
      : `${jpath} got ${JSON.stringify(value)}, want ${JSON.stringify(params.equals)}`;
  } else if (params.exists === false) {
    passed = value === undefined;
    detail = passed ? `${jpath} absent` : `${jpath} unexpectedly present`;
  } else {
    passed = value !== undefined && value !== null;
    detail = passed ? `${jpath} exists` : `${jpath} missing`;
  }
  return {
    type: "json_path",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: `${file}: ${detail}`,
  };
}

/**
 * Check WORLD_STATE.md for a fire/status row matching pattern(s).
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeWorldStateFire(params, root, ctx) {
  const file = String(params.file ?? "WORLD_STATE.md");
  const pattern = String(params.pattern ?? "");
  const flags = String(params.flags ?? "im");
  const needles = asStringList(params.needles);
  const abs = resolveSuitePath(file, root, ctx);
  const text = readUtf8(abs);
  if (text == null) {
    return {
      type: "world_state_fire",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing ${file}`,
    };
  }
  let passed = false;
  let detail = "";
  if (pattern) {
    try {
      const re = new RegExp(pattern, flags);
      passed = re.test(text);
      detail = passed ? `fire pattern matched` : `fire pattern miss: /${pattern}/${flags}`;
    } catch (err) {
      return {
        type: "world_state_fire",
        weight: 1,
        passed: false,
        score: 0,
        detail: `bad regex: ${err instanceof Error ? err.message : err}`,
      };
    }
  } else if (needles.length) {
    const mode = String(params.mode ?? "all").toLowerCase() === "any" ? "any" : "all";
    const ci = Boolean(params.caseInsensitive ?? true);
    const hits = needles.map((n) => includesNeedle(text, n, ci));
    passed = mode === "any" ? hits.some(Boolean) : hits.every(Boolean);
    detail = passed ? `fire needles ok (${mode})` : `fire needles miss`;
  } else {
    detail = "world_state_fire requires pattern or needles";
  }
  return {
    type: "world_state_fire",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: `${file}: ${detail}`,
  };
}

/**
 * Procedure / claim-discipline rule check (regex or needles in procedural file).
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeProcedureRule(params, root, ctx) {
  const file = String(params.file ?? "memory/procedural-memory-v1.md");
  const pattern = String(params.pattern ?? "");
  const flags = String(params.flags ?? "im");
  const needles = asStringList(params.needles);
  const mode = String(params.mode ?? "all").toLowerCase() === "any" ? "any" : "all";
  const ci = Boolean(params.caseInsensitive ?? true);
  const abs = resolveSuitePath(file, root, ctx);
  const text = readUtf8(abs);
  if (text == null) {
    return {
      type: "procedure_rule",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing ${file}`,
    };
  }
  if (pattern) {
    let re;
    try {
      re = new RegExp(pattern, flags);
    } catch (err) {
      return {
        type: "procedure_rule",
        weight: 1,
        passed: false,
        score: 0,
        detail: `bad regex: ${err instanceof Error ? err.message : err}`,
      };
    }
    const passed = re.test(text);
    return {
      type: "procedure_rule",
      weight: 1,
      passed,
      score: passed ? 1 : 0,
      detail: passed ? `procedure pattern ok in ${file}` : `procedure pattern miss in ${file}`,
    };
  }
  const hits = needles.map((n) => includesNeedle(text, n, ci));
  const passed =
    needles.length > 0 && (mode === "any" ? hits.some(Boolean) : hits.every(Boolean));
  return {
    type: "procedure_rule",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: passed
      ? `procedure needles ok (${mode}) in ${file}`
      : `procedure needles miss in ${file}`,
  };
}

/**
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeFileExists(params, root, ctx) {
  const file = String(params.file ?? "");
  const abs = resolveSuitePath(file, root, ctx);
  const passed = fs.existsSync(abs) && fs.statSync(abs).isFile();
  return {
    type: "file_exists",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: passed ? `exists: ${file}` : `missing: ${file}`,
  };
}

/**
 * @param {Record<string, unknown>} params
 * @param {string} root
 * @param {{ today?: string }} ctx
 * @returns {GraderResult}
 */
function gradeFileMaxBytes(params, root, ctx) {
  const file = String(params.file ?? "");
  const maxBytes = Number(params.maxBytes ?? params.max);
  const abs = resolveSuitePath(file, root, ctx);
  if (!fs.existsSync(abs)) {
    return {
      type: "file_max_bytes",
      weight: 1,
      passed: false,
      score: 0,
      detail: `missing: ${file}`,
    };
  }
  const size = fs.statSync(abs).size;
  const passed = Number.isFinite(maxBytes) && size <= maxBytes;
  return {
    type: "file_max_bytes",
    weight: 1,
    passed,
    score: passed ? 1 : 0,
    detail: `${file}: ${size}B ${passed ? "≤" : ">"} ${maxBytes}B`,
  };
}

/**
 * Run a single grader (recursive for composite).
 * @param {GraderSpec} grader
 * @param {string} workspaceRoot
 * @param {{ today?: string }} [ctx]
 * @returns {GraderResult}
 */
export function runGrader(grader, workspaceRoot, ctx = {}) {
  const type = String(grader?.type ?? "");
  const weight = Number(grader?.weight ?? 1);
  const w = Number.isFinite(weight) && weight > 0 ? weight : 1;
  const params = /** @type {Record<string, unknown>} */ (grader?.params ?? {});
  const root = resolveWorkspaceRoot(workspaceRoot);

  /** @type {GraderResult} */
  let result;
  try {
    switch (type) {
      case "file_contains":
        result = gradeFileContains(params, root, ctx);
        break;
      case "file_not_contains":
        result = gradeFileNotContains(params, root, ctx);
        break;
      case "regex_in_file":
        result = gradeRegexInFile(params, root, ctx);
        break;
      case "json_path":
        result = gradeJsonPath(params, root, ctx);
        break;
      case "world_state_fire":
        result = gradeWorldStateFire(params, root, ctx);
        break;
      case "procedure_rule":
        result = gradeProcedureRule(params, root, ctx);
        break;
      case "file_exists":
        result = gradeFileExists(params, root, ctx);
        break;
      case "file_max_bytes":
        result = gradeFileMaxBytes(params, root, ctx);
        break;
      case "composite": {
        const mode = String(params.mode ?? "all").toLowerCase() === "any" ? "any" : "all";
        const children = Array.isArray(params.graders) ? params.graders : [];
        /** @type {GraderResult[]} */
        const childResults = children.map((g) =>
          runGrader(/** @type {GraderSpec} */ (g), root, ctx),
        );
        if (childResults.length === 0) {
          result = {
            type: "composite",
            weight: 1,
            passed: false,
            score: 0,
            detail: "composite has no child graders",
          };
          break;
        }
        const totalW = childResults.reduce((s, r) => s + (r.weight || 1), 0);
        const earned = childResults.reduce(
          (s, r) => s + (r.passed ? r.weight || 1 : 0),
          0,
        );
        const allPass = childResults.every((r) => r.passed);
        const anyPass = childResults.some((r) => r.passed);
        const passed = mode === "any" ? anyPass : allPass;
        const score =
          mode === "any"
            ? passed
              ? 1
              : 0
            : totalW
              ? earned / totalW
              : 0;
        result = {
          type: "composite",
          weight: 1,
          passed,
          score,
          detail: `composite(${mode}): ${childResults.filter((r) => r.passed).length}/${childResults.length} — ${childResults.map((r) => `${r.type}:${r.passed ? "P" : "F"}`).join(", ")}`,
        };
        break;
      }
      default:
        result = {
          type: type || "unknown",
          weight: 1,
          passed: false,
          score: 0,
          detail: `unknown grader type: ${type}`,
        };
    }
  } catch (err) {
    result = {
      type: type || "error",
      weight: 1,
      passed: false,
      score: 0,
      detail: `grader error: ${err instanceof Error ? err.message : err}`,
    };
  }

  return { ...result, weight: w, score: result.passed || result.score > 0 ? result.score : result.score };
}

/**
 * Grade one task; weighted average of grader scores vs passThreshold.
 * @param {TaskSpec} task
 * @param {string} workspaceRoot
 * @param {{ today?: string }} [ctx]
 * @returns {TaskGrade}
 */
export function gradeTask(task, workspaceRoot, ctx = {}) {
  const threshold =
    Number.isFinite(Number(task.passThreshold)) ? Number(task.passThreshold) : 1.0;
  try {
    const graders = Array.isArray(task.graders) ? task.graders : [];
    if (graders.length === 0) {
      return {
        id: task.id,
        name: task.name ?? task.id,
        category: task.category ?? "",
        status: "error",
        score: 0,
        passThreshold: threshold,
        graders: [],
        notes: task.notes,
        severity: task.severity,
        error: "no graders",
      };
    }
    /** @type {GraderResult[]} */
    const results = graders.map((g) => runGrader(g, workspaceRoot, ctx));
    const totalW = results.reduce((s, r) => s + (r.weight || 1), 0);
    const earned = results.reduce((s, r) => {
      const w = r.weight || 1;
      // Prefer explicit score (composite may be fractional); else pass→1
      const unit = typeof r.score === "number" ? r.score : r.passed ? 1 : 0;
      return s + unit * w;
    }, 0);
    const score = totalW ? earned / totalW : 0;
    /** @type {GradeStatus} */
    let status;
    if (score + 1e-9 >= threshold) status = "pass";
    else if (score > 0) status = "partial";
    else status = "fail";

    return {
      id: task.id,
      name: task.name ?? task.id,
      category: task.category ?? "",
      status,
      score,
      passThreshold: threshold,
      graders: results,
      notes: task.notes,
      severity: task.severity,
    };
  } catch (err) {
    return {
      id: task.id,
      name: task.name ?? task.id,
      category: task.category ?? "",
      status: "error",
      score: 0,
      passThreshold: threshold,
      graders: [],
      notes: task.notes,
      severity: task.severity,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Rollup task grades into summary + byCategory.
 * @param {TaskGrade[]} taskGrades
 * @returns {{
 *   passed: number,
 *   failed: number,
 *   partial: number,
 *   errored: number,
 *   total: number,
 *   passRate: number,
 *   byCategory: Record<string, { passed: number, failed: number, partial: number, errored: number, total: number, passRate: number }>
 * }}
 */
export function rollup(taskGrades) {
  const list = Array.isArray(taskGrades) ? taskGrades : [];

  function bucket(subset) {
    const passed = subset.filter((t) => t.status === "pass").length;
    const failed = subset.filter((t) => t.status === "fail").length;
    const partial = subset.filter((t) => t.status === "partial").length;
    const errored = subset.filter((t) => t.status === "error").length;
    const total = subset.length;
    return {
      passed,
      failed,
      partial,
      errored,
      total,
      passRate: total ? passed / total : 0,
    };
  }

  const overall = bucket(list);
  /** @type {Record<string, ReturnType<typeof bucket>>} */
  const byCategory = {};
  const cats = new Set([
    ...CATEGORIES,
    ...list.map((t) => t.category).filter(Boolean),
  ]);
  for (const cat of cats) {
    const subset = list.filter((t) => t.category === cat);
    if (subset.length === 0) continue;
    byCategory[cat] = bucket(subset);
  }
  return { ...overall, byCategory };
}

/**
 * Format markdown report.
 * @param {{
 *   suiteVersion?: string,
 *   suitePath?: string,
 *   workspaceRoot?: string,
 *   generatedAt?: string,
 *   tasks: TaskGrade[],
 *   summary: ReturnType<typeof rollup>
 * }} report
 * @returns {string}
 */
export function formatReport(report) {
  const s = report.summary;
  const lines = [];
  lines.push(`# Nova Task Suite Report`);
  lines.push("");
  lines.push(`- **Generated:** ${report.generatedAt ?? new Date().toISOString()}`);
  lines.push(`- **Suite:** ${report.suitePath ?? "(unknown)"} (${report.suiteVersion ?? "?"})`);
  lines.push(`- **Workspace root:** ${report.workspaceRoot ?? "(cwd)"}`);
  lines.push(
    `- **Rollup:** pass ${s.passed}/${s.total} (${(s.passRate * 100).toFixed(0)}%) · fail ${s.failed} · partial ${s.partial} · error ${s.errored}`,
  );
  lines.push("");
  lines.push(`## By category`);
  lines.push("");
  lines.push(`| Category | Pass | Fail | Partial | Error | Total | Pass rate |`);
  lines.push(`|----------|------|------|---------|-------|-------|-----------|`);
  for (const [cat, b] of Object.entries(s.byCategory ?? {})) {
    lines.push(
      `| ${cat} | ${b.passed} | ${b.failed} | ${b.partial} | ${b.errored} | ${b.total} | ${(b.passRate * 100).toFixed(0)}% |`,
    );
  }
  lines.push("");
  lines.push(`## Tasks`);
  lines.push("");
  for (const t of report.tasks) {
    const mark =
      t.status === "pass" ? "PASS" : t.status === "partial" ? "PARTIAL" : t.status === "error" ? "ERROR" : "FAIL";
    lines.push(`### ${t.id} — ${t.name} · **${mark}**`);
    lines.push("");
    lines.push(
      `- Category: \`${t.category}\` · score ${(t.score * 100).toFixed(0)}% (threshold ${(t.passThreshold * 100).toFixed(0)}%)${t.severity ? ` · severity: ${t.severity}` : ""}`,
    );
    if (t.error) lines.push(`- Error: ${t.error}`);
    if (t.notes) lines.push(`- Notes: ${t.notes}`);
    lines.push(`- Graders:`);
    for (const g of t.graders) {
      lines.push(
        `  - \`${g.type}\` w=${g.weight} → ${g.passed ? "pass" : "fail"} (score ${g.score.toFixed(2)}): ${g.detail}`,
      );
    }
    lines.push("");
  }
  lines.push(`## Philosophy`);
  lines.push("");
  lines.push(`Outcome > vibes. Failures that match live drift are honest signal, not grader bugs.`);
  lines.push("");
  return lines.join("\n");
}

/**
 * Build JSON summary object for --json.
 * @param {TaskGrade[]} tasks
 * @param {ReturnType<typeof rollup>} summary
 * @returns {object}
 */
export function toJsonSummary(tasks, summary) {
  return {
    passed: summary.passed,
    failed: summary.failed,
    partial: summary.partial,
    errored: summary.errored,
    total: summary.total,
    passRate: summary.passRate,
    byCategory: summary.byCategory,
    tasks: tasks.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      status: t.status,
      score: t.score,
      passThreshold: t.passThreshold,
      severity: t.severity,
      error: t.error ?? null,
      graders: t.graders.map((g) => ({
        type: g.type,
        weight: g.weight,
        passed: g.passed,
        score: g.score,
        detail: g.detail,
      })),
    })),
  };
}
