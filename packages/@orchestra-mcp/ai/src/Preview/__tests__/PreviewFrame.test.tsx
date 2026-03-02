// ---------------------------------------------------------------------------
// PreviewFrame.test.tsx
// Tests for PreviewFrame component and buildSrcdoc utility function.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { PreviewFrame, buildSrcdoc } from '../PreviewFrame';
import type { PreviewCode } from '../PreviewFrame';

// jsdom does not implement iframe srcdoc loading, so we only test React
// rendering behaviour (attributes, DOM presence, CSS props). The srcdoc
// content is tested independently via buildSrcdoc (a pure function).

// ---------------------------------------------------------------------------
// Component rendering tests
// ---------------------------------------------------------------------------

describe('PreviewFrame component', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('renders without crashing', () => {
    const code: PreviewCode = { framework: 'html', html: '<h1>Hi</h1>' };
    expect(() => {
      render(createElement(PreviewFrame, { code }));
    }).not.toThrow();
  });

  it('renders an iframe with the correct title', () => {
    const code: PreviewCode = { framework: 'html', html: '<h1>Hi</h1>' };
    render(createElement(PreviewFrame, { code }));

    const iframe = screen.getByTitle('Component Preview');
    expect(iframe).toBeInTheDocument();
  });

  it('iframe has the correct sandbox attribute', () => {
    const code: PreviewCode = { framework: 'html', html: '<h1>Hi</h1>' };
    render(createElement(PreviewFrame, { code }));

    const iframe = screen.getByTitle('Component Preview');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  });

  it('renders loading overlay initially', () => {
    const code: PreviewCode = { framework: 'html', html: '<h1>Loading test</h1>' };
    render(createElement(PreviewFrame, { code }));

    // The loading overlay is shown while isLoading === true (initial state).
    // It will only disappear once the iframe fires preview:ready via postMessage,
    // which does not happen in jsdom.
    const loadingOverlay = screen.getByLabelText('Loading preview');
    expect(loadingOverlay).toBeInTheDocument();
  });

  it('viewport container defaults to desktop width of 1280', () => {
    const code: PreviewCode = { framework: 'html' };
    render(createElement(PreviewFrame, { code }));

    // The viewport div has an inline style set to the preset dimensions.
    // Default preset is "desktop" → width: 1280, height: 800.
    // We query the element that wraps the iframe.
    const iframe = screen.getByTitle('Component Preview');
    const viewportContainer = iframe.parentElement as HTMLElement;

    expect(viewportContainer).toBeTruthy();
    expect(viewportContainer.style.width).toBe('1280px');
  });

  it('registers a message listener on mount and removes it on unmount', () => {
    const code: PreviewCode = { framework: 'html' };
    const { unmount } = render(createElement(PreviewFrame, { code }));

    const messageCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'message',
    );
    expect(messageCalls.length).toBeGreaterThan(0);

    unmount();

    const removeMessageCalls = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'message',
    );
    expect(removeMessageCalls.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// buildSrcdoc unit tests (pure function — no DOM needed)
// ---------------------------------------------------------------------------

describe('buildSrcdoc', () => {
  it('html framework: includes provided html content', () => {
    const code: PreviewCode = {
      framework: 'html',
      html: '<h1>Test</h1>',
      css: 'body{color:red}',
    };
    const result = buildSrcdoc(code);

    expect(result).toContain('<h1>Test</h1>');
    expect(result).toContain('body{color:red}');
  });

  it('html framework: produces a valid HTML document wrapper', () => {
    const code: PreviewCode = { framework: 'html' };
    const result = buildSrcdoc(code);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html');
    expect(result).toContain('</html>');
  });

  it('react framework: includes babel and react CDN references plus jsx content', () => {
    const jsx = 'function App() { return <div>Hello</div>; }';
    const code: PreviewCode = { framework: 'react', jsx };
    const result = buildSrcdoc(code);

    expect(result).toContain('babel');
    expect(result).toContain('react');
    expect(result).toContain(jsx);
  });

  it('vue framework: includes vue.global.js CDN script', () => {
    const code: PreviewCode = {
      framework: 'vue',
      html: '<div>{{msg}}</div>',
    };
    const result = buildSrcdoc(code);

    expect(result).toContain('vue.global.js');
  });

  it('vue framework: includes the template content', () => {
    const code: PreviewCode = {
      framework: 'vue',
      html: '<div>{{msg}}</div>',
    };
    const result = buildSrcdoc(code);

    expect(result).toContain('{{msg}}');
  });

  it('unknown / fallback framework returns a valid HTML document', () => {
    // TypeScript cast simulates an unknown framework string arriving at runtime.
    const code = { framework: 'unknown-framework' as PreviewCode['framework'] };
    const result = buildSrcdoc(code);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html');
  });

  it('svelte framework: returns a placeholder document, not empty', () => {
    const code: PreviewCode = { framework: 'svelte' };
    const result = buildSrcdoc(code);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result.length).toBeGreaterThan(100);
  });

  it('angular framework: returns a placeholder document', () => {
    const code: PreviewCode = { framework: 'angular' };
    const result = buildSrcdoc(code);

    expect(result).toContain('<!DOCTYPE html>');
  });

  it('error listener script is injected into every framework output', () => {
    const frameworks: PreviewCode['framework'][] = ['html', 'react', 'vue'];
    for (const framework of frameworks) {
      const result = buildSrcdoc({ framework });
      expect(result).toContain('preview:ready');
    }
  });
});
