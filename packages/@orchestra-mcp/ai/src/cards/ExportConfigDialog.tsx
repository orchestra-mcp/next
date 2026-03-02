"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import './ExportConfigDialog.css';

export interface ExportConfig {
  format: 'npm' | 'cdn' | 'raw' | 'zip';
  packageName: string;
  version: string;
  minify: boolean;
  includeTypes: boolean;
}

export interface ExportConfigDialogProps {
  open: boolean;
  componentName: string;
  componentId: string;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  isExporting?: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getFormatPreview(config: ExportConfig): string {
  switch (config.format) {
    case 'npm':
      return config.includeTypes
        ? 'Generates a zip with package.json, index.esm.js, index.cjs.js, index.d.ts, index.css, README.md'
        : 'Generates a zip with package.json, index.esm.js, index.cjs.js, index.css, README.md';
    case 'cdn':
      return 'Generates a single self-contained HTML file with all styles and scripts inlined';
    case 'raw':
      return 'Generates a zip with individual source files: component file, styles, assets';
    case 'zip':
      return 'Generates a zip archive with all component files, assets, and dependencies';
    default:
      return '';
  }
}

function PackageIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3c-2 2-3 4-3 7s1 5 3 7M10 3c2 2 3 4 3 7s-1 5-3 7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FolderIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 6a1 1 0 0 1 1-1h3.586a1 1 0 0 1 .707.293L9.707 6.707A1 1 0 0 0 10.414 7H16a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArchiveIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 7v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="export-config-dialog__spinner"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="28.27"
        strokeDashoffset="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type FormatOption = {
  value: ExportConfig['format'];
  label: string;
  description: string;
  icon: React.ReactElement;
};

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'npm', label: 'npm', description: 'ESM + CJS + TypeScript types', icon: <PackageIcon /> },
  { value: 'cdn', label: 'cdn', description: 'Single self-contained HTML file', icon: <GlobeIcon /> },
  { value: 'raw', label: 'raw', description: 'Individual source files in a zip', icon: <FolderIcon /> },
  { value: 'zip', label: 'zip', description: 'Everything in one archive', icon: <ArchiveIcon /> },
];

export const ExportConfigDialog: FC<ExportConfigDialogProps> = ({
  open,
  componentName,
  componentId: _componentId,
  onClose,
  onExport,
  isExporting = false,
}) => {
  const [config, setConfig] = useState<ExportConfig>(() => ({
    format: 'npm',
    packageName: slugify(componentName),
    version: '1.0.0',
    minify: false,
    includeTypes: true,
  }));

  // Re-slug the package name when componentName changes (e.g. dialog reused for different component)
  useEffect(() => {
    setConfig((prev) => ({ ...prev, packageName: slugify(componentName) }));
  }, [componentName]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const handleExport = useCallback(() => {
    if (!isExporting) onExport(config);
  }, [isExporting, onExport, config]);

  if (!open) return null;

  return (
    <div
      className="export-config-dialog__overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Export ${componentName}`}
    >
      <div className="export-config-dialog__panel">
        {/* Header */}
        <div className="export-config-dialog__header">
          <h2 className="export-config-dialog__title">Export component</h2>
          <p className="export-config-dialog__subtitle">{componentName}</p>
          <button
            type="button"
            className="export-config-dialog__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Format selection */}
        <div className="export-config-dialog__section">
          <label className="export-config-dialog__section-label">Format</label>
          <div className="export-config-dialog__format-grid">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`export-config-dialog__format-btn${config.format === opt.value ? ' export-config-dialog__format-btn--active' : ''}`}
                onClick={() => setConfig((c) => ({ ...c, format: opt.value }))}
                aria-pressed={config.format === opt.value}
              >
                <span className="export-config-dialog__format-icon">{opt.icon}</span>
                <span className="export-config-dialog__format-label">{opt.label}</span>
                <span className="export-config-dialog__format-desc">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* npm-specific options */}
        {config.format === 'npm' && (
          <div className="export-config-dialog__section">
            <label className="export-config-dialog__section-label">Package options</label>
            <div className="export-config-dialog__fields">
              <div className="export-config-dialog__field">
                <label className="export-config-dialog__field-label" htmlFor="ecd-package-name">
                  Package name
                </label>
                <input
                  id="ecd-package-name"
                  type="text"
                  className="export-config-dialog__input"
                  value={config.packageName}
                  onChange={(e) => setConfig((c) => ({ ...c, packageName: e.target.value }))}
                  placeholder="my-component"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="export-config-dialog__field">
                <label className="export-config-dialog__field-label" htmlFor="ecd-version">
                  Version
                </label>
                <input
                  id="ecd-version"
                  type="text"
                  className="export-config-dialog__input export-config-dialog__input--short"
                  value={config.version}
                  onChange={(e) => setConfig((c) => ({ ...c, version: e.target.value }))}
                  placeholder="1.0.0"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="export-config-dialog__toggle-row">
              <span className="export-config-dialog__toggle-label">Include TypeScript types</span>
              <button
                type="button"
                role="switch"
                aria-checked={config.includeTypes}
                className={`export-config-dialog__toggle${config.includeTypes ? ' export-config-dialog__toggle--on' : ''}`}
                onClick={() => setConfig((c) => ({ ...c, includeTypes: !c.includeTypes }))}
              >
                <span className="export-config-dialog__toggle-thumb" />
              </button>
            </div>
          </div>
        )}

        {/* Common options */}
        <div className="export-config-dialog__section">
          <div className="export-config-dialog__toggle-row">
            <span className="export-config-dialog__toggle-label">Minify output</span>
            <button
              type="button"
              role="switch"
              aria-checked={config.minify}
              className={`export-config-dialog__toggle${config.minify ? ' export-config-dialog__toggle--on' : ''}`}
              onClick={() => setConfig((c) => ({ ...c, minify: !c.minify }))}
            >
              <span className="export-config-dialog__toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Preview description */}
        <div className="export-config-dialog__preview">
          <span className="export-config-dialog__preview-label">Output</span>
          <p className="export-config-dialog__preview-text">{getFormatPreview(config)}</p>
        </div>

        {/* Footer */}
        <div className="export-config-dialog__footer">
          <button
            type="button"
            className="export-config-dialog__cancel-btn"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="export-config-dialog__export-btn"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting && <SpinnerIcon />}
            {isExporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};
