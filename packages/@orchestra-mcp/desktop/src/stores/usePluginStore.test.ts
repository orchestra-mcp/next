import { describe, it, expect, beforeEach } from 'vitest';
import { usePluginStore } from './usePluginStore';

describe('usePluginStore', () => {
  beforeEach(() => {
    usePluginStore.setState({
      plugins: {},
      loadedCount: 0,
    });
  });

  it('initializes with empty plugins', () => {
    const state = usePluginStore.getState();
    expect(state.plugins).toEqual({});
    expect(state.loadedCount).toBe(0);
  });

  it('adds a plugin', () => {
    const plugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      enabled: true,
    };

    usePluginStore.getState().addPlugin(plugin);
    const state = usePluginStore.getState();

    expect(state.plugins['test-plugin']).toEqual(plugin);
  });

  it('toggles plugin enabled state', () => {
    const plugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      enabled: true,
    };

    usePluginStore.getState().addPlugin(plugin);
    usePluginStore.getState().togglePlugin('test-plugin');

    expect(usePluginStore.getState().plugins['test-plugin'].enabled).toBe(false);
  });

  it('updates loaded count', () => {
    usePluginStore.getState().updateLoadedCount(5);
    expect(usePluginStore.getState().loadedCount).toBe(5);
  });

  it('removes a plugin', () => {
    const plugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      enabled: true,
    };

    usePluginStore.getState().addPlugin(plugin);
    usePluginStore.getState().removePlugin('test-plugin');

    expect(usePluginStore.getState().plugins['test-plugin']).toBeUndefined();
  });
});
