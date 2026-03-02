import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';

// Minimal WebSocket mock — does NOT auto-fire onopen so tests can control timing
class MockWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSED = 3;
  readyState: number;
  url: string;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
  }

  /** Test helper: simulate server accepting the connection */
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }
}

let mockWSInstance: MockWebSocket | null = null;

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockWSInstance = null;
    vi.stubGlobal(
      'WebSocket',
      class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          mockWSInstance = this;
        }
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts disconnected', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));
    expect(result.current.connected).toBe(false);
  });

  it('becomes connected after WebSocket opens', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));

    // Advance past INITIAL_CONNECT_DELAY (200ms) to trigger connectNow
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    // Manually simulate the server accepting the connection
    await act(async () => {
      mockWSInstance?.simulateOpen();
    });

    expect(result.current.connected).toBe(true);
  });

  it('lastMessage starts as null', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));
    expect(result.current.lastMessage).toBeNull();
  });

  it('send function is callable', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    await act(async () => {
      mockWSInstance?.simulateOpen();
    });

    // Should not throw
    expect(() => result.current.send('test.event', { data: 1 })).not.toThrow();
  });

  it('subscribe returns an unsubscribe function', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));
    const handler = vi.fn();
    let unsubscribe: () => void;

    act(() => {
      unsubscribe = result.current.subscribe('test.event', handler);
    });

    expect(typeof unsubscribe!).toBe('function');
  });

  it('dispatches messages to subscribed handlers', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));
    const handler = vi.fn();

    // Advance past INITIAL_CONNECT_DELAY then simulate open
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    await act(async () => {
      mockWSInstance?.simulateOpen();
    });

    act(() => {
      result.current.subscribe('my.event', handler);
    });

    act(() => {
      mockWSInstance?.onmessage?.({
        data: JSON.stringify({ type: 'my.event', payload: { value: 42 }, timestamp: Date.now() }),
      });
    });

    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('unsubscribe stops handler from receiving messages', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));
    const handler = vi.fn();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    await act(async () => {
      mockWSInstance?.simulateOpen();
    });

    let unsubscribe: () => void;
    act(() => {
      unsubscribe = result.current.subscribe('my.event', handler);
    });

    act(() => {
      unsubscribe();
    });

    act(() => {
      mockWSInstance?.onmessage?.({
        data: JSON.stringify({ type: 'my.event', payload: {}, timestamp: Date.now() }),
      });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not dispatch to handlers for different event types', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:9876'));
    const handler = vi.fn();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    await act(async () => {
      mockWSInstance?.simulateOpen();
    });

    act(() => {
      result.current.subscribe('event.a', handler);
    });

    act(() => {
      mockWSInstance?.onmessage?.({
        data: JSON.stringify({ type: 'event.b', payload: {}, timestamp: Date.now() }),
      });
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
