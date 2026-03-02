/**
 * Color Theme Definitions
 * 25 themes from ThemePresets.php organized by group
 */

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  bgContrast: string;
  bgActive: string;
  bgSelection: string;
  fg: string;
  fgDim: string;
  fgMuted: string;
  fgBright: string;
  border: string;
  accent: string;
  isLight?: boolean;
}

export interface SyntaxColors {
  blue: string;
  cyan: string;
  green: string;
  yellow: string;
  orange: string;
  red: string;
  purple: string;
  teal: string;
  error: string;
}

export type ThemeSource = 'default' | 'compact' | 'modern';

export interface ThemeAuthor {
  name: string;
  url?: string;
}

export interface Theme {
  id: string;
  label: string;
  group: 'Orchestra' | 'Material' | 'Popular' | 'Classic';
  source: ThemeSource;
  colors: ThemeColors;
  syntax: SyntaxColors;
  isLight: boolean;
  author?: ThemeAuthor;
  variables?: Record<string, string>;
  version?: string;
  description?: string;
}

const darkSyntax: SyntaxColors = {
  blue: '#82aaff',
  cyan: '#89ddff',
  green: '#c3e88d',
  yellow: '#ffcb6b',
  orange: '#f78c6c',
  red: '#ff5370',
  purple: '#c792ea',
  teal: '#4fd6be',
  error: '#ff5370',
};

const lightSyntax: SyntaxColors = {
  blue: '#0366d6',
  cyan: '#0598bc',
  green: '#22863a',
  yellow: '#b08800',
  orange: '#d73a49',
  red: '#d73a49',
  purple: '#6f42c1',
  teal: '#0598bc',
  error: '#d73a49',
};

export const THEMES: Theme[] = [
  // ── Orchestra ──────────────────────────────────────────────
  {
    id: 'orchestra',
    label: 'Orchestra',
    group: 'Orchestra',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#0a0d14',
      bgAlt: '#141927',
      bgContrast: '#181e2e',
      bgActive: '#283048',
      bgSelection: '#3a4a7080',
      fg: '#b8c5d9',
      fgDim: '#4a5570',
      fgMuted: '#6b7b95',
      fgBright: '#e8eef8',
      border: '#1e2535',
      accent: '#a900ff',
    },
    syntax: darkSyntax,
  },

  // ── Material ───────────────────────────────────────────────
  {
    id: 'deep-ocean',
    label: 'Deep Ocean',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#0f111a',
      bgAlt: '#34324a',
      bgContrast: '#202331',
      bgActive: '#414863',
      bgSelection: '#717cb480',
      fg: '#8f93a2',
      fgDim: '#4b526d',
      fgMuted: '#676e95',
      fgBright: '#eeffff',
      border: '#2b2a3e',
      accent: '#ab47bc',
    },
    syntax: darkSyntax,
  },
  {
    id: 'darker',
    label: 'Darker',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#212121',
      bgAlt: '#292929',
      bgContrast: '#1a1a1a',
      bgActive: '#323232',
      bgSelection: '#40404080',
      fg: '#b0bec5',
      fgDim: '#727272',
      fgMuted: '#616161',
      fgBright: '#eeffff',
      border: '#292929',
      accent: '#ff9800',
    },
    syntax: darkSyntax,
  },
  {
    id: 'oceanic',
    label: 'Oceanic',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#263238',
      bgAlt: '#2e3c43',
      bgContrast: '#1e272c',
      bgActive: '#314549',
      bgSelection: '#54717580',
      fg: '#b0bec5',
      fgDim: '#607d8b',
      fgMuted: '#546e7a',
      fgBright: '#eeffff',
      border: '#2e3c43',
      accent: '#009688',
    },
    syntax: darkSyntax,
  },
  {
    id: 'palenight',
    label: 'Palenight',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#292d3e',
      bgAlt: '#343747',
      bgContrast: '#202331',
      bgActive: '#414863',
      bgSelection: '#717cb480',
      fg: '#a6accd',
      fgDim: '#676e95',
      fgMuted: '#676e95',
      fgBright: '#eeffff',
      border: '#343747',
      accent: '#ab47bc',
    },
    syntax: darkSyntax,
  },
  {
    id: 'jetbrains',
    label: 'JetBrains',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#1e1f22',
      bgAlt: '#2b2d30',
      bgContrast: '#27282e',
      bgActive: '#393b40',
      bgSelection: '#214283',
      fg: '#bcbec4',
      fgDim: '#6f737a',
      fgMuted: '#868a91',
      fgBright: '#dfe1e5',
      border: '#393b40',
      accent: '#3574f0',
    },
    syntax: darkSyntax,
  },
  {
    id: 'lighter',
    label: 'Lighter',
    group: 'Material',
    source: 'default',
    isLight: true,
    colors: {
      bg: '#fafafa',
      bgAlt: '#eaecee',
      bgContrast: '#f5f5f5',
      bgActive: '#d4d6da',
      bgSelection: '#80cbc480',
      fg: '#546e7a',
      fgDim: '#94a7b0',
      fgMuted: '#90a4ae',
      fgBright: '#2e3c43',
      border: '#d3e1e8',
      accent: '#e53935',
      isLight: true,
    },
    syntax: lightSyntax,
  },
  {
    id: 'forest',
    label: 'Forest',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#1a2218',
      bgAlt: '#243020',
      bgContrast: '#1e2a1c',
      bgActive: '#2d3b28',
      bgSelection: '#4a6a4080',
      fg: '#9bb08a',
      fgDim: '#5e7650',
      fgMuted: '#7a9468',
      fgBright: '#d5e0cd',
      border: '#2a3a24',
      accent: '#4caf50',
    },
    syntax: darkSyntax,
  },
  {
    id: 'sky-blue',
    label: 'Sky Blue',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#151b2b',
      bgAlt: '#1d2740',
      bgContrast: '#111827',
      bgActive: '#283452',
      bgSelection: '#3b5faa80',
      fg: '#8ba4c4',
      fgDim: '#4a6080',
      fgMuted: '#6480a4',
      fgBright: '#d4e4ff',
      border: '#233050',
      accent: '#2196f3',
    },
    syntax: darkSyntax,
  },
  {
    id: 'sandy-beach',
    label: 'Sandy Beach',
    group: 'Material',
    source: 'default',
    isLight: true,
    colors: {
      bg: '#fdf6e3',
      bgAlt: '#f5ecda',
      bgContrast: '#faf0d4',
      bgActive: '#e8ddc4',
      bgSelection: '#c8a96080',
      fg: '#5a5040',
      fgDim: '#a09480',
      fgMuted: '#8a7e68',
      fgBright: '#32281e',
      border: '#e0d5c0',
      accent: '#d4a04a',
      isLight: true,
    },
    syntax: lightSyntax,
  },
  {
    id: 'volcano',
    label: 'Volcano',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#1a1012',
      bgAlt: '#2a181c',
      bgContrast: '#150d10',
      bgActive: '#3e2228',
      bgSelection: '#8b3a4680',
      fg: '#c4a0a0',
      fgDim: '#7a5050',
      fgMuted: '#9a6868',
      fgBright: '#ffe0e0',
      border: '#3a2028',
      accent: '#ff5252',
    },
    syntax: darkSyntax,
  },
  {
    id: 'space',
    label: 'Space',
    group: 'Material',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#0a0e1a',
      bgAlt: '#141830',
      bgContrast: '#080c16',
      bgActive: '#1e2440',
      bgSelection: '#4050a080',
      fg: '#8890b0',
      fgDim: '#404868',
      fgMuted: '#5a6488',
      fgBright: '#d0d8f0',
      border: '#1a2038',
      accent: '#7b68ee',
    },
    syntax: darkSyntax,
  },

  // ── Popular ────────────────────────────────────────────────
  {
    id: 'monokai-pro',
    label: 'Monokai Pro',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#2d2a2e',
      bgAlt: '#363337',
      bgContrast: '#221f22',
      bgActive: '#403e41',
      bgSelection: '#6b696680',
      fg: '#d3cfc9',
      fgDim: '#726f72',
      fgMuted: '#908e8f',
      fgBright: '#fcfcfa',
      border: '#403e41',
      accent: '#ffd866',
    },
    syntax: darkSyntax,
  },
  {
    id: 'dracula',
    label: 'Dracula',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#282a36',
      bgAlt: '#2d303e',
      bgContrast: '#21222c',
      bgActive: '#343746',
      bgSelection: '#44475a80',
      fg: '#f8f8f2',
      fgDim: '#6272a4',
      fgMuted: '#6272a4',
      fgBright: '#f8f8f2',
      border: '#343746',
      accent: '#bd93f9',
    },
    syntax: darkSyntax,
  },
  {
    id: 'github-light',
    label: 'GitHub Light',
    group: 'Popular',
    source: 'default',
    isLight: true,
    colors: {
      bg: '#ffffff',
      bgAlt: '#f6f8fa',
      bgContrast: '#f3f4f6',
      bgActive: '#dfe2e5',
      bgSelection: '#0366d620',
      fg: '#24292e',
      fgDim: '#6a737d',
      fgMuted: '#586069',
      fgBright: '#1b1f23',
      border: '#e1e4e8',
      accent: '#0366d6',
      isLight: true,
    },
    syntax: lightSyntax,
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#0d1117',
      bgAlt: '#161b22',
      bgContrast: '#010409',
      bgActive: '#21262d',
      bgSelection: '#388bfd26',
      fg: '#c9d1d9',
      fgDim: '#484f58',
      fgMuted: '#8b949e',
      fgBright: '#f0f6fc',
      border: '#30363d',
      accent: '#58a6ff',
    },
    syntax: darkSyntax,
  },
  {
    id: 'one-dark',
    label: 'One Dark',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#282c34',
      bgAlt: '#2c313a',
      bgContrast: '#21252b',
      bgActive: '#3b4048',
      bgSelection: '#3e445180',
      fg: '#abb2bf',
      fgDim: '#5c6370',
      fgMuted: '#636d83',
      fgBright: '#d7dae0',
      border: '#3b4048',
      accent: '#528bff',
    },
    syntax: darkSyntax,
  },
  {
    id: 'one-light',
    label: 'One Light',
    group: 'Popular',
    source: 'default',
    isLight: true,
    colors: {
      bg: '#fafafa',
      bgAlt: '#f0f0f0',
      bgContrast: '#e5e5e6',
      bgActive: '#dbdbdc',
      bgSelection: '#526fff20',
      fg: '#383a42',
      fgDim: '#a0a1a7',
      fgMuted: '#696c77',
      fgBright: '#232324',
      border: '#dbdbdc',
      accent: '#526fff',
      isLight: true,
    },
    syntax: lightSyntax,
  },
  {
    id: 'night-owl',
    label: 'Night Owl',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#011627',
      bgAlt: '#0b2942',
      bgContrast: '#010e1a',
      bgActive: '#122d42',
      bgSelection: '#5f7e9750',
      fg: '#d6deeb',
      fgDim: '#5f7e97',
      fgMuted: '#7fdbca',
      fgBright: '#ffffff',
      border: '#122d42',
      accent: '#7e57c2',
    },
    syntax: darkSyntax,
  },
  {
    id: 'light-owl',
    label: 'Light Owl',
    group: 'Popular',
    source: 'default',
    isLight: true,
    colors: {
      bg: '#fbfbfb',
      bgAlt: '#f0f0f0',
      bgContrast: '#f5f5f5',
      bgActive: '#d9d9d9',
      bgSelection: '#7e57c220',
      fg: '#403f53',
      fgDim: '#90a7b2',
      fgMuted: '#7a8181',
      fgBright: '#111111',
      border: '#d9d9d9',
      accent: '#7e57c2',
      isLight: true,
    },
    syntax: lightSyntax,
  },
  {
    id: 'moonlight',
    label: 'Moonlight',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#1e2030',
      bgAlt: '#2f334d',
      bgContrast: '#191a2a',
      bgActive: '#3b4261',
      bgSelection: '#82aaff30',
      fg: '#c8d3f5',
      fgDim: '#444a73',
      fgMuted: '#636da6',
      fgBright: '#e2e8fa',
      border: '#2f334d',
      accent: '#82aaff',
    },
    syntax: darkSyntax,
  },
  {
    id: 'synthwave-84',
    label: "SynthWave '84",
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#262335',
      bgAlt: '#342f48',
      bgContrast: '#1e1a2e',
      bgActive: '#463e5e',
      bgSelection: '#ff7edb30',
      fg: '#b6b1c8',
      fgDim: '#5a5478',
      fgMuted: '#7a7498',
      fgBright: '#e4e0f0',
      border: '#342f48',
      accent: '#ff7edb',
    },
    syntax: darkSyntax,
  },
  {
    id: 'matrix',
    label: 'Matrix',
    group: 'Popular',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#101a14',
      bgAlt: '#162219',
      bgContrast: '#0c1410',
      bgActive: '#1e2e24',
      bgSelection: '#2d8a4530',
      fg: '#6aad7b',
      fgDim: '#3d6b4a',
      fgMuted: '#508c60',
      fgBright: '#8ecf9e',
      border: '#1c2b20',
      accent: '#2d8a45',
    },
    syntax: {
      blue: '#5a9e70',
      cyan: '#60b888',
      green: '#4a9e5e',
      yellow: '#7ab878',
      orange: '#508c60',
      red: '#b85050',
      purple: '#6aad80',
      teal: '#60b888',
      error: '#b85050',
    },
  },

  // ── Classic ────────────────────────────────────────────────
  {
    id: 'arc-dark',
    label: 'Arc Dark',
    group: 'Classic',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#2a2a2e',
      bgAlt: '#333338',
      bgContrast: '#232327',
      bgActive: '#3e3e44',
      bgSelection: '#5294e240',
      fg: '#babac0',
      fgDim: '#6a6a70',
      fgMuted: '#8a8a90',
      fgBright: '#e0e0e6',
      border: '#3e3e44',
      accent: '#5294e2',
    },
    syntax: darkSyntax,
  },
  {
    id: 'solarized-dark',
    label: 'Solarized Dark',
    group: 'Classic',
    source: 'default',
    isLight: false,
    colors: {
      bg: '#002b36',
      bgAlt: '#073642',
      bgContrast: '#00212b',
      bgActive: '#0a3d4a',
      bgSelection: '#26869950',
      fg: '#839496',
      fgDim: '#586e75',
      fgMuted: '#657b83',
      fgBright: '#fdf6e3',
      border: '#0a3d4a',
      accent: '#268bd2',
    },
    syntax: darkSyntax,
  },
  {
    id: 'solarized-light',
    label: 'Solarized Light',
    group: 'Classic',
    source: 'default',
    isLight: true,
    colors: {
      bg: '#fdf6e3',
      bgAlt: '#eee8d5',
      bgContrast: '#f5eed9',
      bgActive: '#d3cdb8',
      bgSelection: '#268bd220',
      fg: '#657b83',
      fgDim: '#93a1a1',
      fgMuted: '#839496',
      fgBright: '#002b36',
      border: '#d3cdb8',
      accent: '#268bd2',
      isLight: true,
    },
    syntax: lightSyntax,
  },
];

export const THEME_GROUPS = ['Orchestra', 'Material', 'Popular', 'Classic'] as const;

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((theme) => theme.id === id);
}

export function getThemesByGroup(
  group: 'Orchestra' | 'Material' | 'Popular' | 'Classic'
): Theme[] {
  return THEMES.filter((theme) => theme.group === group);
}

export function toCssVariables(theme: Theme): Record<string, string> {
  return {
    '--color-bg': theme.colors.bg,
    '--color-bg-alt': theme.colors.bgAlt,
    '--color-bg-contrast': theme.colors.bgContrast,
    '--color-bg-active': theme.colors.bgActive,
    '--color-bg-selection': theme.colors.bgSelection,
    '--color-fg': theme.colors.fg,
    '--color-fg-dim': theme.colors.fgDim,
    '--color-fg-muted': theme.colors.fgMuted,
    '--color-fg-bright': theme.colors.fgBright,
    '--color-border': theme.colors.border,
    '--color-accent': theme.colors.accent,
    '--syntax-blue': theme.syntax.blue,
    '--syntax-cyan': theme.syntax.cyan,
    '--syntax-green': theme.syntax.green,
    '--syntax-yellow': theme.syntax.yellow,
    '--syntax-orange': theme.syntax.orange,
    '--syntax-red': theme.syntax.red,
    '--syntax-purple': theme.syntax.purple,
    '--syntax-teal': theme.syntax.teal,
    '--syntax-error': theme.syntax.error,
    ...(theme.variables || {}),
  };
}
