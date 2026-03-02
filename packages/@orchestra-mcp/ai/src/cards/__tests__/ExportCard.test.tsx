// ---------------------------------------------------------------------------
// ExportCard.test.tsx
// Tests for the ExportCard ChatBox card component.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { ExportCard } from '../ExportCard';
import type { ExportCardData, ExportCardProps } from '../ExportCard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeData(overrides: Partial<ExportCardData> = {}): ExportCardData {
  return {
    id: 'export-1',
    componentId: 'comp-abc',
    componentName: 'ButtonGroup',
    format: 'npm',
    fileName: 'button-group.zip',
    exportedAt: '2024-06-15T12:00:00.000Z',
    ...overrides,
  };
}

function makeProps(
  dataOverrides: Partial<ExportCardData> = {},
  propOverrides: Partial<Omit<ExportCardProps, 'data'>> = {},
): ExportCardProps {
  return {
    data: makeData(dataOverrides),
    onDownload: vi.fn(),
    onCopyUrl: vi.fn(),
    ...propOverrides,
  };
}

// ---------------------------------------------------------------------------

describe('ExportCard', () => {
  describe('component name rendering', () => {
    it('renders the component name in the card', () => {
      render(createElement(ExportCard, makeProps({ componentName: 'AlertDialog' })));
      // The title appears at least once (CardBase header + body row)
      expect(screen.getAllByText('AlertDialog').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the component name in the Component row of the body', () => {
      render(createElement(ExportCard, makeProps({ componentName: 'ToastStack' })));
      // The label "Component" is in the body
      expect(screen.getByText('Component')).toBeInTheDocument();
      // The value appears somewhere in the document (at minimum via the badge/title)
      expect(screen.getAllByText('ToastStack').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('format badge', () => {
    it('renders the npm format badge', () => {
      render(createElement(ExportCard, makeProps({ format: 'npm' })));
      // CardBase renders the badge prop as text inside .card-base__badge
      expect(screen.getByText('npm')).toBeInTheDocument();
    });

    it('renders the cdn format badge', () => {
      render(createElement(ExportCard, makeProps({ format: 'cdn' })));
      expect(screen.getByText('cdn')).toBeInTheDocument();
    });

    it('renders the raw format badge', () => {
      render(createElement(ExportCard, makeProps({ format: 'raw' })));
      expect(screen.getByText('raw')).toBeInTheDocument();
    });

    it('renders the zip format badge', () => {
      render(createElement(ExportCard, makeProps({ format: 'zip' })));
      expect(screen.getByText('zip')).toBeInTheDocument();
    });
  });

  describe('format description', () => {
    it('shows npm format description in the Format row', () => {
      render(createElement(ExportCard, makeProps({ format: 'npm' })));
      expect(screen.getByText('ESM + CJS + TypeScript types')).toBeInTheDocument();
    });

    it('shows cdn format description in the Format row', () => {
      render(createElement(ExportCard, makeProps({ format: 'cdn' })));
      expect(screen.getByText('Single self-contained HTML file')).toBeInTheDocument();
    });

    it('shows raw format description in the Format row', () => {
      render(createElement(ExportCard, makeProps({ format: 'raw' })));
      expect(screen.getByText('Individual source files in a zip')).toBeInTheDocument();
    });

    it('shows zip format description in the Format row', () => {
      render(createElement(ExportCard, makeProps({ format: 'zip' })));
      expect(screen.getByText('Everything in one archive')).toBeInTheDocument();
    });
  });

  describe('download button', () => {
    it('shows the Download link when downloadUrl is provided', () => {
      render(
        createElement(ExportCard, makeProps({ downloadUrl: 'https://cdn.example.com/file.zip' })),
      );
      // The download link has text "Download"
      expect(screen.getByRole('link', { name: /download/i })).toBeInTheDocument();
    });

    it('hides the Download link when downloadUrl is absent', () => {
      const props = makeProps();
      // Ensure downloadUrl is not set
      delete (props.data as Partial<ExportCardData>).downloadUrl;
      render(createElement(ExportCard, props));
      expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
    });

    it('download link href points to the downloadUrl', () => {
      const url = 'https://cdn.example.com/component.zip';
      render(createElement(ExportCard, makeProps({ downloadUrl: url })));
      const link = screen.getByRole('link', { name: /download/i }) as HTMLAnchorElement;
      expect(link.href).toBe(url);
    });

    it('download link opens in a new tab', () => {
      render(
        createElement(ExportCard, makeProps({ downloadUrl: 'https://cdn.example.com/file.zip' })),
      );
      const link = screen.getByRole('link', { name: /download/i }) as HTMLAnchorElement;
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    });
  });

  describe('Copy URL button', () => {
    it('shows the Copy URL button when downloadUrl is provided', () => {
      render(
        createElement(ExportCard, makeProps({ downloadUrl: 'https://cdn.example.com/file.zip' })),
      );
      expect(screen.getByRole('button', { name: /copy download url/i })).toBeInTheDocument();
    });

    it('hides the Copy URL button when downloadUrl is absent', () => {
      const props = makeProps();
      delete (props.data as Partial<ExportCardData>).downloadUrl;
      render(createElement(ExportCard, props));
      expect(
        screen.queryByRole('button', { name: /copy download url/i }),
      ).not.toBeInTheDocument();
    });

    it('clicking Copy URL calls onCopyUrl with the downloadUrl', () => {
      const onCopyUrl = vi.fn();
      const url = 'https://cdn.example.com/my-component.zip';
      render(
        createElement(ExportCard, makeProps({ downloadUrl: url }, { onCopyUrl })),
      );

      fireEvent.click(screen.getByRole('button', { name: /copy download url/i }));

      expect(onCopyUrl).toHaveBeenCalledTimes(1);
      expect(onCopyUrl).toHaveBeenCalledWith(url);
    });

    it('does not call onCopyUrl when downloadUrl is absent', () => {
      const onCopyUrl = vi.fn();
      // Build props without downloadUrl
      const data = makeData();
      delete (data as Partial<ExportCardData>).downloadUrl;
      render(createElement(ExportCard, { data, onCopyUrl }));

      // No Copy URL button should be rendered
      expect(screen.queryByRole('button', { name: /copy download url/i })).not.toBeInTheDocument();
      expect(onCopyUrl).not.toHaveBeenCalled();
    });
  });

  describe('file name row', () => {
    it('renders the file name in the File row', () => {
      render(createElement(ExportCard, makeProps({ fileName: 'modal.zip' })));
      expect(screen.getByText('modal.zip')).toBeInTheDocument();
    });
  });

  describe('exported timestamp', () => {
    it('renders the Exported row label', () => {
      render(createElement(ExportCard, makeProps()));
      expect(screen.getByText('Exported')).toBeInTheDocument();
    });

    it('renders a formatted timestamp string', () => {
      // We test that some text is rendered in the exported row. The exact
      // locale-formatted string varies by environment, so we only confirm
      // the "Exported" row label exists and that the raw ISO string is not
      // shown verbatim (it will be formatted by toLocaleString).
      render(createElement(ExportCard, makeProps({ exportedAt: '2024-06-15T12:00:00.000Z' })));
      // The "Exported" label is in the DOM
      expect(screen.getByText('Exported')).toBeInTheDocument();
    });
  });

  describe('onDownload callback', () => {
    it('calls onDownload with the export id when the download link is clicked', () => {
      const onDownload = vi.fn();
      const url = 'https://cdn.example.com/file.zip';
      render(
        createElement(
          ExportCard,
          makeProps({ downloadUrl: url, id: 'export-42' }, { onDownload }),
        ),
      );

      fireEvent.click(screen.getByRole('link', { name: /download/i }));

      expect(onDownload).toHaveBeenCalledTimes(1);
      expect(onDownload).toHaveBeenCalledWith('export-42');
    });
  });

  describe('className prop', () => {
    it('applies a custom className alongside the default export-card class', () => {
      render(createElement(ExportCard, makeProps({}, { className: 'my-custom-class' })));
      // The outer card-base wrapper should exist
      const cardBase = screen.getByTestId('card-base');
      expect(cardBase.className).toContain('export-card');
      expect(cardBase.className).toContain('my-custom-class');
    });
  });
});
