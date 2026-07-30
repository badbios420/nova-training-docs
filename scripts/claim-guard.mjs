#!/usr/bin/env node
/**
 * Claim Guard CLI — flag banned success words without nearby evidence.
 * Usage:
 *   node scripts/claim-guard.mjs --help
 *   node scripts/claim-guard.mjs --text "Ship is done"
 *   node scripts/claim-guard.mjs path/to/note.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  scanText,
  scanFile,
  mergeResults,
  formatReport,
  collectMarkdownFiles,
} from "./lib/claim-guard-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function printHelp() {
  console.log(`Usage: node scripts/claim-guard.mjs [options] [paths...]

Scan text/files for banned success words without nearby evidence.

Options:
  --help              Show this help
  --stdin             Read text from stdin
  --text STRING       Scan a string argument
  --json              Machine-readable output
  --window N          Evidence line window (default 2)
  --strict            Exit 1 on any violation (default for files/text)
  --soft              Exit 0 even with violations (report only)
  --globs             If path is a directory, scan *.md (skip node_modules)
  --exclude REGEX     Skip paths matching regex
  --report PATH       Write markdown report to PATH
  --max-files N       Cap files when walking dirs (default 500)
  --show-cleared      Include cleared hits in text report

Exit codes:
  0  clean (or soft with violations)
  1  violations found (strict)
  2  usage / infra error

Banned words: done, fixed, verified, clean, working, pushed, live, shipped
`);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const args = {
    help: false,
    stdin: false,
    text: null,
    json: false,
    window: 2,
    strict: true,
    soft: false,
    globs: false,
    exclude: null,
    report: null,
    maxFiles: 500,
    showCleared: false,
    /** @type {string[]} */
    paths: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--stdin") args.stdin = true;
    else if (a === "--json") args.json = true;
    else if (a === "--strict") {
      args.strict = true;
      args.soft = false;
    } else if (a === "--soft") {
      args.soft = true;
      args.strict = false;
    } else if (a === "--globs") args.globs = true;
    else if (a === "--show-cleared") args.showCleared = true;
    else if (a === "--text") {
      const t = argv[++i];
      if (t === undefined) throw new Error("--text requires a string");
      args.text = t;
    } else if (a === "--window") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 0) throw new Error("--window requires a non-negative integer");
      args.window = Math.floor(n);
    } else if (a === "--exclude") {
      const r = argv[++i];
      if (!r) throw new Error("--exclude requires a regex");
      args.exclude = new RegExp(r);
    } else if (a === "--report") {
      const p = argv[++i];
      if (!p) throw new Error("--report requires a path");
      args.report = path.resolve(p);
    } else if (a === "--max-files") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 1) throw new Error("--max-files requires a positive integer");
      args.maxFiles = Math.floor(n);
    } else if (a.startsWith("-")) {
      throw new Error(`Unknown argument: ${a}`);
    } else {
      args.paths.push(a);
    }
  }
  return args;
}

/**
 * Expand path args into concrete files.
 * @param {string[]} paths
 * @param {{ globs: boolean, maxFiles: number, exclude: RegExp | null }} opts
 * @returns {string[]}
 */
function resolveInputs(paths, opts) {
  /** @type {string[]} */
  const files = [];
  for (const p of paths) {
    const abs = path.resolve(p);
    let st;
    try {
      st = fs.statSync(abs);
    } catch (err) {
      throw new Error(`path not found: ${p}`);
    }
    if (st.isDirectory()) {
      if (!opts.globs) {
        throw new Error(`directory given without --globs: ${p}`);
      }
      const md = collectMarkdownFiles(abs, {
        maxFiles: opts.maxFiles,
        exclude: opts.exclude ?? undefined,
      });
      files.push(...md);
    } else if (st.isFile()) {
      if (opts.exclude && opts.exclude.test(abs)) continue;
      files.push(abs);
    }
  }
  // de-dupe preserve order
  return [...new Set(files)].slice(0, opts.maxFiles);
}

function readStdin() {
  return fs.readFileSync(0, { encoding: "utf8" });
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

  const hasInput = args.stdin || args.text !== null || args.paths.length > 0;
  if (!hasInput) {
    printHelp();
    process.exit(2);
  }

  const scanOpts = { windowLines: args.window };

  try {
    /** @type {import("./lib/claim-guard-lib.mjs").ScanResult} */
    let result;

    if (args.text !== null) {
      result = scanText(args.text, scanOpts);
    } else if (args.stdin) {
      result = scanText(readStdin(), { ...scanOpts, file: "<stdin>" });
    } else {
      const files = resolveInputs(args.paths, {
        globs: args.globs,
        maxFiles: args.maxFiles,
        exclude: args.exclude,
      });
      if (files.length === 0) {
        console.error("no files to scan");
        process.exit(2);
      }
      const parts = files.map((f) => scanFile(f, scanOpts));
      result = mergeResults(parts);
      if (files.length === 1) result.file = files[0];
    }

    if (args.report) {
      const md = formatReport(result, { format: "markdown", showCleared: args.showCleared });
      fs.mkdirSync(path.dirname(args.report), { recursive: true });
      fs.writeFileSync(args.report, md, "utf8");
      if (!args.json) console.error(`wrote report: ${args.report}`);
    }

    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatReport(result, { format: "text", showCleared: args.showCleared }));
    }

    const hasViolations = result.stats.violations > 0;
    if (hasViolations && args.strict && !args.soft) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error(String(err instanceof Error ? err.message : err));
    process.exit(2);
  }
}

main();
