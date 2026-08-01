/**
 * SWV dry harness — Scout→Worker→Verifier templates + mechanical acceptance.
 * Pure offline helpers. Does not spawn agents.
 */

import fs from "node:fs";
import path from "node:path";

export const ROLES = Object.freeze(["scout", "worker", "verifier"]);

export const REQUIRED_TEMPLATE_VARS = Object.freeze([
  "TASK_ID",
  "OBJECTIVE",
  "SCOPE_PATHS",
  "OUT_OF_SCOPE",
  "EVIDENCE_REQUIRED",
  "ACCEPTANCE",
  "MODEL_HINT",
  "PARENT_REF",
]);

export const REQUIRED_TASK_FIELDS = Object.freeze([
  "taskId",
  "title",
  "objective",
  "scopePaths",
  "outOfScope",
  "evidenceRequired",
  "acceptance",
  "modelHints",
  "parentRef",
]);

export const DEFAULT_TEMPLATE_DIR = "memory/evals/swv/templates";
export const DEFAULT_RUNS_DIR = "memory/cursor-jobs/swv-runs";

const VAR_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

/**
 * @param {string} workspaceRoot
 * @param {string} relOrAbs
 */
export function resolvePath(workspaceRoot, relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.resolve(workspaceRoot, relOrAbs);
}

/**
 * @param {unknown} v
 * @returns {string[]}
 */
export function asStringList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (v == null || v === "") return [];
  return String(v)
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Bullet list for markdown templates.
 * @param {string[]} items
 */
export function formatBulletList(items) {
  if (!items.length) return "- (none)";
  return items.map((i) => `- ${i}`).join("\n");
}

/**
 * Numbered list for acceptance items.
 * @param {string[]} items
 */
export function formatNumberedList(items) {
  if (!items.length) return "1. (none)";
  return items.map((i, idx) => `${idx + 1}. ${i}`).join("\n");
}

/**
 * Validate task object shape.
 * @param {unknown} raw
 * @returns {{ ok: true, value: object } | { ok: false, errors: string[] }}
 */
export function validateTask(raw) {
  /** @type {string[]} */
  const errors = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["task must be a JSON object"] };
  }
  /** @type {Record<string, unknown>} */
  const t = /** @type {Record<string, unknown>} */ (raw);

  for (const key of REQUIRED_TASK_FIELDS) {
    if (t[key] === undefined || t[key] === null || t[key] === "") {
      errors.push(`missing required field: ${key}`);
    }
  }

  if (typeof t.taskId !== "string" || !String(t.taskId).trim()) {
    errors.push("taskId must be a non-empty string");
  }
  if (typeof t.title !== "string" || !String(t.title).trim()) {
    errors.push("title must be a non-empty string");
  }
  if (typeof t.objective !== "string" || !String(t.objective).trim()) {
    errors.push("objective must be a non-empty string");
  }
  if (typeof t.parentRef !== "string" || !String(t.parentRef).trim()) {
    errors.push("parentRef must be a non-empty string");
  }

  for (const listKey of ["scopePaths", "outOfScope", "evidenceRequired", "acceptance"]) {
    const list = asStringList(t[listKey]);
    if (list.length === 0) errors.push(`${listKey} must be a non-empty array/list`);
  }

  const hints = t.modelHints;
  if (!hints || typeof hints !== "object" || Array.isArray(hints)) {
    errors.push("modelHints must be an object with scout/worker/verifier");
  } else {
    for (const role of ROLES) {
      const h = /** @type {Record<string, unknown>} */ (hints)[role];
      if (typeof h !== "string" || !h.trim()) {
        errors.push(`modelHints.${role} must be a non-empty string`);
      }
    }
  }

  // Soft forbidden-path hygiene: sample tasks should list hard outs
  const outs = asStringList(t.outOfScope).map((s) => s.toLowerCase());
  for (const must of ["openclaw.json", "wallet", "secrets"]) {
    if (!outs.some((o) => o.includes(must))) {
      errors.push(`outOfScope should mention "${must}"`);
    }
  }

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      taskId: String(t.taskId).trim(),
      title: String(t.title).trim(),
      objective: String(t.objective).trim(),
      scopePaths: asStringList(t.scopePaths),
      outOfScope: asStringList(t.outOfScope),
      evidenceRequired: asStringList(t.evidenceRequired),
      acceptance: asStringList(t.acceptance),
      modelHints: {
        scout: String(/** @type {Record<string, unknown>} */ (hints).scout).trim(),
        worker: String(/** @type {Record<string, unknown>} */ (hints).worker).trim(),
        verifier: String(/** @type {Record<string, unknown>} */ (hints).verifier).trim(),
      },
      parentRef: String(t.parentRef).trim(),
    },
  };
}

/**
 * @param {string} filePath
 */
export function loadTaskFile(filePath) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    throw new Error(`cannot read task file: ${filePath} (${/** @type {Error} */ (err).message})`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`invalid JSON in ${filePath}: ${/** @type {Error} */ (err).message}`);
  }
  return validateTask(parsed);
}

/**
 * Build {{VAR}} map for a role.
 * @param {object} task
 * @param {string} role
 */
export function buildVars(task, role) {
  const r = String(role || "").toLowerCase();
  if (!ROLES.includes(r)) {
    throw new Error(`role must be one of: ${ROLES.join(" | ")}`);
  }
  /** @type {Record<string, string>} */
  const hints = task.modelHints || {};
  return {
    TASK_ID: String(task.taskId),
    TITLE: String(task.title),
    OBJECTIVE: String(task.objective),
    SCOPE_PATHS: formatBulletList(task.scopePaths),
    OUT_OF_SCOPE: formatBulletList(task.outOfScope),
    EVIDENCE_REQUIRED: formatBulletList(task.evidenceRequired),
    ACCEPTANCE: formatNumberedList(task.acceptance),
    MODEL_HINT: String(hints[r] || ""),
    PARENT_REF: String(task.parentRef),
    ROLE: r,
  };
}

/**
 * Replace {{VAR}} tokens. Unknown vars left intact.
 * @param {string} template
 * @param {Record<string, string>} vars
 */
export function renderTemplate(template, vars) {
  return String(template).replace(VAR_RE, (full, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) return vars[name];
    return full;
  });
}

/**
 * Find leftover {{VAR}} names in text.
 * @param {string} text
 * @returns {string[]}
 */
export function findLeftoverVars(text) {
  /** @type {string[]} */
  const found = [];
  const re = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!found.includes(m[1])) found.push(m[1]);
  }
  return found;
}

/**
 * Leftover vars that are in the required set.
 * @param {string} text
 */
export function findLeftoverRequiredVars(text) {
  return findLeftoverVars(text).filter((v) => REQUIRED_TEMPLATE_VARS.includes(v));
}

/**
 * @param {string} templateDir
 * @param {"scout"|"worker"|"verifier"|"checklist"} kind
 */
export function templateFileName(kind) {
  if (kind === "checklist") return "acceptance-checklist.md";
  return `${kind}-brief.md`;
}

/**
 * @param {string} templateDir
 * @param {"scout"|"worker"|"verifier"|"checklist"} kind
 */
export function loadTemplate(templateDir, kind) {
  const file = path.join(templateDir, templateFileName(kind));
  try {
    return fs.readFileSync(file, "utf8");
  } catch (err) {
    throw new Error(`cannot read template: ${file} (${/** @type {Error} */ (err).message})`);
  }
}

/**
 * @param {object} task
 * @param {string} role
 * @param {string} templateDir
 */
export function renderRole(task, role, templateDir) {
  const vars = buildVars(task, role);
  const tpl = loadTemplate(templateDir, /** @type {"scout"|"worker"|"verifier"} */ (role));
  const text = renderTemplate(tpl, vars);
  const leftoverRequired = findLeftoverRequiredVars(text);
  const leftover = findLeftoverVars(text);
  return { role, text, vars, leftoverRequired, leftover };
}

/**
 * @param {object} task
 * @param {string} templateDir
 */
export function renderChecklist(task, templateDir) {
  const vars = buildVars(task, "verifier");
  const tpl = loadTemplate(templateDir, "checklist");
  const text = renderTemplate(tpl, vars);
  const leftoverRequired = findLeftoverRequiredVars(text);
  const leftover = findLeftoverVars(text);
  return { text, vars, leftoverRequired, leftover };
}

/**
 * @param {object} task
 * @param {string} templateDir
 */
export function renderAll(task, templateDir) {
  /** @type {Record<string, ReturnType<typeof renderRole>>} */
  const roles = {};
  for (const role of ROLES) {
    roles[role] = renderRole(task, role, templateDir);
  }
  const checklist = renderChecklist(task, templateDir);
  return { roles, checklist };
}

/**
 * Local stamp YYYYMMDD-HHMMSS
 * @param {Date} [d]
 */
export function localStamp(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}${m}${day}-${hh}${mm}${ss}`;
}

/**
 * @param {object} task
 * @param {string} [stamp]
 */
export function defaultRunId(task, stamp = localStamp()) {
  const id = String(task.taskId || "SWV")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
  return `${id}-${stamp}`;
}

/**
 * Empty evidence stub markdown.
 * @param {string} role
 * @param {object} task
 */
export function evidenceStub(role, task) {
  return `# ${role} evidence — ${task.taskId}

**Status:** empty stub (dry harness)
**Parent:** ${task.parentRef}

## Paths read / changed

- (fill in)

## Commands + exits

- (fill in)

## Notes

- CLI does not auto-spawn agents. Paste briefs into OpenClaw \`sessions_spawn\` manually.
`;
}

/**
 * Plan files for init-run (no write).
 * @param {object} opts
 * @param {object} opts.task
 * @param {string} opts.runDir
 * @param {string} opts.templateDir
 */
export function planInitRun({ task, runDir, templateDir }) {
  const rendered = renderAll(task, templateDir);
  /** @type {{ rel: string, contents: string }[]} */
  const files = [];

  files.push({
    rel: "task.json",
    contents: JSON.stringify(task, null, 2) + "\n",
  });
  files.push({
    rel: "meta.json",
    contents:
      JSON.stringify(
        {
          taskId: task.taskId,
          runDir,
          createdAt: new Date().toISOString(),
          note: "SWV dry harness — CLI does not auto-spawn agents",
        },
        null,
        2,
      ) + "\n",
  });

  for (const role of ROLES) {
    files.push({
      rel: `${role}-brief.md`,
      contents: rendered.roles[role].text.endsWith("\n")
        ? rendered.roles[role].text
        : rendered.roles[role].text + "\n",
    });
    files.push({
      rel: `evidence/${role}.md`,
      contents: evidenceStub(role, task),
    });
  }

  files.push({
    rel: "checklist.md",
    contents: rendered.checklist.text.endsWith("\n")
      ? rendered.checklist.text
      : rendered.checklist.text + "\n",
  });

  /** @type {string[]} */
  const leftoverRequired = [];
  for (const role of ROLES) {
    leftoverRequired.push(...rendered.roles[role].leftoverRequired.map((v) => `${role}:${v}`));
  }
  leftoverRequired.push(...rendered.checklist.leftoverRequired.map((v) => `checklist:${v}`));

  return { files, rendered, leftoverRequired };
}

/**
 * Write planned files under runDir.
 * @param {string} runDir
 * @param {{ rel: string, contents: string }[]} files
 */
export function writeInitRun(runDir, files) {
  fs.mkdirSync(runDir, { recursive: true });
  fs.mkdirSync(path.join(runDir, "evidence"), { recursive: true });
  /** @type {string[]} */
  const written = [];
  for (const f of files) {
    const abs = path.join(runDir, f.rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, f.contents, "utf8");
    written.push(abs);
  }
  return written;
}
