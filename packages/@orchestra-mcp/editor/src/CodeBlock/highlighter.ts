/**
 * Lightweight syntax highlighter using regex tokenization.
 * Maps tokens to CSS classes that use --syntax-* CSS variables from the theme.
 */

interface TokenRule {
  pattern: RegExp;
  className: string;
}

const COMMON_KEYWORDS = [
  'if', 'else', 'for', 'while', 'return', 'function', 'class', 'const',
  'let', 'var', 'import', 'export', 'from', 'default', 'new', 'this',
  'throw', 'try', 'catch', 'finally', 'switch', 'case', 'break',
  'continue', 'do', 'in', 'of', 'typeof', 'instanceof', 'void',
  'delete', 'async', 'await', 'yield', 'static', 'extends', 'super',
  'implements', 'interface', 'type', 'enum', 'abstract', 'readonly',
];

const PHP_KEYWORDS = [
  'namespace', 'use', 'class', 'function', 'public', 'private', 'protected',
  'static', 'return', 'if', 'else', 'foreach', 'as', 'new', 'extends',
  'implements', 'interface', 'abstract', 'final', 'const', 'echo', 'throw',
  'try', 'catch', 'finally', 'match', 'fn', 'yield', 'readonly',
];

const GO_KEYWORDS = [
  'func', 'package', 'import', 'type', 'struct', 'interface', 'map',
  'chan', 'go', 'defer', 'return', 'if', 'else', 'for', 'range',
  'switch', 'case', 'default', 'break', 'continue', 'select', 'var',
  'const', 'fallthrough', 'goto',
];

const RUST_KEYWORDS = [
  'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'use',
  'mod', 'crate', 'self', 'super', 'match', 'if', 'else', 'for', 'while',
  'loop', 'return', 'where', 'async', 'await', 'move', 'ref', 'type',
  'const', 'static', 'unsafe', 'extern', 'dyn', 'as', 'in',
];

const PYTHON_KEYWORDS = [
  'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else',
  'for', 'while', 'in', 'not', 'and', 'or', 'is', 'with', 'as',
  'try', 'except', 'finally', 'raise', 'pass', 'break', 'continue',
  'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del', 'async', 'await',
];

const JAVA_KEYWORDS = [
  'class', 'interface', 'extends', 'implements', 'public', 'private', 'protected',
  'static', 'final', 'abstract', 'void', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'new', 'throw', 'try', 'catch',
  'finally', 'import', 'package', 'this', 'super', 'synchronized', 'volatile',
];

const C_KEYWORDS = [
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'return', 'struct', 'typedef', 'enum', 'union', 'void', 'int', 'char', 'float',
  'double', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'extern',
  'sizeof', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'NULL',
];

const RUBY_KEYWORDS = [
  'def', 'class', 'module', 'end', 'if', 'elsif', 'else', 'unless', 'while',
  'until', 'for', 'do', 'begin', 'rescue', 'ensure', 'raise', 'return', 'yield',
  'block_given', 'require', 'include', 'extend', 'attr_accessor', 'attr_reader',
  'nil', 'true', 'false', 'self', 'super', 'puts', 'print',
];

const BASH_KEYWORDS = [
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case',
  'esac', 'function', 'return', 'exit', 'echo', 'read', 'export', 'source',
  'local', 'readonly', 'shift', 'set', 'unset', 'trap', 'eval', 'exec',
  'cd', 'pwd', 'test', 'true', 'false',
];

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT',
  'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'AS',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'UNION',
  'EXISTS', 'IN', 'BETWEEN', 'LIKE', 'IS', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'CASCADE', 'DEFAULT', 'CONSTRAINT', 'BEGIN', 'COMMIT', 'ROLLBACK',
];

const SWIFT_KEYWORDS = [
  'func', 'var', 'let', 'class', 'struct', 'enum', 'protocol', 'extension',
  'import', 'return', 'if', 'else', 'guard', 'switch', 'case', 'default',
  'for', 'while', 'repeat', 'break', 'continue', 'throw', 'try', 'catch',
  'self', 'super', 'init', 'deinit', 'nil', 'true', 'false', 'override',
  'private', 'public', 'internal', 'open', 'static', 'async', 'await',
];

const KOTLIN_KEYWORDS = [
  'fun', 'val', 'var', 'class', 'object', 'interface', 'abstract', 'override',
  'open', 'data', 'sealed', 'import', 'package', 'return', 'if', 'else',
  'when', 'for', 'while', 'do', 'break', 'continue', 'throw', 'try', 'catch',
  'finally', 'this', 'super', 'null', 'true', 'false', 'is', 'as', 'in',
  'suspend', 'companion', 'init', 'private', 'public', 'internal', 'protected',
];

const CSHARP_KEYWORDS = [
  'class', 'interface', 'struct', 'enum', 'namespace', 'using', 'public',
  'private', 'protected', 'internal', 'static', 'void', 'return', 'if', 'else',
  'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'new', 'throw', 'try', 'catch', 'finally', 'async', 'await', 'var', 'const',
  'readonly', 'override', 'virtual', 'abstract', 'sealed', 'partial', 'this',
  'base', 'null', 'true', 'false', 'out', 'ref', 'in', 'yield',
];

function getKeywords(lang: string): string[] {
  switch (lang) {
    case 'php': return PHP_KEYWORDS;
    case 'go': case 'golang': return GO_KEYWORDS;
    case 'rust': case 'rs': return RUST_KEYWORDS;
    case 'python': case 'py': return PYTHON_KEYWORDS;
    case 'java': return JAVA_KEYWORDS;
    case 'c': case 'cpp': case 'c++': case 'h': return C_KEYWORDS;
    case 'ruby': case 'rb': return RUBY_KEYWORDS;
    case 'bash': case 'sh': case 'shell': case 'zsh': return BASH_KEYWORDS;
    case 'sql': case 'mysql': case 'postgresql': case 'postgres': case 'sqlite': return SQL_KEYWORDS;
    case 'swift': return SWIFT_KEYWORDS;
    case 'kotlin': case 'kt': return KOTLIN_KEYWORDS;
    case 'csharp': case 'cs': case 'c#': return CSHARP_KEYWORDS;
    default: return COMMON_KEYWORDS;
  }
}

function buildRules(lang: string): TokenRule[] {
  const keywords = getKeywords(lang);
  const isSql = lang === 'sql' || lang === 'mysql' || lang === 'postgresql' || lang === 'postgres' || lang === 'sqlite';
  const kwFlags = isSql ? 'gi' : 'g';
  const kwPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, kwFlags);
  const hasDollarVars = lang === 'php' || lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh';

  return [
    // Comments: // and # single-line
    { pattern: /\/\/.*$/gm, className: 'syn-comment' },
    { pattern: /#.*$/gm, className: 'syn-comment' },
    // Multi-line comments
    { pattern: /\/\*[\s\S]*?\*\//g, className: 'syn-comment' },
    // SQL single-line comments (--)
    ...(isSql ? [{ pattern: /--.*$/gm, className: 'syn-comment' }] : []),
    // Strings: double-quoted
    { pattern: /"(?:[^"\\]|\\.)*"/g, className: 'syn-string' },
    // Strings: single-quoted
    { pattern: /'(?:[^'\\]|\\.)*'/g, className: 'syn-string' },
    // Strings: backtick
    { pattern: /`(?:[^`\\]|\\.)*`/g, className: 'syn-string' },
    // Numbers
    { pattern: /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, className: 'syn-number' },
    // PHP/Bash variables
    ...(hasDollarVars ? [{ pattern: /\$[a-zA-Z_]\w*/g, className: 'syn-variable' }] : []),
    // Type names (PascalCase)
    { pattern: /\b[A-Z][a-zA-Z0-9_]*\b/g, className: 'syn-type' },
    // Keywords
    { pattern: kwPattern, className: 'syn-keyword' },
    // Punctuation: arrows, operators
    { pattern: /=>|->|::|\.\.\.|\.\.|[{}()[\];,.:?]/g, className: 'syn-punctuation' },
  ];
}

interface Token {
  text: string;
  className?: string;
  start: number;
  end: number;
}

/**
 * Tokenize a line of code into highlighted spans.
 * Returns an array of tokens with optional CSS class.
 */
export function tokenizeLine(line: string, lang: string): Token[] {
  const rules = buildRules(lang);
  const markers: { start: number; end: number; className: string }[] = [];

  for (const rule of rules) {
    // Reset lastIndex for global regexes
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = rule.pattern.exec(line)) !== null) {
      markers.push({
        start: match.index,
        end: match.index + match[0].length,
        className: rule.className,
      });
    }
  }

  // Sort by start position, prefer longer matches
  markers.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  // Resolve overlaps: first match wins (comments/strings take priority)
  const resolved: typeof markers = [];
  let cursor = 0;
  for (const m of markers) {
    if (m.start >= cursor) {
      resolved.push(m);
      cursor = m.end;
    }
  }

  // Build token array
  const tokens: Token[] = [];
  let pos = 0;
  for (const m of resolved) {
    if (m.start > pos) {
      tokens.push({ text: line.slice(pos, m.start), start: pos, end: m.start });
    }
    tokens.push({
      text: line.slice(m.start, m.end),
      className: m.className,
      start: m.start,
      end: m.end,
    });
    pos = m.end;
  }
  if (pos < line.length) {
    tokens.push({ text: line.slice(pos), start: pos, end: line.length });
  }

  return tokens.length > 0 ? tokens : [{ text: line || '\n', start: 0, end: line.length }];
}
