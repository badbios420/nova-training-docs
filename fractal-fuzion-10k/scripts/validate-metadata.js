#!/usr/bin/env node
const path = require('path');
const {
  readJson,
  writeText,
  listJson,
  getToken
} = require('./lib');

const config = readJson('config/eternal-coil.prototype.json');
const files = listJson(path.posix.join(config.outputDir, 'metadata'));
const errors = [];
const warnings = [];
const forbiddenPatterns = [
  /seed phrase/i,
  /mnemonic/i,
  /signing/i,
  /skey/i,
  /xprv/i,
  /private key/i,
  /addr1[0-9a-z]{20,}/i,
  /stake1[0-9a-z]{20,}/i
];

for (const file of files) {
  let metadata;
  try {
    metadata = require(file);
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
    continue;
  }

  if (!metadata['721']) errors.push(`${file}: missing 721 root`);
  if (metadata['721']?.version !== config.metadataVersion) errors.push(`${file}: wrong CIP-25 version`);

  const policyIds = Object.keys(metadata['721'] || {}).filter((key) => key !== 'version');
  if (policyIds.length !== 1) errors.push(`${file}: expected exactly one policy placeholder`);
  if (policyIds[0] !== config.policyId) errors.push(`${file}: expected placeholder policy id`);

  const { assetName, token } = getToken(metadata);
  if (!assetName || assetName.length > 32) errors.push(`${file}: asset name missing or over 32 bytes`);
  for (const key of config.categories) {
    if (!token[key]) errors.push(`${file}: missing trait ${key}`);
  }
  if (!token.name) errors.push(`${file}: missing name`);
  if (!token.image?.startsWith('ipfs://')) errors.push(`${file}: image must start ipfs://`);
  if (token.mediaType !== config.mediaType) errors.push(`${file}: mediaType mismatch`);
  if (!Array.isArray(token.files) || token.files.length < 1) errors.push(`${file}: missing files array`);
  if (!token.files?.[0]?.src?.startsWith('ipfs://')) errors.push(`${file}: files[0].src must start ipfs://`);
  if (token.Prototype !== 'true') errors.push(`${file}: missing Prototype=true`);

  const raw = JSON.stringify(metadata);
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(raw)) errors.push(`${file}: forbidden sensitive pattern ${pattern}`);
  }
  if (!raw.includes('POLICY_ID_PLACEHOLDER')) warnings.push(`${file}: no placeholder policy string found`);
}

if (files.length !== config.editionSize) {
  errors.push(`expected ${config.editionSize} metadata files, found ${files.length}`);
}

const status = errors.length === 0 ? 'PASS' : 'FAIL';
const summary = [
  '# Validation Summary',
  '',
  `Status: ${status}`,
  `Metadata files: ${files.length}`,
  `Errors: ${errors.length}`,
  `Warnings: ${warnings.length}`,
  '',
  '## Errors',
  errors.length ? errors.map((line) => `- ${line}`).join('\n') : '- None',
  '',
  '## Warnings',
  warnings.length ? warnings.map((line) => `- ${line}`).join('\n') : '- None',
  ''
].join('\n');

writeText(path.posix.join(config.outputDir, 'reports/validation-summary.md'), summary);
writeText('reports/validation-summary.md', summary);
console.log(`Validation ${status}: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length === 0 ? 0 : 1);

