/**
 * Generate platform-native icon files from Boxicons SVGs.
 *
 * Usage: node scripts/generate-os-icons.mjs [--icons bx-home,bxs-star]
 *
 * Converts SVG icons into OS-native formats:
 *   - macOS: PNG @1x (16px), @2x (32px) as template images (monochrome)
 *   - Windows: Multi-resolution PNG (16, 32, 48px) for ICO assembly
 *   - Linux: PNG 24px + original SVG copy
 *
 * Output: resources/os-icons/{darwin,windows,linux}/{icon-name}.png
 *
 * Uses @resvg/resvg-js for high-quality SVG → PNG rendering.
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BOXICONS_SVG = join(ROOT, 'node_modules/boxicons/svg');
const OUT_DIR = join(ROOT, 'resources/os-icons');

// Default icons used by the app (tray, context menus, etc.)
const DEFAULT_ICONS = [
  'bx-home', 'bx-cog', 'bx-search', 'bx-bell', 'bx-folder',
  'bx-file', 'bx-terminal', 'bx-code-alt', 'bx-git-branch',
  'bx-play', 'bx-stop', 'bx-pause', 'bx-refresh', 'bx-power-off',
  'bx-info-circle', 'bx-check', 'bx-x', 'bx-plus', 'bx-minus',
  'bx-user', 'bx-globe', 'bx-server', 'bx-link', 'bx-copy',
  'bx-edit', 'bx-trash', 'bx-download', 'bx-upload', 'bx-coffee',
];

/**
 * Resolve a boxicon name to its SVG file path.
 */
function resolveSvgPath(name) {
  const categories = ['regular', 'solid', 'logos'];
  for (const cat of categories) {
    const p = join(BOXICONS_SVG, cat, `${name}.svg`);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Render an SVG to PNG at the given size.
 * For template images, forces monochrome black fill.
 */
function renderPng(svgContent, size, monochrome = false) {
  let svg = svgContent;
  if (monochrome) {
    svg = svg.replace(/fill="[^"]*"/g, 'fill="#000000"');
    svg = svg.replace(/<path(?!\s+fill)/g, '<path fill="#000000"');
  }
  svg = svg.replace(/width="\d+"/, `width="${size}"`);
  svg = svg.replace(/height="\d+"/, `height="${size}"`);

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0, 0, 0, 0)',
  });
  return resvg.render().asPng();
}

// Parse CLI args
const args = process.argv.slice(2);
let iconNames = DEFAULT_ICONS;
const iconsIdx = args.indexOf('--icons');
if (iconsIdx !== -1 && args[iconsIdx + 1]) {
  iconNames = args[iconsIdx + 1].split(',').map((s) => s.trim());
}

// Create output directories
const darwinDir = join(OUT_DIR, 'darwin');
const windowsDir = join(OUT_DIR, 'windows');
const linuxDir = join(OUT_DIR, 'linux');
mkdirSync(darwinDir, { recursive: true });
mkdirSync(windowsDir, { recursive: true });
mkdirSync(linuxDir, { recursive: true });

let generated = 0;
let skipped = 0;

for (const name of iconNames) {
  const svgPath = resolveSvgPath(name);
  if (!svgPath) {
    console.warn(`Skipping unknown icon: ${name}`);
    skipped++;
    continue;
  }

  const svg = readFileSync(svgPath, 'utf-8');

  // macOS: template images (monochrome, @1x and @2x)
  const mac1x = renderPng(svg, 16, true);
  const mac2x = renderPng(svg, 32, true);
  writeFileSync(join(darwinDir, `${name}.png`), mac1x);
  writeFileSync(join(darwinDir, `${name}@2x.png`), mac2x);

  // Windows: multi-resolution PNGs (for ICO assembly)
  const win16 = renderPng(svg, 16, false);
  const win32 = renderPng(svg, 32, false);
  const win48 = renderPng(svg, 48, false);
  writeFileSync(join(windowsDir, `${name}-16.png`), win16);
  writeFileSync(join(windowsDir, `${name}-32.png`), win32);
  writeFileSync(join(windowsDir, `${name}-48.png`), win48);

  // Linux: PNG + SVG copy
  const linux24 = renderPng(svg, 24, false);
  writeFileSync(join(linuxDir, `${name}.png`), linux24);
  copyFileSync(svgPath, join(linuxDir, `${name}.svg`));

  generated++;
}

console.log(`Generated OS icons for ${generated} icons (${skipped} skipped)`);
console.log(`  macOS:   ${darwinDir} (PNG @1x/@2x template)`);
console.log(`  Windows: ${windowsDir} (PNG 16/32/48)`);
console.log(`  Linux:   ${linuxDir} (PNG 24 + SVG)`);
