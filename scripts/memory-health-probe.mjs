#!/usr/bin/env node
/**
 * Memory health probe — detect silent OpenClaw memory infra outages.
 * Usage:
 *   node scripts/memory-health-probe.mjs --help
 *   node scripts/memory-health-probe.mjs [--json] [--quick] [--no-report]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  runAllChecks,
  formatHumanReport,
  formatMarkdownReport,
  overallToExitCode,
  collectRepairRecommendations,
  defaultWorkspace,
  defaultSqlitePath,
  DEFAULT_OLLAMA_BASE,
  DEFAULT_EMBED_MODEL,
  DEFAULT_SEARCH_QUERY,
  DEFAULT_TIMEOUT_MS,
} from "./lib/memory-health-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(WORKSPACE, "memory", "cursor-jobs");

function printHelp() {
  console.log(`Usage: node scripts/memory-health-probe.mjs [options]

Probe OpenClaw memory stack health (sqlite, ollama, CLI status/search).

Options:
  --help
  --json
  --quick              skip search smoke + latency + concurrent (faster)
  --search-query Q
  --timeout-ms N
  --report [PATH]      write markdown report (default path when omitted)
  --no-report
  --workspace PATH
  --sqlite PATH
  --ollama URL
  --embed-model NAME
  --remediation        always print remediation block
  --repair             print discovered reindex/repair commands (never executes)
  --repair-dry-run     same as --repair (explicit dry-run alias)

Latency-aware checks (full probe):
  embed_latency              warn if embed >2s; fail if unreachable
  memory_search_latency      warn if CLI search >8s; fail on timeout/error
  memory_search_concurrent   dual search; warn if wall >12s (skipped on --quick)

Warmup (separate): node scripts/memory-embed-warmup.mjs

Exit codes:
  0  overall pass
  1  overall fail (any fail check)
  3  overall degraded (warns only)
  2  usage / infra error in the probe itself

Default report: memory/cursor-jobs/memory-health-YYYYMMDD-HHMM.md
Recovery doc: memory/evals/memory-health-recovery-v0.md
`);
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
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const args = {
    help: false,
    json: false,
    quick: false,
    searchQuery: DEFAULT_SEARCH_QUERY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    report: true,
    reportPath: /** @type {string | null} */ (null),
    workspace: defaultWorkspace(),
    sqlitePath: defaultSqlitePath(),
    ollamaBase: DEFAULT_OLLAMA_BASE,
    embedModel: DEFAULT_EMBED_MODEL,
    remediation: false,
    repair: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--json") args.json = true;
    else if (a === "--quick") args.quick = true;
    else if (a === "--remediation") args.remediation = true;
    else if (a === "--repair" || a === "--repair-dry-run") args.repair = true;
    else if (a === "--no-report") {
      args.report = false;
      args.reportPath = null;
    } else if (a === "--report") {
      args.report = true;
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        args.reportPath = path.resolve(next);
        i += 1;
      }
    } else if (a === "--search-query") {
      const q = argv[++i];
      if (!q) throw new Error("--search-query requires a value");
      args.searchQuery = q;
    } else if (a === "--timeout-ms") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n <= 0) throw new Error("--timeout-ms requires a positive number");
      args.timeoutMs = n;
    } else if (a === "--workspace") {
      const p = argv[++i];
      if (!p) throw new Error("--workspace requires a path");
      args.workspace = path.resolve(p);
    } else if (a === "--sqlite") {
      const p = argv[++i];
      if (!p) throw new Error("--sqlite requires a path");
      args.sqlitePath = path.resolve(p);
    } else if (a === "--ollama") {
      const u = argv[++i];
      if (!u) throw new Error("--ollama requires a URL");
      args.ollamaBase = u;
    } else if (a === "--embed-model") {
      const m = argv[++i];
      if (!m) throw new Error("--embed-model requires a name");
      args.embedModel = m;
    } else {
      throw new Error(`Unknown option: ${a}`);
    }
  }
  return args;
}

async function main() {
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

  let result;
  try {
    result = await runAllChecks({
      workspace: args.workspace,
      sqlitePath: args.sqlitePath,
      ollamaBase: args.ollamaBase,
      embedModel: args.embedModel,
      searchQuery: args.searchQuery,
      timeoutMs: args.timeoutMs,
      skipSearch: args.quick,
    });
  } catch (err) {
    console.error(`Probe infra error: ${err instanceof Error ? err.message : err}`);
    process.exit(2);
  }

  /** @type {string[]} */
  let repairCommands = [];
  if (args.repair || args.remediation || result.overall !== "pass") {
    try {
      repairCommands = await collectRepairRecommendations({
        workspace: args.workspace,
        timeoutMs: args.timeoutMs,
      });
    } catch {
      repairCommands = [];
    }
  }

  const human = formatHumanReport(result, {
    remediation: args.remediation || args.repair || result.overall !== "pass",
    repairCommands: args.repair || result.overall !== "pass" ? repairCommands : [],
  });

  if (args.json) {
    const payload = {
      overall: result.overall,
      exitCode: overallToExitCode(result.overall),
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      env: result.env,
      checks: result.checks,
      repairCommands: args.repair ? repairCommands : undefined,
    };
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(human);
  }

  let reportPath = args.reportPath;
  if (args.report) {
    if (!reportPath) {
      reportPath = path.join(REPORT_DIR, `memory-health-${localStamp()}.md`);
    }
    try {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      const md = formatMarkdownReport(result, {
        repairCommands: result.overall !== "pass" || args.repair ? repairCommands : [],
      });
      fs.writeFileSync(reportPath, md, "utf8");
      if (!args.json) {
        console.log(`\nReport written: ${reportPath}`);
      } else {
        // Still emit path on stderr so scripting can find it
        console.error(`Report written: ${reportPath}`);
      }
    } catch (err) {
      console.error(`Failed to write report: ${err instanceof Error ? err.message : err}`);
      process.exit(2);
    }
  }

  process.exit(overallToExitCode(result.overall));
}

main();
