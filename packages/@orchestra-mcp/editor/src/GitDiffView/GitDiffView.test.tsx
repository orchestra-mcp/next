import { render, screen } from '@testing-library/react';
import { GitDiffView, computeDiff } from './GitDiffView';

const original = `function hello() {
  console.log("hello");
}`;

const modified = `function hello() {
  console.log("hello world");
  return true;
}`;

describe('computeDiff', () => {
  it('detects added lines', () => {
    const diff = computeDiff('a\nb', 'a\nb\nc');
    expect(diff.some((l) => l.type === 'added' && l.content === 'c')).toBe(true);
  });

  it('detects removed lines', () => {
    const diff = computeDiff('a\nb\nc', 'a\nb');
    expect(diff.some((l) => l.type === 'removed' && l.content === 'c')).toBe(true);
  });

  it('detects unchanged lines', () => {
    const diff = computeDiff('a\nb', 'a\nb');
    expect(diff.every((l) => l.type === 'unchanged')).toBe(true);
  });

  it('handles empty strings', () => {
    const diff = computeDiff('', '');
    expect(diff).toHaveLength(1);
    expect(diff[0].type).toBe('unchanged');
  });

  it('assigns line numbers correctly', () => {
    const diff = computeDiff('a\nb', 'a\nc');
    const removed = diff.find((l) => l.type === 'removed');
    const added = diff.find((l) => l.type === 'added');
    expect(removed?.oldLineNumber).toBe(2);
    expect(added?.newLineNumber).toBe(2);
  });
});

describe('GitDiffView', () => {
  it('renders with inline mode by default', () => {
    const { container } = render(
      <GitDiffView original={original} modified={modified} />,
    );
    expect(container.querySelector('.git-diff--inline')).toBeInTheDocument();
  });

  it('renders in side-by-side mode', () => {
    const { container } = render(
      <GitDiffView original={original} modified={modified} mode="side-by-side" />,
    );
    expect(container.querySelector('.git-diff--sbs')).toBeInTheDocument();
  });

  it('shows file name when provided', () => {
    render(
      <GitDiffView original={original} modified={modified} fileName="index.ts" />,
    );
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('shows language badge when provided', () => {
    render(
      <GitDiffView original={original} modified={modified} language="typescript" />,
    );
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('shows diff stats', () => {
    const { container } = render(
      <GitDiffView original={original} modified={modified} />,
    );
    expect(container.querySelector('.git-diff__stat--added')).toBeInTheDocument();
    expect(container.querySelector('.git-diff__stat--removed')).toBeInTheDocument();
  });

  it('shows "No changes" when identical', () => {
    render(<GitDiffView original="same" modified="same" />);
    expect(screen.getByText('No changes')).toBeInTheDocument();
  });

  it('hides line numbers when lineNumbers=false', () => {
    const { container } = render(
      <GitDiffView original={original} modified={modified} lineNumbers={false} />,
    );
    expect(container.querySelector('.git-diff__gutter')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <GitDiffView original={original} modified={modified} className="my-diff" />,
    );
    expect(container.querySelector('.my-diff')).toBeInTheDocument();
  });
});
