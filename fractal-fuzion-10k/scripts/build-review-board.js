#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  readJson,
  writeText,
  listJson,
  getToken
} = require('./lib');

const config = readJson('config/eternal-coil.prototype.json');
const metadataFiles = listJson(path.posix.join(config.outputDir, 'metadata'));
const manifestPath = path.join(ROOT, config.outputDir, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { tokens: [] };
const scores = new Map(manifest.tokens.map((token) => [token.assetName, token.rarityScore]));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const cards = metadataFiles.map((file) => {
  const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { assetName, token } = getToken(metadata);
  return {
    assetName,
    name: token.name,
    tier: token['Edition Tier'],
    rarityScore: scores.get(assetName) ?? 0,
    thumbnail: `thumbnails/${assetName}.png`,
    background: token.Background,
    form: token['Serpent Form'],
    material: token.Material,
    eyes: token.Eyes,
    aura: token.Aura,
    lore: token['Cardano Lore']
  };
});

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Eternal Coil Prototype Review Board</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #080b12;
      --panel: #111827;
      --line: #263244;
      --text: #e8eef8;
      --muted: #91a1b7;
      --accent: #67e8f9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(8, 11, 18, 0.96);
      border-bottom: 1px solid var(--line);
      padding: 16px 20px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 20px;
      letter-spacing: 0;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }
    select, button {
      min-height: 36px;
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--text);
      border-radius: 6px;
      padding: 0 10px;
    }
    button { cursor: pointer; }
    .stats { color: var(--muted); }
    main {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 14px;
    }
    article {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      overflow: hidden;
    }
    img {
      width: 100%;
      aspect-ratio: 1;
      display: block;
      background: #05070d;
    }
    .meta { padding: 10px; }
    .title {
      font-weight: 700;
      margin-bottom: 6px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      color: var(--muted);
      margin: 3px 0;
    }
    .tier {
      color: var(--accent);
      font-weight: 700;
    }
    .traits {
      margin-top: 8px;
      color: var(--muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Fractal Fuzion Eternal Coil - Prototype 100 Review Board</h1>
    <div class="controls">
      <label>Tier
        <select id="tierFilter">
          <option value="All">All</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Epic">Epic</option>
          <option value="Mythic">Mythic</option>
          <option value="1/1 Ultra">1/1 Ultra</option>
        </select>
      </label>
      <button data-sort="asset">Sort ID</button>
      <button data-sort="tier">Sort Tier</button>
      <button data-sort="rarity">Sort Rarity</button>
      <span class="stats" id="stats"></span>
    </div>
  </header>
  <main id="grid"></main>
  <script>
    const cards = ${JSON.stringify(cards)};
    const tierRank = { "1/1 Ultra": 0, "Mythic": 1, "Epic": 2, "Rare": 3, "Uncommon": 4, "Common": 5 };
    let sortMode = "asset";
    const grid = document.getElementById("grid");
    const tierFilter = document.getElementById("tierFilter");
    const stats = document.getElementById("stats");

    function render() {
      const tier = tierFilter.value;
      const visible = cards
        .filter(card => tier === "All" || card.tier === tier)
        .sort((a, b) => {
          if (sortMode === "rarity") return b.rarityScore - a.rarityScore || a.assetName.localeCompare(b.assetName);
          if (sortMode === "tier") return tierRank[a.tier] - tierRank[b.tier] || b.rarityScore - a.rarityScore;
          return a.assetName.localeCompare(b.assetName);
        });
      grid.innerHTML = visible.map(card => \`
        <article>
          <img src="\${card.thumbnail}" alt="\${card.name}">
          <div class="meta">
            <div class="title">\${card.name}</div>
            <div class="row"><span class="tier">\${card.tier}</span><span>Score \${card.rarityScore}</span></div>
            <div class="traits">
              <div>\${card.background}</div>
              <div>\${card.form}</div>
              <div>\${card.material} / \${card.eyes}</div>
              <div>\${card.aura} / \${card.lore}</div>
            </div>
          </div>
        </article>\`).join("");
      stats.textContent = \`\${visible.length} shown / \${cards.length} total\`;
    }

    tierFilter.addEventListener("change", render);
    document.querySelectorAll("button[data-sort]").forEach(button => {
      button.addEventListener("click", () => {
        sortMode = button.dataset.sort;
        render();
      });
    });
    render();
  </script>
</body>
</html>
`;

writeText(path.posix.join(config.outputDir, 'review-board.html'), html);
console.log(`Wrote ${config.outputDir}/review-board.html with ${cards.length} cards`);

