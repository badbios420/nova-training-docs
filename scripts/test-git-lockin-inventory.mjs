#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  classifyLockinPath,
  parsePorcelain,
  buildLockinInventory,
  formatLockinInventoryMarkdown,
  OVERSIZE_BYTES,
} from "./lib/git-lockin-inventory-lib.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e && e.message ? e.message : e}`);
    failed++;
  }
}

console.log("git-lockin-inventory unit tests\n");

test("parsePorcelain basic M and ??", () => {
  const rows = parsePorcelain(" M scripts/foo.mjs\n?? memory/x.log\n");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].path, "scripts/foo.mjs");
  assert.equal(rows[1].path, "memory/x.log");
});

test("secret: openclaw.json.bak", () => {
  assert.equal(classifyLockinPath("memory/cursor-jobs/backups/openclaw.json.bak.x").class, "possible_secret");
});

test("secret: oauth status json", () => {
  assert.equal(classifyLockinPath("memory/xai-oauth-login-status.json").class, "possible_secret");
});

test("dream corpus local", () => {
  assert.equal(classifyLockinPath("memory/dreaming/light/2026-08-01.md").class, "intentional_local_only");
  assert.equal(classifyLockinPath("DREAMS.md").class, "intentional_local_only");
});

test("generated probe report", () => {
  assert.equal(
    classifyLockinPath("memory/cursor-jobs/memory-health-20260801-1256.md").class,
    "generated_rebuildable",
  );
});

test("dated cursor job log is generated_rebuildable", () => {
  assert.equal(
    classifyLockinPath("memory/cursor-jobs/20260801-125006-write.log").class,
    "generated_rebuildable",
  );
});

test("scratch py under cursor-jobs is gitignore candidate", () => {
  assert.equal(
    classifyLockinPath("memory/cursor-jobs/_hb_tick.py").class,
    "add_to_gitignore_candidate",
  );
});

test("scripts durable commit candidate", () => {
  assert.equal(classifyLockinPath("scripts/git-lockin-inventory.mjs").class, "commit_candidate");
  assert.equal(classifyLockinPath("docs/harness/swarm-protocol-v0.md").class, "commit_candidate");
});

test("nested training clone local", () => {
  assert.equal(classifyLockinPath("nova-training-docs").class, "intentional_local_only");
});

test("oversize archive", () => {
  const r = classifyLockinPath("memory/misc-blob.bin", { sizeBytes: OVERSIZE_BYTES + 1 });
  assert.equal(r.class, "archive_candidate");
});

test("build inventory from fixture porcelain", () => {
  const porcelain = [
    " M scripts/a.mjs",
    "?? memory/cursor-jobs/20260801-125006-write.log",
    "?? memory/dreaming/light/x.md",
    "?? memory/xai-oauth-login-status.json",
  ].join("\n");
  const inv = buildLockinInventory({
    workspace: "/tmp/fake-ws",
    statusTextFn: () => porcelain,
    sizeFn: () => 100,
  });
  assert.equal(inv.total, 4);
  assert.equal(inv.counts.commit_candidate, 1);
  assert.equal(inv.counts.generated_rebuildable, 1);
  assert.equal(inv.counts.intentional_local_only, 1);
  assert.equal(inv.counts.possible_secret, 1);
  const md = formatLockinInventoryMarkdown(inv);
  assert.match(md, /READ-ONLY/);
  assert.match(md, /commit_candidate/);
});

test("hard rules forbid mutation language as policy text", () => {
  const inv = buildLockinInventory({
    workspace: "/tmp/x",
    statusTextFn: () => "",
    sizeFn: () => null,
  });
  assert.ok(inv.hardRules.some((r) => /READ-ONLY/i.test(r)));
  assert.ok(inv.hardRules.some((r) => /Never git add -A/i.test(r)));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
