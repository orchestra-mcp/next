import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { BoxIcon, boxiconNames } from '@orchestra-mcp/icons';
import './PromptCardEditor.css';

/* ── Types ───────────────────────────────────────── */

export interface PromptCard {
  id: string;
  icon?: string;
  color?: string;
  [key: string]: string | undefined;
}

export interface PromptCardField {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea';
}

export interface PromptCardEditorProps {
  value: PromptCard[];
  onChange: (value: PromptCard[]) => void;
  fields: PromptCardField[];
  /** 'prompts' shows 2-col card preview, 'actions' shows chip preview */
  previewMode: 'prompts' | 'actions';
  disabled?: boolean;
}

/* ── Curated icon subsets for quick pick ──────────── */

const POPULAR_ICONS = [
  'bx-bug', 'bx-code-alt', 'bx-book-open', 'bx-git-branch',
  'bx-search', 'bx-terminal', 'bx-rocket', 'bx-bulb',
  'bx-file', 'bx-folder', 'bx-cog', 'bx-star',
  'bx-zap', 'bx-shield', 'bx-wrench', 'bx-palette',
  'bx-chat', 'bx-check-circle', 'bx-error', 'bx-info-circle',
  'bx-play', 'bx-refresh', 'bx-download', 'bx-upload',
  'bx-edit', 'bx-trash', 'bx-heart', 'bx-bell',
  'bx-lock', 'bx-globe', 'bx-link', 'bx-image',
];

/* ── Small SVG icons ─────────────────────────────── */

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const RemoveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
  </svg>
);

/* ── Icon Picker Popover ─────────────────────────── */

function IconPicker({
  current,
  onSelect,
  onClose,
  anchorRect,
}: {
  current: string;
  onSelect: (name: string) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return POPULAR_ICONS;
    const lower = search.toLowerCase();
    return boxiconNames.filter((n) => n.includes(lower)).slice(0, 64);
  }, [search]);

  const top = anchorRect ? anchorRect.bottom + 4 : 100;
  const left = anchorRect ? Math.min(anchorRect.left, window.innerWidth - 340) : 100;

  return (
    <>
      <div className="pce__picker-overlay" onClick={onClose} />
      <div className="pce__picker" style={{ top, left }}>
        <div className="pce__picker-search">
          <input
            ref={inputRef}
            className="pce__picker-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 1600+ icons..."
          />
        </div>
        <div className="pce__picker-grid">
          {filtered.length === 0 && (
            <div className="pce__picker-empty" style={{ gridColumn: '1/-1' }}>
              No icons found
            </div>
          )}
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              className={`pce__picker-icon${name === current ? ' pce__picker-icon--active' : ''}`}
              onClick={() => { onSelect(name); onClose(); }}
              title={name}
            >
              <BoxIcon name={name} size={18} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Single Card Editor ──────────────────────────── */

function CardItem({
  card,
  fields,
  onUpdate,
  onRemove,
  disabled,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragOver,
}: {
  card: PromptCard;
  fields: PromptCardField[];
  onUpdate: (id: string, key: string, value: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragOver: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const iconBtnRef = useRef<HTMLButtonElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const openPicker = () => {
    if (iconBtnRef.current) {
      setAnchorRect(iconBtnRef.current.getBoundingClientRect());
    }
    setPickerOpen(true);
  };

  return (
    <div
      className={`pce__card${isDragOver ? ' pce__card--drag-over' : ''}`}
      draggable={!disabled}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(index);
      }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDragEnd={onDragEnd}
    >
      <div className="pce__card-top">
        {/* Drag handle */}
        <span className="pce__drag-handle" title="Drag to reorder">
          <DragIcon />
        </span>

        {/* Icon button */}
        <button
          ref={iconBtnRef}
          type="button"
          className="pce__icon-btn"
          onClick={openPicker}
          disabled={disabled}
          title="Choose icon"
          style={card.color ? { color: card.color, borderColor: card.color + '40' } : undefined}
        >
          {card.icon ? (
            <BoxIcon name={card.icon} size={20} color={card.color || 'currentColor'} />
          ) : (
            <PlusIcon />
          )}
        </button>

        {/* Text fields */}
        <div className="pce__fields">
          {fields.map((f) =>
            f.type === 'textarea' ? (
              <textarea
                key={f.key}
                className="pce__textarea"
                value={card[f.key] ?? ''}
                placeholder={f.placeholder || f.label}
                disabled={disabled}
                onChange={(e) => onUpdate(card.id, f.key, e.target.value)}
              />
            ) : (
              <input
                key={f.key}
                type="text"
                className={`pce__input${f.key === 'title' || f.key === 'label' ? ' pce__input--title' : ''}`}
                value={card[f.key] ?? ''}
                placeholder={f.placeholder || f.label}
                disabled={disabled}
                onChange={(e) => onUpdate(card.id, f.key, e.target.value)}
              />
            ),
          )}
        </div>

        {/* Remove */}
        <div className="pce__card-actions">
          <button
            type="button"
            className="pce__remove"
            onClick={() => onRemove(card.id)}
            disabled={disabled}
            aria-label="Remove"
          >
            <RemoveIcon />
          </button>
        </div>
      </div>

      {/* Color picker row */}
      <div className="pce__color-row">
        <input
          type="color"
          className="pce__color-picker"
          value={card.color || '#6366f1'}
          disabled={disabled}
          onChange={(e) => onUpdate(card.id, 'color', e.target.value)}
        />
        <span className="pce__color-label">Icon color — affects hover border</span>
      </div>

      {/* Icon picker popover */}
      {pickerOpen && (
        <IconPicker
          current={card.icon ?? ''}
          onSelect={(name) => onUpdate(card.id, 'icon', name)}
          onClose={() => setPickerOpen(false)}
          anchorRect={anchorRect}
        />
      )}
    </div>
  );
}

/* ── Preview Components ──────────────────────────── */

function PromptsPreview({ cards }: { cards: PromptCard[] }) {
  if (cards.length === 0) return null;
  return (
    <div className="pce__preview-section">
      <div className="pce__preview-label">Preview</div>
      <div className="pce__preview-grid">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            className="pce__preview-card"
            style={c.color ? { '--card-accent': c.color } as React.CSSProperties : undefined}
          >
            {c.icon && (
              <span className="pce__preview-card-icon">
                <BoxIcon name={c.icon} size={18} color={c.color || 'var(--color-accent)'} />
              </span>
            )}
            <span className="pce__preview-card-title">{c.title || 'Untitled'}</span>
            {c.description && <span className="pce__preview-card-desc">{c.description}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionsPreview({ cards }: { cards: PromptCard[] }) {
  if (cards.length === 0) return null;
  return (
    <div className="pce__preview-section">
      <div className="pce__preview-label">Preview</div>
      <div className="pce__preview-chips">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            className="pce__preview-chip"
            style={c.color ? { '--chip-accent': c.color } as React.CSSProperties : undefined}
          >
            {c.icon && (
              <span className="pce__preview-chip-icon">
                <BoxIcon name={c.icon} size={14} color={c.color || 'currentColor'} />
              </span>
            )}
            <span className="pce__preview-chip-label">{c.label || c.message || c.title || 'Untitled'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Editor ─────────────────────────────────── */

export const PromptCardEditor = ({
  value,
  onChange,
  fields,
  previewMode,
  disabled,
}: PromptCardEditorProps) => {
  const cards = value ?? [];
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const addCard = useCallback(() => {
    const newCard: PromptCard = { id: crypto.randomUUID(), icon: '', color: '#6366f1' };
    for (const f of fields) newCard[f.key] = '';
    onChange([...cards, newCard]);
  }, [cards, fields, onChange]);

  const removeCard = useCallback((id: string) => {
    onChange(cards.filter((c) => c.id !== id));
  }, [cards, onChange]);

  const updateCard = useCallback((id: string, key: string, val: string) => {
    onChange(cards.map((c) => (c.id === id ? { ...c, [key]: val } : c)));
  }, [cards, onChange]);

  const handleDragStart = useCallback((index: number) => {
    setDragFrom(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOver(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
      const next = [...cards];
      const [moved] = next.splice(dragFrom, 1);
      next.splice(dragOver, 0, moved);
      onChange(next);
    }
    setDragFrom(null);
    setDragOver(null);
  }, [cards, dragFrom, dragOver, onChange]);

  return (
    <div className="pce">
      <div className="pce__list">
        {cards.map((card, i) => (
          <CardItem
            key={card.id}
            card={card}
            fields={fields}
            onUpdate={updateCard}
            onRemove={removeCard}
            disabled={disabled}
            index={i}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragOver={dragOver === i && dragFrom !== i}
          />
        ))}
      </div>

      <button
        type="button"
        className="pce__add"
        onClick={addCard}
        disabled={disabled}
      >
        <PlusIcon /> Add item
      </button>

      {previewMode === 'prompts' ? (
        <PromptsPreview cards={cards} />
      ) : (
        <ActionsPreview cards={cards} />
      )}
    </div>
  );
};
