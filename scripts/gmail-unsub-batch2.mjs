#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { appendFileSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "/home/mrbig3/.openclaw/workspace";
const LOG = resolve(ROOT, "memory/cursor-jobs/gmail-unsub-batch1-2026-07-28.md");
const PATH_ENV = [
  `${process.env.HOME}/.nvm/versions/node/v24.18.0/bin`,
  `${process.env.HOME}/.npm-global/bin`,
  process.env.PATH || "",
].join(":");

const QUEUE = [
  ["Homes.com", "from:homes@email.homes.com"],
  ["MLS Blast", "from:mlsblast.com"],
  ["HostGator", "from:e.hostgator.com"],
  ["Apple Vacations", "from:applevacations.com"],
  ["McDonald's", "from:m.mcdonalds.com"],
  ["Carl's Jr", "from:email.carlsjr.com"],
  ["FOX One", "from:m.fox.com"],
  ["Crypto.com", "from:news.crypto.com"],
  ["Canva", "from:engage.canva.com"],
  ["TurboTax Monthly", "from:em1.turbotax.intuit.com"],
  ["Upstart", "from:home.upstart.com"],
  ["The CE Shop", "from:theceshop.com"],
  ["REDX Marketing", "from:redx.com"],
  ["ListReports", "from:hello.listreports.com"],
  ["Phil Dong Insurance", "from:phildongagency.com"],
  ["Carl DeMaio", "from:reformcalifornia.org"],
  ["Trustindex", "from:trustindex.io"],
];

function sh(cmd, args, timeout = 90000) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    timeout,
    env: { ...process.env, PATH: PATH_ENV },
    maxBuffer: 12 * 1024 * 1024,
  });
  return { code: r.status ?? 1, out: `${r.stdout || ""}${r.stderr || ""}` };
}
function browser(args, timeout = 90000) {
  return sh("openclaw", ["browser", "--browser-profile", "remote", ...args], timeout);
}
function sleep(sec) {
  spawnSync("sleep", [String(sec)]);
}
function log(line) {
  appendFileSync(LOG, line + "\n");
  console.log(line);
}

function openSearch(q) {
  const url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(q)}`;
  return browser(["open", url], 30000);
}

function evalJson(fn, timeout = 60000) {
  const r = browser(["evaluate", "--fn", fn], timeout);
  const m = r.out.match(/\{[\s\S]*\}\s*$/);
  if (!m) return { parseError: true, raw: r.out.slice(0, 300) };
  try {
    return JSON.parse(m[0]);
  } catch (e) {
    return { parseError: true, raw: r.out.slice(0, 300) };
  }
}

function snapshotText() {
  const r = browser(["snapshot"], 60000);
  return r.out;
}

function findRefs(snap, patterns) {
  const lines = snap.split(/\r?\n/);
  const hits = [];
  for (const line of lines) {
    const refM = line.match(/\[ref=(e\d+)\]/);
    if (!refM) continue;
    for (const p of patterns) {
      if (p.test(line)) hits.push({ ref: refM[1], line: line.trim().slice(0, 160) });
    }
  }
  return hits;
}

function unsubOne(label, query) {
  console.log(`\n=== ${label} ===`);
  openSearch(query);
  sleep(5);

  // open first row
  const opened = evalJson(`async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const rows = document.querySelectorAll('tr.zA').length;
    const row = document.querySelector('tr.zA');
    if (!row) return { ok:false, reason:'no-rows', rows };
    row.click();
    await sleep(2800);
    return { ok:true, rows, title: document.title };
  }`);
  if (!opened.ok) {
    log(`- **${label}**: SKIP (${opened.reason || opened.raw || "open failed"}; rows=${opened.rows ?? "?"})`);
    return { label, status: "skip", opened };
  }

  // snapshot and find header Unsubscribe link near sender (prefer link Unsubscribe)
  let snap = snapshotText();
  let unsubLinks = findRefs(snap, [/link "Unsubscribe"/i, /link .*Unsubscribe/i]);
  // exclude footer-looking long lines if possible - prefer shorter lines
  unsubLinks.sort((a, b) => a.line.length - b.line.length);
  if (!unsubLinks.length) {
    // try clicking any Unsubscribe text via evaluate then snapshot dialog
    const clicked = evalJson(`() => {
      const els = [...document.querySelectorAll('a,div,span,button')];
      const btn = els.find(el => ((el.innerText||'').trim() === 'Unsubscribe') && el.getClientRects().length && (el.closest('.gD') || el.closest('.ha') || el.closest('.cf') || true));
      if (!btn) return { ok:false };
      btn.click();
      return { ok:true };
    }`);
    if (!clicked.ok) {
      log(`- **${label}**: SKIP (no unsubscribe control in message)`);
      return { label, status: "no-control" };
    }
    sleep(2);
    snap = snapshotText();
  } else {
    const ref = unsubLinks[0].ref;
    const clk = browser(["click", ref], 30000);
    if (clk.code !== 0) {
      log(`- **${label}**: FAIL click unsub ref ${ref}: ${clk.out.slice(0, 120)}`);
      return { label, status: "fail-click" };
    }
    sleep(2);
    snap = snapshotText();
  }

  // find alertdialog confirm
  if (!/alertdialog "Unsubscribe"|heading "Unsubscribe"/i.test(snap)) {
    // maybe already unsubscribed or different UI
    if (/You unsubscribed from/i.test(snap)) {
      log(`- **${label}**: OK already-unsubscribed banner`);
      return { label, status: "ok-already" };
    }
    log(`- **${label}**: FAIL no confirm dialog after unsub click`);
    return { label, status: "no-dialog" };
  }

  // Prefer button "Unsubscribe" inside dialog — last button Unsubscribe is usually confirm
  const cancel = findRefs(snap, [/button "Cancel"/i]);
  const buttons = findRefs(snap, [/button "Unsubscribe"/i]);
  let confirmRef = null;
  if (buttons.length) confirmRef = buttons[buttons.length - 1].ref;
  if (!confirmRef) {
    log(`- **${label}**: FAIL dialog without confirm button`);
    // close dialog if cancel exists
    if (cancel[0]) browser(["click", cancel[0].ref], 15000);
    return { label, status: "no-confirm" };
  }
  const conf = browser(["click", confirmRef], 30000);
  sleep(2);
  const after = snapshotText();
  const success = /You unsubscribed from/i.test(after);
  if (success) {
    const m = after.match(/You unsubscribed from[^\n"]+/i);
    log(`- **${label}**: OK ${m ? m[0].trim() : "unsubscribed"}`);
    return { label, status: "ok" };
  }
  log(`- **${label}**: PARTIAL confirm clicked, no success banner (ref=${confirmRef})`);
  return { label, status: "partial" };
}

writeFileSync(
  LOG,
  `# Gmail Unsubscribe Batch 1 — 2026-07-28

Method: open search → open first message → snapshot ref click Unsubscribe → confirm dialog button  
Include: marketing + mlsblast  
Exclude: Mission Fed, NSDC, First American, OpenRouter, Hilltop/client

## Results
`,
);

const results = [];
for (const [label, q] of QUEUE) {
  try {
    results.push(unsubOne(label, q));
  } catch (e) {
    log(`- **${label}**: ERROR ${e.message || e}`);
    results.push({ label, status: "error" });
  }
  sleep(1);
}

const ok = results.filter((r) => String(r.status).startsWith("ok")).length;
log(`\n## Summary\n- success-ish: ${ok}/${QUEUE.length}\n- finished: ${new Date().toISOString()}\n`);
console.log("DONE", ok, "/", QUEUE.length);
