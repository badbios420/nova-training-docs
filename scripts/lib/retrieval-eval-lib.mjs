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

/**
 * Normalize a path for comparison: strip leading ./, use posix separators.
 * @param {string} p
 * @returns {string}
 */
export function normalizePath(p) {
  if (!p || typeof p !== "string") return "";
  let s = p.replace(/\\/g, "/").trim();
  while (s.startsWith("./")) s = s.slice(2);
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
 * @param {string} p
 * @returns {boolean}
 */
export function isNoisePath(p) {
  const n = normalizePath(p);
  if (!n) return false;
  const base = pathBasename(n).toLowerCase();

  if (n === "memory/retrieval-eval-set-v1.md") return true;
  if (n.startsWith("memory/retrieval-eval-set-v1.md/")) return true;

  if (n.startsWith("memory/dreaming/") || n === "memory/dreaming") return true;
  if (n.startsWith("memory/.dreams/") || n === "memory/.dreams") return true;
  if (n.startsWith("memory/candidates/") || n === "memory/candidates") return true;

  if (base === "dreams.md") return true;

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
 * True if result path equals or ends with any accept path (after normalize).
 * @param {string} resultPath
 * @param {string[]} acceptPaths
 * @returns {boolean}
 */
export function pathMatchesAccept(resultPath, acceptPaths) {
  const rp = normalizePath(resultPath);
  if (!rp || !Array.isArray(acceptPaths)) return false;
  for (const raw of acceptPaths) {
    const ap = normalizePath(raw);
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
 * @returns {ScoreResult}
 */
export function scoreFact(fact, hits) {
  const list = Array.isArray(hits) ? hits : [];
  const accept = fact?.acceptPaths ?? [];
  let hitRank = null;
  /** @type {SearchHit | null} */
  let matched = null;

  for (let i = 0; i < list.length; i += 1) {
    const h = list[i];
    if (pathMatchesAccept(String(h?.path ?? ""), accept)) {
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
 * @param {Array<{ category?: string, raw?: ScoreResult, filtered?: ScoreResult, error?: string | null }>} rows
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
