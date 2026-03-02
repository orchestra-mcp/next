/**
 * Export a DOM element as a PNG image with themed gradient background.
 * Uses file picker dialog (showSaveFilePicker) with UUID-based filename.
 * Falls back to browser download for unsupported browsers.
 */

import { saveBlob, uuidFilename } from '@orchestra-mcp/widgets';

export async function exportToImage(
  element: HTMLElement,
  filename = 'export',
  padding = 40,
): Promise<void> {
  const { toPng } = await import('html-to-image');

  const computed = getComputedStyle(element);

  // Read theme colors for gradient background
  const accent = computed.getPropertyValue('--color-accent').trim() || '#7c3aed';
  const bgColor = computed.getPropertyValue('--color-bg').trim() || '#1e1e2e';
  const bgContrast = computed.getPropertyValue('--color-bg-contrast').trim() || bgColor;

  // Build gradient: accent at top-left fading to bg at bottom-right
  const gradient = `linear-gradient(135deg, ${accent}22 0%, ${bgContrast} 40%, ${bgColor} 100%)`;

  // Create a wrapper div that provides the gradient background
  const wrapper = document.createElement('div');
  wrapper.style.display = 'inline-block';
  wrapper.style.padding = `${padding}px`;
  wrapper.style.borderRadius = '16px';
  wrapper.style.background = gradient;

  // Insert wrapper around element
  const parent = element.parentNode;
  const nextSibling = element.nextSibling;
  wrapper.appendChild(element);
  document.body.appendChild(wrapper);

  // Add exporting class to hide action buttons
  element.classList.add('code-block--exporting');
  element.classList.add('data-table--exporting');

  // Ensure the code block has rounded corners in export
  const origBorderRadius = element.style.borderRadius;
  element.style.borderRadius = '12px';

  try {
    const dataUrl = await toPng(wrapper, {
      pixelRatio: 2,
      backgroundColor: 'transparent',
    });

    // Convert data URL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    // UUID-based filename for uniqueness
    const fullFilename = uuidFilename(filename, 'png');

    await saveBlob(blob, fullFilename, 'image/png');
  } finally {
    // Restore: put element back in its original position
    element.classList.remove('code-block--exporting');
    element.classList.remove('data-table--exporting');
    element.style.borderRadius = origBorderRadius;

    if (parent) {
      if (nextSibling) {
        parent.insertBefore(element, nextSibling);
      } else {
        parent.appendChild(element);
      }
    }
    wrapper.remove();
  }
}
