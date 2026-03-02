import './GitDiffView.css';

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface GitDiffViewProps {
  /** Original text content */
  original: string;
  /** Modified text content */
  modified: string;
  /** Programming language for display */
  language?: string;
  /** File path to display in header */
  fileName?: string;
  /** Display mode */
  mode?: 'side-by-side' | 'inline';
  /** Show line numbers */
  lineNumbers?: boolean;
  /** Additional CSS class */
  className?: string;
}

function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return result;
}

export function computeDiff(original: string, modified: string): DiffLine[] {
  const oldLines = original.split('\n');
  const newLines = modified.split('\n');
  const lcs = computeLCS(oldLines, newLines);
  const result: DiffLine[] = [];
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (
      lcsIdx < lcs.length &&
      oldIdx < oldLines.length &&
      oldLines[oldIdx] === lcs[lcsIdx] &&
      newIdx < newLines.length &&
      newLines[newIdx] === lcs[lcsIdx]
    ) {
      result.push({
        type: 'unchanged',
        content: lcs[lcsIdx],
        oldLineNumber: oldIdx + 1,
        newLineNumber: newIdx + 1,
      });
      oldIdx++;
      newIdx++;
      lcsIdx++;
    } else if (
      oldIdx < oldLines.length &&
      (lcsIdx >= lcs.length || oldLines[oldIdx] !== lcs[lcsIdx])
    ) {
      result.push({
        type: 'removed',
        content: oldLines[oldIdx],
        oldLineNumber: oldIdx + 1,
      });
      oldIdx++;
    } else if (
      newIdx < newLines.length &&
      (lcsIdx >= lcs.length || newLines[newIdx] !== lcs[lcsIdx])
    ) {
      result.push({
        type: 'added',
        content: newLines[newIdx],
        newLineNumber: newIdx + 1,
      });
      newIdx++;
    }
  }
  return result;
}

export const GitDiffView = ({
  original,
  modified,
  language,
  fileName,
  mode = 'inline',
  lineNumbers = true,
  className,
}: GitDiffViewProps) => {
  const diffLines = computeDiff(original, modified);
  const added = diffLines.filter((l) => l.type === 'added').length;
  const removed = diffLines.filter((l) => l.type === 'removed').length;

  const cls = [
    'git-diff',
    mode === 'side-by-side' ? 'git-diff--sbs' : 'git-diff--inline',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <div className="git-diff__header">
        <div className="git-diff__header-left">
          {fileName && <span className="git-diff__filename">{fileName}</span>}
          {language && <span className="git-diff__badge">{language}</span>}
        </div>
        <div className="git-diff__stats">
          {added > 0 && <span className="git-diff__stat--added">+{added}</span>}
          {removed > 0 && (
            <span className="git-diff__stat--removed">-{removed}</span>
          )}
          {added === 0 && removed === 0 && (
            <span className="git-diff__stat--none">No changes</span>
          )}
        </div>
      </div>
      {mode === 'side-by-side' ? (
        <SideBySideView lines={diffLines} lineNumbers={lineNumbers} />
      ) : (
        <InlineView lines={diffLines} lineNumbers={lineNumbers} />
      )}
    </div>
  );
};

function InlineView({ lines, lineNumbers }: { lines: DiffLine[]; lineNumbers: boolean }) {
  return (
    <div className="git-diff__body">
      {lines.map((line, i) => (
        <div key={i} className={`git-diff__line git-diff__line--${line.type}`}>
          {lineNumbers && (
            <span className="git-diff__gutter git-diff__gutter--old">
              {line.oldLineNumber ?? ''}
            </span>
          )}
          {lineNumbers && (
            <span className="git-diff__gutter git-diff__gutter--new">
              {line.newLineNumber ?? ''}
            </span>
          )}
          <span className="git-diff__prefix">
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
          </span>
          <span className="git-diff__content">{line.content || '\n'}</span>
        </div>
      ))}
    </div>
  );
}

function SideBySideView({ lines, lineNumbers }: { lines: DiffLine[]; lineNumbers: boolean }) {
  const left: (DiffLine | null)[] = [];
  const right: (DiffLine | null)[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const line = lines[idx];
    if (line.type === 'unchanged') {
      left.push(line);
      right.push(line);
      idx++;
    } else {
      const removedBatch: DiffLine[] = [];
      const addedBatch: DiffLine[] = [];
      while (idx < lines.length && lines[idx].type === 'removed') {
        removedBatch.push(lines[idx]);
        idx++;
      }
      while (idx < lines.length && lines[idx].type === 'added') {
        addedBatch.push(lines[idx]);
        idx++;
      }
      const max = Math.max(removedBatch.length, addedBatch.length);
      for (let j = 0; j < max; j++) {
        left.push(j < removedBatch.length ? removedBatch[j] : null);
        right.push(j < addedBatch.length ? addedBatch[j] : null);
      }
    }
  }

  return (
    <div className="git-diff__sbs-body">
      <div className="git-diff__side">
        {left.map((line, i) => (
          <div
            key={i}
            className={`git-diff__line ${line ? `git-diff__line--${line.type}` : 'git-diff__line--empty'}`}
          >
            {lineNumbers && (
              <span className="git-diff__gutter">{line?.oldLineNumber ?? ''}</span>
            )}
            <span className="git-diff__content">{line?.content || '\u00A0'}</span>
          </div>
        ))}
      </div>
      <div className="git-diff__side">
        {right.map((line, i) => (
          <div
            key={i}
            className={`git-diff__line ${line ? `git-diff__line--${line.type}` : 'git-diff__line--empty'}`}
          >
            {lineNumbers && (
              <span className="git-diff__gutter">{line?.newLineNumber ?? ''}</span>
            )}
            <span className="git-diff__content">{line?.content || '\u00A0'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
