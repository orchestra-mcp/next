/**
 * Generate high-quality tray icon PNGs from SVG source.
 *
 * Usage: node scripts/generate-tray-icon.mjs
 *
 * Renders the tray icon SVG at multiple resolutions:
 * - tray-icon.png    (22x22 for 1x displays)
 * - tray-icon@2x.png (44x44 for Retina displays)
 * - tray-icon@3x.png (66x66 for extra-high DPI)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Use the tray-specific SVG (optimized for small sizes)
// Perfect for macOS template images (system adapts to dark/light mode)
const SVG_PATH = join(ROOT, '../../../arts/logo-tray.svg');
const OUT_DIR = join(ROOT, 'resources');

// Ensure output directory exists
mkdirSync(OUT_DIR, { recursive: true });

const svg = readFileSync(SVG_PATH, 'utf-8');

// Render at 1x (22x22) — standard macOS tray icon size
const resvg1x = new Resvg(svg, {
  fitTo: { mode: 'width', value: 22 },
});
const png1x = resvg1x.render().asPng();
writeFileSync(join(OUT_DIR, 'tray-icon.png'), png1x);
console.log(`tray-icon.png: ${png1x.length} bytes (22x22)`);

// Render at 2x (44x44) for Retina
const resvg2x = new Resvg(svg, {
  fitTo: { mode: 'width', value: 44 },
});
const png2x = resvg2x.render().asPng();
writeFileSync(join(OUT_DIR, 'tray-icon@2x.png'), png2x);
console.log(`tray-icon@2x.png: ${png2x.length} bytes (44x44)`);

// Render at 3x (66x66) for extra-high DPI
const resvg3x = new Resvg(svg, {
  fitTo: { mode: 'width', value: 66 },
});
const png3x = resvg3x.render().asPng();
writeFileSync(join(OUT_DIR, 'tray-icon@3x.png'), png3x);
console.log(`tray-icon@3x.png: ${png3x.length} bytes (66x66)`);

console.log(`\nGenerated tray icons in: ${OUT_DIR}`);
