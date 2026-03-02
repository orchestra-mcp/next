/**
 * File Icon Service
 *
 * Icon and color mapping for files and folders based on type, extension,
 * and name. Inspired by VS Code's Material Icon Theme.
 *
 * Resolution priority:
 *   1. Exact filename match
 *   2. Regex pattern match
 *   3. Compound extension (e.g. .blade.php, .test.ts)
 *   4. Simple extension
 *   5. Default fallback
 */

export interface IconDef {
  icon: string;
  color: string;
}

export interface FolderIconDef {
  closed: string;
  open: string;
  color: string;
}

/* ── Extension → Icon ──────────────────────────────────── */

const extIcons: Record<string, IconDef> = {
  // JavaScript/TypeScript
  '.js': { icon: 'javascript', color: '#F7DF1E' },
  '.mjs': { icon: 'javascript', color: '#F7DF1E' },
  '.cjs': { icon: 'javascript', color: '#F7DF1E' },
  '.jsx': { icon: 'react', color: '#61DAFB' },
  '.ts': { icon: 'typescript', color: '#3178C6' },
  '.mts': { icon: 'typescript', color: '#3178C6' },
  '.cts': { icon: 'typescript', color: '#3178C6' },
  '.tsx': { icon: 'react-ts', color: '#3178C6' },
  '.d.ts': { icon: 'typescript-def', color: '#3178C6' },
  // Web
  '.html': { icon: 'html', color: '#E34F26' },
  '.htm': { icon: 'html', color: '#E34F26' },
  '.css': { icon: 'css', color: '#1572B6' },
  '.scss': { icon: 'sass', color: '#CC6699' },
  '.sass': { icon: 'sass', color: '#CC6699' },
  '.less': { icon: 'less', color: '#1D365D' },
  '.vue': { icon: 'vue', color: '#4FC08D' },
  '.svelte': { icon: 'svelte', color: '#FF3E00' },
  '.astro': { icon: 'astro', color: '#FF5D01' },
  // Backend
  '.php': { icon: 'php', color: '#777BB4' },
  '.py': { icon: 'python', color: '#3776AB' },
  '.rb': { icon: 'ruby', color: '#CC342D' },
  '.go': { icon: 'go', color: '#00ADD8' },
  '.rs': { icon: 'rust', color: '#DEA584' },
  '.java': { icon: 'java', color: '#ED8B00' },
  '.kt': { icon: 'kotlin', color: '#7F52FF' },
  '.swift': { icon: 'swift', color: '#FA7343' },
  '.c': { icon: 'c', color: '#A8B9CC' },
  '.h': { icon: 'c-header', color: '#A8B9CC' },
  '.cpp': { icon: 'cpp', color: '#00599C' },
  '.cs': { icon: 'csharp', color: '#512BD4' },
  '.dart': { icon: 'dart', color: '#00B4AB' },
  '.lua': { icon: 'lua', color: '#000080' },
  '.r': { icon: 'r', color: '#276DC3' },
  '.ex': { icon: 'elixir', color: '#6E4A7E' },
  '.exs': { icon: 'elixir', color: '#6E4A7E' },
  // Data/Config
  '.json': { icon: 'json', color: '#CBCB41' },
  '.json5': { icon: 'json', color: '#CBCB41' },
  '.yaml': { icon: 'yaml', color: '#CB171E' },
  '.yml': { icon: 'yaml', color: '#CB171E' },
  '.toml': { icon: 'toml', color: '#9C4121' },
  '.xml': { icon: 'xml', color: '#E37933' },
  '.env': { icon: 'dotenv', color: '#ECD53F' },
  '.ini': { icon: 'settings', color: '#6D8086' },
  '.conf': { icon: 'settings', color: '#6D8086' },
  '.csv': { icon: 'csv', color: '#89E051' },
  // Documentation
  '.md': { icon: 'markdown', color: '#083FA1' },
  '.mdx': { icon: 'mdx', color: '#FCB32C' },
  '.txt': { icon: 'text', color: '#89E051' },
  '.pdf': { icon: 'pdf', color: '#FF0000' },
  '.rst': { icon: 'restructuredtext', color: '#141414' },
  // Images
  '.png': { icon: 'image', color: '#A074C4' },
  '.jpg': { icon: 'image', color: '#A074C4' },
  '.jpeg': { icon: 'image', color: '#A074C4' },
  '.gif': { icon: 'image', color: '#A074C4' },
  '.webp': { icon: 'image', color: '#A074C4' },
  '.svg': { icon: 'svg', color: '#FFB13B' },
  '.ico': { icon: 'image', color: '#A074C4' },
  // Audio/Video
  '.mp3': { icon: 'audio', color: '#F44336' },
  '.mp4': { icon: 'video', color: '#F44336' },
  '.wav': { icon: 'audio', color: '#F44336' },
  // Database
  '.sql': { icon: 'database', color: '#336791' },
  '.sqlite': { icon: 'sqlite', color: '#003B57' },
  '.prisma': { icon: 'prisma', color: '#2D3748' },
  '.graphql': { icon: 'graphql', color: '#E535AB' },
  // Shell
  '.sh': { icon: 'shell', color: '#89E051' },
  '.bash': { icon: 'shell', color: '#89E051' },
  '.zsh': { icon: 'shell', color: '#89E051' },
  // Build/Package
  '.lock': { icon: 'lock', color: '#8B8B8B' },
  // Archives
  '.zip': { icon: 'archive', color: '#F4D03F' },
  '.tar': { icon: 'archive', color: '#F4D03F' },
  '.gz': { icon: 'archive', color: '#F4D03F' },
  // Fonts
  '.ttf': { icon: 'font', color: '#FF5252' },
  '.otf': { icon: 'font', color: '#FF5252' },
  '.woff': { icon: 'font', color: '#FF5252' },
  '.woff2': { icon: 'font', color: '#FF5252' },
  // Templates
  '.blade.php': { icon: 'blade', color: '#F05340' },
  '.twig': { icon: 'twig', color: '#BACF2A' },
  // Testing (compound)
  '.test.js': { icon: 'test-js', color: '#99425B' },
  '.test.ts': { icon: 'test-ts', color: '#99425B' },
  '.spec.js': { icon: 'test-js', color: '#99425B' },
  '.spec.ts': { icon: 'test-ts', color: '#99425B' },
  '.test.tsx': { icon: 'test-tsx', color: '#99425B' },
  // Logs
  '.log': { icon: 'log', color: '#8B8B8B' },
  // Proto
  '.proto': { icon: 'proto', color: '#4285F4' },
};

/* ── Filename → Icon ───────────────────────────────────── */

const nameIcons: Record<string, IconDef> = {
  'package.json': { icon: 'nodejs', color: '#339933' },
  'package-lock.json': { icon: 'nodejs-lock', color: '#339933' },
  'yarn.lock': { icon: 'yarn', color: '#2C8EBB' },
  'pnpm-lock.yaml': { icon: 'pnpm', color: '#F69220' },
  'tsconfig.json': { icon: 'tsconfig', color: '#3178C6' },
  'vite.config.ts': { icon: 'vite', color: '#646CFF' },
  'vite.config.js': { icon: 'vite', color: '#646CFF' },
  'webpack.config.js': { icon: 'webpack', color: '#8DD6F9' },
  '.gitignore': { icon: 'git', color: '#F05032' },
  '.gitattributes': { icon: 'git', color: '#F05032' },
  '.eslintrc': { icon: 'eslint', color: '#4B32C3' },
  '.eslintrc.js': { icon: 'eslint', color: '#4B32C3' },
  'eslint.config.js': { icon: 'eslint', color: '#4B32C3' },
  '.prettierrc': { icon: 'prettier', color: '#F7B93E' },
  '.editorconfig': { icon: 'editorconfig', color: '#FEFEFE' },
  'Dockerfile': { icon: 'docker', color: '#2496ED' },
  'docker-compose.yml': { icon: 'docker', color: '#2496ED' },
  'README.md': { icon: 'readme', color: '#083FA1' },
  'CHANGELOG.md': { icon: 'changelog', color: '#83B81A' },
  'LICENSE': { icon: 'license', color: '#D4AF37' },
  'LICENSE.md': { icon: 'license', color: '#D4AF37' },
  'composer.json': { icon: 'composer', color: '#885630' },
  'composer.lock': { icon: 'composer', color: '#885630' },
  'artisan': { icon: 'laravel', color: '#FF2D20' },
  'phpunit.xml': { icon: 'phpunit', color: '#3C9CD7' },
  'phpunit.xml.dist': { icon: 'phpunit', color: '#3C9CD7' },
  '.env': { icon: 'dotenv', color: '#ECD53F' },
  '.env.local': { icon: 'dotenv', color: '#ECD53F' },
  '.env.example': { icon: 'dotenv', color: '#ECD53F' },
  'tailwind.config.js': { icon: 'tailwind', color: '#06B6D4' },
  'tailwind.config.ts': { icon: 'tailwind', color: '#06B6D4' },
  'jest.config.js': { icon: 'jest', color: '#99425B' },
  'vitest.config.ts': { icon: 'vitest', color: '#729B1A' },
  'Makefile': { icon: 'makefile', color: '#6D8086' },
  '.nvmrc': { icon: 'nodejs', color: '#339933' },
  '.npmrc': { icon: 'npm', color: '#CB3837' },
  'Gemfile': { icon: 'gemfile', color: '#CC342D' },
  'Cargo.toml': { icon: 'cargo', color: '#DEA584' },
  'Cargo.lock': { icon: 'cargo', color: '#DEA584' },
  'go.mod': { icon: 'go-mod', color: '#00ADD8' },
  'go.sum': { icon: 'go-mod', color: '#00ADD8' },
  'CLAUDE.md': { icon: 'readme', color: '#D97706' },
  'AGENTS.md': { icon: 'readme', color: '#7C3AED' },
};

/* ── Pattern matching ──────────────────────────────────── */

const patterns: Array<{ re: RegExp; def: IconDef }> = [
  { re: /\.test\.(js|jsx|ts|tsx|mjs)$/, def: { icon: 'test', color: '#99425B' } },
  { re: /\.spec\.(js|jsx|ts|tsx|mjs)$/, def: { icon: 'test', color: '#99425B' } },
  { re: /\.stories\.(js|jsx|ts|tsx|mdx)$/, def: { icon: 'storybook', color: '#FF4785' } },
  { re: /\.d\.ts$/, def: { icon: 'typescript-def', color: '#3178C6' } },
  { re: /\.config\.(js|ts|mjs|cjs)$/, def: { icon: 'settings', color: '#6D8086' } },
  { re: /\.module\.(css|scss|sass|less)$/, def: { icon: 'css-module', color: '#1572B6' } },
  { re: /\.min\.(js|css)$/, def: { icon: 'minified', color: '#F4D03F' } },
  { re: /^\.env\./, def: { icon: 'dotenv', color: '#ECD53F' } },
];

/* ── Folder → Icon ─────────────────────────────────────── */

export const folderIcons: Record<string, FolderIconDef> = {
  src: { closed: 'folder-src', open: 'folder-src-open', color: '#42A5F5' },
  source: { closed: 'folder-src', open: 'folder-src-open', color: '#42A5F5' },
  app: { closed: 'folder-app', open: 'folder-app-open', color: '#7E57C2' },
  lib: { closed: 'folder-lib', open: 'folder-lib-open', color: '#78909C' },
  components: { closed: 'folder-components', open: 'folder-components-open', color: '#7E57C2' },
  ui: { closed: 'folder-components', open: 'folder-components-open', color: '#7E57C2' },
  layouts: { closed: 'folder-layout', open: 'folder-layout-open', color: '#EC407A' },
  pages: { closed: 'folder-pages', open: 'folder-pages-open', color: '#AB47BC' },
  views: { closed: 'folder-views', open: 'folder-views-open', color: '#AB47BC' },
  hooks: { closed: 'folder-hooks', open: 'folder-hooks-open', color: '#61DAFB' },
  store: { closed: 'folder-store', open: 'folder-store-open', color: '#FF7043' },
  stores: { closed: 'folder-store', open: 'folder-store-open', color: '#FF7043' },
  api: { closed: 'folder-api', open: 'folder-api-open', color: '#FF7043' },
  services: { closed: 'folder-services', open: 'folder-services-open', color: '#26A69A' },
  server: { closed: 'folder-server', open: 'folder-server-open', color: '#7CB342' },
  utils: { closed: 'folder-utils', open: 'folder-utils-open', color: '#78909C' },
  helpers: { closed: 'folder-helper', open: 'folder-helper-open', color: '#78909C' },
  shared: { closed: 'folder-shared', open: 'folder-shared-open', color: '#9575CD' },
  core: { closed: 'folder-core', open: 'folder-core-open', color: '#5C6BC0' },
  public: { closed: 'folder-public', open: 'folder-public-open', color: '#66BB6A' },
  static: { closed: 'folder-public', open: 'folder-public-open', color: '#66BB6A' },
  assets: { closed: 'folder-assets', open: 'folder-assets-open', color: '#FFCA28' },
  images: { closed: 'folder-images', open: 'folder-images-open', color: '#A074C4' },
  icons: { closed: 'folder-icons', open: 'folder-icons-open', color: '#EF5350' },
  fonts: { closed: 'folder-fonts', open: 'folder-fonts-open', color: '#FF5252' },
  styles: { closed: 'folder-styles', open: 'folder-styles-open', color: '#42A5F5' },
  css: { closed: 'folder-styles', open: 'folder-styles-open', color: '#42A5F5' },
  tests: { closed: 'folder-test', open: 'folder-test-open', color: '#9CCC65' },
  test: { closed: 'folder-test', open: 'folder-test-open', color: '#9CCC65' },
  __tests__: { closed: 'folder-test', open: 'folder-test-open', color: '#9CCC65' },
  config: { closed: 'folder-config', open: 'folder-config-open', color: '#607D8B' },
  settings: { closed: 'folder-config', open: 'folder-config-open', color: '#607D8B' },
  types: { closed: 'folder-types', open: 'folder-types-open', color: '#3178C6' },
  models: { closed: 'folder-model', open: 'folder-model-open', color: '#FF8A65' },
  database: { closed: 'folder-database', open: 'folder-database-open', color: '#336791' },
  db: { closed: 'folder-database', open: 'folder-database-open', color: '#336791' },
  migrations: { closed: 'folder-database', open: 'folder-database-open', color: '#336791' },
  seeders: { closed: 'folder-database', open: 'folder-database-open', color: '#336791' },
  docs: { closed: 'folder-docs', open: 'folder-docs-open', color: '#42A5F5' },
  scripts: { closed: 'folder-scripts', open: 'folder-scripts-open', color: '#7CB342' },
  bin: { closed: 'folder-bin', open: 'folder-bin-open', color: '#607D8B' },
  build: { closed: 'folder-dist', open: 'folder-dist-open', color: '#BDBDBD' },
  dist: { closed: 'folder-dist', open: 'folder-dist-open', color: '#BDBDBD' },
  node_modules: { closed: 'folder-node', open: 'folder-node-open', color: '#339933' },
  vendor: { closed: 'folder-vendor', open: 'folder-vendor-open', color: '#885630' },
  packages: { closed: 'folder-packages', open: 'folder-packages-open', color: '#9C27B0' },
  plugins: { closed: 'folder-packages', open: 'folder-packages-open', color: '#7E57C2' },
  '.git': { closed: 'folder-git', open: 'folder-git-open', color: '#F05032' },
  '.github': { closed: 'folder-github', open: 'folder-github-open', color: '#181717' },
  '.vscode': { closed: 'folder-vscode', open: 'folder-vscode-open', color: '#007ACC' },
  '.idea': { closed: 'folder-idea', open: 'folder-idea-open', color: '#000000' },
  '.claude': { closed: 'folder-config', open: 'folder-config-open', color: '#D97706' },
  cache: { closed: 'folder-cache', open: 'folder-cache-open', color: '#9E9E9E' },
  temp: { closed: 'folder-temp', open: 'folder-temp-open', color: '#9E9E9E' },
  tmp: { closed: 'folder-temp', open: 'folder-temp-open', color: '#9E9E9E' },
  logs: { closed: 'folder-log', open: 'folder-log-open', color: '#8B8B8B' },
  routes: { closed: 'folder-routes', open: 'folder-routes-open', color: '#FF7043' },
  handlers: { closed: 'folder-routes', open: 'folder-routes-open', color: '#FF7043' },
  middleware: { closed: 'folder-routes', open: 'folder-routes-open', color: '#26A69A' },
  resources: { closed: 'folder-resources', open: 'folder-resources-open', color: '#66BB6A' },
  storage: { closed: 'folder-storage', open: 'folder-storage-open', color: '#9E9E9E' },
  bootstrap: { closed: 'folder-bootstrap', open: 'folder-bootstrap-open', color: '#7952B3' },
  engine: { closed: 'folder-core', open: 'folder-core-open', color: '#DEA584' },
  proto: { closed: 'folder-types', open: 'folder-types-open', color: '#4285F4' },
  cmd: { closed: 'folder-bin', open: 'folder-bin-open', color: '#607D8B' },
};

/* ── Resolve ───────────────────────────────────────────── */

export function getFileIcon(
  name: string,
  type: 'file' | 'directory',
  isOpen = false,
): IconDef {
  if (type === 'directory') {
    const lower = name.toLowerCase();
    const def = folderIcons[lower] ?? folderIcons[name];
    if (def) return { icon: isOpen ? def.open : def.closed, color: def.color };
    return { icon: isOpen ? 'folder-open' : 'folder', color: '#90A4AE' };
  }

  // 1. Exact filename
  if (nameIcons[name]) return nameIcons[name];

  // 2. Regex patterns
  for (const { re, def } of patterns) {
    if (re.test(name)) return def;
  }

  // 3. Compound extension
  const parts = name.split('.');
  if (parts.length > 2) {
    const compound = '.' + parts.slice(-2).join('.');
    if (extIcons[compound]) return extIcons[compound];
  }

  // 4. Simple extension
  const ext = '.' + (parts.pop()?.toLowerCase() ?? '');
  if (extIcons[ext]) return extIcons[ext];

  // 5. Default
  return { icon: 'file', color: '#90A4AE' };
}
