import { describe, it, expect, beforeEach } from 'vitest';
import { sidebarRegistry } from './sidebarRegistry';
import type { SidebarViewRegistration } from './sidebarRegistry';

function makeView(overrides: Partial<SidebarViewRegistration> = {}): SidebarViewRegistration {
  return {
    id: 'view-1',
    title: 'Explorer',
    icon: 'folder',
    route: '/sidebar/explorer',
    order: 1,
    visible: true,
    ...overrides,
  };
}

describe('SidebarRegistry', () => {
  beforeEach(() => {
    sidebarRegistry.clear();
  });

  it('should register a view', () => {
    sidebarRegistry.register(makeView());
    expect(sidebarRegistry.has('view-1')).toBe(true);
    expect(sidebarRegistry.count()).toBe(1);
  });

  it('should warn and not overwrite on duplicate register', () => {
    sidebarRegistry.register(makeView({ title: 'First' }));
    sidebarRegistry.register(makeView({ title: 'Second' }));

    expect(sidebarRegistry.count()).toBe(1);
    expect(sidebarRegistry.get('view-1')?.title).toBe('First');
  });

  it('should return all views sorted by order', () => {
    sidebarRegistry.register(makeView({ id: 'a', order: 3 }));
    sidebarRegistry.register(makeView({ id: 'b', order: 1 }));
    sidebarRegistry.register(makeView({ id: 'c', order: 2 }));

    const all = sidebarRegistry.getAll();
    expect(all).toHaveLength(3);
    expect(all[0].id).toBe('b');
    expect(all[1].id).toBe('c');
    expect(all[2].id).toBe('a');
  });

  it('should return only visible views sorted by order', () => {
    sidebarRegistry.register(makeView({ id: 'vis', order: 2, visible: true }));
    sidebarRegistry.register(makeView({ id: 'hid', order: 1, visible: false }));

    const visible = sidebarRegistry.getVisible();
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('vis');
  });

  it('should get a view by id', () => {
    sidebarRegistry.register(makeView());
    const view = sidebarRegistry.get('view-1');
    expect(view).toBeDefined();
    expect(view?.title).toBe('Explorer');
  });

  it('should return undefined for missing id', () => {
    expect(sidebarRegistry.get('nonexistent')).toBeUndefined();
  });

  it('should check has correctly', () => {
    expect(sidebarRegistry.has('view-1')).toBe(false);
    sidebarRegistry.register(makeView());
    expect(sidebarRegistry.has('view-1')).toBe(true);
  });

  it('should unregister a view', () => {
    sidebarRegistry.register(makeView());
    sidebarRegistry.unregister('view-1');
    expect(sidebarRegistry.has('view-1')).toBe(false);
    expect(sidebarRegistry.count()).toBe(0);
  });

  it('should clear all views', () => {
    sidebarRegistry.register(makeView({ id: 'a' }));
    sidebarRegistry.register(makeView({ id: 'b' }));
    sidebarRegistry.clear();
    expect(sidebarRegistry.count()).toBe(0);
  });

  it('should return correct count', () => {
    expect(sidebarRegistry.count()).toBe(0);
    sidebarRegistry.register(makeView({ id: 'a' }));
    sidebarRegistry.register(makeView({ id: 'b' }));
    expect(sidebarRegistry.count()).toBe(2);
  });
});
