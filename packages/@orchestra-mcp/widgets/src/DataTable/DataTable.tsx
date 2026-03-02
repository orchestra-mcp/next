import { useState, useMemo, useCallback, useRef } from 'react';
import { saveFile, uuidFilename } from '../utils/saveFile';
import './DataTable.css';

export interface Column {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface DataTableProps {
  columns: Column[];
  rows: string[][];
  sortable?: boolean;
  exportable?: boolean;
  /** Show export-to-image button */
  exportImage?: boolean;
  /** Show code-block-style header with window dots */
  showHeader?: boolean;
  /** Label shown in header badge (default: "Table") */
  label?: string;
  /** Convert cell/header text to HTML (e.g. inline markdown bold/italic/code/links) */
  renderCell?: (text: string) => string;
  /** Called when a [data-md-link] anchor inside a cell is clicked */
  onLinkClick?: (href: string) => void;
  maxHeight?: number;
  className?: string;
}

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

function isNumeric(value: string): boolean {
  return value !== '' && !isNaN(Number(value));
}

function compareValues(a: string, b: string): number {
  if (isNumeric(a) && isNumeric(b)) {
    return Number(a) - Number(b);
  }
  return a.localeCompare(b);
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/* Small SVG icons for action buttons */
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 3H4.5A1.5 1.5 0 0 0 3 4.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2v8m0 0L5 7m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    <path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DataTable = ({
  columns,
  rows,
  sortable = false,
  exportable = false,
  exportImage = false,
  showHeader = false,
  label,
  renderCell,
  onLinkClick,
  maxHeight,
  className,
}: DataTableProps) => {
  const [sort, setSort] = useState<SortState>({ column: null, direction: 'asc' });
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSort = useCallback((col: Column) => {
    if (!sortable && !col.sortable) return;
    setSort((prev) => {
      if (prev.column === col.key) {
        return prev.direction === 'asc'
          ? { column: col.key, direction: 'desc' }
          : { column: null, direction: 'asc' };
      }
      return { column: col.key, direction: 'asc' };
    });
  }, [sortable]);

  const sortedRows = useMemo(() => {
    if (!sort.column) return rows;
    const colIndex = columns.findIndex((c) => c.key === sort.column);
    if (colIndex === -1) return rows;
    const sorted = [...rows].sort((a, b) => compareValues(a[colIndex], b[colIndex]));
    return sort.direction === 'desc' ? sorted.reverse() : sorted;
  }, [rows, columns, sort]);

  const buildCsv = useCallback(() => {
    const headerLine = columns.map((c) => escapeCsvValue(c.header)).join(',');
    const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','));
    return [headerLine, ...dataLines].join('\n');
  }, [columns, rows]);

  const handleExport = useCallback(async () => {
    await saveFile(buildCsv(), uuidFilename('table-export', 'csv'), 'text/csv');
  }, [buildCsv]);

  const handleCopy = useCallback(() => {
    const csv = buildCsv();
    navigator.clipboard.writeText(csv).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [buildCsv]);

  const handleExportImage = useCallback(async () => {
    if (!tableRef.current) return;
    const { exportToImage } = await import('../utils/exportToImage');
    await exportToImage(tableRef.current, 'table-export');
  }, []);

  const handleTableClick = useCallback((e: React.MouseEvent<HTMLTableSectionElement>) => {
    if (!onLinkClick) return;
    const target = e.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('[data-md-link]');
    if (link) {
      e.preventDefault();
      onLinkClick(link.dataset.mdLink!);
    }
  }, [onLinkClick]);

  const isSortable = (col: Column) => sortable || col.sortable === true;
  const hasActions = exportable || exportImage || showHeader;

  const containerStyle = maxHeight ? { maxHeight: `${maxHeight}px` } : undefined;
  const containerClass = [
    'data-table-container',
    showHeader ? 'data-table-container--card' : '',
    maxHeight ? 'data-table-container--scrollable' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} ref={tableRef}>
      {showHeader && (
        <div className="data-table__header">
          <div className="data-table__header-left">
            <div className="data-table__dots" aria-hidden="true">
              <span className="data-table__dot data-table__dot--red" />
              <span className="data-table__dot data-table__dot--yellow" />
              <span className="data-table__dot data-table__dot--green" />
            </div>
            <span className="data-table__badge">{label || 'Table'}</span>
          </div>
          <div className="data-table__actions">
            <button
              type="button"
              className={`data-table__btn ${copied ? 'data-table__btn--copied' : ''}`}
              onClick={handleCopy}
              aria-label="Copy as CSV"
              title="Copy as CSV"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            {exportable && (
              <button
                type="button"
                className="data-table__btn"
                onClick={handleExport}
                aria-label="Download CSV"
                title="Download CSV"
              >
                <DownloadIcon />
              </button>
            )}
            {exportImage && (
              <button
                type="button"
                className="data-table__btn"
                onClick={handleExportImage}
                aria-label="Export as image"
                title="Export as image"
              >
                <ImageIcon />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Legacy toolbar for non-header mode */}
      {!showHeader && (exportable || exportImage) && (
        <div className="data-table__toolbar">
          {exportable && (
            <button type="button" className="data-table__export" onClick={handleExport}>
              Export CSV
            </button>
          )}
          {exportImage && (
            <button
              type="button"
              className="data-table__export"
              onClick={handleExportImage}
              aria-label="Export as image"
            >
              Export Image
            </button>
          )}
        </div>
      )}
      <div className="data-table__body" style={containerStyle}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    `data-table__th--${col.align ?? 'left'}`,
                    isSortable(col) ? 'data-table__th--sortable' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => isSortable(col) && handleSort(col)}
                >
                  {renderCell
                    ? <span dangerouslySetInnerHTML={{ __html: renderCell(col.header) }} />
                    : col.header}
                  {isSortable(col) && sort.column === col.key && (
                    <span className="data-table__sort">
                      {sort.direction === 'asc' ? '\u25B2' : '\u25BC'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody onClick={handleTableClick}>
            {sortedRows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) =>
                  renderCell ? (
                    <td
                      key={cellIdx}
                      className={`data-table__td--${columns[cellIdx]?.align ?? 'left'}`}
                      dangerouslySetInnerHTML={{ __html: renderCell(cell) }}
                    />
                  ) : (
                    <td
                      key={cellIdx}
                      className={`data-table__td--${columns[cellIdx]?.align ?? 'left'}`}
                    >
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
