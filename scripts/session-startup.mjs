#!/usr/bin/env node
/**
 * Main-session startup ritual CLI.
 * Logic lives in lib/session-startup-lib.mjs for fixture testing.
 */
import { main } from "./lib/session-startup-lib.mjs";

const isDirect =
  process.argv[1] &&
  (process.argv[1].endsWith("session-startup.mjs") ||
    process.argv[1].endsWith(`session-startup`));

if (isDirect) {
  main(process.argv.slice(2));
}

export { main, runStartup, parseArgs } from "./lib/session-startup-lib.mjs";
