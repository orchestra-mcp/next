#!/usr/bin/env tsx
/**
 * Generate CSS files for all 25 color themes
 * Run with: npx tsx scripts/generate-color-themes.ts
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { THEMES } from '../src/themes';

const COLOR_THEMES_DIR = resolve(__dirname, '../src/color-themes');

function generateThemeCss(theme: typeof THEMES[0]): string {
  const { colors, syntax } = theme;

  return `/**
 * ${theme.label} Color Theme
 * Group: ${theme.group}
 */

--color-bg: ${colors.bg};
--color-bg-alt: ${colors.bgAlt};
--color-bg-contrast: ${colors.bgContrast};
--color-bg-active: ${colors.bgActive};
--color-bg-selection: ${colors.bgSelection};
--color-fg: ${colors.fg};
--color-fg-dim: ${colors.fgDim};
--color-fg-muted: ${colors.fgMuted};
--color-fg-bright: ${colors.fgBright};
--color-border: ${colors.border};
--color-accent: ${colors.accent};

/* Syntax colors */
--syntax-blue: ${syntax.blue};
--syntax-cyan: ${syntax.cyan};
--syntax-green: ${syntax.green};
--syntax-yellow: ${syntax.yellow};
--syntax-orange: ${syntax.orange};
--syntax-red: ${syntax.red};
--syntax-purple: ${syntax.purple};
--syntax-teal: ${syntax.teal};
--syntax-error: ${syntax.error};
`;
}

console.log(`Generating ${THEMES.length} color theme CSS files...`);

let generated = 0;
for (const theme of THEMES) {
  const css = generateThemeCss(theme);
  const filePath = resolve(COLOR_THEMES_DIR, `${theme.id}.css`);

  writeFileSync(filePath, css, 'utf-8');
  generated++;
  console.log(`  ✓ ${theme.id}.css`);
}

console.log(`\nGenerated ${generated} theme files in ${COLOR_THEMES_DIR}`);
