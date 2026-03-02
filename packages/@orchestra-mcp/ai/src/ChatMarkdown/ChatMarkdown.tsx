import { MarkdownRenderer } from '@orchestra-mcp/editor';
import './ChatMarkdown.css';

export interface ChatMarkdownProps {
  /** Markdown string to render */
  content: string;
  /** Intercept link clicks */
  onLinkClick?: (href: string) => void;
  /** Additional CSS class */
  className?: string;
}

export const ChatMarkdown = ({
  content,
  onLinkClick,
  className,
}: ChatMarkdownProps) => {
  const cls = ['chat-markdown', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="chat-markdown">
      <MarkdownRenderer content={content} onLinkClick={onLinkClick} />
    </div>
  );
};
