"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import './IconPicker.css';

export interface IconItem {
  id: string;
  name: string;
  /** Boxicon name (e.g. 'bx-home', 'bxs-star', 'bxl-github') or ReactNode fallback */
  icon: string | ReactNode;
  category?: string;
}

export interface IconPickerProps {
  mode?: 'select' | 'inline' | 'panel';
  icons: IconItem[];
  onSelect: (icon: IconItem) => void;
  value?: string;
  /** @deprecated Use `value` instead */
  selected?: string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  columns?: number;
  categories?: string[];
  className?: string;
  /** Custom render function for icons. Defaults to BoxIcon SVG for string names. */
  renderIcon?: (icon: string | ReactNode, size?: number) => ReactNode;
}

/** Renders a boxicon name as inline SVG, or passes ReactNode through */
const defaultRenderIcon = (icon: string | ReactNode, size = 20): ReactNode => {
  if (typeof icon !== 'string') return icon;
  return <BoxIconInline name={icon} size={size} />;
};

/** Inline BoxIcon renderer — renders SVG from @orchestra-mcp/icons path data */
const BoxIconInline = ({ name, size = 20 }: { name: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    role="img"
    aria-label={name}
    data-boxicon={name}
  >
    <use xlinkHref={`#${name}`} />
  </svg>
);

const PanelContent = ({ icons, searchable, categories, columns, resolvedValue, onSelect, search, setSearch, activeCategory, setActiveCategory, render }: {
  icons: IconItem[]; searchable: boolean; categories?: string[]; columns: number;
  resolvedValue?: string; onSelect: (icon: IconItem) => void;
  search: string; setSearch: (s: string) => void;
  activeCategory: string | null; setActiveCategory: (c: string | null) => void;
  render: (icon: string | ReactNode, size?: number) => ReactNode;
}) => {
  const filtered = useMemo(() => {
    let result = icons;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(lower));
    }
    if (activeCategory) result = result.filter((i) => i.category === activeCategory);
    return result;
  }, [icons, search, activeCategory]);

  return (
    <>
      {searchable && (
        <input className="icon-picker__search" type="text" placeholder="Search icons..." value={search} onChange={(e) => setSearch(e.target.value)} />
      )}
      {categories && categories.length > 0 && (
        <div className="icon-picker__categories" role="tablist">
          <button type="button" className={`icon-picker__category-btn${activeCategory === null ? ' icon-picker__category-btn--active' : ''}`} role="tab" aria-selected={activeCategory === null} onClick={() => setActiveCategory(null)}>All</button>
          {categories.map((cat) => (
            <button key={cat} type="button" className={`icon-picker__category-btn${activeCategory === cat ? ' icon-picker__category-btn--active' : ''}`} role="tab" aria-selected={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="icon-picker__empty">No icons found</div>
      ) : (
        <div className="icon-picker__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {filtered.map((item) => (
            <button key={item.id} type="button" className={`icon-picker__icon-btn${resolvedValue === item.id ? ' icon-picker__icon-btn--selected' : ''}`} title={item.name} onClick={() => onSelect(item)}>{render(item.icon)}</button>
          ))}
        </div>
      )}
    </>
  );
};

export const IconPicker = ({
  mode = 'select', icons, onSelect, value, selected, placeholder = 'Select an icon',
  disabled = false, searchable = false, columns = 8, categories, className,
  renderIcon = defaultRenderIcon,
}: IconPickerProps) => {
  const resolvedValue = value ?? selected;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedItem = useMemo(() => icons.find((i) => i.id === resolvedValue), [icons, resolvedValue]);
  const cls = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ');

  useEffect(() => {
    if (mode !== 'select') return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mode]);

  const panelProps = { icons, searchable, categories, columns, resolvedValue, search, setSearch, activeCategory, setActiveCategory, render: renderIcon };

  if (mode === 'inline') return (
    <div className={cls('icon-inline', className)} data-testid="icon-inline">
      <div className="icon-picker__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {icons.map((item) => (
          <button key={item.id} type="button" disabled={disabled} className={`icon-inline__item${resolvedValue === item.id ? ' icon-inline__item--selected' : ''}`} title={item.name} onClick={() => onSelect(item)}>{renderIcon(item.icon)}</button>
        ))}
      </div>
    </div>
  );

  if (mode === 'panel') return (
    <div className={cls('icon-picker', className)} data-testid="icon-picker">
      <PanelContent {...panelProps} onSelect={onSelect} />
    </div>
  );

  const selectIcon = (icon: IconItem) => { onSelect(icon); setOpen(false); };

  return (
    <div className={cls('icon-select', className)} ref={wrapperRef} data-testid="icon-select">
      <button type="button" className="icon-select__trigger" disabled={disabled} data-testid="icon-select-trigger" onClick={() => !disabled && setOpen(!open)}>
        {selectedItem ? (<>
          <span className="icon-select__trigger-icon">{renderIcon(selectedItem.icon)}</span>
          <span className="icon-select__trigger-name">{selectedItem.name}</span>
        </>) : (
          <span className="icon-select__trigger-placeholder">{placeholder}</span>
        )}
        <span className="icon-select__trigger-chevron">{'\u25BE'}</span>
      </button>
      {open && (
        <div className="icon-select__dropdown" data-testid="icon-select-dropdown">
          <PanelContent {...panelProps} onSelect={selectIcon} />
        </div>
      )}
    </div>
  );
};
