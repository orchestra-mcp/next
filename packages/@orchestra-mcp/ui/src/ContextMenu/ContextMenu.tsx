"use client";

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import './ContextMenu.css';

export type ContextMenuColor = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
  /** Color the icon and label */
  color?: ContextMenuColor;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  children: ReactNode;
  onAction?: (id: string) => void;
  /** Show a search input at the top of the menu to filter items */
  searchable?: boolean;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
}

export const ContextMenu = ({
  items,
  children,
  onAction,
  searchable,
  searchPlaceholder = 'Search...',
}: ContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = searchable && search
    ? items.filter((i) => !i.separator && i.label.toLowerCase().includes(search.toLowerCase()))
    : items;

  const actionableItems = filtered.filter((i) => !i.separator);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    setSearch('');
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
    setActiveIndex(-1);
    setSearch('');
  };

  const handleAction = (item: ContextMenuItem) => {
    if (item.disabled) return;
    onAction?.(item.id);
    close();
  };

  useEffect(() => {
    if (!isOpen) return;

    if (searchable && searchRef.current) {
      searchRef.current.focus();
    }

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < actionableItems.length - 1 ? prev + 1 : 0,
        );
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : actionableItems.length - 1,
        );
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const item = actionableItems[activeIndex];
        if (item && !item.disabled) handleAction(item);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, activeIndex, actionableItems, close, searchable]);

  return (
    <div className="ctx-menu-wrapper" onContextMenu={handleContextMenu}>
      {children}
      {isOpen && (
        <ContextMenuPanel
          items={filtered}
          position={position}
          activeIndex={activeIndex}
          actionableItems={actionableItems}
          onAction={handleAction}
          menuRef={menuRef}
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          search={search}
          onSearch={setSearch}
          searchRef={searchRef}
        />
      )}
    </div>
  );
};

interface PanelProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  activeIndex: number;
  actionableItems: ContextMenuItem[];
  onAction: (item: ContextMenuItem) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  searchable?: boolean;
  searchPlaceholder?: string;
  search: string;
  onSearch: (value: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

const ContextMenuPanel = ({
  items,
  position,
  activeIndex,
  actionableItems,
  onAction,
  menuRef,
  searchable,
  searchPlaceholder,
  search,
  onSearch,
  searchRef,
}: PanelProps) => (
  <div
    ref={menuRef}
    className="ctx-menu"
    role="menu"
    style={{ left: position.x, top: position.y }}
  >
    {searchable && (
      <div className="ctx-menu-search">
        <SearchSvg />
        <input
          ref={searchRef}
          type="text"
          className="ctx-menu-search__input"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search menu items"
        />
      </div>
    )}
    {items.length === 0 && search && (
      <div className="ctx-menu-empty">No matches</div>
    )}
    {items.map((item) =>
      item.separator ? (
        <div key={item.id} className="ctx-menu-separator" role="separator" />
      ) : (
        <ContextMenuRow
          key={item.id}
          item={item}
          isActive={actionableItems[activeIndex]?.id === item.id}
          onAction={onAction}
        />
      ),
    )}
  </div>
);

interface RowProps {
  item: ContextMenuItem;
  isActive: boolean;
  onAction: (item: ContextMenuItem) => void;
}

const ContextMenuRow = ({ item, isActive, onAction }: RowProps) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className="ctx-menu-item-wrap"
      onMouseEnter={() => hasChildren && setSubmenuOpen(true)}
      onMouseLeave={() => hasChildren && setSubmenuOpen(false)}
    >
      <button
        className={[
          'ctx-menu-item',
          item.disabled ? 'ctx-menu-item--disabled' : '',
          isActive ? 'ctx-menu-item--active' : '',
          item.color ? `ctx-menu-item--${item.color}` : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="menuitem"
        disabled={item.disabled}
        onClick={() => !hasChildren && onAction(item)}
      >
        {item.icon && <span className="ctx-menu-item-icon">{item.icon}</span>}
        <span className="ctx-menu-item-label">{item.label}</span>
        {item.shortcut && (
          <span className="ctx-menu-item-shortcut">{item.shortcut}</span>
        )}
        {hasChildren && <span className="ctx-menu-item-arrow">&#9656;</span>}
      </button>
      {hasChildren && submenuOpen && (
        <div className="ctx-submenu" role="menu">
          {item.children!.map((child) =>
            child.separator ? (
              <div
                key={child.id}
                className="ctx-menu-separator"
                role="separator"
              />
            ) : (
              <ContextMenuRow
                key={child.id}
                item={child}
                isActive={false}
                onAction={onAction}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

/* Inline search icon — avoids dependency on icons package inside ui */
const SearchSvg = () => (
  <svg
    className="ctx-menu-search__icon"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
