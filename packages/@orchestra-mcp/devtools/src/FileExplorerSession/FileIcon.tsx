/**
 * FileIcon — Material Design-inspired file/folder icons.
 * Uses fileIconService to resolve icon name + color by filename/type.
 *
 * Files: renders a colored label badge (TS, JS, PY, GO, …) on a document
 *        shape so each file type is immediately recognizable.
 * Special categories (image/audio/video/archive/font/database/settings)
 *        get a unique SVG shape instead of the document+label approach.
 * Folders: open/closed with the accent color from fileIconService.
 */

import { useMemo, type FC } from 'react';
import { getFileIcon } from './fileIconService';

export interface FileIconProps {
  name: string;
  type: 'file' | 'directory';
  isOpen?: boolean;
  size?: number;
}

/* ── Label map ─────────────────────────────────────────────
   Short strings (≤3 chars) rendered inside the file badge.   */

const ICON_LABELS: Record<string, string> = {
  // TypeScript / JavaScript
  typescript: 'TS',
  'typescript-def': 'DTS',
  javascript: 'JS',
  react: 'JSX',
  'react-ts': 'TSX',
  'test-js': 'TJS',
  'test-ts': 'TTS',
  'test-tsx': 'TTX',
  test: 'TST',
  storybook: 'SB',
  'css-module': 'MOD',
  // Web
  html: 'HTM',
  css: 'CSS',
  sass: 'SCS',
  less: 'LES',
  vue: 'VUE',
  svelte: 'SVE',
  astro: 'AST',
  // Backend
  python: 'PY',
  go: 'GO',
  'go-mod': 'MOD',
  rust: 'RS',
  cargo: 'CAR',
  php: 'PHP',
  ruby: 'RB',
  gemfile: 'GEM',
  java: 'JV',
  kotlin: 'KT',
  swift: 'SW',
  c: 'C',
  'c-header': 'H',
  cpp: 'C++',
  csharp: 'C#',
  dart: 'DA',
  lua: 'LU',
  r: 'R',
  elixir: 'EX',
  // Data / Config
  json: '{}',
  yaml: 'YML',
  toml: 'TOM',
  xml: 'XML',
  csv: 'CSV',
  dotenv: 'ENV',
  settings: 'CFG',
  editorconfig: 'CFG',
  tsconfig: 'TSC',
  // Docs
  markdown: 'MD',
  mdx: 'MDX',
  text: 'TXT',
  pdf: 'PDF',
  restructuredtext: 'RST',
  readme: 'DOC',
  changelog: 'LOG',
  license: 'LIC',
  // Shell / Build
  shell: 'SH',
  makefile: 'MK',
  docker: 'DK',
  proto: 'PB',
  // Package managers
  nodejs: 'NPM',
  'nodejs-lock': 'NPM',
  npm: 'NPM',
  yarn: 'YRN',
  pnpm: 'PNP',
  composer: 'PHP',
  // Tooling
  vite: 'VIT',
  webpack: 'WPK',
  eslint: 'ESL',
  prettier: 'FMT',
  tailwind: 'TW',
  jest: 'JST',
  vitest: 'VIT',
  phpunit: 'PHU',
  // Templates
  laravel: 'LA',
  blade: 'BLD',
  twig: 'TWG',
  // Misc
  graphql: 'GQL',
  prisma: 'PRI',
  lock: 'LCK',
  log: 'LOG',
  // git
  git: 'GIT',
  gitignore: 'GIT',
};

/* ── Category paths ────────────────────────────────────────
   SVG path data (24×24 viewBox) for non-document categories. */

const CATEGORY_PATHS: Record<string, string> = {
  // Landscape / mountain photo
  image:
    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z' +
    'M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  // Music note
  audio:
    'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  // Film strip
  video:
    'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z',
  // Box / package
  archive:
    'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55' +
    'L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5' +
    'c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1' +
    'h12l.94 1H5.12z',
  // Letter A (font)
  font:
    'M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z',
  // Cylinder (database)
  database:
    'M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4z' +
    'M4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4S4 11.21 4 9z' +
    'M4 14v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z',
  // Gear / settings
  settings:
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58' +
    'c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96' +
    'c-.5-.38-1.03-.7-1.62-.94l-.36-2.54C14.44 3.17 14.24 3 14 3h-3.84' +
    'c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96' +
    'c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58' +
    'c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61' +
    'l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54' +
    'c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54' +
    'c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32' +
    'c.12-.22.07-.47-.12-.61l-2.01-1.58z' +
    'M12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  // Document with ruled lines (default)
  doc:
    'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z' +
    'M13 9V3.5L18.5 9H13z',
};

/* ── Category resolver ─────────────────────────────────── */

const IMAGE_ICONS = new Set(['image', 'svg']);
const AUDIO_ICONS = new Set(['audio']);
const VIDEO_ICONS = new Set(['video']);
const ARCHIVE_ICONS = new Set(['archive']);
const FONT_ICONS = new Set(['font']);
const DATABASE_ICONS = new Set(['database', 'sqlite', 'prisma', 'graphql']);
const SETTINGS_ICONS = new Set(['settings', 'editorconfig']);

function getCategory(icon: string): string {
  if (IMAGE_ICONS.has(icon)) return 'image';
  if (AUDIO_ICONS.has(icon)) return 'audio';
  if (VIDEO_ICONS.has(icon)) return 'video';
  if (ARCHIVE_ICONS.has(icon)) return 'archive';
  if (FONT_ICONS.has(icon)) return 'font';
  if (DATABASE_ICONS.has(icon)) return 'database';
  if (SETTINGS_ICONS.has(icon)) return 'settings';
  return 'doc';
}

/* ── FileSvg ────────────────────────────────────────────── */

interface FileSvgProps {
  size: number;
  color: string;
  icon: string;
  name: string;
}

function FileSvg({ size, color, icon, name }: FileSvgProps) {
  const category = getCategory(icon);
  const path = CATEGORY_PATHS[category] ?? CATEGORY_PATHS.doc;

  // Non-document categories: render the distinct shape icon.
  if (category !== 'doc') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        className="fe__svg-icon"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    );
  }

  // Document category: render the paper shape with a colored label badge
  // so each code/text/config file type is visually distinct at a glance.
  const label: string = ICON_LABELS[icon] ?? (() => {
    const ext = name.includes('.')
      ? (name.split('.').pop()?.toUpperCase().slice(0, 3) ?? '')
      : '';
    return ext || '?';
  })();

  // Scale label font so 3-char labels still fit inside the icon.
  const fontSize = size <= 14 ? 4 : size <= 18 ? 5 : 6;
  // Y position of label text (vertically centred in the lower two-thirds).
  const textY = size <= 14 ? 15.5 : size <= 18 ? 15 : 14.5;

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="fe__svg-icon"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Paper silhouette in a muted neutral */}
      <path d={path} fill="currentColor" opacity={0.25} />
      {/* Colored top-left corner strip — acts as a hue swatch */}
      <rect x="6" y="2" width="7" height="2.5" rx="0.4" fill={color} opacity={0.9} />
      {/* Label text centred in the lower portion of the document */}
      <text
        x="12"
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="700"
        fill={color}
        letterSpacing="-0.3"
      >
        {label.length > 3 ? label.slice(0, 3) : label}
      </text>
    </svg>
  );
}

/* ── FolderSvg ──────────────────────────────────────────── */

interface FolderSvgProps {
  size: number;
  color: string;
  isOpen: boolean;
}

function FolderSvg({ size, color, isOpen }: FolderSvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className="fe__svg-icon"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {isOpen ? (
        // Open folder — tab visible, front panel angled
        <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 12H5l3-10h13l-2 10z" />
      ) : (
        // Closed folder
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      )}
    </svg>
  );
}

/* ── Main export ────────────────────────────────────────── */

export const FileIcon: FC<FileIconProps> = ({ name, type, isOpen = false, size = 16 }) => {
  const { icon, color } = useMemo(
    () => getFileIcon(name, type, isOpen),
    [name, type, isOpen],
  );

  if (type === 'directory') {
    return <FolderSvg size={size} color={color} isOpen={isOpen} />;
  }

  return <FileSvg size={size} color={color} icon={icon} name={name} />;
};
