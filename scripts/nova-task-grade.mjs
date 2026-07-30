#!/usr/bin/env node
/**
 * Nova Task Suite grader — offline outcome checks against workspace files.
 * Usage:
 *   node scripts/nova-task-grade.mjs --help
 *   node scripts/nova-task-grade.mjs [--id T01] [--limit N] [--json] [--no-report]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadSuite,
  gradeTask,
  rollup,
  formatReport,
  toJsonSummary,
  resolveWorkspaceRoot,
} from "./lib/nova-task-grade-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const DEFAULT_SUITE = path.join(WORKSPACE, "memory", "evals", "nova-task-suite-v0.json");
const REPORT_DIR = path.join(WORKSPACE, "memory", "cursor-jobs");

function printHelp() {
  console.log(`Usage: node scripts/nova-task-grade.mjs [options]

Grade Nova Task Suite v0 outcomes against the live workspace filesystem
(or an optional fixture root). No LLM / network required.

Options:
  --help              Show this help
  --suite PATH        Suite JSON (default: memory/evals/nova-task-suite-v0.json)
  --id T0X            Run a single task by ID (e.g. T01)
  --limit N           Only first N tasks (after id filter)
  --json              Print machine-readable summary to stdout
  --fixture-root PATH Override workspace root for file reads (tests/fixtures)
  --report            Write markdown report (default: on)
  --no-report         Skip writing markdown report

Exit codes:
  0  all run tasks passed
  1  any fail / partial below threshold / error
  2  usage or infra error

Reports: memory/cursor-jobs/nova-task-suite-report-YYYYMMDD-HHMM.md
`);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const args = {
    help: false,
    suite: DEFAULT_SUITE,
    id: null,
    limit: null,
    json: false,
    fixtureRoot: null,
    report: true,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--json") args.json = true;
    else if (a === "--report") args.report = true;
    else if (a === "--no-report") args.report = false;
    else if (a === "--suite") {
      const p = argv[++i];
      if (!p) throw new Error("--suite requires a path");
      args.suite = path.resolve(p);
    } else if (a === "--fixture-root") {
      const p = argv[++i];
      if (!p) throw new Error("--fixture-root requires a path");
      args.fixtureRoot = path.resolve(p);
    } else if (a === "--id") {
      const id = String(argv[++i] ?? "").trim().toUpperCase();
      if (!id) throw new Error("--id requires a task ID like T01");
      args.id = id;
    } else if (a === "--limit") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 1) throw new Error("--limit requires a positive integer");
      args.limit = Math.floor(n);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function localStamp(d = new Date()) {
  return (
    `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
    `-${pad2(d.getHours())}${pad2(d.getMinutes())}`
  );
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(String(err instanceof Error ? err.message : err));
    printHelp();
    process.exit(2);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const workspaceRoot = resolveWorkspaceRoot(args.fixtureRoot ?? WORKSPACE);

  let suite;
  try {
    suite = loadSuite(args.suite);
  } catch (err) {
    console.error(`Failed to load suite: ${err instanceof Error ? err.message : err}`);
    process.exit(2);
  }

  let tasks = [...suite.tasks];
  if (args.id) {
    tasks = tasks.filter((t) => String(t.id).toUpperCase() === args.id);
    if (tasks.length === 0) {
      console.error(`No task with id ${args.id}`);
      process.exit(2);
    }
  }
  if (args.limit != null) tasks = tasks.slice(0, args.limit);

  const grades = tasks.map((t) => gradeTask(t, workspaceRoot));
  const summary = rollup(grades);
  const generatedAt = new Date().toISOString();

  if (args.report) {
    try {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
      const reportPath = path.join(
        REPORT_DIR,
        `nova-task-suite-report-${localStamp()}.md`,
      );
      const md = formatReport({
        suiteVersion: suite.version,
        suitePath: args.suite,
        workspaceRoot,
        generatedAt,
        tasks: grades,
        summary,
      });
      fs.writeFileSync(reportPath, md, "utf8");
      console.error(`Report written: ${reportPath}`);
    } catch (err) {
      console.error(`Failed to write report: ${err instanceof Error ? err.message : err}`);
      process.exit(2);
    }
  }

  if (args.json) {
    console.log(JSON.stringify(toJsonSummary(grades, summary), null, 2));
  } else {
    console.log(
      `Nova Task Suite ${suite.version}: ${summary.passed}/${summary.total} passed` +
        ` (${(summary.passRate * 100).toFixed(0)}%)` +
        ` · fail ${summary.failed} · partial ${summary.partial} · error ${summary.errored}`,
    );
    for (const t of grades) {
      const mark =
        t.status === "pass"
          ? "PASS"
          : t.status === "partial"
            ? "PARTIAL"
            : t.status === "error"
              ? "ERROR"
              : "FAIL";
      console.log(
        `  ${t.id} [${t.category}] ${mark} score=${(t.score * 100).toFixed(0)}% — ${t.name}`,
      );
    }
    console.log("By category:");
    for (const [cat, b] of Object.entries(summary.byCategory)) {
      console.log(
        `  ${cat}: ${b.passed}/${b.total} (${(b.passRate * 100).toFixed(0)}%)`,
      );
    }
  }

  const allPass = grades.length > 0 && grades.every((t) => t.status === "pass");
  process.exit(allPass ? 0 : 1);
}

main();
