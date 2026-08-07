#!/usr/bin/env node
/**
 * Read-only git lock-in inventory CLI.
 * Classifies dirty paths for Chair review. Never mutates git or .gitignore.
 *
 * Usage:
 *   node scripts/git-lockin-inventory.mjs
 *   node scripts/git-lockin-inventory.mjs --json
 *   node scripts/git-lockin-inventory.mjs --out memory/swarm/runs/.../inventory.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildLockinInventory,
  formatLockinInventoryMarkdown,
} from "./lib/git-lockin-inventory-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultWorkspace = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const out = { json: false, outPath: null, workspace: defaultWorkspace, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--out") out.outPath = argv[++i];
    else if (a === "--workspace") out.workspace = path.resolve(argv[++i]);
    else throw new Error(`unknown arg: ${a}`);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`git-lockin-inventory — read-only dirty-path classifier

Usage:
  node scripts/git-lockin-inventory.mjs [--json] [--out PATH] [--workspace DIR]

Never stages, commits, pushes, deletes, moves, or edits .gitignore.
`);
    process.exit(0);
  }

  const inv = buildLockinInventory({ workspace: args.workspace });
  if (args.json) {
    const text = JSON.stringify(inv, null, 2);
    if (args.outPath) {
      fs.mkdirSync(path.dirname(path.resolve(args.outPath)), { recursive: true });
      fs.writeFileSync(args.outPath, text);
    }
    process.stdout.write(text + "\n");
  } else {
    const md = formatLockinInventoryMarkdown(inv);
    if (args.outPath) {
      fs.mkdirSync(path.dirname(path.resolve(args.outPath)), { recursive: true });
      fs.writeFileSync(args.outPath, md);
    }
    process.stdout.write(md);
    if (!md.endsWith("\n")) process.stdout.write("\n");
  }
  process.exit(0);
}

main();
