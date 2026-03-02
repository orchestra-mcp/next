import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIPC } from './useIPC';

describe('useIPC', () => {
  const originalWails = (window as Window).wails;

  beforeEach(() => {
    delete (window as Window).wails;
  });

  afterEach(() => {
    (window as Window).wails = originalWails;
  });

  it('isAvailable returns false when window.wails is not present', () => {
    const { result } = renderHook(() => useIPC());
    expect(result.current.isAvailable()).toBe(false);
  });

  it('isAvailable returns true when window.wails is present', () => {
    (window as Window).wails = {
      WindowHide: vi.fn(),
      WindowShow: vi.fn(),
      WindowMinimise: vi.fn(),
      WindowUnminimise: vi.fn(),
      WindowMaximise: vi.fn(),
      WindowUnmaximise: vi.fn(),
      WindowToggleMaximise: vi.fn(),
      WindowClose: vi.fn(),
      WindowSetTitle: vi.fn(),
      WindowFullscreen: vi.fn(),
      WindowUnfullscreen: vi.fn(),
      WindowIsMaximised: vi.fn(),
      WindowIsMinimised: vi.fn(),
      WindowIsFullscreen: vi.fn(),
      Call: { ByName: vi.fn() },
    };

    const { result } = renderHook(() => useIPC());
    expect(result.current.isAvailable()).toBe(true);
  });

  it('call returns null when Wails is unavailable', async () => {
    const { result } = renderHook(() => useIPC());

    let value: unknown;
    await act(async () => {
      value = await result.current.call('Service', 'Method');
    });

    expect(value).toBeNull();
  });

  it('call invokes wails.Call.ByName correctly', async () => {
    const mockByName = vi.fn().mockResolvedValue({ ok: true });
    (window as Window).wails = {
      WindowHide: vi.fn(),
      WindowShow: vi.fn(),
      WindowMinimise: vi.fn(),
      WindowUnminimise: vi.fn(),
      WindowMaximise: vi.fn(),
      WindowUnmaximise: vi.fn(),
      WindowToggleMaximise: vi.fn(),
      WindowClose: vi.fn(),
      WindowSetTitle: vi.fn(),
      WindowFullscreen: vi.fn(),
      WindowUnfullscreen: vi.fn(),
      WindowIsMaximised: vi.fn(),
      WindowIsMinimised: vi.fn(),
      WindowIsFullscreen: vi.fn(),
      Call: { ByName: mockByName },
    };

    const { result } = renderHook(() => useIPC());

    let value: unknown;
    await act(async () => {
      value = await result.current.call('UIManifestService', 'GetUIManifest');
    });

    expect(mockByName).toHaveBeenCalledWith('UIManifestService.GetUIManifest');
    expect(value).toEqual({ ok: true });
  });

  it('call returns null when wails.Call.ByName throws', async () => {
    const mockByName = vi.fn().mockRejectedValue(new Error('fail'));
    (window as Window).wails = {
      WindowHide: vi.fn(),
      WindowShow: vi.fn(),
      WindowMinimise: vi.fn(),
      WindowUnminimise: vi.fn(),
      WindowMaximise: vi.fn(),
      WindowUnmaximise: vi.fn(),
      WindowToggleMaximise: vi.fn(),
      WindowClose: vi.fn(),
      WindowSetTitle: vi.fn(),
      WindowFullscreen: vi.fn(),
      WindowUnfullscreen: vi.fn(),
      WindowIsMaximised: vi.fn(),
      WindowIsMinimised: vi.fn(),
      WindowIsFullscreen: vi.fn(),
      Call: { ByName: mockByName },
    };

    const { result } = renderHook(() => useIPC());

    let value: unknown;
    await act(async () => {
      value = await result.current.call('Service', 'Method');
    });

    expect(value).toBeNull();
  });
});
