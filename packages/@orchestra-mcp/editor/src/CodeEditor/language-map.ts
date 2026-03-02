/** Maps language names, aliases, and file extensions to Monaco language IDs */
const LANGUAGE_MAP: Record<string, string> = {
  // Monaco built-in language IDs
  javascript: 'javascript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  python: 'python',
  go: 'go',
  rust: 'rust',
  java: 'java',
  csharp: 'csharp',
  cpp: 'cpp',
  c: 'c',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  sql: 'sql',
  yaml: 'yaml',
  xml: 'xml',
  markdown: 'markdown',
  shell: 'shell',
  scss: 'scss',
  less: 'less',
  graphql: 'graphql',
  dockerfile: 'dockerfile',
  lua: 'lua',
  perl: 'perl',
  r: 'r',
  // Common aliases
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rs: 'rust',
  rb: 'ruby',
  cs: 'csharp',
  kt: 'kotlin',
  md: 'markdown',
  yml: 'yaml',
  bash: 'shell',
  sh: 'shell',
  zsh: 'shell',
  toml: 'ini',
  proto: 'protobuf',
  tf: 'hcl',
};

/** Resolve a language name or alias to a Monaco language ID */
export function resolveLanguage(lang?: string): string | undefined {
  if (!lang) return undefined;
  return LANGUAGE_MAP[lang.toLowerCase()] ?? lang.toLowerCase();
}

/** Infer Monaco language ID from a filename extension */
export function languageFromFilename(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return undefined;
  return LANGUAGE_MAP[ext];
}
