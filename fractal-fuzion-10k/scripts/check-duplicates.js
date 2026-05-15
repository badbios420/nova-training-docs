#!/usr/bin/env node
const path = require('path');
const {
  readJson,
  writeJson,
  listJson,
  getToken,
  traitCombo,
  hashObject
} = require('./lib');

const config = readJson('config/eternal-coil.prototype.json');
const files = listJson(path.posix.join(config.outputDir, 'metadata'));
const seen = new Map();
const exactTraitDuplicates = [];

for (const file of files) {
  const metadata = require(file);
  const { assetName, token } = getToken(metadata);
  if (token['Edition Tier'] === '1/1 Ultra') continue;
  const combo = traitCombo(token);
  delete combo['Edition Tier'];
  const hash = hashObject(combo);
  if (seen.has(hash)) {
    exactTraitDuplicates.push({
      hash,
      first: seen.get(hash),
      duplicate: assetName,
      combo
    });
  } else {
    seen.set(hash, assetName);
  }
}

const report = {
  checkedFiles: files.length,
  exactTraitDuplicates,
  visualDuplicateCheck: {
    status: 'skipped',
    reason: 'No image generation in scaffold pass.'
  },
  status: exactTraitDuplicates.length === 0 ? 'PASS' : 'FAIL'
};

writeJson(path.posix.join(config.outputDir, 'reports/duplicates.json'), report);
writeJson('reports/duplicates.json', report);
console.log(`Duplicate check ${report.status}: ${exactTraitDuplicates.length} exact trait duplicates`);
process.exit(exactTraitDuplicates.length === 0 ? 0 : 1);

