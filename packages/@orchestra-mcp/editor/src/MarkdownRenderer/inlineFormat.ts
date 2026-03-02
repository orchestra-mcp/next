/**
 * Inline markdown formatting — converts inline syntax to HTML.
 * Handles bold, italic, strikethrough, inline code, links, and images.
 */

export interface InlineFormatOptions {
  onLinkClick?: (href: string) => void;
}

/** Convert inline markdown to an HTML string */
export function formatInline(text: string): string {
  let result = text;

  // Escape HTML entities first to prevent XSS
  result = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline code: `code` — process first so content is protected from formatting
  const codeSlots: string[] = [];
  result = result.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeSlots.length;
    codeSlots.push(`<code class="markdown-renderer__inline-code">${code}</code>`);
    return `\x00CODE${idx}\x00`;
  });

  // Images: ![alt](src) — must come before links
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" class="markdown-renderer__img" />'
  );

  // Links: [text](url)
  // href is intentionally omitted — navigation is handled via the data-md-link
  // click handler on the parent (MarkdownRenderer or DataTable tbody).
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a role="link" class="markdown-renderer__link" data-md-link="$2" style="color:var(--color-link,var(--color-primary,var(--primary,#6366f1)));opacity:0.75;cursor:pointer;text-decoration:none">$1</a>'
  );

  // Bold+Italic: ***text***
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_ (but not inside ** or __)
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Restore inline code slots
  result = result.replace(/\x00CODE(\d+)\x00/g, (_, idx) => codeSlots[parseInt(idx)]);

  return result;
}
