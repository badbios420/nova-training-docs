#!/usr/bin/env node
/**
 * Warm Ollama embed + CLI memory search path (no DB writes / no reindex).
 * Usage: node scripts/memory-embed-warmup.mjs
 *
 * Exit: 0 warm OK · 1 fail
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  pingOllamaEmbed,
  timedMemorySearch,
  buildChildEnv,
  defaultWorkspace,
  DEFAULT_EMBED_MODEL,
  DEFAULT_OLLAMA_BASE,
  WARMUP_SEARCH_QUERY,
} from "./lib/memory-health-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`Usage: node scripts/memory-embed-warmup.mjs

Warm embed + memory search path (no DB writes / no reindex / no config edits).

Steps:
  1. HTTP embed ping to Ollama (nomic-embed-text or DEFAULT_EMBED_MODEL)
  2. One openclaw memory search --json --max-results 1

Exit: 0 warm OK · 1 fail
Prints: embed_ms, search_ms
`);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const env = buildChildEnv();
  const ollamaBase = (process.env.OLLAMA_HOST || DEFAULT_OLLAMA_BASE).replace(/\/$/, "");
  const embedModel = process.env.DEFAULT_EMBED_MODEL || DEFAULT_EMBED_MODEL;
  const workspace = process.env.OPENCLAW_WORKSPACE || defaultWorkspace() || WORKSPACE;

  console.log(`memory-embed-warmup: model=${embedModel} ollama=${ollamaBase}`);

  const embed = await pingOllamaEmbed({
    ollamaBase,
    embedModel,
    prompt: "memory warmup ping",
    timeoutMs: 30_000,
  });

  if (!embed.ok) {
    console.error(`FAIL embed: ${embed.error} (embed_ms=${embed.embedMs})`);
    console.log(`embed_ms=${embed.embedMs}`);
    console.log(`search_ms=`);
    process.exit(1);
  }

  console.log(`OK embed: dims=${embed.dims} embed_ms=${embed.embedMs}`);

  const search = await timedMemorySearch({
    workspace,
    query: WARMUP_SEARCH_QUERY,
    maxResults: 1,
    timeoutMs: 30_000,
    env,
  });

  if (!search.ok) {
    console.error(
      `FAIL search: ${search.error || search.parseError || "error"} (search_ms=${search.searchMs})`,
    );
    console.log(`embed_ms=${embed.embedMs}`);
    console.log(`search_ms=${search.searchMs}`);
    process.exit(1);
  }

  console.log(
    `OK search: results=${search.resultCount ?? "?"} search_ms=${search.searchMs}`,
  );
  console.log(`embed_ms=${embed.embedMs}`);
  console.log(`search_ms=${search.searchMs}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`FAIL: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
