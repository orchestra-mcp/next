/**
 * Lightweight markdown parser — no external dependencies.
 * Splits raw markdown into typed blocks for rendering.
 */

export type TableAlign = 'left' | 'center' | 'right';

export type Block =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][]; alignments: TableAlign[] }
  | { type: 'blockquote'; text: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'task-list'; items: { checked: boolean; text: string }[] }
  | { type: 'hr' };

/** Matches unordered list bullet: -, *, + */
const UL_RE = /^\s*[-*+]\s/;
/** Matches ordered list marker: 1. or 1) */
const OL_RE = /^\s*\d+[.)]\s/;
/** Matches any list line */
const LIST_RE = (line: string) => UL_RE.test(line) || OL_RE.test(line);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseAlignments(separatorLine: string): TableAlign[] {
  return separatorLine.split('|').map((c) => c.trim()).filter(Boolean).map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

function parseTable(lines: string[]): Block | null {
  if (lines.length < 2) return null;
  const parse = (line: string) =>
    line.split('|').map((c) => c.trim()).filter(Boolean);
  const headers = parse(lines[0]);
  if (!lines[1].match(/^\|?[\s-:|]+\|?$/)) return null;
  const alignments = parseAlignments(lines[1]);
  const rows = lines.slice(2).map(parse);
  return { type: 'table', headers, rows, alignments };
}

function parseListBlock(lines: string[]): Block {
  // Strip leading whitespace from each line to support indented lists
  const stripped = lines.map((l) => l.replace(/^\s+/, ''));
  const taskMatch = stripped[0].match(/^[-*+]\s+\[([ xX])\]/);
  if (taskMatch) {
    const items = stripped.map((l) => {
      const m = l.match(/^[-*+]\s+\[([ xX])\]\s*(.*)/);
      return { checked: m ? m[1] !== ' ' : false, text: m ? m[2] : l };
    });
    return { type: 'task-list', items };
  }
  if (OL_RE.test(stripped[0])) {
    return { type: 'ordered-list', items: stripped.map((l) => l.replace(/^\d+[.)]\s*/, '')) };
  }
  return { type: 'unordered-list', items: stripped.map((l) => l.replace(/^[-*+]\s*/, '')) };
}

export function parseMarkdown(content: string): Block[] {
  const blocks: Block[] = [];
  const rawLines = content.split('\n');
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    // Blank line — skip
    if (line.trim() === '') { i++; continue; }

    // Horizontal rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++; continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const text = headingMatch[2];
      blocks.push({ type: 'heading', level: headingMatch[1].length, text, id: slugify(text) });
      i++; continue;
    }

    // Fenced code block
    const codeMatch = line.match(/^```(\w*)/);
    if (codeMatch) {
      const language = codeMatch[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      blocks.push({ type: 'code', language, code: codeLines.join('\n') });
      i++; continue;
    }

    // Table
    if (line.includes('|') && i + 1 < rawLines.length && rawLines[i + 1].match(/^\|?[\s-:|]+\|?$/)) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].includes('|')) {
        tableLines.push(rawLines[i]);
        i++;
      }
      const table = parseTable(tableLines);
      if (table) { blocks.push(table); continue; }
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].startsWith('>')) {
        quoteLines.push(rawLines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') });
      continue;
    }

    // List (unordered, ordered, or task) — supports -, *, +, 1., 1) and indentation
    // Continuation lines (indented or plain text after a bullet) belong to the list
    if (LIST_RE(line)) {
      const listLines: string[] = [];
      while (i < rawLines.length) {
        const cur = rawLines[i];
        if (cur.trim() === '') break;
        if (LIST_RE(cur)) {
          listLines.push(cur);
          i++;
        } else if (listLines.length > 0 && (cur.startsWith('  ') || cur.startsWith('\t'))) {
          // Continuation: append to previous list item
          listLines[listLines.length - 1] += ' ' + cur.trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push(parseListBlock(listLines));
      continue;
    }

    // Paragraph (collect contiguous non-blank, non-special lines)
    const paraLines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() !== '' &&
      !rawLines[i].match(/^(#{1,6}\s|```|>|---+$)/) &&
      !LIST_RE(rawLines[i]) &&
      !(rawLines[i].includes('|') && i + 1 < rawLines.length && rawLines[i + 1]?.match(/^\|?[\s-:|]+\|?$/))
    ) {
      paraLines.push(rawLines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}
