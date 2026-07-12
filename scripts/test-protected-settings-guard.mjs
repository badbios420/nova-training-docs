#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-guard-test-"));
const config = path.join(root, "openclaw.json");
const sessions = path.join(root, "sessions.json");
const state = path.join(root, "state");
const script = path.resolve(path.dirname(new URL(import.meta.url).pathname), "protected-settings-guard.mjs");
const env = { ...process.env, OPENCLAW_GUARD_CONFIG: config, OPENCLAW_GUARD_SESSIONS: sessions, OPENCLAW_GUARD_STATE_DIR: state };
const baseline = {
  models: { providers: { xai: { apiKey: "test-secret", models: [{ id: "grok-4.5" }] }, zai: { apiKey: "test-secret-2", models: [{ id: "glm-5.1" }] } } },
  agents: { defaults: { model: { primary: "xai/grok-4.5" }, models: { "xai/grok-4.5": { alias: "grok" }, "zai/glm-5.1": { alias: "GLM" } }, thinkingDefault: "medium" } },
};
const parentKey = "agent:main:dashboard:test-parent";

fs.writeFileSync(config, JSON.stringify(baseline));
fs.writeFileSync(sessions, JSON.stringify({ [parentKey]: { modelProvider: "xai", model: "grok-4.5", thinkingLevel: "medium", fastMode: false } }));
execFileSync(process.execPath, [script, "snapshot", "--context", "test"], { env });

const mutated = structuredClone(baseline);
mutated.agents.defaults.model.primary = "zai/glm-5.1";
delete mutated.agents.defaults.models["xai/grok-4.5"];
fs.writeFileSync(config, JSON.stringify(mutated));
const fallbackStore = { [parentKey]: { modelProvider: "zai", model: "glm-5.1", providerOverride: "zai", modelOverride: "glm-5.1", modelOverrideSource: "auto", modelOverrideFallbackOriginProvider: "xai", modelOverrideFallbackOriginModel: "grok-4.5", thinkingLevel: "medium", fastMode: false } };
fs.writeFileSync(sessions, JSON.stringify(fallbackStore));
try { execFileSync(process.execPath, [script, "check", "--context", "failure-recovery-test", "--session-key", parentKey], { env }); } catch (error) { assert.equal(error.status, 2); }

const repairedConfig = JSON.parse(fs.readFileSync(config));
const repairedSession = JSON.parse(fs.readFileSync(sessions))[parentKey];
assert.equal(repairedConfig.agents.defaults.model.primary, "xai/grok-4.5");
assert.ok(repairedConfig.agents.defaults.models["xai/grok-4.5"]);
assert.ok(repairedConfig.agents.defaults.models["zai/glm-5.1"]);
assert.equal(repairedSession.modelProvider, "xai");
assert.equal(repairedSession.model, "grok-4.5");
assert.equal(repairedSession.thinkingLevel, "medium");
assert.equal(repairedSession.fastMode, false);
assert.equal(repairedSession.modelOverride, undefined);
const audit = fs.readFileSync(path.join(state, "audit.jsonl"), "utf8");
assert.ok(audit.includes("failure-recovery-test"));
assert.ok(!audit.includes("test-secret"));
console.log(JSON.stringify({ ok: true, tests: 10, root }));
