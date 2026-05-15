# Fractal Fuzion 10K - Eternal Coil Prototype

No-chain local scaffold for the Eternal Coil collection.

This project generates fake CIP-25 prototype metadata only. It does not mint, sign, build transactions, submit transactions, create policy IDs, upload to IPFS, generate wallets, or access keys.

## Run

```bash
cd fractal-fuzion-10k
node scripts/generate-prototype.js
node scripts/validate-metadata.js
node scripts/report-rarity.js
node scripts/check-duplicates.js
node scripts/render-placeholders.js
node scripts/build-review-board.js
```

Generated files are written to:

```text
output/prototype-100/metadata/
output/prototype-100/reports/
```

Root-level report copies are also written to `reports/` for quick review.

## Outputs

- `output/prototype-100/metadata/*.json` - 100 fake CIP-25 metadata files.
- `output/prototype-100/reports/rarity-report.csv` - token traits and rarity scores.
- `output/prototype-100/reports/trait-counts.json` - counts and percentages by category.
- `output/prototype-100/reports/duplicates.json` - duplicate trait-combo report.
- `output/prototype-100/reports/validation-summary.md` - metadata validation summary.
- `output/prototype-100/manifest.json` - run manifest.
- `output/prototype-100/images/*.png` - 2048x2048 placeholder PNGs.
- `output/prototype-100/thumbnails/*.png` - 512x512 placeholder thumbnails.
- `output/prototype-100/review-board.html` - local review board with filtering and sorting.

## Safety

All policy IDs and image CIDs are placeholders:

- `POLICY_ID_PLACEHOLDER`
- `ipfs://IMAGE_CID_PLACEHOLDER/<asset>.png`

Do not submit this metadata to mainnet. It is for art direction, rarity planning, and generator validation only.
