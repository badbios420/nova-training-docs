#!/usr/bin/env node
/**
 * Trajectory closeout CLI — Procedure 13 in one command.
 *
 * Usage:
 *   node scripts/trajectory-closeout.mjs --help
 *   node scripts/trajectory-closeout.mjs --title "..." --goal "..." --actions "..." \
 *     --evidence "..." --outcome win|partial|fail --lesson "..." [--follow-up "..."]
 *   node scripts/trajectory-closeout.mjs --dry-run ...
 *   node scripts/trajectory-closeout.mjs --list
 *   node scripts/trajectory-closeout.mjs --json --list
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_TRAJECTORY_PATH,
  OUTCOMES,
  validateFields,
  formatEntry,
  planAppend,
  planScorecardTouch,
  listRecentEntries,
  resolveLogPath,
  readMaybe,
  writeFileAtomic,
  countEntryLines,
  exceedsLineCap,
  localYmd,
} from "./lib/trajectory-closeout-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const DEFAULT_SCORECARD = "memory/harness-scorecard.md";

function printHelp() {
  console.log(`Usage: node scripts/trajectory-closeout.mjs [options]

Append a ≤20-line graded trajectory (Procedure 13) to memory/trajectory-log.md.

Required (unless --list):
  --title TEXT
  --goal TEXT
  --actions TEXT
  --evidence TEXT
  --outcome win|partial|fail
  --lesson TEXT

Optional:
  --follow-up TEXT
  --date YYYY-MM-DD     default: today local
  --path PATH           trajectory log (default: ${DEFAULT_TRAJECTORY_PATH})
  --dry-run             print entry; do not write
  --scorecard           also append a one-row touch to harness-scorecard.md
  --scorecard-path PATH default: ${DEFAULT_SCORECARD}
  --scorecard-note TEXT extra note line on scorecard touch
  --list [N]            show last N entries (default 5); no write
  --json                machine-readable stdout
  --stdin-json          read fields object from stdin
  --help

Exit codes:
  0  ok
  1  validation / line-cap failure
  2  usage / infra error

Examples:
  node scripts/trajectory-closeout.mjs \\
    --title "C5 trajectory CLI" \\
    --goal "Procedure 13 one command" \\
    --actions "lib+CLI+tests+hook" \\
    --evidence "node scripts/test-trajectory-closeout.mjs exit 0" \\
    --outcome win \\
    --lesson "Close the loop while evidence is fresh" \\
    --follow-up "Use after every major harness arc"
`);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, unknown>} */
  const args = {
    help: false,
    dryRun: false,
    list: false,
    listN: 5,
    json: false,
    stdinJson: false,
    scorecard: false,
    scorecardPath: DEFAULT_SCORECARD,
    scorecardNote: "",
    path: DEFAULT_TRAJECTORY_PATH,
    title: "",
    goal: "",
    actions: "",
    evidence: "",
    outcome: "",
    lesson: "",
    followUp: "",
    date: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} requires a value`);
      return v;
    };
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--json") args.json = true;
    else if (a === "--stdin-json") args.stdinJson = true;
    else if (a === "--scorecard") args.scorecard = true;
    else if (a === "--list") {
      args.list = true;
      const peek = argv[i + 1];
      if (peek && !peek.startsWith("--") && /^\d+$/.test(peek)) {
        args.listN = Math.max(1, Number(next()));
      }
    } else if (a === "--path") args.path = next();
    else if (a === "--scorecard-path") args.scorecardPath = next();
    else if (a === "--scorecard-note") args.scorecardNote = next();
    else if (a === "--title") args.title = next();
    else if (a === "--goal") args.goal = next();
    else if (a === "--actions") args.actions = next();
    else if (a === "--evidence") args.evidence = next();
    else if (a === "--outcome") args.outcome = next();
    else if (a === "--lesson") args.lesson = next();
    else if (a === "--follow-up" || a === "--followup") args.followUp = next();
    else if (a === "--date") args.date = next();
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function readStdin() {
  return fs.readFileSync(0, "utf8");
}

/**
 * @param {Record<string, unknown>} args
 */
function fieldsFromArgs(args) {
  return {
    title: String(args.title || ""),
    goal: String(args.goal || ""),
    actions: String(args.actions || ""),
    evidence: String(args.evidence || ""),
    outcome: String(args.outcome || ""),
    lesson: String(args.lesson || ""),
    followUp: String(args.followUp || ""),
    date: String(args.date || "") || localYmd(),
  };
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`trajectory-closeout: ${/** @type {Error} */ (err).message}`);
    printHelp();
    process.exit(2);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const logPath = resolveLogPath(WORKSPACE, String(args.path));

  if (args.list) {
    const text = readMaybe(logPath);
    const recent = listRecentEntries(text, Number(args.listN) || 5);
    if (args.json) {
      console.log(JSON.stringify({ path: logPath, recent }, null, 2));
    } else {
      console.log(`trajectory-closeout — last ${recent.length} from ${logPath}`);
      if (!recent.length) console.log("(none)");
      for (const e of recent) console.log(`- ${e.date} — ${e.title}`);
    }
    process.exit(0);
  }

  /** @type {Record<string, unknown>} */
  let rawFields = fieldsFromArgs(args);
  if (args.stdinJson) {
    let parsed;
    try {
      parsed = JSON.parse(readStdin());
    } catch (err) {
      console.error(`trajectory-closeout: invalid stdin JSON: ${/** @type {Error} */ (err).message}`);
      process.exit(2);
    }
    rawFields = { ...rawFields, ...parsed };
  }

  const validated = validateFields(rawFields);
  if (!validated.ok) {
    if (args.json) {
      console.log(JSON.stringify({ ok: false, errors: validated.errors }, null, 2));
    } else {
      console.error("trajectory-closeout: validation failed:");
      for (const e of validated.errors) console.error(`  - ${e}`);
      console.error(`outcome one of: ${OUTCOMES.join(" | ")}`);
    }
    process.exit(1);
  }

  const entry = formatEntry(validated.value);
  const lines = countEntryLines(entry);
  if (exceedsLineCap(entry, 20)) {
    console.error(`trajectory-closeout: entry has ${lines} lines (cap 20)`);
    process.exit(1);
  }

  const existing = readMaybe(logPath);
  const nextContents = planAppend(existing, entry);

  /** @type {string | null} */
  let scorecardPath = null;
  /** @type {string | null} */
  let nextScorecard = null;
  if (args.scorecard) {
    scorecardPath = resolveLogPath(WORKSPACE, String(args.scorecardPath));
    const scExisting = readMaybe(scorecardPath);
    nextScorecard = planScorecardTouch(scExisting, {
      date: validated.value.date,
      title: validated.value.title,
      outcome: validated.value.outcome,
      note: String(args.scorecardNote || "") || undefined,
    });
  }

  if (args.dryRun) {
    if (args.json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            dryRun: true,
            path: logPath,
            lines,
            entry,
            scorecardPath,
          },
          null,
          2,
        ),
      );
    } else {
      console.log("trajectory-closeout — DRY RUN (no write)");
      console.log(`path: ${logPath}`);
      console.log(`lines: ${lines}`);
      console.log("---");
      process.stdout.write(entry);
      if (scorecardPath) console.log(`(would touch scorecard: ${scorecardPath})`);
    }
    process.exit(0);
  }

  try {
    writeFileAtomic(logPath, nextContents);
    if (scorecardPath && nextScorecard !== null) {
      writeFileAtomic(scorecardPath, nextScorecard);
    }
  } catch (err) {
    console.error(`trajectory-closeout: write failed: ${/** @type {Error} */ (err).message}`);
    process.exit(2);
  }

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: false,
          path: logPath,
          lines,
          title: validated.value.title,
          outcome: validated.value.outcome,
          date: validated.value.date,
          scorecardPath,
          entry,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`trajectory-closeout — appended (${lines} lines)`);
    console.log(`path: ${logPath}`);
    console.log(`title: ${validated.value.date} — ${validated.value.title}`);
    console.log(`outcome: ${validated.value.outcome}`);
    if (scorecardPath) console.log(`scorecard: ${scorecardPath}`);
  }
}

main().catch((err) => {
  console.error(`trajectory-closeout: ${err?.stack || err}`);
  process.exit(2);
});
