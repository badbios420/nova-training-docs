#!/usr/bin/env node
/**
 * Runtime Error Doctor v0.1.1 — READ-ONLY CLI (precision: ≤5 families)
 *
 *   node scripts/error-doctor.mjs
 *   node scripts/error-doctor.mjs --json
 *   node scripts/error-doctor.mjs --out memory/swarm/runs/.../error-doctor-report.md
 *   node scripts/error-doctor.mjs --skip-live-probes
 *
 * Never runs repairs, doctor --fix, gateway restart, config edits, or git writes
 * (except optional --write-ledger-draft for NEW fingerprints — still not a repair).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  runErrorDoctor,
  formatDoctorReportMarkdown,
  defaultLedgerMarkdown,
  DOCTOR_VERSION,
} from "./lib/error-doctor-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultWorkspace = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const out = {
    json: false,
    outPath: null,
    workspace: defaultWorkspace,
    skipLiveProbes: false,
    writeLedgerDraft: false,
    includeFixtures: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--out") out.outPath = argv[++i];
    else if (a === "--workspace") out.workspace = path.resolve(argv[++i]);
    else if (a === "--skip-live-probes") out.skipLiveProbes = true;
    else if (a === "--write-ledger-draft") out.writeLedgerDraft = true;
    else if (a === "--include-fixtures") out.includeFixtures = true;
    else throw new Error(`unknown arg: ${a}`);
  }
  return out;
}

function ensureLedger(workspace) {
  const p = path.join(workspace, "memory/error-doctor-ledger.md");
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, defaultLedgerMarkdown());
  }
  return p;
}

function appendLedgerDrafts(ledgerPath, incidents) {
  const existing = fs.readFileSync(ledgerPath, "utf8");
  const additions = [];
  for (const inc of incidents) {
    if (inc.status !== "NEW") continue;
    if (existing.includes(`## ${inc.id}`)) continue;
    additions.push(`
## ${inc.id}
- status: OPEN
- first_seen: ${new Date().toISOString().slice(0, 10)}
- last_seen: ${new Date().toISOString().slice(0, 10)}
- occurrences: ${inc.count}
- fingerprint: ${inc.fingerprint}
- root_cause_confidence: ${inc.confidence}
- mitigation: none yet (draft from doctor v${DOCTOR_VERSION})
- permanent_repair: TBD
- owner: Nova
- regression_test: TBD
`);
  }
  if (additions.length) {
    fs.appendFileSync(ledgerPath, "\n" + additions.join("\n"));
  }
  return additions.length;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`error-doctor v${DOCTOR_VERSION} — read-only runtime incident triage

Usage:
  node scripts/error-doctor.mjs [--json] [--out PATH] [--skip-live-probes]
  node scripts/error-doctor.mjs --include-fixtures   # allow test fixture paths
  node scripts/error-doctor.mjs --write-ledger-draft  # append NEW ids only

Default output: ≤5 actionable families + appendix.
Hard bans: no doctor --fix, no gateway restart, no config edits, no repairs.
`);
    process.exit(0);
  }

  const ledgerPath = ensureLedger(args.workspace);
  const report = runErrorDoctor({
    workspace: args.workspace,
    skipLiveProbes: args.skipLiveProbes,
    includeFixtures: args.includeFixtures,
    ledgerPath,
  });

  if (args.writeLedgerDraft) {
    report.ledgerDraftsAppended = appendLedgerDrafts(
      ledgerPath,
      report.families || report.incidents,
    );
  }

  const md = formatDoctorReportMarkdown(report);
  if (args.outPath) {
    const abs = path.resolve(args.outPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, args.json ? JSON.stringify(report, null, 2) : md);
  }

  if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  else process.stdout.write(md.endsWith("\n") ? md : md + "\n");

  process.exit(0);
}

main();
