"use client";

import { useMemo, useCallback } from 'react';
import { CodeBlock } from '../CodeBlock';
import { DataTable } from '../DataTable';
import type { Column } from '../DataTable';
import { Checkbox } from '@orchestra-mcp/ui';
import { parseMarkdown } from './parseMarkdown';
import type { Block, TableAlign } from './parseMarkdown';
import { formatInline } from './inlineFormat';
import './MarkdownRenderer.css';

export interface MarkdownRendererProps {
  /** Raw markdown text to render */
  content: string;
  /** Additional CSS class */
  className?: string;
  /** Called when a markdown link is clicked */
  onLinkClick?: (href: string) => void;
}

export const MarkdownRenderer = ({
  content,
  className,
  onLinkClick,
}: MarkdownRendererProps) => {
  const blocks = useMemo(() => parseMarkdown(content), [content]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const link = target.closest<HTMLAnchorElement>('[data-md-link]');
      if (link && onLinkClick) {
        e.preventDefault();
        onLinkClick(link.dataset.mdLink!);
      }
    },
    [onLinkClick]
  );

  const wrapperClass = ['markdown-renderer', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass} onClick={handleClick}>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} onLinkClick={onLinkClick} />
      ))}
    </div>
  );
};

function renderHeading(level: number, id: string, text: string) {
  const anchor = <a href={`#${id}`} className="markdown-renderer__heading-anchor" aria-hidden="true">#</a>;
  const inner = <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />;
  if (level === 1) return <h1 id={id}>{anchor}{inner}</h1>;
  if (level === 2) return <h2 id={id}>{anchor}{inner}</h2>;
  if (level === 3) return <h3 id={id}>{anchor}{inner}</h3>;
  if (level === 4) return <h4 id={id}>{anchor}{inner}</h4>;
  if (level === 5) return <h5 id={id}>{anchor}{inner}</h5>;
  return <h6 id={id}>{anchor}{inner}</h6>;
}

function BlockRenderer({ block, onLinkClick }: { block: Block; onLinkClick?: (href: string) => void }) {
  switch (block.type) {
    case 'heading':
      return renderHeading(block.level, block.id, block.text);
    case 'paragraph':
      return <p dangerouslySetInnerHTML={{ __html: formatInline(block.text) }} />;
    case 'code':
      return <CodeBlock code={block.code} language={block.language || undefined} copyable exportable exportImage />;
    case 'table': {
      const columns: Column[] = block.headers.map((h, i) => ({
        key: `col-${i}`,
        header: h,
        align: block.alignments[i] ?? 'left',
      }));
      return <DataTable columns={columns} rows={block.rows} showHeader exportable exportImage renderCell={formatInline} onLinkClick={onLinkClick} />;
    }
    case 'blockquote':
      return <blockquote dangerouslySetInnerHTML={{ __html: formatInline(block.text) }} />;
    case 'unordered-list':
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
    case 'ordered-list':
      return (
        <ol>
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
    case 'task-list':
      return (
        <ul className="task-list">
          {block.items.map((item, i) => (
            <li key={i} className="task-list__item">
              <Checkbox
                checked={item.checked}
                color={item.checked ? 'success' : undefined}
                className="task-list__checkbox"
              />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item.text) }} />
            </li>
          ))}
        </ul>
      );
    case 'hr':
      return <hr />;
  }
}
