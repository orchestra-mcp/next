import { describe, it, expect, beforeEach } from 'vitest';
import { panelRegistry, registerPanel, registerLazyPanel } from './panelRegistry';

describe('PanelRegistry', () => {
  beforeEach(() => {
    panelRegistry.clear();
  });

  it('should register a panel', () => {
    const TestComponent = () => null;

    panelRegistry.register({
      route: '/panels/test',
      component: TestComponent,
      title: 'Test Panel',
    });

    expect(panelRegistry.has('/panels/test')).toBe(true);
    expect(panelRegistry.count()).toBe(1);
  });

  it('should get a registered panel', () => {
    const TestComponent = () => null;

    panelRegistry.register({
      route: '/panels/test',
      component: TestComponent,
      title: 'Test Panel',
    });

    const registration = panelRegistry.get('/panels/test');
    expect(registration).toBeDefined();
    expect(registration?.title).toBe('Test Panel');
    expect(registration?.component).toBe(TestComponent);
  });

  it('should unregister a panel', () => {
    const TestComponent = () => null;

    panelRegistry.register({
      route: '/panels/test',
      component: TestComponent,
      title: 'Test Panel',
    });

    panelRegistry.unregister('/panels/test');
    expect(panelRegistry.has('/panels/test')).toBe(false);
    expect(panelRegistry.count()).toBe(0);
  });

  it('should get all registered panels', () => {
    const TestComponent1 = () => null;
    const TestComponent2 = () => null;

    panelRegistry.register({
      route: '/panels/test1',
      component: TestComponent1,
      title: 'Test Panel 1',
    });

    panelRegistry.register({
      route: '/panels/test2',
      component: TestComponent2,
      title: 'Test Panel 2',
    });

    const panels = panelRegistry.getAll();
    expect(panels).toHaveLength(2);
  });

  it('should not register duplicate routes', () => {
    const TestComponent1 = () => null;
    const TestComponent2 = () => null;

    panelRegistry.register({
      route: '/panels/test',
      component: TestComponent1,
      title: 'Test Panel 1',
    });

    // Try to register again with same route
    panelRegistry.register({
      route: '/panels/test',
      component: TestComponent2,
      title: 'Test Panel 2',
    });

    // Should still have only 1 panel
    expect(panelRegistry.count()).toBe(1);

    // Should keep the first registration
    const registration = panelRegistry.get('/panels/test');
    expect(registration?.component).toBe(TestComponent1);
  });

  it('should clear all panels', () => {
    const TestComponent1 = () => null;
    const TestComponent2 = () => null;

    panelRegistry.register({
      route: '/panels/test1',
      component: TestComponent1,
      title: 'Test Panel 1',
    });

    panelRegistry.register({
      route: '/panels/test2',
      component: TestComponent2,
      title: 'Test Panel 2',
    });

    panelRegistry.clear();
    expect(panelRegistry.count()).toBe(0);
  });

  it('should use decorator to register panels', () => {
    const TestComponent = registerPanel({
      route: '/panels/decorated',
      title: 'Decorated Panel',
    })(() => null);

    expect(panelRegistry.has('/panels/decorated')).toBe(true);

    const registration = panelRegistry.get('/panels/decorated');
    expect(registration?.title).toBe('Decorated Panel');
  });

  it('should handle panels with icons and permissions', () => {
    const TestComponent = () => null;

    panelRegistry.register({
      route: '/panels/secure',
      component: TestComponent,
      title: 'Secure Panel',
      icon: 'lock',
      permissions: ['admin', 'read'],
    });

    const registration = panelRegistry.get('/panels/secure');
    expect(registration?.icon).toBe('lock');
    expect(registration?.permissions).toEqual(['admin', 'read']);
  });

  it('should return undefined for non-existent panel', () => {
    const registration = panelRegistry.get('/panels/nonexistent');
    expect(registration).toBeUndefined();
  });

  it('should return false for has() on non-existent panel', () => {
    expect(panelRegistry.has('/panels/nonexistent')).toBe(false);
  });

  it('should register a lazy-loaded panel', () => {
    registerLazyPanel(
      { route: '/panels/lazy', title: 'Lazy Panel' },
      () => Promise.resolve({ default: () => null })
    );

    expect(panelRegistry.has('/panels/lazy')).toBe(true);

    const registration = panelRegistry.get('/panels/lazy');
    expect(registration?.title).toBe('Lazy Panel');
    expect(registration?.lazy).toBe(true);
  });
});
