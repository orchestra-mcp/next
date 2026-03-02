import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from './useWindowStore';

describe('useWindowStore', () => {
  beforeEach(() => {
    useWindowStore.setState({
      windows: {},
      activeWindow: null,
    });
  });

  it('initializes with no windows', () => {
    const state = useWindowStore.getState();
    expect(state.windows).toEqual({});
    expect(state.activeWindow).toBeNull();
  });

  it('registers a window', () => {
    useWindowStore.getState().registerWindow('main', 'Orchestra');
    const state = useWindowStore.getState();

    expect(state.windows['main']).toBeDefined();
    expect(state.windows['main'].title).toBe('Orchestra');
    expect(state.activeWindow).toBe('main');
  });

  it('sets window maximized state', () => {
    useWindowStore.getState().registerWindow('main', 'Orchestra');
    useWindowStore.getState().setWindowMaximized('main', true);

    expect(useWindowStore.getState().windows['main'].isMaximized).toBe(true);
  });

  it('sets window focused state', () => {
    useWindowStore.getState().registerWindow('main', 'Orchestra');
    useWindowStore.getState().setWindowFocused('main', false);

    expect(useWindowStore.getState().windows['main'].isFocused).toBe(false);
  });

  it('closes a window', () => {
    useWindowStore.getState().registerWindow('main', 'Orchestra');
    useWindowStore.getState().closeWindow('main');

    expect(useWindowStore.getState().windows['main']).toBeUndefined();
  });

  it('sets active window', () => {
    useWindowStore.getState().registerWindow('main', 'Orchestra');
    useWindowStore.getState().registerWindow('settings', 'Settings');
    useWindowStore.getState().setActiveWindow('settings');

    expect(useWindowStore.getState().activeWindow).toBe('settings');
  });
});
