#!/usr/bin/env node
/**
 * Active Memory smoke tests — offline contract + package presence.
 * Does not mutate openclaw.json or call live gateway.
 * Run: node scripts/test-active-memory-smoke.mjs
 */

import {
  normalizeAmConfig,
  isTurnEligible,
  mockRecallBackend,
  buildInjection,
  runActiveMemoryTurn,
  checkPluginPackagePresent,
  injectionExposesSecrets,
  DEFAULT_MAX_SUMMARY_CHARS,
} from "./lib/active-memory-smoke-lib.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      passed += 1;
      console.log(`  PASS  ${name}`);
    })
    .catch((err) => {
      failed += 1;
      console.error(`  FAIL  ${name}`);
      console.error(`        ${err instanceof Error ? err.message : err}`);
    });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log("active-memory smoke tests\n");

await test("plugin package loads (files + manifest present)", () => {
  const p = checkPluginPackagePresent();
  assert(p.ok === true, `plugin package missing: ${JSON.stringify(p)}`);
  assert(p.manifest && (p.manifest.id || p.manifest.name || p.manifest), "manifest parse");
});

await test("normalizeAmConfig defaults", () => {
  const c = normalizeAmConfig({});
  assert(c.enabled === true, "enabled");
  assert(c.agents.includes("main"), "main agent");
  assert(c.allowedChatTypes.includes("direct"), "direct");
  assert(c.maxSummaryChars === DEFAULT_MAX_SUMMARY_CHARS, "max chars");
});

await test("eligible turn injects expected memory context", async () => {
  const r = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "direct" },
    config: { enabled: true, agents: ["main"], allowedChatTypes: ["direct"], maxSummaryChars: 220 },
    recall: mockRecallBackend("ok", "Hilltop weekly -5k path is live"),
  });
  assert(r.injected === true, "injected");
  assert(r.text.includes("Active Memory"), "wrapper");
  assert(r.text.includes("Hilltop"), "content");
});

await test("ineligible turn does not inject (group chat)", async () => {
  const r = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "group" },
    config: { enabled: true, agents: ["main"], allowedChatTypes: ["direct"] },
    recall: mockRecallBackend("ok", "secret should not inject"),
  });
  assert(r.injected === false, "no inject");
  assert(r.reason === "chat_type_not_allowed", `reason ${r.reason}`);
  assert(!r.text.includes("secret"), "no leak");
});

await test("ineligible agent id does not inject", async () => {
  const r = await runActiveMemoryTurn({
    turn: { agentId: "other", chatType: "direct" },
    config: { enabled: true, agents: ["main"] },
    recall: mockRecallBackend("ok", "nope"),
  });
  assert(r.injected === false && r.reason === "agent_not_allowed", "agent gate");
});

await test("missing/unavailable memory backend fails gracefully", async () => {
  const r = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "direct" },
    config: { enabled: true },
    recall: mockRecallBackend("error"),
  });
  assert(r.injected === false, "no inject on error");
  assert(r.reason === "backend_unavailable", "reason");
  assert(r.backend && r.backend.ok === false, "backend flag");
});

await test("backend throw fails gracefully", async () => {
  const r = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "direct" },
    config: { enabled: true },
    recall: async () => {
      throw new Error("boom");
    },
  });
  assert(r.injected === false && r.reason === "backend_throw", "throw handled");
});

await test("duplicate injection prevented", async () => {
  const first = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "direct" },
    config: { maxSummaryChars: 220 },
    recall: mockRecallBackend("ok", "same fact"),
  });
  assert(first.injected === true, "first");
  const second = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "direct", priorInjectedHash: first.hash },
    config: { maxSummaryChars: 220 },
    recall: mockRecallBackend("ok", "same fact"),
  });
  assert(second.injected === false && second.reason === "duplicate", "dup blocked");
});

await test("injected content stays within configured limits", () => {
  const long = "x".repeat(500);
  const built = buildInjection({ summary: long, maxSummaryChars: 50 });
  assert(built.inject === true, "inject");
  // wrapper + body — body truncated to 50
  assert(built.truncated === true, "truncated");
  const body = built.text.replace(/^.*Active Memory:\n/, "");
  assert(body.length <= 50, `body len ${body.length}`);
});

await test("no secrets or protected files exposed", () => {
  const dirty =
    "wallet path memory/.nova-wallet-key and mnemonic seed phrase and openclaw.json token";
  const built = buildInjection({ summary: dirty, maxSummaryChars: 400 });
  // lines with markers stripped — may become empty
  if (built.inject) {
    const leaks = injectionExposesSecrets(built.text);
    assert(leaks.length === 0, `leaks ${leaks.join(",")}`);
  } else {
    assert(built.reason === "redacted_empty" || built.reason === "empty_summary", "redacted");
  }
  const clean = buildInjection({
    summary: "Vista FBN is CLOSED",
    maxSummaryChars: 220,
  });
  assert(clean.inject === true, "clean injects");
  assert(injectionExposesSecrets(clean.text).length === 0, "clean no secrets");
});

await test("isTurnEligible session disabled", () => {
  const r = isTurnEligible(
    { agentId: "main", chatType: "direct", sessionDisabled: true },
    { enabled: true },
  );
  assert(r.eligible === false && r.reason === "session_disabled", "session off");
});

await test("empty backend summary does not inject", async () => {
  const r = await runActiveMemoryTurn({
    turn: { agentId: "main", chatType: "direct" },
    config: {},
    recall: mockRecallBackend("empty"),
  });
  assert(r.injected === false, "no empty inject");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
