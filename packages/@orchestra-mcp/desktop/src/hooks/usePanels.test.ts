import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePanels } from './usePanels';
import { panelRegistry } from '../lib/panelRegistry';

const mockAssign = vi.fn();

Object.defineProperty(window, 'location', {
  value: { assign: mockAssign },
  writable: true,
});

function FakePanel() {
  return null;
}

describe('usePanels', () => {
  beforeEach(() => {
    panelRegistry.clear();
    mockAssign.mockClear();
  });

  it('returns empty panels array when no panels are registered', () => {
    const { result } = renderHook(() => usePanels());
    expect(result.current.panels).toEqual([]);
  });

  it('returns registered panels', () => {
    panelRegistry.register({ route: '/panels/settings', component: FakePanel, title: 'Settings' });
    const { result } = renderHook(() => usePanels());
    expect(result.current.panels).toHaveLength(1);
    expect(result.current.panels[0].route).toBe('/panels/settings');
  });

  it('panelCount reflects registered panels', () => {
    panelRegistry.register({ route: '/panels/a', component: FakePanel, title: 'A' });
    panelRegistry.register({ route: '/panels/b', component: FakePanel, title: 'B' });
    const { result } = renderHook(() => usePanels());
    expect(result.current.panelCount).toBe(2);
  });

  it('navigateToPanel calls router.push with the route', () => {
    const { result } = renderHook(() => usePanels());
    result.current.navigateToPanel('/panels/settings');
    expect(mockAssign).toHaveBeenCalledWith('/panels/settings');
  });

  it('getPanel returns the panel for a registered route', () => {
    panelRegistry.register({ route: '/panels/settings', component: FakePanel, title: 'Settings' });
    const { result } = renderHook(() => usePanels());
    const panel = result.current.getPanel('/panels/settings');
    expect(panel?.title).toBe('Settings');
  });

  it('getPanel returns undefined for an unregistered route', () => {
    const { result } = renderHook(() => usePanels());
    expect(result.current.getPanel('/panels/unknown')).toBeUndefined();
  });

  it('hasPanel returns true for a registered route', () => {
    panelRegistry.register({ route: '/panels/settings', component: FakePanel, title: 'Settings' });
    const { result } = renderHook(() => usePanels());
    expect(result.current.hasPanel('/panels/settings')).toBe(true);
  });

  it('hasPanel returns false for an unregistered route', () => {
    const { result } = renderHook(() => usePanels());
    expect(result.current.hasPanel('/panels/nonexistent')).toBe(false);
  });
});
