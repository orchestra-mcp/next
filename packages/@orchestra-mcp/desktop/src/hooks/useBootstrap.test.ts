import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBootstrap } from './useBootstrap';
import { panelRegistry } from '../lib/panelRegistry';
import { sidebarRegistry } from '../lib/sidebarRegistry';
import { usePluginStore } from '../stores';

// Mock useIPC to control IPC behavior
vi.mock('./useIPC', () => ({
  useIPC: () => ({
    call: mockCall,
    isAvailable: () => true,
  }),
}));

let mockCall: ReturnType<typeof vi.fn>;

const fakeManifest = {
  panels: [
    {
      id: 'settings',
      title: 'Settings',
      route: '/panels/settings',
      icon: 'gear',
      type: 'default',
      width: 800,
      height: 600,
      resizable: true,
      closable: true,
      singleton: true,
      visible: true,
      lazyLoad: false,
      order: 1,
    },
  ],
  trayItems: [],
  contextMenus: [],
  ipcHandlers: [],
  sidebarViews: [
    {
      id: 'explorer',
      title: 'Explorer',
      icon: 'folder',
      route: '/sidebar/explorer',
      order: 1,
      visible: true,
    },
  ],
  tabs: [],
};

describe('useBootstrap', () => {
  beforeEach(() => {
    panelRegistry.clear();
    sidebarRegistry.clear();
    usePluginStore.setState({ loadedCount: 0 });
    mockCall = vi.fn();
  });

  it('sets ready=true even when IPC returns null', async () => {
    mockCall.mockResolvedValue(null);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });
  });

  it('registers panels from manifest', async () => {
    mockCall.mockResolvedValue(fakeManifest);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(panelRegistry.has('/panels/settings')).toBe(true);
    expect(panelRegistry.count()).toBe(1);
  });

  it('registers sidebar views from manifest', async () => {
    mockCall.mockResolvedValue(fakeManifest);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(sidebarRegistry.has('explorer')).toBe(true);
    expect(sidebarRegistry.count()).toBe(1);
  });

  it('handles errors gracefully and still sets ready', async () => {
    mockCall.mockRejectedValue(new Error('IPC unavailable'));

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.error).toBe('IPC unavailable');
  });

  it('exposes the manifest when loaded', async () => {
    mockCall.mockResolvedValue(fakeManifest);

    const { result } = renderHook(() => useBootstrap());

    await waitFor(() => {
      expect(result.current.manifest).not.toBeNull();
    });

    expect(result.current.manifest?.panels).toHaveLength(1);
    expect(result.current.manifest?.sidebarViews).toHaveLength(1);
  });
});
