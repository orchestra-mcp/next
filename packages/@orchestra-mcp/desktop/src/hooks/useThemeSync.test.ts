import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeSync } from './useThemeSync';
import { useThemeStore } from '../stores/useThemeStore';

const mockEmit = vi.fn();
const mockOn = vi.fn<(name: string, cb: (data: unknown) => void) => () => void>();

function setupWailsMock() {
  const w = window as any;
  w.wails = {
    Events: {
      Emit: mockEmit,
      On: mockOn,
    },
  };
}

function removeWailsMock() {
  delete (window as any).wails;
}

function createMockOptions(overrides?: Partial<Parameters<typeof useThemeSync>[0]>) {
  return {
    subscribe: vi.fn(() => vi.fn()),
    send: vi.fn(),
    enabled: true,
    ...overrides,
  };
}

describe('useThemeSync', () => {
  beforeEach(() => {
    useThemeStore.setState({
      colorTheme: 'orchestra',
      componentVariant: 'default',
    });
    setupWailsMock();
    mockEmit.mockClear();
    mockOn.mockClear();
  });

  afterEach(() => {
    removeWailsMock();
  });

  it('subscribes to WebSocket theme.update on mount', () => {
    const opts = createMockOptions();
    renderHook(() => useThemeSync(opts));
    expect(opts.subscribe).toHaveBeenCalledWith('theme.update', expect.any(Function));
  });

  it('subscribes to Wails theme:update on mount', () => {
    renderHook(() => useThemeSync(createMockOptions()));
    expect(mockOn).toHaveBeenCalledWith('theme:update', expect.any(Function));
  });

  it('updates store when receiving WebSocket theme.update', () => {
    const opts = createMockOptions();
    let wsHandler: (payload: unknown) => void = () => {};
    opts.subscribe.mockImplementation((_type: string, handler: (payload: unknown) => void) => {
      wsHandler = handler;
      return vi.fn();
    });

    renderHook(() => useThemeSync(opts));

    act(() => {
      wsHandler({ themeId: 'dracula', variant: 'compact' });
    });

    const state = useThemeStore.getState();
    expect(state.colorTheme).toBe('dracula');
    expect(state.componentVariant).toBe('compact');
  });

  it('emits Wails event and WebSocket message on local store change', () => {
    const opts = createMockOptions();
    renderHook(() => useThemeSync(opts));

    act(() => {
      useThemeStore.getState().setColorTheme('matrix');
    });

    expect(opts.send).toHaveBeenCalledWith('theme.update', {
      themeId: 'matrix',
      variant: 'default',
    });
    expect(mockEmit).toHaveBeenCalledWith('theme:update', {
      themeId: 'matrix',
      variant: 'default',
    });
  });

  it('skips echo when receiving own change back', () => {
    const opts = createMockOptions();
    let wsHandler: (payload: unknown) => void = () => {};
    opts.subscribe.mockImplementation((_type: string, handler: (payload: unknown) => void) => {
      wsHandler = handler;
      return vi.fn();
    });

    renderHook(() => useThemeSync(opts));

    // Trigger local change (sets skipNextRef = true)
    act(() => {
      useThemeStore.getState().setColorTheme('solarized');
    });

    // Simulate echo from WebSocket with different theme (should be skipped)
    act(() => {
      wsHandler({ themeId: 'nord', variant: 'modern' });
    });

    // Store should NOT have been updated to 'nord'
    expect(useThemeStore.getState().colorTheme).toBe('solarized');
  });

  it('does nothing when enabled=false', () => {
    const opts = createMockOptions({ enabled: false });
    renderHook(() => useThemeSync(opts));

    expect(opts.subscribe).not.toHaveBeenCalled();
    expect(mockOn).not.toHaveBeenCalled();
  });

  it('cleans up subscriptions on unmount', () => {
    const unsubWs = vi.fn();
    const unsubWails = vi.fn();
    const opts = createMockOptions();
    opts.subscribe.mockReturnValue(unsubWs);
    mockOn.mockReturnValue(unsubWails);

    const { unmount } = renderHook(() => useThemeSync(opts));
    unmount();

    expect(unsubWs).toHaveBeenCalled();
    expect(unsubWails).toHaveBeenCalled();
  });

  it('handles missing Wails runtime gracefully', () => {
    removeWailsMock();
    const opts = createMockOptions();

    // Should not throw
    expect(() => {
      renderHook(() => useThemeSync(opts));
    }).not.toThrow();

    // Local change should still send via WebSocket
    act(() => {
      useThemeStore.getState().setColorTheme('monokai');
    });

    expect(opts.send).toHaveBeenCalledWith('theme.update', {
      themeId: 'monokai',
      variant: 'default',
    });
  });

  it('returns syncing=false in idle state', () => {
    const { result } = renderHook(() => useThemeSync(createMockOptions()));
    expect(result.current.syncing).toBe(false);
  });

  it('ignores invalid payload shapes', () => {
    const opts = createMockOptions();
    let wsHandler: (payload: unknown) => void = () => {};
    opts.subscribe.mockImplementation((_type: string, handler: (payload: unknown) => void) => {
      wsHandler = handler;
      return vi.fn();
    });

    renderHook(() => useThemeSync(opts));

    act(() => {
      wsHandler({ bad: 'data' });
    });

    // Store should remain at defaults
    expect(useThemeStore.getState().colorTheme).toBe('orchestra');
  });
});
