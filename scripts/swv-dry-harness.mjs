#!/usr/bin/env node
/**
 * SWV dry harness CLI — prepare Scout/Worker/Verifier briefs + checklist.
 * Does NOT auto-spawn agents (OpenClaw sessions_spawn stays in agent runtime).
 *
 * Usage:
 *   node scripts/swv-dry-harness.mjs --help
 *   node scripts/swv-dry-harness.mjs validate --task memory/evals/swv/fixtures/sample-task.json
 *   node scripts/swv-dry-harness.mjs render --task ... --role scout|worker|verifier
 *   node scripts/swv-dry-harness.mjs render-all --task ... [--out-dir ...]
 *   node scripts/swv-dry-harness.mjs checklist --task ... [--report ...]
 *   node scripts/swv-dry-harness.mjs init-run --task ...
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROLES,
  DEFAULT_TEMPLATE_DIR,
  DEFAULT_RUNS_DIR,
  resolvePath,
  loadTaskFile,
  renderRole,
  renderAll,
  renderChecklist,
  defaultRunId,
  planInitRun,
  writeInitRun,
} from "./lib/swv-dry-harness-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`Usage: node scripts/swv-dry-harness.mjs <command> [options]

Scout→Worker→Verifier dry harness (v0). Prepares + grades briefs.
Does NOT auto-spawn agents — paste rendered briefs into OpenClaw sessions_spawn.

Commands:
  validate     Validate task JSON structure
  render       Render one role brief to stdout
  render-all   Render scout/worker/verifier (+ checklist) to out-dir or stdout
  checklist    Render acceptance checklist (optional --report write)
  init-run     Create run dir + rendered briefs + empty evidence stubs

Options:
  --task PATH           Task JSON (required for all commands except --help)
  --role ROLE           scout | worker | verifier (required for render)
  --out-dir PATH        Output directory (render-all / init-run)
  --report PATH         Write checklist markdown to PATH
  --template-dir PATH   Templates dir (default: ${DEFAULT_TEMPLATE_DIR})
  --run-id ID           Override run id for init-run
  --json                Machine-readable stdout where applicable
  --help, -h            Show this help

Exit codes:
  0  ok
  1  validation fail / leftover required {{VAR}}
  2  usage / infra error

Examples:
  node scripts/swv-dry-harness.mjs validate --task memory/evals/swv/fixtures/sample-task.json
  node scripts/swv-dry-harness.mjs render --task memory/evals/swv/fixtures/sample-task.json --role scout
  node scripts/swv-dry-harness.mjs init-run --task memory/evals/swv/fixtures/sample-task.json
`);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, unknown>} */
  const args = {
    help: false,
    json: false,
    command: "",
    task: "",
    role: "",
    outDir: "",
    report: "",
    templateDir: DEFAULT_TEMPLATE_DIR,
    runId: "",
  };

  const positionals = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} requires a value`);
      return v;
    };
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--json") args.json = true;
    else if (a === "--task") args.task = next();
    else if (a === "--role") args.role = next();
    else if (a === "--out-dir") args.outDir = next();
    else if (a === "--report") args.report = next();
    else if (a === "--template-dir") args.templateDir = next();
    else if (a === "--run-id") args.runId = next();
    else if (a.startsWith("-")) throw new Error(`Unknown argument: ${a}`);
    else positionals.push(a);
  }

  if (!args.command && positionals.length) {
    args.command = positionals.shift() || "";
  }
  if (positionals.length) {
    throw new Error(`Unexpected arguments: ${positionals.join(" ")}`);
  }
  return args;
}

/**
 * @param {Record<string, unknown>} args
 */
function loadValidatedTask(args) {
  const taskPath = String(args.task || "");
  if (!taskPath) throw Object.assign(new Error("--task is required"), { code: "usage" });
  const abs = resolvePath(WORKSPACE, taskPath);
  const result = loadTaskFile(abs);
  if (!result.ok) {
    return { ok: false, errors: result.errors, path: abs };
  }
  return { ok: true, task: result.value, path: abs };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`swv-dry-harness: ${/** @type {Error} */ (err).message}`);
    printHelp();
    process.exit(2);
  }

  if (args.help || !args.command) {
    printHelp();
    process.exit(args.help ? 0 : 2);
  }

  const templateDir = resolvePath(WORKSPACE, String(args.templateDir));
  const cmd = String(args.command);

  try {
    if (cmd === "validate") {
      const loaded = loadValidatedTask(args);
      if (!loaded.ok) {
        if (args.json) {
          console.log(JSON.stringify({ ok: false, errors: loaded.errors, path: loaded.path }, null, 2));
        } else {
          console.error("swv-dry-harness: validation failed:");
          for (const e of loaded.errors || []) console.error(`  - ${e}`);
        }
        process.exit(1);
      }
      if (args.json) {
        console.log(JSON.stringify({ ok: true, path: loaded.path, taskId: loaded.task.taskId }, null, 2));
      } else {
        console.log(`swv-dry-harness: validate OK — ${loaded.task.taskId}`);
        console.log(`path: ${loaded.path}`);
      }
      process.exit(0);
    }

    if (cmd === "render") {
      const loaded = loadValidatedTask(args);
      if (!loaded.ok) {
        console.error("swv-dry-harness: validation failed:");
        for (const e of loaded.errors || []) console.error(`  - ${e}`);
        process.exit(1);
      }
      const role = String(args.role || "").toLowerCase();
      if (!ROLES.includes(role)) {
        console.error(`swv-dry-harness: --role must be one of: ${ROLES.join(" | ")}`);
        process.exit(2);
      }
      const out = renderRole(loaded.task, role, templateDir);
      if (out.leftoverRequired.length) {
        console.error(
          `swv-dry-harness: leftover required vars: ${out.leftoverRequired.join(", ")}`,
        );
        process.exit(1);
      }
      if (args.json) {
        console.log(
          JSON.stringify(
            {
              ok: true,
              role,
              leftover: out.leftover,
              leftoverRequired: out.leftoverRequired,
              text: out.text,
            },
            null,
            2,
          ),
        );
      } else {
        process.stdout.write(out.text.endsWith("\n") ? out.text : out.text + "\n");
      }
      process.exit(0);
    }

    if (cmd === "render-all") {
      const loaded = loadValidatedTask(args);
      if (!loaded.ok) {
        console.error("swv-dry-harness: validation failed:");
        for (const e of loaded.errors || []) console.error(`  - ${e}`);
        process.exit(1);
      }
      const all = renderAll(loaded.task, templateDir);
      /** @type {string[]} */
      const leftoverRequired = [];
      for (const role of ROLES) {
        leftoverRequired.push(
          ...all.roles[role].leftoverRequired.map((v) => `${role}:${v}`),
        );
      }
      leftoverRequired.push(...all.checklist.leftoverRequired.map((v) => `checklist:${v}`));
      if (leftoverRequired.length) {
        console.error(`swv-dry-harness: leftover required vars: ${leftoverRequired.join(", ")}`);
        process.exit(1);
      }

      const outDirArg = String(args.outDir || "");
      if (outDirArg) {
        const outDir = resolvePath(WORKSPACE, outDirArg);
        fs.mkdirSync(outDir, { recursive: true });
        /** @type {string[]} */
        const written = [];
        for (const role of ROLES) {
          const p = path.join(outDir, `${role}-brief.md`);
          const text = all.roles[role].text.endsWith("\n")
            ? all.roles[role].text
            : all.roles[role].text + "\n";
          fs.writeFileSync(p, text, "utf8");
          written.push(p);
        }
        const cp = path.join(outDir, "checklist.md");
        const ct = all.checklist.text.endsWith("\n")
          ? all.checklist.text
          : all.checklist.text + "\n";
        fs.writeFileSync(cp, ct, "utf8");
        written.push(cp);
        if (args.json) {
          console.log(JSON.stringify({ ok: true, outDir, written }, null, 2));
        } else {
          console.log(`swv-dry-harness: render-all → ${outDir}`);
          for (const w of written) console.log(`  wrote ${w}`);
        }
      } else {
        if (args.json) {
          console.log(
            JSON.stringify(
              {
                ok: true,
                scout: all.roles.scout.text,
                worker: all.roles.worker.text,
                verifier: all.roles.verifier.text,
                checklist: all.checklist.text,
              },
              null,
              2,
            ),
          );
        } else {
          for (const role of ROLES) {
            console.log(`\n===== ${role.toUpperCase()} =====\n`);
            process.stdout.write(
              all.roles[role].text.endsWith("\n")
                ? all.roles[role].text
                : all.roles[role].text + "\n",
            );
          }
          console.log(`\n===== CHECKLIST =====\n`);
          process.stdout.write(
            all.checklist.text.endsWith("\n")
              ? all.checklist.text
              : all.checklist.text + "\n",
          );
        }
      }
      process.exit(0);
    }

    if (cmd === "checklist") {
      const loaded = loadValidatedTask(args);
      if (!loaded.ok) {
        console.error("swv-dry-harness: validation failed:");
        for (const e of loaded.errors || []) console.error(`  - ${e}`);
        process.exit(1);
      }
      const out = renderChecklist(loaded.task, templateDir);
      if (out.leftoverRequired.length) {
        console.error(
          `swv-dry-harness: leftover required vars: ${out.leftoverRequired.join(", ")}`,
        );
        process.exit(1);
      }
      const text = out.text.endsWith("\n") ? out.text : out.text + "\n";
      const report = String(args.report || "");
      if (report) {
        const reportPath = resolvePath(WORKSPACE, report);
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, text, "utf8");
        if (!args.json) console.error(`wrote report: ${reportPath}`);
      }
      if (args.json) {
        console.log(
          JSON.stringify(
            { ok: true, report: report || null, leftoverRequired: out.leftoverRequired, text },
            null,
            2,
          ),
        );
      } else if (!report) {
        process.stdout.write(text);
      } else {
        console.log(`swv-dry-harness: checklist OK — ${loaded.task.taskId}`);
      }
      process.exit(0);
    }

    if (cmd === "init-run") {
      const loaded = loadValidatedTask(args);
      if (!loaded.ok) {
        console.error("swv-dry-harness: validation failed:");
        for (const e of loaded.errors || []) console.error(`  - ${e}`);
        process.exit(1);
      }
      const runId = String(args.runId || "") || defaultRunId(loaded.task);
      const outDirArg = String(args.outDir || "") || path.join(DEFAULT_RUNS_DIR, runId);
      const runDir = resolvePath(WORKSPACE, outDirArg);
      const plan = planInitRun({
        task: loaded.task,
        runDir,
        templateDir,
      });
      if (plan.leftoverRequired.length) {
        console.error(
          `swv-dry-harness: leftover required vars: ${plan.leftoverRequired.join(", ")}`,
        );
        process.exit(1);
      }
      const written = writeInitRun(runDir, plan.files);
      if (args.json) {
        console.log(JSON.stringify({ ok: true, runId, runDir, written }, null, 2));
      } else {
        console.log(`swv-dry-harness: init-run OK — ${runId}`);
        console.log(`runDir: ${runDir}`);
        for (const w of written) console.log(`  wrote ${path.relative(WORKSPACE, w)}`);
        console.log("note: CLI does not auto-spawn agents");
      }
      process.exit(0);
    }

    console.error(`swv-dry-harness: unknown command: ${cmd}`);
    printHelp();
    process.exit(2);
  } catch (err) {
    const e = /** @type {Error & { code?: string }} */ (err);
    console.error(`swv-dry-harness: ${e.message}`);
    process.exit(e.code === "usage" ? 2 : 2);
  }
}

main();
