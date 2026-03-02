"use client";

import { useCallback } from 'react';
import type { FC, ReactElement } from 'react';
import { CardBase } from './CardBase';
import './ExportCard.css';

export interface ExportCardData {
  id: string;
  componentId: string;
  componentName: string;
  format: 'npm' | 'cdn' | 'raw' | 'zip';
  fileName: string;
  downloadUrl?: string;
  exportedAt: string;
}

export interface ExportCardProps {
  data: ExportCardData;
  className?: string;
  onDownload?: (id: string) => void;
  onCopyUrl?: (url: string) => void;
}

function getFormatDescription(format: ExportCardData['format']): string {
  switch (format) {
    case 'npm':
      return 'ESM + CJS + TypeScript types';
    case 'cdn':
      return 'Single self-contained HTML file';
    case 'raw':
      return 'Individual source files in a zip';
    case 'zip':
      return 'Everything in one archive';
    default:
      return '';
  }
}

function getFormatBadgeColor(
  format: ExportCardData['format'],
): 'info' | 'success' | 'gray' | 'warning' {
  const map: Record<ExportCardData['format'], 'info' | 'success' | 'gray' | 'warning'> = {
    npm: 'info',
    cdn: 'success',
    raw: 'gray',
    zip: 'warning',
  };
  return map[format];
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function DownloadIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8M5 7l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClipboardIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ExternalLinkIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 2h4m0 0v4m0-4L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const ExportCard: FC<ExportCardProps> = ({ data, className, onDownload, onCopyUrl }) => {
  const badgeColor = getFormatBadgeColor(data.format);
  const formatDesc = getFormatDescription(data.format);
  const timestamp = formatTimestamp(data.exportedAt);

  const handleDownload = useCallback(() => {
    onDownload?.(data.id);
  }, [onDownload, data.id]);

  const handleCopyUrl = useCallback(() => {
    if (data.downloadUrl) onCopyUrl?.(data.downloadUrl);
  }, [onCopyUrl, data.downloadUrl]);

  return (
    <CardBase
      title={data.componentName}
      icon={<DownloadIcon />}
      badge={data.format}
      badgeColor={badgeColor}
      defaultCollapsed={false}
      className={`export-card${className ? ` ${className}` : ''}`}
    >
      <div className="export-card__body">
        <div className="export-card__row">
          <span className="export-card__row-label">Component</span>
          <span className="export-card__row-value">{data.componentName}</span>
        </div>
        <div className="export-card__row">
          <span className="export-card__row-label">Format</span>
          <span className="export-card__row-value">{formatDesc}</span>
        </div>
        <div className="export-card__row">
          <span className="export-card__row-label">File</span>
          <span className="export-card__row-value export-card__row-value--mono">{data.fileName}</span>
        </div>
        <div className="export-card__row">
          <span className="export-card__row-label">Exported</span>
          <span className="export-card__row-value">{timestamp}</span>
        </div>

        {data.downloadUrl && (
          <div className="export-card__actions">
            <a
              href={data.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="export-card__download-btn"
              onClick={handleDownload}
            >
              <ExternalLinkIcon />
              Download
            </a>
            <button
              type="button"
              className="export-card__copy-btn"
              onClick={handleCopyUrl}
              title="Copy download URL"
              aria-label="Copy download URL"
            >
              <ClipboardIcon />
              Copy URL
            </button>
          </div>
        )}
      </div>
    </CardBase>
  );
};
