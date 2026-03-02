import React from 'react';
import './Sidebar.css';

export interface SidebarProps {
  /** Position of the sidebar */
  position?: 'left' | 'right';
  /** Width of the sidebar */
  width?: number;
  /** Whether the sidebar is open */
  isOpen?: boolean;
  /** Children elements to render inside */
  children: React.ReactNode;
  /** Callback when sidebar close is requested */
  onClose?: () => void;
  /** Show overlay when open on mobile */
  showOverlay?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  position = 'left',
  width = 280,
  isOpen = true,
  children,
  onClose,
  showOverlay = true,
}) => {
  const sidebarClasses = [
    'sidebar',
    `sidebar--${position}`,
    isOpen ? 'sidebar--open' : 'sidebar--closed',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {showOverlay && isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      <aside
        className={sidebarClasses}
        style={{ width: isOpen ? `${width}px` : '0px' }}
      >
        <div className="sidebar-content">{children}</div>
      </aside>
    </>
  );
};
