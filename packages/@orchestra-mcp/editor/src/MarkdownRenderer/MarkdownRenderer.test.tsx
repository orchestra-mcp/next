import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

// Mock CodeBlock and DataTable to isolate MarkdownRenderer logic
vi.mock('../CodeBlock', () => ({
  CodeBlock: ({ code, language }: { code: string; language?: string }) => (
    <pre data-testid="code-block" data-language={language}>{code}</pre>
  ),
}));

vi.mock('../DataTable', () => ({
  DataTable: ({ columns, rows }: { columns: { header: string }[]; rows: string[][] }) => (
    <table data-testid="data-table">
      <thead>
        <tr>{columns.map((c, i) => <th key={i}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('@orchestra-mcp/ui', () => ({
  Checkbox: ({ checked, color, className }: { checked?: boolean; color?: string; className?: string }) => (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      data-testid="task-checkbox"
      data-color={color ?? ''}
      className={className}
    />
  ),
}));

describe('MarkdownRenderer', () => {
  it('renders heading with correct level', () => {
    const { container } = render(<MarkdownRenderer content="## Second heading" />);
    const h2 = container.querySelector('h2');
    expect(h2).toBeInTheDocument();
    expect(h2!.textContent).toContain('Second heading');
  });

  it('renders paragraph text', () => {
    render(<MarkdownRenderer content="Hello world paragraph." />);
    expect(screen.getByText('Hello world paragraph.')).toBeInTheDocument();
  });

  it('renders code block with CodeBlock component', () => {
    const md = '```typescript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={md} />);
    const block = screen.getByTestId('code-block');
    expect(block).toBeInTheDocument();
    expect(block).toHaveAttribute('data-language', 'typescript');
    expect(block.textContent).toBe('const x = 1;');
  });

  it('renders table using DataTable component', () => {
    const md = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
    render(<MarkdownRenderer content={md} />);
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders blockquote', () => {
    const { container } = render(<MarkdownRenderer content="> Important note" />);
    const bq = container.querySelector('blockquote');
    expect(bq).toBeInTheDocument();
    expect(bq!.textContent).toContain('Important note');
  });

  it('renders unordered list', () => {
    const md = '- First item\n- Second item\n- Third item';
    const { container } = render(<MarkdownRenderer content={md} />);
    const ul = container.querySelector('ul');
    expect(ul).toBeInTheDocument();
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('First item');
  });

  it('renders ordered list', () => {
    const md = '1. Step one\n2. Step two';
    const { container } = render(<MarkdownRenderer content={md} />);
    const ol = container.querySelector('ol');
    expect(ol).toBeInTheDocument();
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[1].textContent).toBe('Step two');
  });

  it('renders task list with Checkbox component', () => {
    const md = '- [x] Done task\n- [ ] Pending task';
    render(<MarkdownRenderer content={md} />);
    const checkboxes = screen.getAllByTestId('task-checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[0]).toHaveAttribute('data-color', 'success');
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[1]).toHaveAttribute('data-color', '');
  });

  it('renders inline bold and italic', () => {
    const { container } = render(<MarkdownRenderer content="A **bold** and *italic* word." />);
    expect(container.querySelector('strong')!.textContent).toBe('bold');
    expect(container.querySelector('em')!.textContent).toBe('italic');
  });

  it('renders links and calls onLinkClick', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <MarkdownRenderer content="Click [here](https://example.com) now." onLinkClick={handleClick} />
    );
    const link = container.querySelector('a[data-md-link]') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.textContent).toBe('here');
    fireEvent.click(link);
    expect(handleClick).toHaveBeenCalledWith('https://example.com');
  });

  it('renders horizontal rule', () => {
    const md = 'Above\n\n---\n\nBelow';
    const { container } = render(<MarkdownRenderer content={md} />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('heading has anchor ID', () => {
    const { container } = render(<MarkdownRenderer content="# Getting Started" />);
    const h1 = container.querySelector('h1');
    expect(h1).toHaveAttribute('id', 'getting-started');
    expect(h1).toHaveTextContent('Getting Started');
  });
});
