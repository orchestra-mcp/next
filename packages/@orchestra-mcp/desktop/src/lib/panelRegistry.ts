import { ComponentType, LazyExoticComponent, lazy } from 'react';

export type PanelComponent = ComponentType<any> | LazyExoticComponent<ComponentType<any>>;

export interface PanelRegistration {
  route: string;
  component: PanelComponent;
  title: string;
  icon?: string;
  permissions?: string[];
  lazy?: boolean; // Whether this is a lazy-loaded component
}

class PanelRegistry {
  private panels: Map<string, PanelRegistration> = new Map();

  /**
   * Register a panel component for a specific route
   */
  register(registration: PanelRegistration): void {
    if (this.panels.has(registration.route)) {
      console.warn(`Panel already registered for route: ${registration.route}`);
      return;
    }

    this.panels.set(registration.route, registration);
    console.log(`Registered panel: ${registration.route}`);
  }

  /**
   * Unregister a panel by route
   */
  unregister(route: string): void {
    this.panels.delete(route);
    console.log(`Unregistered panel: ${route}`);
  }

  /**
   * Get a panel registration by route
   */
  get(route: string): PanelRegistration | undefined {
    return this.panels.get(route);
  }

  /**
   * Get all registered panels
   */
  getAll(): PanelRegistration[] {
    return Array.from(this.panels.values());
  }

  /**
   * Check if a route is registered
   */
  has(route: string): boolean {
    return this.panels.has(route);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.panels.clear();
  }

  /**
   * Get panel count
   */
  count(): number {
    return this.panels.size;
  }
}

// Singleton instance
export const panelRegistry = new PanelRegistry();

/**
 * Decorator for registering panel components
 */
export function registerPanel(registration: Omit<PanelRegistration, 'component' | 'lazy'>) {
  return function <T extends ComponentType<any>>(component: T): T {
    panelRegistry.register({
      ...registration,
      component,
      lazy: false,
    });
    return component;
  };
}

/**
 * Register a lazy-loaded panel component
 */
export function registerLazyPanel(
  registration: Omit<PanelRegistration, 'component' | 'lazy'>,
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  const LazyComponent = lazy(importFn);
  panelRegistry.register({
    ...registration,
    component: LazyComponent,
    lazy: true,
  });
}
