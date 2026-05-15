#!/usr/bin/env node
const path = require('path');
const {
  readJson,
  writeJson,
  cleanDir,
  ensureDir,
  mulberry32,
  weightedPick,
  makeAssetName,
  traitCombo,
  hashObject,
  tierScore
} = require('./lib');

const config = readJson('config/eternal-coil.prototype.json');
const weights = readJson('config/rarity-weights.json');
const rules = readJson('config/incompatibility-rules.json');
const rand = mulberry32(config.seed);

const metadataDir = path.posix.join(config.outputDir, 'metadata');
const reportsDir = path.posix.join(config.outputDir, 'reports');
cleanDir(metadataDir);
cleanDir(reportsDir);
ensureDir(path.posix.join(config.outputDir, 'images'));
ensureDir(path.posix.join(config.outputDir, 'thumbnails'));
ensureDir(path.posix.join(config.outputDir, 'proofs'));
ensureDir('reports');

const tierQueue = [];
for (const [tier, count] of Object.entries(config.tierTargets)) {
  for (let i = 0; i < count; i += 1) tierQueue.push(tier);
}

function shuffle(values) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function hasForbiddenPair(traits) {
  return rules.forbiddenPairs.some((rule) => (
    traits[rule.a.category] === rule.a.trait && traits[rule.b.category] === rule.b.trait
  ) || (
    traits[rule.a.category] === rule.b.trait && traits[rule.b.category] === rule.a.trait
  ));
}

function highIntensityCount(traits) {
  return Object.entries(rules.highIntensityTraits).reduce((count, [category, names]) => (
    count + (names.includes(traits[category]) ? 1 : 0)
  ), 0);
}

function pickTraits(editionTier, index) {
  if (editionTier === '1/1 Ultra') {
    return {
      Background: 'One-of-One Scene',
      'Serpent Form': 'Ouroboros 1/1 Body',
      Material: 'One-of-One Material',
      Eyes: 'One-of-One Eyes',
      'Head Trait': 'One-of-One Headpiece',
      Aura: 'Animated Aura Placeholder',
      'Cardano Lore': 'One-of-One Lore',
      'Edition Tier': editionTier,
      'One-of-One Concept': index % 2 === 0 ? 'Ouroboros Maxima' : 'Genesis Coil'
    };
  }

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const traits = {
      Background: weightedPick(weights.Background.filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      'Serpent Form': weightedPick(weights['Serpent Form'].filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      Material: weightedPick(weights.Material.filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      Eyes: weightedPick(weights.Eyes.filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      'Head Trait': weightedPick(weights['Head Trait'].filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      Aura: weightedPick(weights.Aura.filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      'Cardano Lore': weightedPick(weights['Cardano Lore'].filter((item) => item.tier !== '1/1 Ultra'), rand).name,
      'Edition Tier': editionTier
    };
    if (hasForbiddenPair(traits)) continue;
    if (highIntensityCount(traits) > rules.maxHighIntensityTraits) continue;
    return traits;
  }

  throw new Error(`Unable to generate compatible traits for edition ${index}`);
}

function makeMetadata(index, traits) {
  const assetName = makeAssetName(config.assetPrefix, index);
  const displayName = traits['One-of-One Concept']
    ? `${config.shortName} #${String(index).padStart(4, '0')} - ${traits['One-of-One Concept']}`
    : `${config.shortName} #${String(index).padStart(4, '0')}`;
  const image = `${config.imageBaseUri}/${assetName}.png`;
  const token = {
    name: displayName,
    image,
    mediaType: config.mediaType,
    description: traits['One-of-One Concept']
      ? `A 1/1 prototype concept: ${traits['One-of-One Concept']}. Planning metadata only; not minted.`
      : config.description,
    files: [
      {
        name: displayName,
        mediaType: config.mediaType,
        src: image
      }
    ],
    Collection: config.collection,
    ...traits,
    Prototype: 'true'
  };

  return {
    721: {
      [config.policyId]: {
        [assetName]: token
      },
      version: config.metadataVersion
    }
  };
}

const usedCombos = new Set();
const manifest = {
  generatedAt: new Date().toISOString(),
  editionSize: config.editionSize,
  seed: config.seed,
  policyId: config.policyId,
  imageBaseUri: config.imageBaseUri,
  tokens: []
};

shuffle(tierQueue);

for (let index = 1; index <= config.editionSize; index += 1) {
  let metadata;
  let comboHash;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const traits = pickTraits(tierQueue[index - 1], index);
    metadata = makeMetadata(index, traits);
    const combo = traitCombo(metadata['721'][config.policyId][makeAssetName(config.assetPrefix, index)]);
    comboHash = hashObject(combo);
    if (traits['Edition Tier'] === '1/1 Ultra' || !usedCombos.has(comboHash)) break;
    metadata = null;
  }
  if (!metadata) throw new Error(`Unable to avoid duplicate for edition ${index}`);

  const assetName = makeAssetName(config.assetPrefix, index);
  const token = metadata['721'][config.policyId][assetName];
  if (token['Edition Tier'] !== '1/1 Ultra') usedCombos.add(comboHash);
  writeJson(path.posix.join(metadataDir, `${assetName}.json`), metadata);
  manifest.tokens.push({
    assetName,
    name: token.name,
    tier: token['Edition Tier'],
    rarityScore: Object.keys(traitCombo(token)).reduce((sum, key) => {
      if (key === 'Edition Tier' || key === 'One-of-One Concept') return sum;
      const item = weights[key]?.find((entry) => entry.name === token[key]);
      return sum + tierScore(item?.tier);
    }, tierScore(token['Edition Tier']))
  });
}

writeJson(path.posix.join(config.outputDir, 'manifest.json'), manifest);
console.log(`Generated ${config.editionSize} fake metadata files in ${metadataDir}`);
