/**
 * BrowserActions — Individual browser automation action implementations.
 * Each function takes params and returns a BrowserResult. Errors are
 * caught internally so callers always receive a structured response.
 */

import type { BrowserResult } from './PlaywrightBridge';

/** Unique ID placeholder — filled by PlaywrightBridge before sending. */
const PLACEHOLDER_ID = '__action__';

function ok(data?: unknown): BrowserResult {
  return { id: PLACEHOLDER_ID, success: true, data };
}

function fail(error: string): BrowserResult {
  return { id: PLACEHOLDER_ID, success: false, error };
}

// -- Navigate -----------------------------------------------------------------

export async function navigateAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const url = params.url as string | undefined;
  if (!url) return fail('Missing required param: url');

  try {
    if (typeof chrome !== 'undefined' && chrome?.tabs?.update) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { url });
        return ok({ tabId: tab.id, url });
      }
    }
    // Fallback: navigate in current window context
    window.location.href = url;
    return ok({ url });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Query --------------------------------------------------------------------

export async function queryAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const selector = params.selector as string | undefined;
  if (!selector) return fail('Missing required param: selector');

  try {
    const all = Boolean(params.all);
    if (all) {
      const elements = document.querySelectorAll(selector);
      const results = Array.from(elements).map(serializeElement);
      return ok({ count: results.length, elements: results });
    }
    const el = document.querySelector(selector);
    if (!el) return ok({ found: false });
    return ok({ found: true, element: serializeElement(el) });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Click --------------------------------------------------------------------

export async function clickAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const selector = params.selector as string | undefined;
  if (!selector) return fail('Missing required param: selector');

  try {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return fail(`Element not found: ${selector}`);

    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.click();
    return ok({ clicked: selector });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Type ---------------------------------------------------------------------

export async function typeAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const selector = params.selector as string | undefined;
  const text = params.text as string | undefined;
  if (!selector) return fail('Missing required param: selector');
  if (text === undefined) return fail('Missing required param: text');

  try {
    const el = document.querySelector(selector) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!el) return fail(`Element not found: ${selector}`);

    el.focus();

    const clear = Boolean(params.clear);
    if (clear) {
      el.value = '';
    }

    // Set value natively then dispatch standard events
    const nativeSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      'value',
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(el, clear ? text : el.value + text);
    } else {
      el.value = clear ? text : el.value + text;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return ok({ typed: text, selector });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Screenshot ---------------------------------------------------------------

export async function screenshotAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  try {
    const format = (params.format as string) || 'png';
    const quality = (params.quality as number) || 90;

    // Prefer chrome.tabs.captureVisibleTab (requires activeTab permission)
    if (typeof chrome !== 'undefined' && chrome?.tabs?.captureVisibleTab) {
      const dataUrl = await chrome.tabs.captureVisibleTab(undefined as any, {
        format: format === 'jpeg' ? 'jpeg' : 'png',
        quality,
      });
      return ok({ dataUrl, format });
    }

    // Fallback: use canvas to capture what we can
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fail('Cannot create canvas context');
    // Canvas-based capture is very limited without html2canvas; return a blank frame
    const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100);
    return ok({ dataUrl, format, fallback: true });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Evaluate -----------------------------------------------------------------

export async function evaluateAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const expression = params.expression as string | undefined;
  if (!expression) return fail('Missing required param: expression');

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${expression});`);
    const result = fn();
    const resolved = result instanceof Promise ? await result : result;
    return ok({ result: serialize(resolved) });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Wait ---------------------------------------------------------------------

export async function waitAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const selector = params.selector as string | undefined;
  const timeout = (params.timeout as number) || 5000;
  const interval = (params.interval as number) || 100;

  if (!selector) return fail('Missing required param: selector');

  try {
    const found = await waitForSelector(selector, timeout, interval);
    if (!found) return fail(`Timeout waiting for: ${selector}`);
    return ok({ found: true, element: serializeElement(found) });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Intercept ----------------------------------------------------------------

/** In-memory store of intercepted requests. */
const interceptedRequests: Array<{
  url: string;
  method: string;
  body?: string;
  timestamp: number;
}> = [];

let interceptInstalled = false;

export async function interceptAction(
  params: Record<string, unknown>,
): Promise<BrowserResult> {
  const urlPattern = params.urlPattern as string | undefined;
  const retrieve = Boolean(params.retrieve);

  try {
    if (retrieve) {
      const filtered = urlPattern
        ? interceptedRequests.filter((r) => r.url.includes(urlPattern))
        : [...interceptedRequests];
      return ok({ requests: filtered, count: filtered.length });
    }

    if (!interceptInstalled) {
      installFetchIntercept();
      interceptInstalled = true;
    }

    return ok({ intercepting: true, urlPattern: urlPattern ?? '*' });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

// -- Helpers ------------------------------------------------------------------

/** Serialize a DOM element into a plain object. */
function serializeElement(el: Element): Record<string, unknown> {
  const rect = el.getBoundingClientRect();
  const attrs: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    attrs[attr.name] = attr.value;
  }
  return {
    tag: el.tagName.toLowerCase(),
    text: (el.textContent ?? '').slice(0, 500),
    attributes: attrs,
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    visible: rect.width > 0 && rect.height > 0,
  };
}

/** Safely serialize a JS value for transport. */
function serialize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'function') return '[Function]';
  if (value instanceof Element) return serializeElement(value);
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

/** Poll for a selector to appear in the DOM, using MutationObserver. */
function waitForSelector(
  selector: string,
  timeout: number,
  interval: number,
): Promise<Element | null> {
  return new Promise((resolve) => {
    // Check immediately
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    let resolved = false;

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el && !resolved) {
        resolved = true;
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Fallback polling in case MutationObserver misses changes
    const poll = setInterval(() => {
      const el = document.querySelector(selector);
      if (el && !resolved) {
        resolved = true;
        clearInterval(poll);
        observer.disconnect();
        resolve(el);
      }
    }, interval);

    // Timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        clearInterval(poll);
        observer.disconnect();
        resolve(null);
      }
    }, timeout);
  });
}

/** Monkey-patch globalThis.fetch to record requests. */
function installFetchIntercept(): void {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? 'GET';

    interceptedRequests.push({
      url,
      method,
      body: typeof init?.body === 'string' ? init.body : undefined,
      timestamp: Date.now(),
    });

    // Cap stored requests to prevent memory leaks
    if (interceptedRequests.length > 500) {
      interceptedRequests.splice(0, interceptedRequests.length - 500);
    }

    return originalFetch.call(globalThis, input, init);
  };
}
