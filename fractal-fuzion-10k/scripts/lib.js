const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const target = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(ROOT, relativePath), { recursive: true });
}

function cleanDir(relativePath) {
  const target = path.join(ROOT, relativePath);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
}

function listJson(relativePath) {
  const dir = path.join(ROOT, relativePath);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => path.join(dir, file));
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function rand() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(items, rand, tier) {
  const pool = tier ? items.filter((item) => item.tier === tier) : items;
  if (pool.length === 0) {
    throw new Error(`No traits available for tier ${tier || 'any'}`);
  }
  const total = pool.reduce((sum, item) => sum + Number(item.weight), 0);
  let cursor = rand() * total;
  for (const item of pool) {
    cursor -= Number(item.weight);
    if (cursor <= 0) return item;
  }
  return pool[pool.length - 1];
}

function makeAssetName(prefix, index) {
  return `${prefix}${String(index).padStart(4, '0')}`;
}

function getToken(metadata) {
  const root = metadata['721'];
  const policyId = Object.keys(root).find((key) => key !== 'version');
  const assetName = Object.keys(root[policyId])[0];
  return { policyId, assetName, token: root[policyId][assetName] };
}

function traitCombo(token) {
  const keys = [
    'Background',
    'Serpent Form',
    'Material',
    'Eyes',
    'Head Trait',
    'Aura',
    'Cardano Lore',
    'Edition Tier',
    'One-of-One Concept'
  ];
  const combo = {};
  for (const key of keys) {
    if (token[key]) combo[key] = token[key];
  }
  return combo;
}

function hashObject(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function tierScore(tier) {
  return {
    Common: 1,
    Uncommon: 2,
    Rare: 4,
    Epic: 8,
    Mythic: 16,
    '1/1 Ultra': 64
  }[tier] || 0;
}

module.exports = {
  ROOT,
  readJson,
  writeJson,
  writeText,
  ensureDir,
  cleanDir,
  listJson,
  mulberry32,
  weightedPick,
  makeAssetName,
  getToken,
  traitCombo,
  hashObject,
  csvEscape,
  tierScore
};

