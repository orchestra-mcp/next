import type { ReactNode } from 'react';
import type { SidebarView } from './Sidebar';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { StatusBar } from './StatusBar';
import './MainLayout.css';

interface MainLayoutProps {
  children?: ReactNode;
  breadcrumb?: string;
  pluginCount?: number;
  notificationCount?: number;
  sidebarViews?: SidebarView[];
  activeRoute?: string;
  topbarActions?: ReactNode;
  statusBarChildren?: ReactNode;
  onNavigate?: (route: string) => void;
  onBack?: () => void;
  onForward?: () => void;
}

/**
 * Full desktop IDE layout: sidebar + topbar + content + status bar.
 * Composes rebuilt sub-components with proper theme support.
 */
export function MainLayout({
  children,
  breadcrumb = 'Orchestra',
  pluginCount = 0,
  notificationCount = 0,
  sidebarViews = [],
  activeRoute,
  topbarActions,
  statusBarChildren,
  onNavigate,
  onBack,
  onForward,
}: MainLayoutProps) {
  return (
    <div className="desktop-layout">
      <Sidebar
        views={sidebarViews}
        activeRoute={activeRoute}
        onNavigate={onNavigate}
      />
      <div className="desktop-layout__body">
        <Topbar
          breadcrumb={breadcrumb}
          actions={topbarActions}
          onBack={onBack}
          onForward={onForward}
        />
        <main className="desktop-layout__main">
          {children}
        </main>
        <StatusBar
          loadedCount={pluginCount}
          notificationCount={notificationCount}
        >
          {statusBarChildren}
        </StatusBar>
      </div>
    </div>
  );
}
