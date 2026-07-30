#!/usr/bin/env node
/**
 * Memory-before-speech meter v0 — harness scorecard meter #1.
 *
 * Usage:
 *   node scripts/memory-before-speech-meter.mjs --help
 *   node scripts/memory-before-speech-meter.mjs --fixture path.json
 *   node scripts/memory-before-speech-meter.mjs --samples path.json [--scorecard]
 *   node scripts/memory-before-speech-meter.mjs --json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadSamplesFile,
  computeMeter,
  formatHumanReport,
  formatJsonPayload,
  updateScorecard,
  writeFileAtomic,
  scanLogLines,
  defaultWorkspace,
} from "./lib/memory-before-speech-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const DEFAULT_SCORECARD = path.join(WORKSPACE, "memory", "harness-scorecard.md");
const DEFAULT_FIXTURE = path.join(
  WORKSPACE,
  "memory",
  "evals",
  "fixtures",
  "memory-before-speech",
  "samples-v0.json",
);

function printHelp() {
  console.log(`Usage: node scripts/memory-before-speech-meter.mjs [options]

Measure memory-before-speech rate (harness scorecard meter #1).
On turns that needed prior facts, did memory/AM/ops-first fire before speech?

Options:
  --help                 Show this help
  --fixture [PATH]       Load fixture samples (default: samples-v0.json)
  --samples PATH         Load samples JSON (fixture|manual|log-scan)
  --log-scan PATH        Best-effort heuristic scan of a text log (optional)
  --scorecard            Append/update meter #1 section in harness-scorecard.md
  --scorecard-path PATH  Scorecard file (default: memory/harness-scorecard.md)
  --label TEXT           Measurement label (default: fixture-baseline for fixtures)
  --json                 Machine-readable stdout
  --workspace PATH       Workspace root (default: ${defaultWorkspace()})

Exit codes:
  0  successful measure (even if rate is low)
  1  invalid samples schema
  2  usage / infra error

Examples:
  node scripts/memory-before-speech-meter.mjs --fixture memory/evals/fixtures/memory-before-speech/samples-v0.json
  node scripts/memory-before-speech-meter.mjs --samples path.json --scorecard --json
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
    scorecard: false,
    scorecardPath: DEFAULT_SCORECARD,
    fixture: false,
    fixturePath: /** @type {string | null} */ (null),
    samplesPath: /** @type {string | null} */ (null),
    logScanPath: /** @type {string | null} */ (null),
    label: /** @type {string | null} */ (null),
    workspace: WORKSPACE,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} requires a value`);
      return v;
    };
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--json") args.json = true;
    else if (a === "--scorecard") args.scorecard = true;
    else if (a === "--scorecard-path") args.scorecardPath = path.resolve(next());
    else if (a === "--label") args.label = next();
    else if (a === "--workspace") args.workspace = path.resolve(next());
    else if (a === "--fixture") {
      args.fixture = true;
      const peek = argv[i + 1];
      if (peek && !peek.startsWith("-")) {
        args.fixturePath = path.resolve(peek);
        i += 1;
      } else {
        args.fixturePath = DEFAULT_FIXTURE;
      }
    } else if (a === "--samples") {
      args.samplesPath = path.resolve(next());
    } else if (a === "--log-scan") {
      args.logScanPath = path.resolve(next());
    } else {
      throw new Error(`Unknown option: ${a}`);
    }
  }
  return args;
}

/**
 * @param {Record<string, unknown>} args
 */
function resolveInput(args) {
  if (args.logScanPath) {
    const p = /** @type {string} */ (args.logScanPath);
    let text;
    try {
      text = fs.readFileSync(p, "utf8");
    } catch (err) {
      const e = new Error(`cannot read log: ${err instanceof Error ? err.message : err}`);
      /** @type {Error & { exitCode?: number }} */ (e).exitCode = 2;
      throw e;
    }
    const turns = scanLogLines(text);
    return {
      turns,
      source: /** @type {const} */ ("log-scan"),
      inputPath: p,
      defaultLabel: "log-scan",
    };
  }

  const samplesPath =
    /** @type {string | null} */ (args.samplesPath) ||
    (args.fixture ? /** @type {string} */ (args.fixturePath || DEFAULT_FIXTURE) : null);

  if (!samplesPath) {
    const e = new Error("Provide --fixture, --samples PATH, or --log-scan PATH");
    /** @type {Error & { exitCode?: number }} */ (e).exitCode = 2;
    throw e;
  }

  try {
    const doc = loadSamplesFile(samplesPath);
    const defaultLabel =
      doc.source === "fixture" || args.fixture ? "fixture-baseline" : doc.source;
    return {
      turns: doc.turns,
      source: doc.source,
      inputPath: samplesPath,
      defaultLabel,
      generatedAt: doc.generatedAt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const schemaFail =
      /must be|expected object|non-empty|parse failed|amStatus must|needsPriorFact|memoryEvidence/i.test(
        msg,
      );
    const e = new Error(msg);
    /** @type {Error & { exitCode?: number }} */ (e).exitCode = schemaFail ? 1 : 2;
    throw e;
  }
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    printHelp();
    process.exit(2);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  let input;
  try {
    input = resolveInput(args);
  } catch (err) {
    const e = /** @type {Error & { exitCode?: number }} */ (err);
    console.error(e.message);
    process.exit(e.exitCode ?? 2);
  }

  const label =
    /** @type {string | null} */ (args.label) ||
    input.defaultLabel ||
    "manual";

  const result = computeMeter(input.turns, {
    source: input.source,
    label,
  });

  const relInput = path.relative(WORKSPACE, input.inputPath) || input.inputPath;

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          ...formatJsonPayload(result),
          inputPath: input.inputPath,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(formatHumanReport(result));
    console.log(`\nInput: ${relInput}`);
  }

  if (args.scorecard) {
    const scorecardPath = /** @type {string} */ (args.scorecardPath);
    let existing = "";
    try {
      existing = fs.readFileSync(scorecardPath, "utf8");
    } catch (err) {
      const e = /** @type {NodeJS.ErrnoException} */ (err);
      if (e.code !== "ENOENT") {
        console.error(`Failed to read scorecard: ${e.message}`);
        process.exit(2);
      }
    }
    try {
      const next = updateScorecard(existing, result, {
        fixturePath: relInput,
      });
      writeFileAtomic(scorecardPath, next);
      if (!args.json) {
        console.log(`\nScorecard updated: ${path.relative(WORKSPACE, scorecardPath) || scorecardPath}`);
      } else {
        console.error(`Scorecard updated: ${scorecardPath}`);
      }
    } catch (err) {
      console.error(`Failed to write scorecard: ${err instanceof Error ? err.message : err}`);
      process.exit(2);
    }
  }

  process.exit(0);
}

main();
