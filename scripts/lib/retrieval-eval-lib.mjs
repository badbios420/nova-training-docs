/**
 * Pure helpers for retrieval-eval: parse fact table, noise filter, score, rollup.
 * No network / no openclaw calls.
 */

/** @typedef {{ id: string, query: string, goldFact: string, acceptPaths: string[], category: string }} EvalFact */
/** @typedef {{ path: string, snippet?: string, score?: number, [k: string]: unknown }} SearchHit */
/** @typedef {{ hitAt1: boolean, hitAt3: boolean, supportAt3: boolean, hitRank: number | null }} ScoreResult */

export const CATEGORIES = Object.freeze([
  "current_ops",
  "recent_events",
  "durable_facts",
  "procedures",
  "historical_narrative",
]);

/** Paths preferred under optional opsPrefer tie-break (after classic filter). */
export const OPS_PREFER_BASENAMES = Object.freeze([
  "WORLD_STATE.md",
  "MEMORY.md",
  "memory/ops-fact-cards-v1.md",
]);

/**
 * Normalize a path for comparison: strip leading ./, absolute workspace roots,
 * use posix separators. Optional workspaceRoot strips that prefix when present.
 * @param {string} p
 * @param {string} [workspaceRoot]
 * @returns {string}
 */
export function normalizePath(p, workspaceRoot) {
  if (!p || typeof p !== "string") return "";
  let s = p.replace(/\\/g, "/").trim();
  while (s.startsWith("./")) s = s.slice(2);

  // Heuristic: strip .../.openclaw/workspace/ absolute prefix
  const marker = ".openclaw/workspace/";
  const markerIdx = s.toLowerCase().indexOf(marker);
  if (markerIdx !== -1) {
    s = s.slice(markerIdx + marker.length);
  }

  if (workspaceRoot && typeof workspaceRoot === "string") {
    let wr = workspaceRoot.replace(/\\/g, "/").trim();
    while (wr.endsWith("/")) wr = wr.slice(0, -1);
    if (wr && (s === wr || s.startsWith(wr + "/"))) {
      s = s.slice(wr.length);
      while (s.startsWith("/")) s = s.slice(1);
    }
    // Also try without leading slash on workspace root compare against absolute s
    const wrNoSlash = wr.replace(/^\/+/, "");
    const sNoSlash = s.replace(/^\/+/, "");
    if (wrNoSlash && (sNoSlash === wrNoSlash || sNoSlash.startsWith(wrNoSlash + "/"))) {
      s = sNoSlash.slice(wrNoSlash.length);
      while (s.startsWith("/")) s = s.slice(1);
    }
  }

  while (s.startsWith("/")) s = s.slice(1);
  return s;
}

/**
 * Basename of a posix-ish path.
 * @param {string} p
 * @returns {string}
 */
export function pathBasename(p) {
  const n = normalizePath(p);
  const i = n.lastIndexOf("/");
  return i === -1 ? n : n.slice(i + 1);
}

/**
 * True if path should be dropped under memory-efficiency-pass filtered ranking.
 * Classic drops: dreaming, .dreams, DREAMS.md, candidates, eval-set self-hit.
 * C3 noise expansions: MEMORY-archive-*, *-training-docs/**, cursor-jobs/**, evals/**
 * (meta/report/fixture noise that steals ranks without being gold).
 * @param {string} p
 * @returns {boolean}
 */
export function isNoisePath(p) {
  const n = normalizePath(p);
  if (!n) return false;
  const base = pathBasename(n).toLowerCase();

  if (n === "memory/retrieval-eval-set-v1.md") return true;
  if (n.startsWith("memory/retrieval-eval-set-v1.md/")) return true;
  // Canonical eval set relocated under docs/harness (C3); still treat as self-hit noise if indexed
  if (n === "docs/harness/retrieval-eval-set-v1.md") return true;
  if (n.endsWith("/retrieval-eval-set-v1.md") && n.includes("harness")) return true;

  if (n.startsWith("memory/dreaming/") || n === "memory/dreaming") return true;
  if (n.startsWith("memory/.dreams/") || n === "memory/.dreams") return true;
  if (n.startsWith("memory/candidates/") || n === "memory/candidates") return true;

  if (base === "dreams.md") return true;

  // Pre-trim / archive MEMORY dumps — not live inject gold
  if (/^memory\/memory-archive-/i.test(n)) return true;

  // Nested training clones (reference only)
  if (/(^|\/)[^/]*-training-docs(\/|$)/i.test(n)) return true;

  // Job reports + eval fixtures/suites steal ranks (F14 etc.) without being accept gold
  if (n.startsWith("memory/cursor-jobs/") || n === "memory/cursor-jobs") return true;
  if (n.startsWith("memory/evals/") || n === "memory/evals") return true;

  return false;
}

/**
 * Drop noise hits; keep remaining in original score order.
 * @param {SearchHit[]} hits
 * @returns {SearchHit[]}
 */
export function filterHits(hits) {
  if (!Array.isArray(hits)) return [];
  return hits.filter((h) => h && !isNoisePath(String(h.path ?? "")));
}

/**
 * True if path is an ops-preferred anchor for optional tie-break re-rank.
 * @param {string} p
 * @param {{ todayYmd?: string }} [opts]
 */
export function isOpsPreferPath(p, opts = {}) {
  const n = normalizePath(p);
  if (!n) return false;
  if (OPS_PREFER_BASENAMES.includes(n)) return true;
  if (opts.todayYmd) {
    const today = `memory/${opts.todayYmd}.md`;
    if (n === today) return true;
  }
  return false;
}

/**
 * Optional filtered+opsPrefer mode: after classic filter, within equal-score
 * ties prefer WORLD_STATE / MEMORY / today daily / ops-fact-cards.
 * Does not override higher engine scores. Canonical meter remains classic filtered.
 * @param {SearchHit[]} hits  already filterHits()'d
 * @param {{ todayYmd?: string }} [opts]
 * @returns {SearchHit[]}
 */
export function applyOpsPrefer(hits, opts = {}) {
  if (!Array.isArray(hits) || hits.length === 0) return [];
  const annotated = hits.map((h, i) => ({ h, i }));
  const allScored = annotated.every(
    ({ h }) => h && h.score != null && Number.isFinite(Number(h.score)),
  );
  if (!allScored) {
    // Without scores, only reorder exact path-preference at equal position — no-op preserve
    return hits.slice();
  }
  annotated.sort((a, b) => {
    const sa = Number(a.h.score);
    const sb = Number(b.h.score);
    if (sb !== sa) return sb - sa;
    const pa = isOpsPreferPath(String(a.h.path ?? ""), opts) ? 0 : 1;
    const pb = isOpsPreferPath(String(b.h.path ?? ""), opts) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return a.i - b.i;
  });
  return annotated.map(({ h }) => h);
}

/**
 * True if result path equals or ends with any accept path (after normalize).
 * @param {string} resultPath
 * @param {string[]} acceptPaths
 * @param {string} [workspaceRoot]
 * @returns {boolean}
 */
export function pathMatchesAccept(resultPath, acceptPaths, workspaceRoot) {
  const rp = normalizePath(resultPath, workspaceRoot);
  if (!rp || !Array.isArray(acceptPaths)) return false;
  for (const raw of acceptPaths) {
    const ap = normalizePath(raw, workspaceRoot);
    if (!ap) continue;
    if (rp === ap) return true;
    if (rp.endsWith("/" + ap) || rp.endsWith(ap)) {
      // endsWith(ap) alone can false-positive on short suffixes; require boundary
      if (rp === ap || rp.endsWith("/" + ap)) return true;
    }
  }
  return false;
}

/**
 * Parse accept paths from a comma-separated cell.
 * @param {string} cell
 * @returns {string[]}
 */
export function parseAcceptPaths(cell) {
  if (!cell || typeof cell !== "string") return [];
  return cell
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Split a markdown table row into cells (pipe-delimited).
 * @param {string} line
 * @returns {string[] | null}
 */
export function splitTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return null;
  let s = trimmed;
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

/**
 * True for markdown separator rows like |---|---|
 * @param {string[]} cells
 * @returns {boolean}
 */
export function isSeparatorRow(cells) {
  if (!cells || cells.length === 0) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c.trim()) || c.trim() === "");
}

/**
 * Parse F01+ facts from retrieval-eval-set markdown (pipe table with Category).
 * @param {string} markdown
 * @returns {EvalFact[]}
 */
export function parseFacts(markdown) {
  const text = String(markdown ?? "");
  const lines = text.split(/\r?\n/);
  /** @type {EvalFact[]} */
  const facts = [];
  let headerCells = null;
  let col = null;

  for (const line of lines) {
    const cells = splitTableRow(line);
    if (!cells || cells.length < 2) continue;

    if (isSeparatorRow(cells)) continue;

    const idLike = cells[0]?.trim() ?? "";
    if (!headerCells && /^(ID|id)$/i.test(idLike)) {
      headerCells = cells.map((c) => c.toLowerCase());
      col = {
        id: headerCells.findIndex((h) => h === "id"),
        query: headerCells.findIndex((h) => h === "query"),
        gold: headerCells.findIndex((h) => h.startsWith("gold")),
        accept: headerCells.findIndex((h) => h.startsWith("accept")),
        category: headerCells.findIndex((h) => h === "category"),
      };
      continue;
    }

    if (!/^F\d+$/i.test(idLike)) continue;

    // Fallback column order if header missing: ID | Query | Gold | Accept | Category
    const c = col ?? { id: 0, query: 1, gold: 2, accept: 3, category: 4 };
    const id = (cells[c.id] ?? idLike).trim().toUpperCase();
    const query = (cells[c.query] ?? "").trim();
    const goldFact = (cells[c.gold] ?? "").trim();
    const acceptPaths = parseAcceptPaths(cells[c.accept] ?? "");
    const category = (cells[c.category] ?? "").trim();

    if (!query) continue;

    facts.push({ id, query, goldFact, acceptPaths, category });
  }

  return facts;
}

/**
 * Score one fact against an ordered hit list (already raw or filtered).
 * support@3: weak proxy — Y iff hit@3 and top matching hit's snippet non-empty; else N.
 * @param {EvalFact} fact
 * @param {SearchHit[]} hits
 * @param {string} [workspaceRoot]
 * @returns {ScoreResult}
 */
export function scoreFact(fact, hits, workspaceRoot) {
  const list = Array.isArray(hits) ? hits : [];
  const accept = fact?.acceptPaths ?? [];
  let hitRank = null;
  /** @type {SearchHit | null} */
  let matched = null;

  for (let i = 0; i < list.length; i += 1) {
    const h = list[i];
    if (pathMatchesAccept(String(h?.path ?? ""), accept, workspaceRoot)) {
      hitRank = i + 1;
      matched = h;
      break;
    }
  }

  const hitAt1 = hitRank === 1;
  const hitAt3 = hitRank !== null && hitRank <= 3;
  const snippet = matched?.snippet != null ? String(matched.snippet) : "";
  const supportAt3 = hitAt3 && snippet.trim().length > 0;

  return { hitAt1, hitAt3, supportAt3, hitRank };
}

/**
 * @param {Array<{ category?: string, raw?: ScoreResult, filtered?: ScoreResult, opsPrefer?: ScoreResult, error?: string | null }>} rows
 * @returns {{ overall: object, byCategory: Record<string, object> }}
 */
export function rollup(rows) {
  const list = Array.isArray(rows) ? rows : [];

  function meter(subset, key) {
    const usable = subset.filter((r) => !r.error && r[key]);
    const n = usable.length;
    const hit1 = usable.filter((r) => r[key].hitAt1).length;
    const hit3 = usable.filter((r) => r[key].hitAt3).length;
    const support = usable.filter((r) => r[key].supportAt3).length;
    return {
      n,
      hitAt1: hit1,
      hitAt3: hit3,
      supportAt3: support,
      hitAt1Rate: n ? hit1 / n : 0,
      hitAt3Rate: n ? hit3 / n : 0,
      supportAt3Rate: n ? support / n : 0,
      errors: subset.filter((r) => r.error).length,
    };
  }

  const overall = {
    raw: meter(list, "raw"),
    filtered: meter(list, "filtered"),
  };
  if (list.some((r) => r.opsPrefer)) {
    overall.opsPrefer = meter(list, "opsPrefer");
  }

  /** @type {Record<string, object>} */
  const byCategory = {};
  const cats = new Set([
    ...CATEGORIES,
    ...list.map((r) => r.category).filter(Boolean),
  ]);
  for (const cat of cats) {
    const subset = list.filter((r) => r.category === cat);
    if (subset.length === 0) continue;
    byCategory[cat] = {
      raw: meter(subset, "raw"),
      filtered: meter(subset, "filtered"),
    };
    if (subset.some((r) => r.opsPrefer)) {
      byCategory[cat].opsPrefer = meter(subset, "opsPrefer");
    }
  }

  return { overall, byCategory };
}

/**
 * Format a rate meter as "k/n (0.xx)".
 * @param {{ n: number, hitAt1?: number, hitAt3?: number, supportAt3?: number, hitAt1Rate?: number, hitAt3Rate?: number, supportAt3Rate?: number }} m
 * @param {'hitAt1'|'hitAt3'|'supportAt3'} field
 */
export function formatMeter(m, field) {
  const countKey = field;
  const rateKey = `${field}Rate`;
  const count = m?.[countKey] ?? 0;
  const n = m?.n ?? 0;
  const rate = m?.[rateKey] ?? 0;
  return `${count}/${n} (${rate.toFixed(2)})`;
}

/**
 * Local YYYY-MM-DD for today-daily opsPrefer.
 * @param {Date} [d]
 */
export function localYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
