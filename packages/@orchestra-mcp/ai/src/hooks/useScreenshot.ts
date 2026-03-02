import { useCallback, useRef } from 'react';

const API = 'http://127.0.0.1:19191';

export interface UseScreenshotResult {
  /** Launches the OS native interactive screenshot tool and returns the captured File, or null if cancelled. */
  captureScreenshot: () => Promise<File | null>;
  /** Always true — backend handles platform detection. */
  supported: boolean;
}

function base64ToFile(base64: string, filename: string): File {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: 'image/png' });
  return new File([blob], filename, { type: 'image/png' });
}

export function useScreenshot(): UseScreenshotResult {
  const pendingRef = useRef(false);

  const captureScreenshot = useCallback(async (): Promise<File | null> => {
    if (pendingRef.current) return null;
    pendingRef.current = true;

    try {
      // This call blocks (up to 120s) while the user draws the crop region
      // using the OS native tool. The image is returned directly in the response.
      const res = await fetch(`${API}/api/screenshot/start`, {
        method: 'POST',
        signal: AbortSignal.timeout(120_000),
      });

      if (!res.ok) {
        console.error('[useScreenshot] Request failed:', res.status);
        return null;
      }

      const data = await res.json();
      if (!data.ok || !data.image) {
        // User cancelled
        return null;
      }

      return base64ToFile(data.image, `screenshot-${Date.now()}.png`);
    } catch (err) {
      console.error('[useScreenshot] Error:', err);
      return null;
    } finally {
      pendingRef.current = false;
    }
  }, []);

  return {
    captureScreenshot,
    supported: true,
  };
}
