"use client";

import { useCallback } from 'react';
import {
  OrchestraLogo,
  SettingsIcon,
  FileIcon,
  SearchIcon,
  ExtensionsIcon,
  GitIcon,
  DebugIcon,
} from '@orchestra-mcp/icons';
import { Tooltip } from '@orchestra-mcp/ui';
import { Badge } from '@orchestra-mcp/ui';
import './Sidebar.css';

/** Matches the Go SidebarViewDef struct */
export interface SidebarView {
  id: string;
  title: string;
  icon: string;
  route: string;
  badge?: string;
}

/** Map icon names from Go → React icon components */
const ICON_MAP: Record<string, React.FC<{ size?: number | string; className?: string }>> = {
  files: FileIcon,
  search: SearchIcon,
  extensions: ExtensionsIcon,
  git: GitIcon,
  debug: DebugIcon,
  settings: SettingsIcon,
};

function resolveIcon(name: string, size: number = 18) {
  const Icon = ICON_MAP[name] ?? FileIcon;
  return <Icon size={size} />;
}

interface SidebarItemProps {
  view: SidebarView;
  active?: boolean;
  onNavigate: (route: string) => void;
}

function SidebarItem({ view, active, onNavigate }: SidebarItemProps) {
  const handleClick = useCallback(() => {
    onNavigate(view.route);
  }, [view.route, onNavigate]);

  const classes = [
    'desktop-sidebar__item',
    active ? 'desktop-sidebar__item--active' : '',
  ].filter(Boolean).join(' ');

  return (
    <Tooltip content={view.title} placement="right">
      <button className={classes} onClick={handleClick} aria-label={view.title}>
        {resolveIcon(view.icon)}
        {view.badge && (
          <span style={{ position: 'absolute', top: -2, right: -2 }}>
            <Badge label={view.badge} size="xs" variant="filled" color="primary" />
          </span>
        )}
      </button>
    </Tooltip>
  );
}

interface SidebarProps {
  views?: SidebarView[];
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

/**
 * Desktop icon-rail sidebar. Uses @orchestra-mcp/icons and @orchestra-mcp/ui.
 * Prop-driven — the app provides views from sidebarRegistry.
 */
export function Sidebar({ views = [], activeRoute, onNavigate = () => {} }: SidebarProps) {
  const openSettings = useCallback(() => {
    onNavigate('/panels/settings');
  }, [onNavigate]);

  return (
    <aside className="desktop-sidebar">
      <div className="desktop-sidebar__brand">
        <OrchestraLogo size={20} />
      </div>

      <nav className="desktop-sidebar__nav">
        {views.map((view) => (
          <SidebarItem
            key={view.id}
            view={view}
            active={activeRoute === view.route}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="desktop-sidebar__footer">
        <Tooltip content="Settings" placement="right" shortcut="Cmd+,">
          <button
            className="desktop-sidebar__item"
            onClick={openSettings}
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
