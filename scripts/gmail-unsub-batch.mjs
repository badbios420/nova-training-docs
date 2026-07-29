#!/usr/bin/env node
/**
 * Gmail unsubscribe batch via openclaw browser remote profile.
 * Usage: node scripts/gmail-unsub-batch.mjs
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "/home/mrbig3/.openclaw/workspace";
const LOG = resolve(ROOT, "memory/cursor-jobs/gmail-unsub-batch1-2026-07-28.md");
const PATH_ENV = [
  `${process.env.HOME}/.nvm/versions/node/v24.18.0/bin`,
  `${process.env.HOME}/.local/bin`,
  `${process.env.HOME}/.npm-global/bin`,
  process.env.PATH || "",
].join(":");

const QUEUE = [
  { id: "homes", q: "from:homes@email.homes.com", label: "Homes.com" },
  { id: "mlsblast", q: "from:mlsblast.com", label: "MLS Blast (mlsblast.com)" },
  { id: "hostgator", q: "from:e.hostgator.com", label: "HostGator" },
  { id: "applevac", q: "from:applevacations.com", label: "Apple Vacations" },
  { id: "mcd", q: "from:m.mcdonalds.com", label: "McDonald's" },
  { id: "carls", q: "from:email.carlsjr.com", label: "Carl's Jr" },
  { id: "fox", q: "from:m.fox.com", label: "FOX One" },
  { id: "crypto", q: "from:news.crypto.com", label: "Crypto.com" },
  { id: "canva", q: "from:engage.canva.com", label: "Canva" },
  { id: "turbotax", q: "from:em1.turbotax.intuit.com", label: "TurboTax Monthly" },
  { id: "upstart", q: "from:home.upstart.com", label: "Upstart" },
  { id: "ceshop", q: "from:theceshop.com", label: "The CE Shop" },
  { id: "redx", q: "from:redx.com", label: "REDX Marketing" },
  { id: "listreports", q: "from:hello.listreports.com", label: "ListReports" },
  { id: "phildong", q: "from:shared1.ccsend.com phildong", label: "Phil Dong Insurance" },
  { id: "demaio", q: "from:reformcalifornia.org", label: "Carl DeMaio" },
  { id: "trustindex", q: "from:trustindex.io", label: "Trustindex" },
];

function run(cmd, args, timeoutMs = 60000) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    timeout: timeoutMs,
    env: { ...process.env, PATH: PATH_ENV },
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    code: r.status ?? 1,
    out: `${r.stdout || ""}${r.stderr || ""}`.trim(),
  };
}

function browser(args, timeoutMs = 60000) {
  return run("openclaw", ["browser", "--browser-profile", "remote", ...args], timeoutMs);
}

function openSearch(query) {
  const url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
  return browser(["open", url], 30000);
}

const UNSUB_FN = `async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function click(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: "center", inline: "nearest" }); } catch (e) {}
    const opts = { bubbles: true, cancelable: true, view: window };
    for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
      try { el.dispatchEvent(new MouseEvent(type, opts)); } catch (e) {}
    }
    try { el.click(); } catch (e) {}
    return true;
  }
  function visible(el) {
    if (!el) return false;
    const r = el.getClientRects();
    return r && r.length > 0;
  }
  function textOf(el) {
    return ((el.innerText || el.getAttribute("aria-label") || "") + "").trim().replace(/\\s+/g, " ");
  }
  await sleep(800);
  const rows = document.querySelectorAll("tr.zA").length;
  // List-view unsubscribe buttons
  let buttons = Array.from(document.querySelectorAll("div.aOd, div.T-I.aOd, div[role=button], button, span[role=link]"))
    .filter((el) => textOf(el) === "Unsubscribe" && visible(el));
  if (!buttons.length) {
    // open first message
    const row = document.querySelector("tr.zA");
    if (row) {
      click(row);
      await sleep(2000);
      buttons = Array.from(document.querySelectorAll("div.aOd, div[role=button], button, span"))
        .filter((el) => textOf(el) === "Unsubscribe" && visible(el));
    }
  }
  if (!buttons.length) {
    return { ok: false, reason: "no-unsubscribe-control", rows, title: document.title };
  }
  click(buttons[0]);
  await sleep(1500);
  // Dialog confirm
  const candidates = Array.from(document.querySelectorAll("button, div[role=button]")).filter(visible);
  let confirm = candidates.find((el) => {
    const t = textOf(el);
    return t === "Unsubscribe" || /^Unsubscribe from\\b/i.test(t);
  });
  // Prefer dialog footer Unsubscribe (often near Cancel)
  const cancel = candidates.find((el) => textOf(el) === "Cancel");
  if (cancel) {
    const near = candidates.filter((el) => textOf(el) === "Unsubscribe");
    if (near.length) confirm = near[near.length - 1];
  }
  let confirmed = false;
  if (confirm) {
    click(confirm);
    confirmed = true;
    await sleep(1500);
  }
  const toast = Array.from(document.querySelectorAll(".bAq, .aT, [role=alert], .vh"))
    .map((e) => textOf(e))
    .filter(Boolean)
    .slice(0, 8);
  // remaining unsub buttons
  const remaining = Array.from(document.querySelectorAll("div.aOd, div[role=button], button"))
    .filter((el) => textOf(el) === "Unsubscribe" && visible(el)).length;
  return {
    ok: true,
    confirmed,
    rows,
    remainingUnsubButtons: remaining,
    toast,
    title: document.title,
  };
}`;

function evaluateUnsub() {
  return browser(["evaluate", "--fn", UNSUB_FN], 90000);
}

function parseJson(out) {
  const m = out.match(/\{[\s\S]*\}\s*$/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

function logLine(s) {
  appendFileSync(LOG, s + "\n");
  console.log(s);
}

writeFileSync(
  LOG,
  `# Gmail Unsubscribe Batch 1 — 2026-07-28

Method: OpenClaw browser profile \`remote\` → Gmail search → list Unsubscribe → confirm dialog  
Include: marketing batch + mlsblast.com  
Exclude: Mission Fed, NSDC, First American, OpenRouter, Hilltop/client-named

## Results
`,
);

const results = [];
for (const item of QUEUE) {
  console.log(`\n=== ${item.label} ===`);
  const opened = openSearch(item.q);
  if (opened.code !== 0) {
    logLine(`- **${item.label}**: FAIL open (${opened.out.slice(0, 120)})`);
    results.push({ ...item, status: "fail-open" });
    continue;
  }
  // wait for Gmail render
  spawnSync("sleep", ["4"]);
  // try up to 3 unsubscribe clicks per sender (different threads / remaining buttons)
  let last = null;
  let clicks = 0;
  for (let i = 0; i < 3; i++) {
    const ev = evaluateUnsub();
    last = parseJson(ev.out);
    if (!last) {
      logLine(`- **${item.label}**: FAIL parse evaluate: ${ev.out.slice(0, 200)}`);
      break;
    }
    if (!last.ok) {
      if (i === 0) logLine(`- **${item.label}**: SKIP (${last.reason || "no control"}; rows=${last.rows ?? "?"})`);
      break;
    }
    clicks += 1;
    if (!last.confirmed) {
      logLine(`- **${item.label}**: PARTIAL click without confirm (rows=${last.rows}) toast=${JSON.stringify(last.toast || [])}`);
      break;
    }
    // if no remaining buttons, done for this sender page
    if ((last.remainingUnsubButtons || 0) === 0) break;
    spawnSync("sleep", ["1"]);
  }
  if (clicks > 0 && last?.ok) {
    logLine(
      `- **${item.label}**: OK clicks=${clicks} confirmed=${!!last.confirmed} remainingBtns=${last.remainingUnsubButtons ?? "?"} toast=${JSON.stringify(last.toast || [])}`,
    );
    results.push({ ...item, status: "ok", clicks, last });
  } else if (!results.find((r) => r.id === item.id)) {
    results.push({ ...item, status: last?.reason || "unknown", last });
  }
  spawnSync("sleep", ["2"]);
}

const ok = results.filter((r) => r.status === "ok").length;
logLine(`\n## Summary\n- ok: ${ok}/${QUEUE.length}\n- finished: ${new Date().toISOString()}\n`);
console.log(`\nDONE ok=${ok}/${QUEUE.length} log=${LOG}`);
