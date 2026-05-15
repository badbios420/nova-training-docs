#!/usr/bin/env node
const path = require('path');
const {
  readJson,
  writeJson,
  writeText,
  listJson,
  getToken,
  csvEscape,
  tierScore
} = require('./lib');

const config = readJson('config/eternal-coil.prototype.json');
const weights = readJson('config/rarity-weights.json');
const files = listJson(path.posix.join(config.outputDir, 'metadata'));
const traitCounts = {};
const tierSummary = {};
const rows = [
  [
    'assetName',
    'name',
    'editionTier',
    'rarityScore',
    ...config.categories.filter((category) => category !== 'Edition Tier')
  ]
];

function scoreTrait(category, trait) {
  const entry = weights[category]?.find((item) => item.name === trait);
  return tierScore(entry?.tier);
}

for (const category of config.categories) traitCounts[category] = {};

for (const file of files) {
  const metadata = require(file);
  const { assetName, token } = getToken(metadata);
  let rarityScore = tierScore(token['Edition Tier']);
  for (const category of config.categories) {
    const trait = token[category];
    traitCounts[category][trait] = (traitCounts[category][trait] || 0) + 1;
    if (category !== 'Edition Tier') rarityScore += scoreTrait(category, trait);
  }
  tierSummary[token['Edition Tier']] = (tierSummary[token['Edition Tier']] || 0) + 1;
  rows.push([
    assetName,
    token.name,
    token['Edition Tier'],
    rarityScore,
    ...config.categories.filter((category) => category !== 'Edition Tier').map((category) => token[category])
  ]);
}

const withPercentages = {};
for (const [category, counts] of Object.entries(traitCounts)) {
  withPercentages[category] = Object.fromEntries(
    Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([trait, count]) => [trait, {
        count,
        percentage: Number(((count / files.length) * 100).toFixed(2))
      }])
  );
}

const csv = `${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`;
writeText(path.posix.join(config.outputDir, 'reports/rarity-report.csv'), csv);
writeText('reports/rarity-report.csv', csv);
writeJson(path.posix.join(config.outputDir, 'reports/trait-counts.json'), withPercentages);
writeJson('reports/trait-counts.json', withPercentages);
writeJson(path.posix.join(config.outputDir, 'reports/tier-summary.json'), tierSummary);
writeJson('reports/tier-summary.json', tierSummary);
console.log(`Wrote rarity report for ${files.length} metadata files`);

