import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from './MarkdownEditor';

// Mock MarkdownRenderer to isolate MarkdownEditor logic
vi.mock('../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="md-preview">{content}</div>
  ),
}));

describe('MarkdownEditor', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea with initial value', () => {
    render(<MarkdownEditor {...defaultProps} value="Hello world" />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i });
    expect(textarea).toHaveValue('Hello world');
  });

  it('renders preview with MarkdownRenderer', () => {
    render(<MarkdownEditor {...defaultProps} value="# Title" />);
    const preview = screen.getByTestId('md-preview');
    expect(preview).toBeInTheDocument();
    expect(preview.textContent).toBe('# Title');
  });

  it('onChange fires when typing in textarea', () => {
    const onChange = vi.fn();
    render(<MarkdownEditor {...defaultProps} onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i });
    fireEvent.change(textarea, { target: { value: 'New text' } });
    expect(onChange).toHaveBeenCalledWith('New text');
  });

  it('bold toolbar button wraps selection with **', () => {
    const onChange = vi.fn();
    render(<MarkdownEditor {...defaultProps} value="hello world" onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i }) as HTMLTextAreaElement;
    // Simulate selecting "world" (index 6 to 11)
    textarea.selectionStart = 6;
    textarea.selectionEnd = 11;
    const boldBtn = screen.getByTitle(/bold/i);
    fireEvent.click(boldBtn);
    expect(onChange).toHaveBeenCalledWith('hello **world**');
  });

  it('italic toolbar button wraps selection with *', () => {
    const onChange = vi.fn();
    render(<MarkdownEditor {...defaultProps} value="hello world" onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i }) as HTMLTextAreaElement;
    textarea.selectionStart = 6;
    textarea.selectionEnd = 11;
    const italicBtn = screen.getByTitle(/italic/i);
    fireEvent.click(italicBtn);
    expect(onChange).toHaveBeenCalledWith('hello *world*');
  });

  it('keyboard shortcut Cmd+B triggers bold', () => {
    const onChange = vi.fn();
    render(<MarkdownEditor {...defaultProps} value="hello world" onChange={onChange} />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i }) as HTMLTextAreaElement;
    textarea.selectionStart = 6;
    textarea.selectionEnd = 11;
    fireEvent.keyDown(textarea, { key: 'b', metaKey: true });
    expect(onChange).toHaveBeenCalledWith('hello **world**');
  });

  it('word count displays correctly', () => {
    render(<MarkdownEditor {...defaultProps} value="one two three four" />);
    expect(screen.getByTestId('word-count')).toHaveTextContent('4 words');
  });

  it('reading time displays correctly', () => {
    // 400 words should be 2 min read at 200wpm
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(' ');
    render(<MarkdownEditor {...defaultProps} value={words} />);
    expect(screen.getByTestId('reading-time')).toHaveTextContent('2 min read');
  });

  it('readOnly disables textarea', () => {
    render(<MarkdownEditor {...defaultProps} value="read only" readOnly />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i });
    expect(textarea).toHaveAttribute('readonly');
  });

  it('placeholder text shown when empty', () => {
    render(<MarkdownEditor {...defaultProps} placeholder="Write markdown..." />);
    const textarea = screen.getByRole('textbox', { name: /markdown source/i });
    expect(textarea).toHaveAttribute('placeholder', 'Write markdown...');
  });
});
