/**
 * Cross-platform file save utility with native file picker.
 *
 * Strategy order:
 * 1. Desktop API (POST /api/download) — Go backend shows native Save As dialog via osascript
 * 2. File System Access API (showSaveFilePicker) — Chrome/Edge browsers
 * 3. <a download> fallback — Firefox and other browsers
 */

const API = 'http://127.0.0.1:19191';

/** Generate a UUID v4 string */
function uuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Generate a UUID-based filename: `{prefix}-{uuid}.{ext}` */
export function uuidFilename(prefix: string, ext: string): string {
  return `${prefix}-${uuid()}.${ext}`;
}

// ── Strategy 1: Desktop API (native Save As via Go backend) ──────────

async function saveViaDesktopAPI(content: string, filename: string, encoding = 'text'): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content, encoding }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.ok !== false;
    }
  } catch {
    // API not available — fall through
  }
  return false;
}

// ── Strategy 2: File System Access API (showSaveFilePicker) ──────────

const MIME_EXTENSIONS: Record<string, string[]> = {
  'text/plain': ['.txt'], 'text/csv': ['.csv'],
  'text/html': ['.html'], 'text/css': ['.css'],
  'text/javascript': ['.js'], 'text/markdown': ['.md'],
  'application/json': ['.json'], 'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'], 'image/svg+xml': ['.svg'],
};

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot) : '';
}

async function saveWithPicker(blob: Blob, suggestedName: string, mimeType: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('showSaveFilePicker' in window)) return false;

  try {
    const ext = getExtension(suggestedName);
    const accept: Record<string, string[]> = {};
    if (MIME_EXTENSIONS[mimeType]) {
      accept[mimeType] = MIME_EXTENSIONS[mimeType];
    } else if (ext) {
      accept[mimeType || 'application/octet-stream'] = [ext];
    }

    const handle = await (window as any).showSaveFilePicker({
      suggestedName,
      types: Object.keys(accept).length
        ? [{ description: suggestedName, accept }]
        : undefined,
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (err: any) {
    if (err?.name === 'AbortError') return true; // user cancelled
    return false;
  }
}

// ── Strategy 3: Browser fallback (<a download>) ─────────────────────

function saveViaBrowser(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// ── Public API ───────────────────────────────────────────────────────

/** Save a text file. Tries desktop API → file picker → browser download. */
export async function saveFile(content: string, filename: string, mimeType: string): Promise<void> {
  // Strategy 1: Desktop API (shows native Save As dialog)
  const apiOk = await saveViaDesktopAPI(content, filename);
  if (apiOk) return;

  // Strategy 2: File System Access API
  const blob = new Blob([content], { type: mimeType });
  const pickerOk = await saveWithPicker(blob, filename, mimeType);
  if (pickerOk) return;

  // Strategy 3: Browser fallback
  saveViaBrowser(blob, filename);
}

/** Save a binary blob (e.g. PNG image). Tries desktop API → file picker → browser download. */
export async function saveBlob(blob: Blob, filename: string, mimeType: string): Promise<void> {
  // Strategy 1: Desktop API (convert blob to base64)
  try {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const apiOk = await saveViaDesktopAPI(base64, filename, 'base64');
    if (apiOk) return;
  } catch {
    // fall through
  }

  // Strategy 2: File System Access API
  const pickerOk = await saveWithPicker(blob, filename, mimeType);
  if (pickerOk) return;

  // Strategy 3: Browser fallback
  saveViaBrowser(blob, filename);
}
