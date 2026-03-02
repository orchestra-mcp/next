"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import type { FC } from 'react';
import './PreviewFrame.css';

export interface PreviewCode {
  html?: string;
  css?: string;
  js?: string;
  jsx?: string;
  framework: 'html' | 'react' | 'vue' | 'svelte' | 'angular' | 'react-native' | 'flutter';
}

export interface PreviewViewport {
  width: number;
  height: number;
  preset: 'mobile' | 'tablet' | 'desktop' | 'custom';
}

export interface PreviewFrameProps {
  code: PreviewCode;
  viewport?: PreviewViewport;
  sessionId?: string;
  onError?: (error: Error) => void;
  className?: string;
}

const VIEWPORT_PRESETS: Record<string, { width: number; height: number }> = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

const ERROR_LISTENER_SCRIPT = `
<script>
window.onerror = function(msg, src, line, col, err) {
  window.parent.postMessage({type: 'preview:error', error: {message: msg, line: line, col: col}}, '*');
};
window.addEventListener('unhandledrejection', function(e) {
  window.parent.postMessage({type: 'preview:error', error: {message: String(e.reason)}}, '*');
});
window.addEventListener('load', function() {
  window.parent.postMessage({type: 'preview:ready'}, '*');
});
</script>`;

function buildPlaceholder(title: string, description: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #0a0d14;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #b8c5d9;
  }
  .placeholder {
    text-align: center;
    padding: 32px 24px;
    background: #141927;
    border: 1px solid #1e2535;
    border-radius: 12px;
    max-width: 380px;
  }
  .placeholder__icon {
    font-size: 40px;
    margin-bottom: 16px;
  }
  .placeholder__title {
    font-size: 16px;
    font-weight: 600;
    color: #e8eef8;
    margin-bottom: 8px;
  }
  .placeholder__desc {
    font-size: 13px;
    color: #6b7b95;
    line-height: 1.6;
  }
  .placeholder__badge {
    display: inline-block;
    margin-top: 16px;
    padding: 4px 12px;
    background: color-mix(in srgb, #a900ff 18%, transparent);
    color: #a900ff;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }
</style>
</head>
<body>
<div class="placeholder">
  <div class="placeholder__icon">🔧</div>
  <div class="placeholder__title">${title}</div>
  <div class="placeholder__desc">${description}</div>
  <span class="placeholder__badge">Coming Soon</span>
</div>
${ERROR_LISTENER_SCRIPT}
</body>
</html>`;
}

function buildHtmlSrcdoc(code: PreviewCode): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview</title>
${code.css ? `<style>${code.css}</style>` : ''}
</head>
<body>
${code.html ?? ''}
${code.js ? `<script>${code.js}</script>` : ''}
${ERROR_LISTENER_SCRIPT}
</body>
</html>`;
}

function buildReactSrcdoc(code: PreviewCode): string {
  const jsxContent = code.jsx ?? code.js ?? '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; background: #fff; }
  ${code.css ?? ''}
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18",
    "react-dom/client": "https://esm.sh/react-dom@18/client",
    "react-dom": "https://esm.sh/react-dom@18"
  }
}
</script>
<script type="text/babel" data-type="module">
import React from 'react';
import { createRoot } from 'react-dom/client';

${jsxContent}

const rootEl = document.getElementById('root');
if (rootEl && typeof App !== 'undefined') {
  createRoot(rootEl).render(React.createElement(App));
}
</script>
${ERROR_LISTENER_SCRIPT}
</body>
</html>`;
}

function buildVueSrcdoc(code: PreviewCode): string {
  const template = code.html ?? '<div>Hello from Vue</div>';
  const script = code.js ?? '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 16px; }
  ${code.css ?? ''}
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
const { createApp } = Vue;
${script}
const app = createApp({
  template: \`${template.replace(/`/g, '\\`')}\`,
  ...(typeof setup !== 'undefined' ? { setup } : {}),
  ...(typeof data !== 'undefined' ? { data } : {}),
  ...(typeof methods !== 'undefined' ? { methods } : {}),
  ...(typeof computed !== 'undefined' ? { computed } : {}),
});
app.mount('#root');
</script>
${ERROR_LISTENER_SCRIPT}
</body>
</html>`;
}

function buildReactNativeSrcdoc(code: PreviewCode): string {
  const rnSource = code.jsx ?? code.js ?? '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>React Native Preview</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #1a1a2e; display: flex; align-items: center; justify-content: center; font-family: -apple-system, sans-serif; }
  .phone-shell { width: 375px; height: 667px; border-radius: 40px; border: 8px solid #2d2d44; background: #000; box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08); overflow: hidden; position: relative; display: flex; flex-direction: column; }
  .phone-shell__notch { height: 28px; background: #000; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .phone-shell__notch-pill { width: 120px; height: 12px; background: #1a1a1a; border-radius: 6px; }
  .phone-shell__screen { flex: 1; background: #fff; overflow: hidden; position: relative; }
  #root { width: 100%; height: 100%; overflow: auto; }
  .error-banner { position: absolute; top: 0; left: 0; right: 0; background: #ef4444; color: #fff; font-size: 11px; padding: 6px 10px; z-index: 100; white-space: pre-wrap; word-break: break-all; }
</style>
</head>
<body>
<div class="phone-shell">
  <div class="phone-shell__notch"><div class="phone-shell__notch-pill"></div></div>
  <div class="phone-shell__screen"><div id="root"></div></div>
</div>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18",
    "react-dom/client": "https://esm.sh/react-dom@18/client",
    "react-dom": "https://esm.sh/react-dom@18",
    "react-native": "https://esm.sh/react-native-web@0.19.12"
  }
}
</script>
<script type="text/babel" data-type="module">
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry, StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, TextInput, FlatList } from 'react-native';

${rnSource}

const rootEl = document.getElementById('root');
if (rootEl) {
  const candidates = [
    typeof App !== 'undefined' && App,
    typeof Screen !== 'undefined' && Screen,
    typeof Main !== 'undefined' && Main,
  ];
  const RootComponent = candidates.find(Boolean);
  if (RootComponent) {
    AppRegistry.registerComponent('Preview', () => RootComponent);
    AppRegistry.runApplication('Preview', { rootTag: rootEl });
  }
}
window.parent.postMessage({ type: 'preview:ready' }, '*');
</script>
${ERROR_LISTENER_SCRIPT}
</body>
</html>`;
}

function buildFlutterSrcdoc(code: PreviewCode): string {
  const dartSource = code.js ?? code.jsx ?? '';
  const escapedSource = dartSource.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flutter Preview</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #1a1a2e; display: flex; align-items: center; justify-content: center; font-family: -apple-system, sans-serif; }
  .phone-shell { width: 375px; height: 667px; border-radius: 40px; border: 8px solid #2d2d44; background: #000; box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08); overflow: hidden; position: relative; display: flex; flex-direction: column; }
  .phone-shell__notch { height: 28px; background: #000; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .phone-shell__notch-pill { width: 120px; height: 12px; background: #1a1a1a; border-radius: 6px; }
  .phone-shell__screen { flex: 1; background: #fff; overflow: hidden; position: relative; }
  #flutter-frame { width: 100%; height: 100%; border: none; display: none; }
  .status { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #fff; color: #555; font-size: 13px; }
  .spinner { width: 28px; height: 28px; border: 3px solid #e0e0e0; border-top-color: #0175c2; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg { color: #c62828; font-size: 12px; padding: 12px; text-align: center; line-height: 1.5; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto; }
</style>
</head>
<body>
<div class="phone-shell">
  <div class="phone-shell__notch"><div class="phone-shell__notch-pill"></div></div>
  <div class="phone-shell__screen">
    <iframe id="flutter-frame" sandbox="allow-scripts allow-same-origin allow-forms" title="Flutter output"></iframe>
    <div class="status" id="status">
      <div class="spinner" id="spinner"></div>
      <span id="status-text">Compiling Flutter…</span>
    </div>
  </div>
</div>
<script>
(async function() {
  const dartCode = \`${escapedSource}\`;
  const statusEl = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const spinnerEl = document.getElementById('spinner');
  const frame = document.getElementById('flutter-frame');

  function showError(msg) {
    spinnerEl.style.display = 'none';
    statusText.textContent = '';
    const err = document.createElement('div');
    err.className = 'error-msg';
    err.textContent = msg;
    statusEl.appendChild(err);
    window.parent.postMessage({ type: 'preview:error', error: { message: msg } }, '*');
  }

  if (!dartCode.trim()) {
    showError('No Dart source provided. Add Flutter widget code to the js field.');
    return;
  }

  try {
    statusText.textContent = 'Compiling with DartPad…';
    const res = await fetch('https://dartpad.dev/api/dartservices/v2/compileDDC', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: dartCode }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Compile error (HTTP ' + res.status + '): ' + text.slice(0, 300));
    }
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    if (!data.result) {
      throw new Error('DartPad returned no compiled output.');
    }

    statusText.textContent = 'Loading Flutter runtime…';

    // Build a self-contained HTML page that runs the DDC module
    const outputHtml = \`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<script src="https://storage.googleapis.com/nnbd_artifacts/dartpad_support.js"><\/script>
<script type="module">
\${data.result}
\${data.modulesBaseUrl ? 'self.require = { paths: { dart_sdk: "' + data.modulesBaseUrl + '/dart_sdk" } };' : ''}
<\/script>
<style>body{margin:0;padding:0;overflow:hidden;}</style>
</head><body><div id="output"></div></body></html>\`;

    const blob = new Blob([outputHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    frame.onload = function() {
      URL.revokeObjectURL(url);
      statusEl.style.display = 'none';
      frame.style.display = 'block';
      window.parent.postMessage({ type: 'preview:ready' }, '*');
    };
    frame.src = url;
  } catch (e) {
    showError(String(e.message || e));
  }
})();
</script>
${ERROR_LISTENER_SCRIPT}
</body>
</html>`;
}

export function buildSrcdoc(code: PreviewCode): string {
  switch (code.framework) {
    case 'html':
      return buildHtmlSrcdoc(code);
    case 'react':
      return buildReactSrcdoc(code);
    case 'vue':
      return buildVueSrcdoc(code);
    case 'svelte':
      return buildPlaceholder(
        'Svelte Preview',
        'Svelte in-browser compilation is not yet supported. Use React or HTML mode for live preview.',
      );
    case 'angular':
      return buildPlaceholder(
        'Angular Preview',
        'Angular requires a build step and cannot run in a sandboxed iframe. Use HTML or React mode for live preview.',
      );
    case 'react-native':
      return buildReactNativeSrcdoc(code);
    case 'flutter':
      return buildFlutterSrcdoc(code);
    default:
      return buildHtmlSrcdoc(code);
  }
}

export const PreviewFrame: FC<PreviewFrameProps> = ({
  code,
  viewport,
  onError,
  className,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const prevSrcdocRef = useRef<string>('');

  const resolvedViewport: PreviewViewport = viewport ?? {
    preset: 'desktop',
    ...VIEWPORT_PRESETS.desktop,
  };

  const viewportSize =
    resolvedViewport.preset !== 'custom'
      ? VIEWPORT_PRESETS[resolvedViewport.preset] ?? { width: resolvedViewport.width, height: resolvedViewport.height }
      : { width: resolvedViewport.width, height: resolvedViewport.height };

  // Hot-reload: update srcdoc directly on the iframe element without remounting
  useEffect(() => {
    const newDoc = buildSrcdoc(code);
    if (newDoc === prevSrcdocRef.current) return;
    prevSrcdocRef.current = newDoc;
    setIsLoading(true);
    setPreviewError(null);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = newDoc;
    }
  }, [code]);

  // Listen for messages from the iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, error } = event.data as { type: string; error?: { message: string; line?: number; col?: number } };

      if (type === 'preview:ready') {
        setIsLoading(false);
        setPreviewError(null);
      } else if (type === 'preview:error') {
        setIsLoading(false);
        const msg = error?.message ?? 'Unknown error';
        const location = error?.line != null ? ` (line ${error.line}${error.col != null ? `:${error.col}` : ''})` : '';
        setPreviewError(`${msg}${location}`);
        if (onError) {
          onError(new Error(`${msg}${location}`));
        }
      }
    },
    [onError],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // Initial srcdoc set on mount
  useEffect(() => {
    const doc = buildSrcdoc(code);
    prevSrcdocRef.current = doc;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = doc;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCustom = resolvedViewport.preset === 'custom';

  return (
    <div className={`preview-frame${className ? ` ${className}` : ''}`}>
      <div
        className="preview-frame__viewport"
        style={{
          width: viewportSize.width,
          height: viewportSize.height,
          ...(isCustom ? { resize: 'both', overflow: 'auto' } : {}),
        }}
      >
        <iframe
          ref={iframeRef}
          className="preview-frame__iframe"
          sandbox="allow-scripts allow-same-origin"
          title="Component Preview"
          aria-label="Component preview frame"
        />
        {isLoading && (
          <div className="preview-frame__loading" aria-label="Loading preview">
            <div className="preview-frame__spinner" />
          </div>
        )}
        {previewError && (
          <div className="preview-frame__error" role="alert">
            <span className="preview-frame__error-label">Preview Error</span>
            <code className="preview-frame__error-text">{previewError}</code>
          </div>
        )}
      </div>
    </div>
  );
};
