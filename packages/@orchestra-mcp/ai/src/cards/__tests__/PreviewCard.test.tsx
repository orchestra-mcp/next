// ---------------------------------------------------------------------------
// PreviewCard.test.tsx
// Tests for the PreviewCard ChatBox card component.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { PreviewCard } from '../PreviewCard';
import type { PreviewCardData } from '../PreviewCard';

// PreviewFrame uses window.addEventListener for postMessage events. We spy
// to avoid warnings, but do not need to assert on it in these card-level tests.
let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

// URL.createObjectURL is not available in jsdom — PreviewCard calls it inside
// an onClick handler, so it only needs to exist to avoid thrown errors if the
// button is clicked. We mock it at the module level.
Object.defineProperty(globalThis, 'URL', {
  writable: true,
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

beforeEach(() => {
  addEventListenerSpy = vi.spyOn(window, 'addEventListener');
  removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
});

afterEach(() => {
  addEventListenerSpy.mockRestore();
  removeEventListenerSpy.mockRestore();
});

// ---------------------------------------------------------------------------

describe('PreviewCard', () => {
  it('renders card header with "Component Preview" title', () => {
    const data: PreviewCardData = {
      session_id: 'abc123',
      framework: 'react',
    };

    render(createElement(PreviewCard, { data }));

    // The CardBase title span has text "Component Preview".
    expect(screen.getByText('Component Preview')).toBeInTheDocument();
  });

  it('renders the framework badge with the correct label', () => {
    const data: PreviewCardData = {
      session_id: 'abc123',
      framework: 'react',
    };

    render(createElement(PreviewCard, { data }));

    // "React" appears in both the card-base badge and the toolbar framework
    // label — getAllByText confirms at least one instance is in the DOM.
    const reactLabels = screen.getAllByText('React');
    expect(reactLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders an iframe inside the card body', () => {
    const data: PreviewCardData = {
      session_id: 'abc123',
      framework: 'react',
    };

    render(createElement(PreviewCard, { data }));

    // PreviewFrame renders <iframe title="Component Preview">. The card's
    // defaultCollapsed is false so the body is expanded. Because the title
    // attribute also appears on the CardBase inner span, we select by role
    // to guarantee we get the actual iframe element.
    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);
    expect(iframes[0].tagName.toLowerCase()).toBe('iframe');
  });

  it('renders the sandbox attribute on the iframe', () => {
    const data: PreviewCardData = {
      session_id: 'session-42',
      framework: 'html',
    };

    render(createElement(PreviewCard, { data }));

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);
    expect(iframes[0]).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  });

  it('renders with code override if data.code is supplied', () => {
    const data: PreviewCardData = {
      session_id: 'with-code',
      framework: 'html',
      code: {
        framework: 'html',
        html: '<p id="custom-content">Custom</p>',
      },
    };

    render(createElement(PreviewCard, { data }));

    // The card should render title and iframe without error.
    expect(screen.getByText('Component Preview')).toBeInTheDocument();
    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);
  });

  it('renders the "Open in browser" button', () => {
    const data: PreviewCardData = {
      session_id: 'abc123',
      framework: 'vue',
    };

    render(createElement(PreviewCard, { data }));

    const openBtn = screen.getByLabelText('Open preview in browser');
    expect(openBtn).toBeInTheDocument();
  });
});
