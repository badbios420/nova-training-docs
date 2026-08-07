#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  redactSecrets,
  normalizeErrorLine,
  fingerprintOf,
  clusterErrors,
  parseLedger,
  matchLedgerIncident,
  classifyIncidentStatus,
  runErrorDoctor,
  formatDoctorReportMarkdown,
  defaultLedgerMarkdown,
  discoverEvidenceSources,
  isExcludedEvidencePath,
  mergeIncidentFamilies,
  selectTopFamilies,
  DOCTOR_VERSION,
} from "./lib/error-doctor-lib.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e && e.stack ? e.stack : e}`);
    failed++;
  }
}

console.log("error-doctor unit tests\n");

test("redacts bearer and sk keys and emails", () => {
  const s = redactSecrets("Bearer abcdefghijklmnop sk-1234567890abcdef user@example.com");
  assert.ok(!s.includes("abcdefghijklmnop"));
  assert.ok(!s.includes("sk-1234567890"));
  assert.ok(!s.includes("user@example.com"));
  assert.match(s, /REDACTED|EMAIL/);
});

test("clusters repeated timeout variants", () => {
  const bundles = [
    {
      path: "/tmp/a.log",
      ok: true,
      lines: [
        "memory_search timed out after 15s runId=aaa-111",
        "memory_search timed out after 15s runId=bbb-222",
        "Memory search is unavailable due to an embedding/provider error.",
        "something totally different ECONNREFUSED 127.0.0.1:9999",
      ],
    },
  ];
  const clusters = clusterErrors(bundles);
  assert.ok(clusters.length >= 2);
  const mem = clusters.filter((c) => /memory-search-timeout|memory_search/i.test(c.fingerprint + c.normalized));
  assert.ok(mem.some((c) => c.count >= 2));
});

test("separates unrelated errors", () => {
  const bundles = [
    {
      path: "x",
      ok: true,
      lines: ["memory_search timed out after 15s", "402 Insufficient credits on openrouter"],
    },
  ];
  const clusters = clusterErrors(bundles);
  const fps = new Set(clusters.map((c) => c.fingerprint));
  assert.ok(fps.size >= 2);
});

test("ledger recognizes known memory_search incident", () => {
  const ledger = parseLedger(defaultLedgerMarkdown());
  const fp = fingerprintOf(
    normalizeErrorLine("memory_search timed out after 15s runId=abc"),
  );
  const hit = matchLedgerIncident(fp, ledger);
  assert.ok(hit);
  assert.equal(hit.id, "E-memory-search-timeout");
});

test("REGRESSED when prior RESOLVED and probe fails", () => {
  const st = classifyIncidentStatus({ count: 2 }, { status: "RESOLVED" }, { probePass: false });
  assert.equal(st, "REGRESSED");
});

test("KNOWN when prior KNOWN", () => {
  assert.equal(
    classifyIncidentStatus({ count: 1 }, { status: "KNOWN" }, { probePass: true }),
    "KNOWN",
  );
});

test("NEW when no prior", () => {
  assert.equal(classifyIncidentStatus({ count: 1 }, null, {}), "NEW");
});

test("missing log sources graceful + deterministic options", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "errdoc-"));
  fs.writeFileSync(path.join(tmp, "memory-error-doctor-ledger.md"), defaultLedgerMarkdown());
  fs.mkdirSync(path.join(tmp, "memory"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "memory/error-doctor-ledger.md"), defaultLedgerMarkdown());
  const logPath = path.join(tmp, "fake.log");
  fs.writeFileSync(
    logPath,
    [
      "memory_search timed out after 15s",
      "memory_search timed out after 15s",
      "active-memory done status=timeout elapsedMs=12001",
    ].join("\n"),
  );

  const report = runErrorDoctor({
    workspace: tmp,
    skipLiveProbes: true,
    ledgerPath: path.join(tmp, "memory/error-doctor-ledger.md"),
    sources: [
      { kind: "openclaw_log", path: logPath },
      { kind: "openclaw_log", path: path.join(tmp, "missing.log") },
    ],
  });

  assert.equal(report.sourcesFail, 1);
  assert.equal(report.sourcesOk, 1);
  assert.ok(report.incidents.length >= 1);
  const mem = report.incidents.find(
    (i) => i.id === "E-memory-search-timeout" || i.familyId === "F-memory-search-timeout",
  );
  assert.ok(mem);
  assert.equal(mem.status, "KNOWN");
  assert.ok(mem.options.length >= 2);
  assert.equal(mem.options[0].n, 1);
  const md = formatDoctorReportMarkdown(report);
  assert.match(md, /READ-ONLY/);
  assert.ok(!/repair executed|applied fix/i.test(md));
});

test("does not duplicate ledger ids in parse", () => {
  const ledger = parseLedger(defaultLedgerMarkdown() + defaultLedgerMarkdown());
  assert.ok(ledger["E-memory-search-timeout"]);
});

test("fingerprint stable for same normalized form", () => {
  const a = fingerprintOf(normalizeErrorLine("foo timeout runId=1"));
  const b = fingerprintOf(normalizeErrorLine("foo timeout runId=2"));
  assert.equal(a, b);
});

// --- Precision pass tests ---

test("report corpus excluded from discovery", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "errdoc-excl-"));
  const jobDir = path.join(tmp, "memory/cursor-jobs");
  const swarmDir = path.join(tmp, "memory/swarm/runs/2026-08-01-error-doctor");
  fs.mkdirSync(jobDir, { recursive: true });
  fs.mkdirSync(swarmDir, { recursive: true });
  fs.writeFileSync(path.join(swarmDir, "error-doctor-report.md"), "status: failed bogus");
  fs.writeFileSync(path.join(swarmDir, "chair-adjudication.md"), "error timeout");
  fs.writeFileSync(path.join(swarmDir, "worker-packet.json"), '{"error":"x"}');
  fs.writeFileSync(path.join(jobDir, "cursor-brief-error-doctor-precision.md"), "error timeout");
  fs.writeFileSync(path.join(jobDir, "nova-error-log-audit-2026-07-28.md"), "error timeout");
  fs.writeFileSync(path.join(tmp, "memory/error-doctor-ledger.md"), defaultLedgerMarkdown());
  fs.writeFileSync(path.join(jobDir, "safe-real.log"), "memory_search timed out after 15s\n");

  assert.equal(isExcludedEvidencePath(path.join(swarmDir, "error-doctor-report.md")), true);
  assert.equal(isExcludedEvidencePath(path.join(tmp, "memory/error-doctor-ledger.md")), true);
  assert.equal(isExcludedEvidencePath(path.join(jobDir, "nova-error-log-audit-2026-07-28.md")), true);

  const sources = discoverEvidenceSources(tmp, {
    logDir: path.join(tmp, "missing-logs"),
    includeFixtures: false,
  });
  for (const s of sources) {
    assert.equal(
      isExcludedEvidencePath(s.path),
      false,
      `discovered excluded path: ${s.path}`,
    );
  }
  assert.ok(sources.some((s) => s.path.endsWith("safe-real.log")));
  assert.ok(!sources.some((s) => /error-doctor-report|chair-adjudication|worker-packet|nova-error-log-audit|swarm\/runs/i.test(s.path)));
});

test("same-run lifecycle stages merge into one family", () => {
  const runId = "active-memory-msasyvy1-a15b49d7";
  const bundles = [
    {
      path: "/tmp/am.log",
      ok: true,
      lines: [
        `active-memory: before_prompt_build recall timed out after 13500ms; skipping memory lookup`,
        `embedded run timeout: runId=${runId} sessionId=${runId} timeoutMs=12000`,
        `embedded abort settle timed out: runId=${runId} sessionId=${runId} timeoutMs=2000`,
        `[responses] error provider=xai message=Request was aborted`,
        `{"event":"embedded_run_failover_decision","runId":"${runId}","failoverReason":"timeout","profileFailureReason":"timeout"}`,
      ],
    },
  ];
  const clusters = clusterErrors(bundles);
  const families = mergeIncidentFamilies(clusters);
  const am = families.filter((f) => f.familyId === "F-active-memory-timeout");
  assert.equal(am.length, 1, `expected 1 AM family, got ${families.map((f) => f.familyId).join(",")}`);
  assert.ok(am[0].children.length >= 3, `expected merged children, got ${am[0].children.length}`);
  assert.ok(am[0].count >= 4);
});

test("unrelated timeouts remain separate", () => {
  const bundles = [
    {
      path: "/tmp/split.log",
      ok: true,
      lines: [
        "active-memory: before_prompt_build recall timed out after 13500ms",
        "fetch timeout reached for TTS elevenlabs speech synthesis",
      ],
    },
  ];
  const families = mergeIncidentFamilies(clusterErrors(bundles));
  const ids = new Set(families.map((f) => f.familyId));
  assert.ok(ids.has("F-active-memory-timeout"), `missing AM family: ${[...ids]}`);
  assert.ok(ids.has("F-fetch-tts-timeout"), `missing TTS family: ${[...ids]}`);
  assert.ok(ids.size >= 2);
});

test("punctuation variants merge (aborted vs aborted.)", () => {
  const a = fingerprintOf(normalizeErrorLine("Request was aborted"));
  const b = fingerprintOf(normalizeErrorLine("Request was aborted."));
  assert.equal(a, b);
  const clusters = clusterErrors([
    {
      path: "p",
      ok: true,
      lines: [
        "[responses] error message=Request was aborted",
        "[responses] error message=Request was aborted.",
      ],
    },
  ]);
  const aborted = clusters.filter((c) => /aborted/i.test(c.normalized));
  assert.ok(aborted.length >= 1);
  assert.ok(aborted.some((c) => c.count >= 2));
});

test("high-severity low-count remains visible in top families", () => {
  const incidents = [
    {
      id: "F-noise-many",
      status: "KNOWN",
      count: 100,
      confidence: "medium",
      blastRadius: { severity: "low", summary: "noise" },
    },
    {
      id: "F-billing-402",
      status: "NEW",
      count: 1,
      confidence: "high",
      blastRadius: { severity: "high", summary: "billing" },
    },
    {
      id: "F-watch",
      status: "KNOWN",
      count: 50,
      confidence: "medium",
      blastRadius: { severity: "low-medium", summary: "am" },
    },
  ];
  const { families } = selectTopFamilies(incidents, 2);
  assert.ok(
    families.some((f) => f.id === "F-billing-402"),
    `high-sev missing from top: ${families.map((f) => f.id)}`,
  );
});

test("no raw secrets in formatted output", () => {
  const report = runErrorDoctor({
    workspace: fs.mkdtempSync(path.join(os.tmpdir(), "errdoc-sec-")),
    skipLiveProbes: true,
    ledgerPath: path.join(os.tmpdir(), "no-such-ledger-errdoc.md"),
    sources: [
      {
        kind: "openclaw_log",
        path: (() => {
          const p = path.join(os.tmpdir(), `errdoc-sec-${Date.now()}.log`);
          fs.writeFileSync(
            p,
            "ERROR auth failed Bearer FAKESECRET_e2f3g4h5i6j7k8l9m0n1 sk-abcdefghijklmnopqrstuvwx memory_search timed out after 15s\n",
          );
          return p;
        })(),
      },
    ],
  });
  const md = formatDoctorReportMarkdown(report);
  const json = JSON.stringify(report);
  assert.ok(!md.includes("tok_LIVESECRETVALUE99"));
  assert.ok(!md.includes("sk-abcdefghijklmnopqrstuvwx"));
  assert.ok(!json.includes("tok_LIVESECRETVALUE99"));
  assert.ok(!json.includes("sk-abcdefghijklmnopqrstuvwx"));
  assert.match(md + json, /REDACTED/);
});

test("doctor run does not call repair / doctor --fix / write config", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "errdoc-ban-"));
  fs.mkdirSync(path.join(tmp, "memory"), { recursive: true });
  const ledger = path.join(tmp, "memory/error-doctor-ledger.md");
  fs.writeFileSync(ledger, defaultLedgerMarkdown());
  const logPath = path.join(tmp, "x.log");
  fs.writeFileSync(logPath, "active-memory done status=timeout elapsedMs=12000\n");

  const report = runErrorDoctor({
    workspace: tmp,
    skipLiveProbes: true,
    ledgerPath: ledger,
    sources: [{ kind: "openclaw_log", path: logPath }],
  });

  assert.ok(report.hardBans.some((b) => /doctor --fix/i.test(b)));
  assert.ok(report.hardBans.some((b) => /no config edits/i.test(b)));
  assert.ok(report.hardBans.some((b) => /auto-repair|no repairs|repair/i.test(b)));
  assert.equal(report.sideEffects.repaired, false);
  assert.equal(report.sideEffects.doctorFix, false);
  assert.equal(report.sideEffects.configWritten, false);
  assert.equal(report.sideEffects.gatewayRestarted, false);

  const libSrc = fs.readFileSync(
    path.join(path.dirname(new URL(import.meta.url).pathname), "lib/error-doctor-lib.mjs"),
    "utf8",
  );
  const cliSrc = fs.readFileSync(
    path.join(path.dirname(new URL(import.meta.url).pathname), "error-doctor.mjs"),
    "utf8",
  );
  // No live invocation of doctor --fix / --repair (ban strings mentioning them are fine)
  assert.ok(!/execFileSync\([^)]*doctor[^)]*--fix/.test(libSrc));
  assert.ok(!/spawn(?:Sync)?\([^)]*doctor[^)]*--fix/.test(libSrc + cliSrc));
  assert.ok(!/execFileSync\(\s*["']openclaw["']/.test(libSrc + cliSrc));
  assert.ok(!/writeFileSync\([^)]*openclaw\.json/.test(libSrc + cliSrc));
  assert.ok(DOCTOR_VERSION);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
