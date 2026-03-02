"use client";

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useIPC } from './useIPC';
import { panelRegistry } from '../lib/panelRegistry';
import { sidebarRegistry } from '../lib/sidebarRegistry';
import { usePluginStore } from '../stores';
import type { SidebarViewRegistration } from '../lib/sidebarRegistry';

/** Mirrors Go UIManifest struct from app/desktop/ui_manifest.go */
interface UIManifest {
  panels: PanelDef[];
  trayItems: unknown[];
  contextMenus: unknown[];
  ipcHandlers: unknown[];
  sidebarViews: SidebarViewDef[];
  tabs: unknown[];
}

/** Mirrors Go PanelDef struct from app/plugins/capabilities_panels.go */
interface PanelDef {
  id: string;
  title: string;
  route: string;
  icon: string;
  type: string;
  width: number;
  height: number;
  resizable: boolean;
  closable: boolean;
  singleton: boolean;
  visible: boolean;
  lazyLoad: boolean;
  order: number;
  permissions?: string[];
}

/** Mirrors Go SidebarViewDef from app/plugins/capabilities_sidebar.go */
interface SidebarViewDef {
  id: string;
  title: string;
  icon: string;
  route: string;
  order: number;
  visible: boolean;
  badge?: string;
  actions?: { id: string; icon: string; tooltip: string; action: string }[];
  hasSearch?: boolean;
}

/**
 * Bootstrap hook that loads UI manifest from Go backend.
 * Populates panelRegistry and sidebarRegistry from plugin contributions.
 */
export function useBootstrap() {
  const { call } = useIPC();
  const updateLoadedCount = usePluginStore((s) => s.updateLoadedCount);

  const [ready, setReady] = useState(false);
  const [manifest, setManifest] = useState<UIManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const registerPanels = useCallback((panels: PanelDef[]) => {
    for (const panel of panels) {
      if (panelRegistry.has(panel.route)) continue;
      panelRegistry.register({
        route: panel.route,
        title: panel.title,
        icon: panel.icon,
        permissions: panel.permissions,
        component: () => null, // Panels render via route, not component
      });
    }
  }, []);

  const registerSidebarViews = useCallback((views: SidebarViewDef[]) => {
    for (const view of views) {
      if (sidebarRegistry.has(view.id)) continue;
      const registration: SidebarViewRegistration = {
        id: view.id,
        title: view.title,
        icon: view.icon,
        route: view.route,
        order: view.order,
        visible: view.visible,
        badge: view.badge,
        actions: view.actions,
        hasSearch: view.hasSearch,
      };
      sidebarRegistry.register(registration);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const result = await call<UIManifest>('UIManifestService', 'GetUIManifest');
        if (cancelled) return;

        if (result) {
          setManifest(result);
          registerPanels(result.panels);
          registerSidebarViews(result.sidebarViews);
          updateLoadedCount(result.panels.length + result.sidebarViews.length);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Bootstrap failed';
          setError(msg);
          console.warn('[Bootstrap]', msg);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [call, registerPanels, registerSidebarViews, updateLoadedCount]);

  return { ready, manifest, error };
}
