import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({
      colorTheme: 'orchestra',
      componentVariant: 'default',
    });
  });

  it('initializes with default values', () => {
    const state = useThemeStore.getState();
    expect(state.colorTheme).toBe('orchestra');
    expect(state.componentVariant).toBe('default');
  });

  it('updates color theme', () => {
    useThemeStore.getState().setColorTheme('dracula');
    expect(useThemeStore.getState().colorTheme).toBe('dracula');
  });

  it('updates component variant', () => {
    useThemeStore.getState().setComponentVariant('compact');
    expect(useThemeStore.getState().componentVariant).toBe('compact');
  });
});
