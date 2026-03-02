"use client";

import type { ComponentType, LazyExoticComponent } from 'react';
import { Suspense, useMemo } from 'react';
import { Shimmer, ShimmerGroup } from '@orchestra-mcp/ui';
import { PanelNotFound } from './PanelNotFound';
import { PanelError } from './PanelError';
import './Panels.css';

export type PanelComponent = ComponentType<any> | LazyExoticComponent<ComponentType<any>>;

export interface PanelRegistration {
  route: string;
  component: PanelComponent;
  title: string;
  icon?: string;
  lazy?: boolean;
}

interface PanelContainerProps {
  route: string;
  panels: PanelRegistration[];
  props?: Record<string, any>;
}

function PanelLoading() {
  return (
    <div className="desktop-panel-loading">
      <div className="desktop-panel-loading__inner">
        <ShimmerGroup gap="16px">
          <Shimmer shape="line" width="200px" />
          <Shimmer shape="rect" width="300px" height="60px" />
          <Shimmer shape="line" width="160px" />
        </ShimmerGroup>
        <span className="desktop-panel-loading__text">Loading panel...</span>
      </div>
    </div>
  );
}

/**
 * Resolves and renders a panel by route.
 * Uses Shimmer from @orchestra-mcp/ui for loading state.
 */
export function PanelContainer({ route, panels, props = {} }: PanelContainerProps) {
  const registration = useMemo(() => {
    return panels.find((p) => p.route === route);
  }, [route, panels]);

  if (!registration) {
    return <PanelNotFound route={route} />;
  }

  const Component = registration.component;

  try {
    const content = <Component {...props} />;

    if (registration.lazy) {
      return <Suspense fallback={<PanelLoading />}>{content}</Suspense>;
    }

    return content;
  } catch (error) {
    return <PanelError error={error as Error} route={route} />;
  }
}
