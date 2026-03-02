// ---------------------------------------------------------------------------
// ExportConfigDialog.test.tsx
// Tests for the ExportConfigDialog component.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { createElement } from 'react';
import { ExportConfigDialog } from '../ExportConfigDialog';
import type { ExportConfigDialogProps } from '../ExportConfigDialog';

function makeProps(overrides: Partial<ExportConfigDialogProps> = {}): ExportConfigDialogProps {
  return {
    open: true,
    componentName: 'MyButton',
    componentId: 'comp-123',
    onClose: vi.fn(),
    onExport: vi.fn(),
    isExporting: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------

describe('ExportConfigDialog', () => {
  describe('visibility', () => {
    it('renders nothing when open=false', () => {
      const props = makeProps({ open: false });
      const { container } = render(createElement(ExportConfigDialog, props));
      expect(container.firstChild).toBeNull();
    });

    it('renders the dialog panel when open=true', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // The overlay element has role="dialog"
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // The panel header shows "Export component"
      expect(screen.getByText('Export component')).toBeInTheDocument();
      // The component name appears as the subtitle
      expect(screen.getByText('MyButton')).toBeInTheDocument();
    });
  });

  describe('format buttons', () => {
    it('renders all 4 format buttons (npm, cdn, raw, zip)', () => {
      render(createElement(ExportConfigDialog, makeProps()));

      // The format buttons contain only the short format label text inside
      // .export-config-dialog__format-label spans. Because the description
      // text for "raw" also contains the word "zip", we query by the exact
      // visible label text of each button using getAllByText and confirm at
      // least one button element is present.
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      expect(formatGrid.querySelector('[aria-pressed]')).toBeInTheDocument();

      // All 4 label spans are visible
      expect(screen.getAllByText('npm').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('cdn').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('raw').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('zip').length).toBeGreaterThanOrEqual(1);

      // Exactly 4 buttons in the format grid
      const formatButtons = formatGrid.querySelectorAll('button');
      expect(formatButtons).toHaveLength(4);
    });

    it('npm format button is pressed by default', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // The npm button is the first button in the format grid and has aria-pressed=true
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      const npmBtn = formatGrid.querySelectorAll('button')[0];
      expect(npmBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('npm-specific fields', () => {
    it('shows package name, version, and include types fields when format is npm (default)', () => {
      render(createElement(ExportConfigDialog, makeProps()));

      expect(screen.getByLabelText('Package name')).toBeInTheDocument();
      expect(screen.getByLabelText('Version')).toBeInTheDocument();
      expect(screen.getByText('Include TypeScript types')).toBeInTheDocument();
    });

    it('package name input is pre-populated with the slugified component name', () => {
      render(createElement(ExportConfigDialog, makeProps({ componentName: 'My Button' })));
      const input = screen.getByLabelText('Package name') as HTMLInputElement;
      expect(input.value).toBe('my-button');
    });

    it('hides npm-specific fields when cdn format is selected', () => {
      render(createElement(ExportConfigDialog, makeProps()));

      // Click the 2nd format button (cdn) directly via the format grid
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      const cdnBtn = formatGrid.querySelectorAll('button')[1];
      fireEvent.click(cdnBtn);

      expect(screen.queryByLabelText('Package name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Version')).not.toBeInTheDocument();
      expect(screen.queryByText('Include TypeScript types')).not.toBeInTheDocument();
    });

    it('hides npm-specific fields when raw format is selected', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // Click the 3rd format button (raw) directly via the format grid
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      const rawBtn = formatGrid.querySelectorAll('button')[2];
      fireEvent.click(rawBtn);
      expect(screen.queryByLabelText('Package name')).not.toBeInTheDocument();
    });

    it('hides npm-specific fields when zip format is selected', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // Click the 4th format button (zip) directly via the format grid to avoid
      // ambiguity — the "raw" button description also contains the word "zip"
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      const zipBtn = formatGrid.querySelectorAll('button')[3];
      fireEvent.click(zipBtn);
      expect(screen.queryByLabelText('Package name')).not.toBeInTheDocument();
    });

    it('shows npm-specific fields again after switching back to npm', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      const buttons = formatGrid.querySelectorAll('button');
      fireEvent.click(buttons[1]); // cdn
      fireEvent.click(buttons[0]); // npm
      expect(screen.getByLabelText('Package name')).toBeInTheDocument();
    });
  });

  describe('backdrop and close behaviour', () => {
    it('clicking the backdrop (overlay) calls onClose', () => {
      const onClose = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ onClose })));

      const overlay = screen.getByRole('dialog');
      // Simulate a click where target === currentTarget (i.e. the overlay itself)
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clicking the X close button calls onClose', () => {
      const onClose = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ onClose })));

      fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clicking the Cancel button calls onClose', () => {
      const onClose = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ onClose })));

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('pressing Escape calls onClose', () => {
      const onClose = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ onClose })));

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Export button', () => {
    it('clicking Export button calls onExport with the current config', () => {
      const onExport = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ onExport, componentName: 'MyButton' })));

      fireEvent.click(screen.getByRole('button', { name: 'Export' }));

      expect(onExport).toHaveBeenCalledTimes(1);
      const calledConfig = onExport.mock.calls[0][0];
      expect(calledConfig.format).toBe('npm');
      expect(calledConfig.packageName).toBe('mybutton');
      expect(calledConfig.version).toBe('1.0.0');
      expect(typeof calledConfig.minify).toBe('boolean');
      expect(typeof calledConfig.includeTypes).toBe('boolean');
    });

    it('clicking Export with cdn format passes format=cdn to onExport', () => {
      const onExport = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ onExport })));

      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      fireEvent.click(formatGrid.querySelectorAll('button')[1]); // cdn
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));

      expect(onExport).toHaveBeenCalledWith(expect.objectContaining({ format: 'cdn' }));
    });

    it('isExporting=true disables the Export button', () => {
      render(createElement(ExportConfigDialog, makeProps({ isExporting: true })));

      const exportBtn = screen.getByRole('button', { name: /exporting/i });
      expect(exportBtn).toBeDisabled();
    });

    it('isExporting=true disables the Cancel button', () => {
      render(createElement(ExportConfigDialog, makeProps({ isExporting: true })));

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    it('isExporting=true does NOT call onExport when button is clicked', () => {
      const onExport = vi.fn();
      render(createElement(ExportConfigDialog, makeProps({ isExporting: true, onExport })));

      // Button is disabled, but we also guard in handleExport
      const exportBtn = screen.getByRole('button', { name: /exporting/i });
      fireEvent.click(exportBtn);

      expect(onExport).not.toHaveBeenCalled();
    });

    it('shows "Exporting..." label when isExporting=true', () => {
      render(createElement(ExportConfigDialog, makeProps({ isExporting: true })));
      expect(screen.getByText('Exporting\u2026')).toBeInTheDocument();
    });
  });

  describe('config state updates', () => {
    it('updating the package name input changes the value', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      const input = screen.getByLabelText('Package name') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'new-pkg-name' } });

      expect(input.value).toBe('new-pkg-name');
    });

    it('updating the version input changes the value', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      const input = screen.getByLabelText('Version') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '2.0.0' } });

      expect(input.value).toBe('2.0.0');
    });

    it('toggling "Include TypeScript types" flips aria-checked', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // The toggle buttons use role="switch" but the accessible name comes from
      // an adjacent <span>, not an aria-label. We query the two switches by role
      // and identify the "include types" one by its initial aria-checked=true.
      const switches = screen.getAllByRole('switch');
      // The "Include TypeScript types" switch is first (inside npm-specific section)
      // and defaults to true.
      const includeTypesToggle = switches.find(
        (s) => s.getAttribute('aria-checked') === 'true',
      )!;
      expect(includeTypesToggle).toBeDefined();

      fireEvent.click(includeTypesToggle);

      expect(includeTypesToggle).toHaveAttribute('aria-checked', 'false');
    });

    it('toggling "Minify output" flips aria-checked', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // The "Minify output" switch starts with aria-checked=false
      const switches = screen.getAllByRole('switch');
      const minifyToggle = switches.find(
        (s) => s.getAttribute('aria-checked') === 'false',
      )!;
      expect(minifyToggle).toBeDefined();

      fireEvent.click(minifyToggle);

      expect(minifyToggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('format preview text', () => {
    it('shows npm output preview by default', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      expect(
        screen.getByText(/Generates a zip with package\.json/i),
      ).toBeInTheDocument();
    });

    it('shows cdn output preview when cdn is selected', () => {
      render(createElement(ExportConfigDialog, makeProps()));
      // Click the cdn format button (2nd in the grid)
      const formatGrid = document.querySelector('.export-config-dialog__format-grid')!;
      const cdnBtn = formatGrid.querySelectorAll('button')[1];
      fireEvent.click(cdnBtn);
      // The preview text is specifically in .export-config-dialog__preview-text
      const previewText = document.querySelector('.export-config-dialog__preview-text')!;
      expect(previewText.textContent).toMatch(/single self-contained HTML file/i);
    });
  });
});
