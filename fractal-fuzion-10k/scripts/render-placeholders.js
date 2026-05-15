#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const {
  ROOT,
  readJson,
  ensureDir,
  listJson,
  getToken,
  hashObject
} = require('./lib');

const config = readJson('config/eternal-coil.prototype.json');
const metadataFiles = listJson(path.posix.join(config.outputDir, 'metadata'));
const imageDir = path.join(ROOT, config.outputDir, 'images');
const thumbnailDir = path.join(ROOT, config.outputDir, 'thumbnails');

ensureDir(path.posix.join(config.outputDir, 'images'));
ensureDir(path.posix.join(config.outputDir, 'thumbnails'));

const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['10010', '10010', '10010', '11111', '00010', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '#': ['01010', '11111', '01010', '01010', '11111', '01010', '01010'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  ':': ['00000', '00100', '00100', '00000', '00100', '00100', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00100', '00100'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
};

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xFFFFFFFF;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function writePng(filePath, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    raw[rowOffset] = 0;
    rgba.copy(raw, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  fs.writeFileSync(filePath, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND')
  ]));
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

function traitColor(text) {
  const hash = hashObject(text);
  const hue = parseInt(hash.slice(0, 6), 16) % 360;
  return hslToRgb(hue, 55, 18);
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function putPixel(buffer, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 4;
  buffer[i] = color[0];
  buffer[i + 1] = color[1];
  buffer[i + 2] = color[2];
  buffer[i + 3] = color[3] ?? 255;
}

function fillRect(buffer, width, height, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) putPixel(buffer, width, height, xx, yy, color);
  }
}

function drawCircle(buffer, width, height, cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) putPixel(buffer, width, height, x, y, color);
    }
  }
}

function drawText(buffer, width, height, text, x, y, scale, color) {
  const safe = text.toUpperCase().replace(/[^A-Z0-9#\-/:.& ]/g, ' ');
  let cursor = x;
  for (const char of safe) {
    const glyph = FONT[char] || FONT[' '];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === '1') {
          fillRect(buffer, width, height, cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += 6 * scale;
  }
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLabel(buffer, width, height, label, value, y, scale) {
  const left = Math.round(width * 0.08);
  drawText(buffer, width, height, `${label}:`, left, y, scale, [150, 230, 255, 255]);
  for (const [index, line] of wrapText(value, Math.floor(width / (6 * scale)) - 16).entries()) {
    drawText(buffer, width, height, line, left + 12 * scale, y + (index + 1) * 9 * scale, scale, [245, 250, 255, 255]);
  }
}

function renderToken(token, assetName, size) {
  const buffer = Buffer.alloc(size * size * 4);
  const bg = traitColor(token.Background);
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = bg[0];
    buffer[i + 1] = bg[1];
    buffer[i + 2] = bg[2];
    buffer[i + 3] = 255;
  }

  const accent = traitColor(`${token.Material} ${token.Eyes}`);
  const center = size / 2;
  const ringRadius = size * 0.23;
  const beadRadius = Math.max(4, Math.round(size * 0.018));
  for (let i = 0; i < 58; i += 1) {
    const angle = (Math.PI * 2 * i) / 58 - Math.PI / 2;
    const wobble = Math.sin(i * 0.55) * size * 0.018;
    const x = center + Math.cos(angle) * (ringRadius + wobble);
    const y = center + Math.sin(angle) * (ringRadius * 0.84 + wobble);
    drawCircle(buffer, size, size, x, y, beadRadius, [accent[0], accent[1], accent[2], 255]);
  }

  drawCircle(buffer, size, size, center + ringRadius * 0.68, center - ringRadius * 0.58, beadRadius * 2.2, [245, 250, 255, 255]);
  drawCircle(buffer, size, size, center - ringRadius * 0.68, center + ringRadius * 0.58, beadRadius * 1.6, [20, 25, 35, 255]);

  const titleScale = Math.max(2, Math.round(size / 128));
  const bodyScale = Math.max(1, Math.round(size / 190));
  drawText(buffer, size, size, assetName, Math.round(size * 0.08), Math.round(size * 0.08), titleScale, [255, 255, 255, 255]);
  drawText(buffer, size, size, token['Edition Tier'], Math.round(size * 0.08), Math.round(size * 0.08) + titleScale * 10, bodyScale, [255, 220, 120, 255]);

  let y = Math.round(size * 0.64);
  const step = bodyScale * 21;
  drawLabel(buffer, size, size, 'FORM', token['Serpent Form'], y, bodyScale); y += step;
  drawLabel(buffer, size, size, 'MATERIAL', token.Material, y, bodyScale); y += step;
  drawLabel(buffer, size, size, 'EYES', token.Eyes, y, bodyScale); y += step;
  drawLabel(buffer, size, size, 'LORE', token['Cardano Lore'], y, bodyScale);

  return buffer;
}

let count = 0;
for (const file of metadataFiles) {
  const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { assetName, token } = getToken(metadata);
  writePng(path.join(imageDir, `${assetName}.png`), 2048, 2048, renderToken(token, assetName, 2048));
  writePng(path.join(thumbnailDir, `${assetName}.png`), 512, 512, renderToken(token, assetName, 512));
  count += 1;
}

console.log(`Rendered ${count} placeholder PNGs and ${count} thumbnails`);

