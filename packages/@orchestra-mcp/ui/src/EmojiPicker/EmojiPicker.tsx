"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { EmojiGrid } from './EmojiGrid';
import './EmojiPicker.css';

export interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  emojis: string[];
}

export interface EmojiPickerProps {
  mode?: 'select' | 'inline' | 'panel';
  value?: string;
  onSelect: (emoji: string) => void;
  placeholder?: string;
  disabled?: boolean;
  categories?: EmojiCategory[];
  recents?: string[];
  searchPlaceholder?: string;
  columns?: number;
  className?: string;
}

const DEFAULT_CATEGORIES: EmojiCategory[] = [
  { id: 'smileys', label: 'Smileys', icon: '😀', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊'] },
  { id: 'gestures', label: 'Gestures', icon: '👋', emojis: ['👋','🤚','✋','🖐','👌','🤏','✌','🤞','🤟','🤘'] },
  { id: 'hearts', label: 'Hearts', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔'] },
  { id: 'animals', label: 'Animals', icon: '🐶', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯'] },
  { id: 'food', label: 'Food', icon: '🍎', emojis: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈'] },
];

const PanelContent = ({
  categories,
  recents,
  searchPlaceholder,
  columns,
  onSelect,
}: {
  categories: EmojiCategory[];
  recents?: string[];
  searchPlaceholder: string;
  columns: number;
  onSelect: (emoji: string) => void;
}) => {
  const hasRecents = recents && recents.length > 0;
  const recentsCategory: EmojiCategory = {
    id: 'recents', label: 'Recents', icon: '🕐', emojis: recents ?? [],
  };
  const tabs = hasRecents ? [recentsCategory, ...categories] : categories;
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [search, setSearch] = useState('');

  const filteredEmojis = useMemo(() => {
    if (search) {
      const all = categories.flatMap((c) => c.emojis);
      if (hasRecents) all.unshift(...recents);
      return all.filter((e) => e.includes(search));
    }
    const active = tabs.find((t) => t.id === activeTab);
    return active ? active.emojis : [];
  }, [search, activeTab, tabs, categories, hasRecents, recents]);

  return (
    <>
      <div className="emoji-picker__search">
        <input
          className="emoji-picker__search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {!search && (
        <div className="emoji-picker__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`emoji-picker__tab${activeTab === tab.id ? ' emoji-picker__tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      )}
      <EmojiGrid emojis={filteredEmojis} columns={columns} onSelect={onSelect} />
    </>
  );
};

export const EmojiPicker = ({
  mode = 'select',
  value,
  onSelect,
  placeholder = 'Select emoji',
  disabled = false,
  categories,
  recents,
  searchPlaceholder = 'Search emojis...',
  columns = 8,
  className,
}: EmojiPickerProps) => {
  const allCategories = categories ?? DEFAULT_CATEGORIES;

  if (mode === 'inline') {
    const allEmojis = allCategories.flatMap((c) => c.emojis);
    const style = columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined;
    return (
      <div className={['emoji-inline', className].filter(Boolean).join(' ')} data-testid="emoji-inline">
        <div className="emoji-inline__grid" style={style}>
          {allEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`emoji-inline__item${value === emoji ? ' emoji-inline__item--selected' : ''}`}
              disabled={disabled}
              onClick={() => onSelect(emoji)}
              aria-label={`Emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'panel') {
    return (
      <div className={['emoji-picker', className].filter(Boolean).join(' ')} data-testid="emoji-picker">
        <PanelContent
          categories={allCategories}
          recents={recents}
          searchPlaceholder={searchPlaceholder}
          columns={columns}
          onSelect={onSelect}
        />
      </div>
    );
  }

  return <SelectMode
    value={value}
    onSelect={onSelect}
    placeholder={placeholder}
    disabled={disabled}
    categories={allCategories}
    recents={recents}
    searchPlaceholder={searchPlaceholder}
    columns={columns}
    className={className}
  />;
};

const SelectMode = ({
  value,
  onSelect,
  placeholder,
  disabled,
  categories,
  recents,
  searchPlaceholder,
  columns,
  className,
}: {
  value?: string;
  onSelect: (emoji: string) => void;
  placeholder: string;
  disabled: boolean;
  categories: EmojiCategory[];
  recents?: string[];
  searchPlaceholder: string;
  columns: number;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <div
      className={['emoji-select', className].filter(Boolean).join(' ')}
      ref={wrapperRef}
      data-testid="emoji-select"
    >
      <button
        type="button"
        className="emoji-select__trigger"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        data-testid="emoji-select-trigger"
      >
        <span className="emoji-select__value">{value || ''}</span>
        <span className="emoji-select__label">{placeholder}</span>
        <span className="emoji-select__chevron" aria-hidden="true">{'\u25BE'}</span>
      </button>
      {open && (
        <div className="emoji-select__dropdown" data-testid="emoji-select-dropdown">
          <PanelContent
            categories={categories}
            recents={recents}
            searchPlaceholder={searchPlaceholder}
            columns={columns}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
};
