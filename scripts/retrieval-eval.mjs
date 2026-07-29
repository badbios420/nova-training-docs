#!/usr/bin/env node
/**
 * Retrieval eval runner — live openclaw memory search vs gold accept paths.
 * Usage:
 *   node scripts/retrieval-eval.mjs --help
 *   node scripts/retrieval-eval.mjs [--limit N] [--id F09] [--json]
 */

import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseFacts,
  filterHits,
  scoreFact,
  rollup,
  formatMeter,
  CATEGORIES,
} from "./lib/retrieval-eval-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const DEFAULT_EVAL_SET = path.join(WORKSPACE, "memory", "retrieval-eval-set-v1.md");
const REPORT_DIR = path.join(WORKSPACE, "memory", "cursor-jobs");
const SEARCH_TIMEOUT_MS = 120_000;
const INTER_QUERY_SLEEP_MS = 150;

function printHelp() {
  console.log(`Usage: node scripts/retrieval-eval.mjs [options]

Run live openclaw memory search against memory/retrieval-eval-set-v1.md,
score raw + filtered hit@1 / hit@3 / support@3, write markdown report.

Options:
  --help           Show this help
  --limit N        Only first N facts (smoke)
  --id FXX         Run a single fact by ID
  --json           Print machine-readable summary to stdout
  --eval-set PATH  Override eval-set markdown (default: memory/retrieval-eval-set-v1.md)
  --max-results N  openclaw --max-results (default: 8)
  --no-report      Skip writing markdown report

Filtered ranking drops: memory/dreaming/**, memory/.dreams/**, DREAMS.md,
memory/candidates/**, memory/retrieval-eval-set-v1.md (self-hit).
support@3 is a weak proxy: Y if hit@3 and matched snippet non-empty.
`);
}

function parseArgs(argv) {
  const args = {
    help: false,
    limit: null,
    id: null,
    json: false,
    evalSet: DEFAULT_EVAL_SET,
    maxResults: 8,
    report: true,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--json") args.json = true;
    else if (a === "--no-report") args.report = false;
    else if (a === "--limit") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 1) throw new Error("--limit requires a positive integer");
      args.limit = Math.floor(n);
    } else if (a === "--id") {
      args.id = String(argv[++i] ?? "").trim().toUpperCase();
      if (!args.id) throw new Error("--id requires a fact ID like F09");
    } else if (a === "--eval-set") {
      args.evalSet = path.resolve(argv[++i] ?? "");
    } else if (a === "--max-results") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 1) throw new Error("--max-results requires a positive integer");
      args.maxResults = Math.floor(n);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function which(cmd) {
  try {
    return execFileSync("which", [cmd], { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Prefer a Node that satisfies openclaw's engine range when spawning the CLI.
 * openclaw shebang uses `env node`; PATH order decides.
 */
function childEnv() {
  const env = { ...process.env };
  const candidates = [
    path.join(process.env.HOME || "", ".nvm", "versions", "node", "v24.18.0", "bin"),
    path.join(process.env.HOME || "", ".nvm", "versions", "node", "v24.15.0", "bin"),
  ].filter((d) => d && fs.existsSync(path.join(d, "node")));

  if (candidates.length) {
    env.PATH = `${candidates.join(path.delimiter)}${path.delimiter}${env.PATH || ""}`;
  }
  return env;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

/**
 * @param {string} openclawPath
 * @param {string} query
 * @param {number} maxResults
 * @returns {Promise<{ hits: object[], error: string | null, rawStdout: string }>}
 */
function runSearch(openclawPath, query, maxResults) {
  return new Promise((resolve) => {
    const args = [
      "memory",
      "search",
      "--query",
      query,
      "--max-results",
      String(maxResults),
      "--json",
    ];
    const child = spawn(openclawPath, args, {
      env: childEnv(),
      cwd: WORKSPACE,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      resolve({
        hits: [],
        error: `timeout after ${SEARCH_TIMEOUT_MS}ms`,
        rawStdout: stdout,
      });
    }, SEARCH_TIMEOUT_MS);

    child.stdout.on("data", (buf) => {
      stdout += buf.toString("utf8");
    });
    child.stderr.on("data", (buf) => {
      stderr += buf.toString("utf8");
    });
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ hits: [], error: err.message, rawStdout: stdout });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        resolve({
          hits: [],
          error: `openclaw exit ${code}: ${(stderr || stdout).trim().slice(0, 400)}`,
          rawStdout: stdout,
        });
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        const hits = Array.isArray(parsed?.results)
          ? parsed.results
          : Array.isArray(parsed)
            ? parsed
            : [];
        resolve({ hits, error: null, rawStdout: stdout });
      } catch (err) {
        resolve({
          hits: [],
          error: `JSON parse failed: ${err.message}`,
          rawStdout: stdout,
        });
      }
    });
  });
}

function pathsPreview(hits, n = 3) {
  return (hits || [])
    .slice(0, n)
    .map((h, i) => `${i + 1}. ${h.path ?? "?"}`)
    .join("; ");
}

function renderReport({ stamp, evalSetRel, facts, rows, rolled, openclawPath }) {
  const lines = [];
  lines.push(`# Retrieval Eval Report — ${stamp}`);
  lines.push("");
  lines.push(`- **Runner:** \`scripts/retrieval-eval.mjs\``);
  lines.push(`- **Eval set:** \`${evalSetRel}\``);
  lines.push(`- **openclaw:** \`${openclawPath}\``);
  lines.push(`- **Facts scored:** ${rows.length}`);
  lines.push(
    `- **support@3 note:** weak proxy — Y if hit@3 and matched hit snippet is non-empty; N on miss.`,
  );
  lines.push(
    `- **Filtered drops:** \`memory/dreaming/**\`, \`memory/.dreams/**\`, \`DREAMS.md\`, \`memory/candidates/**\`, \`memory/retrieval-eval-set-v1.md\``,
  );
  lines.push("");

  const o = rolled.overall;
  lines.push("## Overall");
  lines.push("");
  lines.push("| Mode | hit@1 | hit@3 | support@3 | errors |");
  lines.push("|------|-------|-------|-----------|--------|");
  lines.push(
    `| raw | ${formatMeter(o.raw, "hitAt1")} | ${formatMeter(o.raw, "hitAt3")} | ${formatMeter(o.raw, "supportAt3")} | ${o.raw.errors} |`,
  );
  lines.push(
    `| filtered | ${formatMeter(o.filtered, "hitAt1")} | ${formatMeter(o.filtered, "hitAt3")} | ${formatMeter(o.filtered, "supportAt3")} | ${o.filtered.errors} |`,
  );
  lines.push("");

  lines.push("## Per category");
  lines.push("");
  lines.push("| Category | Mode | hit@1 | hit@3 | support@3 | n |");
  lines.push("|----------|------|-------|-------|-----------|---|");
  const catOrder = [
    ...CATEGORIES,
    ...Object.keys(rolled.byCategory).filter((c) => !CATEGORIES.includes(c)),
  ];
  for (const cat of catOrder) {
    const block = rolled.byCategory[cat];
    if (!block) continue;
    lines.push(
      `| ${cat} | raw | ${formatMeter(block.raw, "hitAt1")} | ${formatMeter(block.raw, "hitAt3")} | ${formatMeter(block.raw, "supportAt3")} | ${block.raw.n} |`,
    );
    lines.push(
      `| ${cat} | filtered | ${formatMeter(block.filtered, "hitAt1")} | ${formatMeter(block.filtered, "hitAt3")} | ${formatMeter(block.filtered, "supportAt3")} | ${block.filtered.n} |`,
    );
  }
  lines.push("");

  lines.push("## Per fact");
  lines.push("");
  lines.push(
    "| ID | Category | raw hit@1 | raw hit@3 | filt hit@1 | filt hit@3 | support@3 (filt) | error | top raw paths |",
  );
  lines.push(
    "|----|----------|-----------|-----------|------------|------------|------------------|-------|---------------|",
  );
  for (const r of rows) {
    lines.push(
      `| ${r.id} | ${r.category} | ${r.error ? "—" : r.raw.hitAt1 ? "Y" : "N"} | ${r.error ? "—" : r.raw.hitAt3 ? "Y" : "N"} | ${r.error ? "—" : r.filtered.hitAt1 ? "Y" : "N"} | ${r.error ? "—" : r.filtered.hitAt3 ? "Y" : "N"} | ${r.error ? "—" : r.filtered.supportAt3 ? "Y" : "N"} | ${r.error ? r.error.replace(/\|/g, "/") : ""} | ${pathsPreview(r.rawHits).replace(/\|/g, "/")} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const openclawPath = which("openclaw");
  if (!openclawPath) {
    console.error(
      "error: `openclaw` not found on PATH. Install/link OpenClaw CLI, then retry.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(args.evalSet)) {
    console.error(`error: eval set not found: ${args.evalSet}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(args.evalSet, "utf8");
  let facts = parseFacts(markdown);
  if (args.id) {
    facts = facts.filter((f) => f.id === args.id);
    if (facts.length === 0) {
      console.error(`error: no fact with id ${args.id}`);
      process.exit(1);
    }
  }
  if (args.limit != null) {
    facts = facts.slice(0, args.limit);
  }
  if (facts.length === 0) {
    console.error("error: no facts to score");
    process.exit(1);
  }

  /** @type {object[]} */
  const rows = [];
  for (let i = 0; i < facts.length; i += 1) {
    const fact = facts[i];
    process.stderr.write(`[${i + 1}/${facts.length}] ${fact.id} …\n`);
    const { hits, error } = await runSearch(openclawPath, fact.query, args.maxResults);
    const filtered = filterHits(hits);
    const rawScore = error
      ? { hitAt1: false, hitAt3: false, supportAt3: false, hitRank: null }
      : scoreFact(fact, hits);
    const filtScore = error
      ? { hitAt1: false, hitAt3: false, supportAt3: false, hitRank: null }
      : scoreFact(fact, filtered);

    rows.push({
      id: fact.id,
      category: fact.category,
      query: fact.query,
      acceptPaths: fact.acceptPaths,
      error,
      raw: rawScore,
      filtered: filtScore,
      rawHits: hits,
      filteredHits: filtered,
    });

    if (!args.json) {
      const line = error
        ? `  ${fact.id} ERROR ${error}`
        : `  ${fact.id} [${fact.category}] raw hit@1=${rawScore.hitAt1 ? "Y" : "N"} hit@3=${rawScore.hitAt3 ? "Y" : "N"} | filt hit@1=${filtScore.hitAt1 ? "Y" : "N"} hit@3=${filtScore.hitAt3 ? "Y" : "N"} support@3=${filtScore.supportAt3 ? "Y" : "N"}`;
      console.log(line);
      if (!error) {
        console.log(`    raw top: ${pathsPreview(hits)}`);
        console.log(`    filt top: ${pathsPreview(filtered)}`);
      }
    }

    if (i < facts.length - 1) await sleep(INTER_QUERY_SLEEP_MS);
  }

  const rolled = rollup(rows);
  const stamp = localStamp();
  const evalSetRel = path.relative(WORKSPACE, args.evalSet) || args.evalSet;

  let reportPath = null;
  if (args.report) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    reportPath = path.join(REPORT_DIR, `retrieval-eval-report-${stamp}.md`);
    const md = renderReport({
      stamp,
      evalSetRel,
      facts,
      rows,
      rolled,
      openclawPath,
    });
    fs.writeFileSync(reportPath, md, "utf8");
  }

  const summary = {
    stamp,
    evalSet: evalSetRel,
    openclaw: openclawPath,
    factCount: rows.length,
    overall: rolled.overall,
    byCategory: rolled.byCategory,
    reportPath: reportPath ? path.relative(WORKSPACE, reportPath) : null,
    facts: rows.map((r) => ({
      id: r.id,
      category: r.category,
      error: r.error,
      raw: r.raw,
      filtered: r.filtered,
      rawTopPaths: (r.rawHits || []).slice(0, 3).map((h) => h.path),
      filteredTopPaths: (r.filteredHits || []).slice(0, 3).map((h) => h.path),
    })),
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("");
    console.log("## Overall");
    console.log(
      `raw:      hit@1 ${formatMeter(rolled.overall.raw, "hitAt1")}  hit@3 ${formatMeter(rolled.overall.raw, "hitAt3")}  support@3 ${formatMeter(rolled.overall.raw, "supportAt3")}`,
    );
    console.log(
      `filtered: hit@1 ${formatMeter(rolled.overall.filtered, "hitAt1")}  hit@3 ${formatMeter(rolled.overall.filtered, "hitAt3")}  support@3 ${formatMeter(rolled.overall.filtered, "supportAt3")}`,
    );
    console.log("");
    console.log("## Per category (filtered hit@3)");
    for (const cat of CATEGORIES) {
      const b = rolled.byCategory[cat];
      if (!b) continue;
      console.log(`  ${cat}: ${formatMeter(b.filtered, "hitAt3")}`);
    }
    if (reportPath) {
      console.log("");
      console.log(`Report: ${path.relative(WORKSPACE, reportPath)}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
