import { useCallback, useState, useRef, useEffect } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { Tooltip } from '@orchestra-mcp/ui';
import './IconSidebar.css';

export type ChatView = 'chat' | 'projects' | 'search' | 'extensions' | 'notes' | 'devtools' | 'integrations' | 'settings' | 'components';

interface NavItem {
  view: ChatView;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'chat', icon: 'bx-chat', label: 'Chat' },
  { view: 'projects', icon: 'bx-grid-alt', label: 'Projects' },
  { view: 'notes', icon: 'bx-notepad', label: 'Notes' },
  { view: 'devtools', icon: 'bx-terminal', label: 'DevTools' },
  { view: 'components', icon: 'bx-layer', label: 'Components' },
];

export interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface IconSidebarProps {
  activeView: ChatView;
  onViewChange: (view: ChatView) => void;
  userInfo?: UserInfo;
  onLogout?: () => void;
  /** Whether the WebSocket/backend sync connection is live */
  syncConnected?: boolean;
  /** ISO timestamp of last successful sync event (tasks:changed, etc.) */
  lastSyncAt?: string | null;
  /** Called when user clicks "Sync Now" in the user menu */
  onSyncNow?: () => void;
}

/** Format relative time for last-sync label */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function IconSidebar({
  activeView,
  onViewChange,
  userInfo,
  onLogout,
  syncConnected = false,
  lastSyncAt = null,
  onSyncNow,
}: IconSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [, forceUpdate] = useState(0);

  // Re-render every 30s so relative time stays fresh
  useEffect(() => {
    if (!lastSyncAt) return;
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, [lastSyncAt]);

  const handleClick = useCallback(
    (view: ChatView) => () => onViewChange(view),
    [onViewChange],
  );

  const itemClass = (view: ChatView) =>
    [
      'icon-sidebar__item',
      activeView === view ? 'icon-sidebar__item--active' : '',
    ]
      .filter(Boolean)
      .join(' ');

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        avatarRef.current && !avatarRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const syncLabel = syncConnected
    ? lastSyncAt ? `Live · ${relativeTime(lastSyncAt)}` : 'Connected'
    : 'Reconnecting…';

  return (
    <aside className="icon-sidebar">
      <nav className="icon-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.view} content={item.label} placement="right">
            <button
              className={itemClass(item.view)}
              onClick={handleClick(item.view)}
              aria-label={item.label}
            >
              <BoxIcon name={item.icon} size={18} />
            </button>
          </Tooltip>
        ))}
      </nav>

      <div className="icon-sidebar__footer">
        {userInfo && (
          <div className="icon-sidebar__avatar-wrap">
            <button
              ref={avatarRef}
              className="icon-sidebar__avatar"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              {userInfo.avatarUrl ? (
                <img
                  src={userInfo.avatarUrl}
                  alt={userInfo.name}
                  className="icon-sidebar__avatar-img"
                />
              ) : (
                <span className="icon-sidebar__avatar-initials">
                  {userInfo.name.charAt(0).toUpperCase()}
                </span>
              )}
              {/* Sync status dot on the avatar */}
              <span
                className={`icon-sidebar__sync-dot icon-sidebar__sync-dot--${syncConnected ? 'live' : 'offline'}`}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div ref={menuRef} className="icon-sidebar__menu">
                <div className="icon-sidebar__menu-header">
                  <span className="icon-sidebar__menu-name">{userInfo.name}</span>
                  <span className="icon-sidebar__menu-email">{userInfo.email}</span>
                </div>
                <div className="icon-sidebar__menu-divider" />

                {/* ── Sync status row ── */}
                <div className="icon-sidebar__sync-row">
                  <span className={`icon-sidebar__sync-indicator icon-sidebar__sync-indicator--${syncConnected ? 'live' : 'offline'}`}>
                    {syncConnected
                      ? <span className="icon-sidebar__sync-pulse" aria-hidden="true" />
                      : <BoxIcon name="bx-wifi-off" size={12} />
                    }
                  </span>
                  <span className="icon-sidebar__sync-label">{syncLabel}</span>
                  {onSyncNow && (
                    <button
                      className="icon-sidebar__sync-btn"
                      onClick={() => { onSyncNow(); }}
                      title="Sync now"
                    >
                      <BoxIcon name="bx-refresh" size={13} />
                    </button>
                  )}
                </div>

                <div className="icon-sidebar__menu-divider" />

                <button
                  className="icon-sidebar__menu-item"
                  onClick={() => { setMenuOpen(false); onViewChange('integrations'); }}
                >
                  <BoxIcon name="bx-plug" size={15} />
                  Integrations
                </button>
                <button
                  className="icon-sidebar__menu-item"
                  onClick={() => { setMenuOpen(false); onViewChange('settings'); }}
                >
                  <BoxIcon name="bx-cog" size={15} />
                  Settings
                </button>
                <button
                  className="icon-sidebar__menu-item icon-sidebar__menu-item--danger"
                  onClick={() => { setMenuOpen(false); onLogout?.(); }}
                >
                  <BoxIcon name="bx-log-out" size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
