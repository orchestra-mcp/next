import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';
import { saveFile } from '@orchestra-mcp/widgets';

vi.mock('@orchestra-mcp/widgets', () => ({
  saveFile: vi.fn(),
  uuidFilename: vi.fn(() => 'code-mock.ts'),
}));

const sampleCode = `function hello() {
  console.log("world");
}`;

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock code={sampleCode} />);
    expect(screen.getByText(/function/)).toBeInTheDocument();
    expect(screen.getByText(/console/)).toBeInTheDocument();
  });

  it('shows language badge when language provided', () => {
    render(<CodeBlock code={sampleCode} language="typescript" />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('shows line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={sampleCode} showLineNumbers />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides line numbers when showLineNumbers is false', () => {
    const { container } = render(
      <CodeBlock code={sampleCode} showLineNumbers={false} />
    );
    expect(container.querySelector('.code-block__gutter')).not.toBeInTheDocument();
  });

  it('highlights specified lines', () => {
    const { container } = render(
      <CodeBlock code={sampleCode} highlightLines={[2]} />
    );
    const lines = container.querySelectorAll('.code-block__line');
    expect(lines[0]).not.toHaveClass('code-block__line--highlighted');
    expect(lines[1]).toHaveClass('code-block__line--highlighted');
    expect(lines[2]).not.toHaveClass('code-block__line--highlighted');
  });

  it('copy button copies to clipboard', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<CodeBlock code={sampleCode} />);
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy code'));
    });

    expect(writeText).toHaveBeenCalledWith(sampleCode);
  });

  it('shows copied state after copy', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<CodeBlock code={sampleCode} />);
    const copyBtn = screen.getByLabelText('Copy code');
    expect(copyBtn).not.toHaveClass('code-block__btn--copied');

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(copyBtn).toHaveClass('code-block__btn--copied');
  });

  it('export button triggers download', async () => {
    const saveFileMock = vi.mocked(saveFile);
    saveFileMock.mockClear();

    render(
      <CodeBlock code={sampleCode} exportable language="typescript" />
    );
    fireEvent.click(screen.getByLabelText('Download code'));

    await vi.waitFor(() => {
      expect(saveFileMock).toHaveBeenCalledTimes(1);
    });
    expect(saveFileMock).toHaveBeenCalledWith(sampleCode, expect.any(String), 'text/plain');
  });

  it('word wrap toggle changes class', () => {
    const { container } = render(<CodeBlock code={sampleCode} />);
    const pre = container.querySelector('.code-block__code');
    expect(pre).not.toHaveClass('code-block__code--wrapped');

    fireEvent.click(screen.getByLabelText('Toggle word wrap'));
    expect(pre).toHaveClass('code-block__code--wrapped');

    fireEvent.click(screen.getByLabelText('Toggle word wrap'));
    expect(pre).not.toHaveClass('code-block__code--wrapped');
  });

  it('hides copy button when copyable is false', () => {
    render(<CodeBlock code={sampleCode} copyable={false} />);
    expect(screen.queryByLabelText('Copy code')).not.toBeInTheDocument();
  });

  it('is scrollable when maxHeight is set', () => {
    const { container } = render(
      <CodeBlock code={sampleCode} maxHeight={200} />
    );
    const body = container.querySelector('.code-block__body');
    expect(body).toHaveClass('code-block__body--scrollable');
    expect(body).toHaveStyle({ maxHeight: '200px' });
  });

  it('renders macOS window dots by default', () => {
    const { container } = render(<CodeBlock code={sampleCode} language="js" />);
    expect(container.querySelector('.code-block__dots')).toBeInTheDocument();
    expect(container.querySelector('.code-block__dot--red')).toBeInTheDocument();
    expect(container.querySelector('.code-block__dot--yellow')).toBeInTheDocument();
    expect(container.querySelector('.code-block__dot--green')).toBeInTheDocument();
  });

  it('hides window dots when showWindowDots is false', () => {
    const { container } = render(
      <CodeBlock code={sampleCode} language="js" showWindowDots={false} />
    );
    expect(container.querySelector('.code-block__dots')).not.toBeInTheDocument();
  });

  it('applies syntax highlighting when language is set', () => {
    const { container } = render(
      <CodeBlock code='const x = "hello";' language="javascript" />
    );
    const keywords = container.querySelectorAll('.syn-keyword');
    expect(keywords.length).toBeGreaterThan(0);
    const strings = container.querySelectorAll('.syn-string');
    expect(strings.length).toBeGreaterThan(0);
  });

  it('does not apply syntax highlighting without language', () => {
    const { container } = render(<CodeBlock code='const x = "hello";' />);
    expect(container.querySelector('.syn-keyword')).not.toBeInTheDocument();
  });

  it('shows Export Image button when exportImage is true', () => {
    render(<CodeBlock code={sampleCode} exportImage />);
    expect(screen.getByLabelText('Export as image')).toBeInTheDocument();
  });
});
