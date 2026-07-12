#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const home = process.env.HOME || "/home/mrbig3";
const configPath = process.env.OPENCLAW_GUARD_CONFIG || path.join(home, ".openclaw", "openclaw.json");
const sessionsPath = process.env.OPENCLAW_GUARD_SESSIONS || path.join(home, ".openclaw", "agents", "main", "sessions", "sessions.json");
const stateDir = process.env.OPENCLAW_GUARD_STATE_DIR || path.join(home, ".openclaw", "protected-settings");
const baselinePath = path.join(stateDir, "baseline.json");
const auditPath = path.join(stateDir, "audit.jsonl");

function args(argv) {
  const out = { command: "check", context: "unspecified", sessionKey: "" };
  if (argv[0] && !argv[0].startsWith("--")) out.command = argv[0];
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === "--context") out.context = argv[++i] || out.context;
    else if (argv[i] === "--session-key") out.sessionKey = argv[++i] || "";
  }
  return out;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function atomicJson(file, value, mode = 0o600) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { mode });
  await fs.rename(temp, file);
}

function protectedValues(config) {
  return {
    globalDefaultModel: config?.agents?.defaults?.model?.primary ?? null,
    defaultProvider: config?.agents?.defaults?.provider ?? null,
    preferredProvider: config?.agents?.defaults?.preferredProvider ?? null,
    modelAliasesAndAllowlist: config?.agents?.defaults?.models ?? {},
    providerRegistry: config?.models?.providers ?? {},
  };
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function equal(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

function safeSummary(value) {
  return {
    globalDefaultModel: value.globalDefaultModel,
    defaultProvider: value.defaultProvider,
    preferredProvider: value.preferredProvider,
    modelAliasesAndAllowlist: value.modelAliasesAndAllowlist,
    providerRegistry: Object.fromEntries(Object.entries(value.providerRegistry || {}).map(([provider, spec]) => [provider, {
      models: Array.isArray(spec?.models) ? spec.models.map((model) => model?.id).filter(Boolean) : [],
    }])),
  };
}

async function audit(record) {
  await fs.mkdir(stateDir, { recursive: true });
  await fs.appendFile(auditPath, `${JSON.stringify({ timestamp: new Date().toISOString(), ...record })}\n`, { mode: 0o600 });
}

function restoreProtected(config, baseline) {
  config.agents ||= {};
  config.agents.defaults ||= {};
  config.agents.defaults.model ||= {};
  config.models ||= {};
  config.agents.defaults.model.primary = baseline.globalDefaultModel;
  if (baseline.defaultProvider == null) delete config.agents.defaults.provider;
  else config.agents.defaults.provider = baseline.defaultProvider;
  if (baseline.preferredProvider == null) delete config.agents.defaults.preferredProvider;
  else config.agents.defaults.preferredProvider = baseline.preferredProvider;
  config.agents.defaults.models = baseline.modelAliasesAndAllowlist;
  config.models.providers = baseline.providerRegistry;
}

async function checkSession(sessionKey, primary, context) {
  if (!sessionKey || sessionKey.includes(":subagent:")) return { changed: false };
  const store = await readJson(sessionsPath);
  const entry = store[sessionKey];
  if (!entry || entry.modelOverrideSource !== "auto") return { changed: false };
  const [originProvider, ...originModelParts] = String(primary).split("/");
  const originModel = originModelParts.join("/");
  if (entry.modelOverrideFallbackOriginProvider !== originProvider || entry.modelOverrideFallbackOriginModel !== originModel) {
    return { changed: false };
  }
  const oldValue = `${entry.providerOverride || entry.modelProvider || ""}/${entry.modelOverride || entry.model || ""}`;
  for (const key of ["providerOverride", "modelOverride", "modelOverrideSource", "modelOverrideFallbackOriginProvider", "modelOverrideFallbackOriginModel", "fallbackNoticeSelectedModel", "fallbackNoticeActiveModel", "fallbackNoticeReason", "liveModelSwitchPending"]) delete entry[key];
  entry.modelProvider = originProvider;
  entry.model = originModel;
  await atomicJson(sessionsPath, store);
  await audit({ setting: `session:${sessionKey}:model`, oldValue, newValue: primary, approval: "automatic fallback is ephemeral; restored protected parent selection", responsible: context, verification: "readback pending" });
  const verify = (await readJson(sessionsPath))[sessionKey];
  const ok = verify?.modelProvider === originProvider && verify?.model === originModel && !verify?.modelOverride;
  await audit({ setting: `session:${sessionKey}:model`, oldValue, newValue: primary, approval: "policy enforcement", responsible: context, verification: ok ? "passed" : "failed" });
  if (!ok) throw new Error(`failed to restore session model for ${sessionKey}`);
  return { changed: true, oldValue, newValue: primary };
}

const options = args(process.argv.slice(2));
const config = await readJson(configPath);
const current = protectedValues(config);

if (options.command === "snapshot") {
  await atomicJson(baselinePath, current);
  await audit({ setting: "protected-settings-baseline", oldValue: null, newValue: "snapshot", approval: options.context, responsible: process.pid, verification: "passed" });
  console.log(JSON.stringify({ ok: true, baselinePath, protected: safeSummary(current) }));
  process.exit(0);
}

const baseline = await readJson(baselinePath);
let configChanged = false;
if (!equal(current, baseline)) {
  restoreProtected(config, baseline);
  await atomicJson(configPath, config);
  configChanged = true;
  await audit({ setting: "protected-settings", oldValue: safeSummary(current), newValue: safeSummary(baseline), approval: "unauthorized mutation rejected", responsible: options.context, verification: "readback pending" });
  const verified = equal(protectedValues(await readJson(configPath)), baseline);
  await audit({ setting: "protected-settings", oldValue: safeSummary(current), newValue: safeSummary(baseline), approval: "policy enforcement", responsible: options.context, verification: verified ? "passed" : "failed" });
  if (!verified) throw new Error("protected config restoration verification failed");
}

const session = await checkSession(options.sessionKey, baseline.globalDefaultModel, options.context);
console.log(JSON.stringify({ ok: true, configChanged, session }));
if (configChanged || session.changed) process.exitCode = 2;
