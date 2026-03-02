import { useCallback, useMemo } from 'react';
import { panelRegistry } from '../lib/panelRegistry';
import type { PanelRegistration } from '../lib/panelRegistry';

export function usePanels() {
  /**
   * Navigate to a panel by route
   */
  const navigateToPanel = useCallback((route: string) => {
    window.location.assign(route);
  }, []);

  /**
   * Get all registered panels
   */
  const panels = useMemo(() => {
    return panelRegistry.getAll();
  }, []);

  /**
   * Get a panel by route
   */
  const getPanel = useCallback((route: string): PanelRegistration | undefined => {
    return panelRegistry.get(route);
  }, []);

  /**
   * Check if a panel is registered
   */
  const hasPanel = useCallback((route: string): boolean => {
    return panelRegistry.has(route);
  }, []);

  /**
   * Get panel count
   */
  const panelCount = useMemo(() => {
    return panelRegistry.count();
  }, []);

  return {
    panels,
    panelCount,
    navigateToPanel,
    getPanel,
    hasPanel,
  };
}
