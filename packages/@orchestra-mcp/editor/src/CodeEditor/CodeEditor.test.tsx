import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeEditor } from './CodeEditor';

// Mock the entire MonacoLoader module to avoid importing monaco-editor in jsdom
vi.mock('./MonacoLoader', () => {
  const { Suspense } = require('react');
  return {
    MonacoEditor: ({ value, language, onChange, options }: Record<string, unknown>) => (
      <div
        data-testid="mock-monaco"
        data-language={language as string}
        data-readonly={String((options as Record<string, unknown>)?.readOnly ?? false)}
      >
        <textarea
          data-testid="monaco-textarea"
          value={value as string}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            (onChange as ((v: string) => void))?.(e.target.value)
          }
          readOnly={(options as Record<string, unknown>)?.readOnly as boolean}
        />
      </div>
    ),
    MonacoSuspense: ({ children }: { children: React.ReactNode }) => (
      <Suspense fallback={null}>{children}</Suspense>
    ),
  };
});

// Mock @monaco-editor/react (for useMonaco in useMonacoTheme)
vi.mock('@monaco-editor/react', () => ({
  useMonaco: () => null,
  loader: { config: vi.fn() },
}));

// Mock theme imports
vi.mock('@orchestra-mcp/theme', () => ({
  THEMES: [],
  getColorTheme: () => 'orchestra',
  onColorThemeChange: () => () => {},
}));

describe('CodeEditor (Monaco)', () => {
  it('renders Monaco editor container', async () => {
    render(<CodeEditor value="const x = 1;" language="typescript" />);
    await waitFor(() => {
      expect(screen.getByTestId('mock-monaco')).toBeInTheDocument();
    });
  });

  it('passes language to Monaco', async () => {
    render(<CodeEditor value="" language="go" />);
    await waitFor(() => {
      expect(screen.getByTestId('mock-monaco')).toHaveAttribute('data-language', 'go');
    });
  });

  it('renders file header with name and language badge', () => {
    render(<CodeEditor value="" fileName="app.ts" language="typescript" />);
    expect(screen.getByText('app.ts')).toBeInTheDocument();
    // Language appears in both header badge and footer
    expect(screen.getAllByText('typescript')).toHaveLength(2);
  });

  it('renders footer with cursor info', () => {
    render(<CodeEditor value="" />);
    expect(screen.getByText(/Ln 1, Col 1/)).toBeInTheDocument();
  });

  it('shows Read Only badge when readOnly', () => {
    render(<CodeEditor value="" readOnly />);
    expect(screen.getByText('Read Only')).toBeInTheDocument();
  });

  it('calls onChange when Monaco fires change', async () => {
    const handleChange = vi.fn();
    render(<CodeEditor value="" onChange={handleChange} />);
    await waitFor(() => {
      const textarea = screen.getByTestId('monaco-textarea');
      fireEvent.change(textarea, { target: { value: 'new code' } });
      expect(handleChange).toHaveBeenCalledWith('new code');
    });
  });

  it('applies custom className', () => {
    const { container } = render(<CodeEditor value="" className="my-editor" />);
    expect(container.querySelector('.my-editor')).toBeInTheDocument();
  });

  it('renders legacy textarea when useLegacy is true', () => {
    render(<CodeEditor value="hello world" useLegacy />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('hello world');
  });

  it('hides header when no fileName is provided', () => {
    const { container } = render(<CodeEditor value="" />);
    expect(container.querySelector('.code-editor__header')).not.toBeInTheDocument();
  });

  it('resolves language from fileName extension', async () => {
    render(<CodeEditor value="" fileName="main.go" />);
    await waitFor(() => {
      expect(screen.getByTestId('mock-monaco')).toHaveAttribute('data-language', 'go');
    });
  });
});
