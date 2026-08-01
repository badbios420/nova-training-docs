/**
 * Active Memory smoke helpers — policy/contract tests without live gateway.
 * Mirrors documented AM behavior (docs/concepts/active-memory.md + local config norms).
 */

import fs from "node:fs";
import path from "node:path";

export const DEFAULT_MAX_SUMMARY_CHARS = 220;
export const DEFAULT_AGENTS = Object.freeze(["main"]);
export const DEFAULT_ALLOWED_CHAT_TYPES = Object.freeze(["direct"]);

/** Paths that must never appear in injected AM text. */
export const PROTECTED_PATH_MARKERS = Object.freeze([
  "openclaw.json",
  ".nova-wallet-key",
  "nova-mainnet",
  "mnemonic",
  "seed phrase",
  "private key",
  "BEGIN OPENSSH",
  "credentials.json",
  "CURSOR_API_KEY",
]);

/**
 * @typedef {object} AmConfig
 * @property {boolean} [enabled]
 * @property {string[]} [agents]
 * @property {string[]} [allowedChatTypes]
 * @property {number} [maxSummaryChars]
 * @property {number} [timeoutMs]
 */

/**
 * @typedef {object} TurnContext
 * @property {string} agentId
 * @property {string} chatType  direct|group|channel
 * @property {boolean} [pluginEnabled]
 * @property {boolean} [sessionDisabled]
 */

export function normalizeAmConfig(raw = {}) {
  const maxSummaryChars = Number(raw.maxSummaryChars ?? DEFAULT_MAX_SUMMARY_CHARS);
  return {
    enabled: raw.enabled !== false,
    agents: Array.isArray(raw.agents) && raw.agents.length ? [...raw.agents] : [...DEFAULT_AGENTS],
    allowedChatTypes:
      Array.isArray(raw.allowedChatTypes) && raw.allowedChatTypes.length
        ? [...raw.allowedChatTypes]
        : [...DEFAULT_ALLOWED_CHAT_TYPES],
    maxSummaryChars: Number.isFinite(maxSummaryChars) && maxSummaryChars > 0 ? maxSummaryChars : DEFAULT_MAX_SUMMARY_CHARS,
    timeoutMs: Number(raw.timeoutMs ?? 15_000),
  };
}

/**
 * Eligible for AM inject?
 */
export function isTurnEligible(turn, config) {
  const cfg = normalizeAmConfig(config);
  if (!cfg.enabled) return { eligible: false, reason: "config_disabled" };
  if (turn.pluginEnabled === false) return { eligible: false, reason: "plugin_disabled" };
  if (turn.sessionDisabled === true) return { eligible: false, reason: "session_disabled" };
  const agentId = String(turn.agentId || "").toLowerCase();
  if (!cfg.agents.map((a) => a.toLowerCase()).includes(agentId)) {
    return { eligible: false, reason: "agent_not_allowed" };
  }
  const chatType = String(turn.chatType || "").toLowerCase();
  if (!cfg.allowedChatTypes.map((c) => c.toLowerCase()).includes(chatType)) {
    return { eligible: false, reason: "chat_type_not_allowed" };
  }
  return { eligible: true, reason: "ok" };
}

/**
 * Simulate recall backend.
 * @param {'ok'|'empty'|'error'} mode
 * @param {string} [text]
 */
export function mockRecallBackend(mode, text = "") {
  return async () => {
    if (mode === "error") {
      return { ok: false, status: "unavailable", error: "database is not open", text: "" };
    }
    if (mode === "empty") {
      return { ok: true, status: "empty", text: "" };
    }
    return { ok: true, status: "ok", text: String(text || "") };
  };
}

/**
 * Bound and sanitize injection payload.
 */
export function buildInjection({ summary, maxSummaryChars, priorInjectedHash = null }) {
  const cfgMax = maxSummaryChars ?? DEFAULT_MAX_SUMMARY_CHARS;
  let text = String(summary || "").trim();
  if (!text) {
    return { inject: false, reason: "empty_summary", text: "", hash: null, truncated: false };
  }

  // Strip obvious secret lines
  const lines = text.split("\n").filter((line) => {
    const lower = line.toLowerCase();
    return !PROTECTED_PATH_MARKERS.some((m) => lower.includes(m.toLowerCase()));
  });
  text = lines.join("\n").trim();
  if (!text) {
    return { inject: false, reason: "redacted_empty", text: "", hash: null, truncated: false };
  }

  let truncated = false;
  if (text.length > cfgMax) {
    text = text.slice(0, cfgMax);
    truncated = true;
  }

  const hash = simpleHash(text);
  if (priorInjectedHash && priorInjectedHash === hash) {
    return { inject: false, reason: "duplicate", text: "", hash, truncated };
  }

  return {
    inject: true,
    reason: "ok",
    text: `🧩 Active Memory:\n${text}`,
    hash,
    truncated,
  };
}

export function simpleHash(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i += 1) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return String(h);
}

/**
 * One-shot smoke pipeline for a turn.
 */
export async function runActiveMemoryTurn({ turn, config, recall }) {
  const cfg = normalizeAmConfig(config);
  const elig = isTurnEligible(turn, cfg);
  if (!elig.eligible) {
    return {
      injected: false,
      reason: elig.reason,
      text: "",
      backend: null,
    };
  }

  let backend;
  try {
    backend = await recall();
  } catch (err) {
    return {
      injected: false,
      reason: "backend_throw",
      text: "",
      backend: { ok: false, error: String(err && err.message ? err.message : err) },
    };
  }

  if (!backend || backend.ok === false) {
    return {
      injected: false,
      reason: "backend_unavailable",
      text: "",
      backend,
    };
  }

  const built = buildInjection({
    summary: backend.text,
    maxSummaryChars: cfg.maxSummaryChars,
    priorInjectedHash: turn.priorInjectedHash ?? null,
  });

  return {
    injected: built.inject,
    reason: built.reason,
    text: built.text,
    hash: built.hash,
    truncated: built.truncated,
    backend,
  };
}

/**
 * Plugin package presence (load contract without enabling runtime).
 */
export function checkPluginPackagePresent(openclawRoot) {
  const root = openclawRoot || guessOpenclawRoot();
  const pluginJson = path.join(root, "dist/extensions/active-memory/openclaw.plugin.json");
  const indexJs = path.join(root, "dist/extensions/active-memory/index.js");
  const docs = path.join(root, "docs/concepts/active-memory.md");
  const result = {
    root,
    pluginJsonExists: fs.existsSync(pluginJson),
    indexJsExists: fs.existsSync(indexJs),
    docsExist: fs.existsSync(docs),
  };
  result.ok = result.pluginJsonExists && result.indexJsExists;
  if (result.pluginJsonExists) {
    try {
      result.manifest = JSON.parse(fs.readFileSync(pluginJson, "utf8"));
    } catch (e) {
      result.manifestError = String(e.message || e);
      result.ok = false;
    }
  }
  return result;
}

export function guessOpenclawRoot() {
  const home = process.env.HOME || "";
  const candidates = [
    path.join(home, ".npm-global/lib/node_modules/openclaw"),
    path.join(home, ".nvm/versions/node/v24.18.0/lib/node_modules/openclaw"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "package.json"))) return c;
  }
  return candidates[0];
}

/**
 * Ensure injection text does not leak protected markers.
 */
export function injectionExposesSecrets(text) {
  const lower = String(text || "").toLowerCase();
  return PROTECTED_PATH_MARKERS.filter((m) => lower.includes(m.toLowerCase()));
}
