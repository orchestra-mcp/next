"use client";

import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import './TagInput.css';

export interface TagInputProps {
  /** Current tags */
  tags: string[];
  /** Called when tags change */
  onChange: (tags: string[]) => void;
  /** Autocomplete suggestions */
  suggestions?: string[];
  /** Maximum number of tags */
  maxTags?: number;
  /** Input placeholder */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Allow duplicate tags */
  allowDuplicates?: boolean;
}

export const TagInput = ({
  tags,
  onChange,
  suggestions = [],
  maxTags,
  placeholder = 'Add tag...',
  disabled = false,
  allowDuplicates = false,
}: TagInputProps) => {
  const [input, setInput] = useState('');
  const [flashTag, setFlashTag] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxReached = maxTags !== undefined && tags.length >= maxTags;

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || maxReached) return;

      if (!allowDuplicates && tags.includes(trimmed)) {
        setFlashTag(trimmed);
        setTimeout(() => setFlashTag(null), 400);
        setInput('');
        return;
      }

      onChange([...tags, trimmed]);
      setInput('');
      setShowSuggestions(false);
    },
    [tags, onChange, maxReached, allowDuplicates],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach((p) => p.trim() && addTag(p));
      return;
    }
    setInput(val);
    setShowSuggestions(val.length > 0 && suggestions.length > 0);
  };

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      (allowDuplicates || !tags.includes(s)),
  );

  const wrapperClass = [
    'tag-input',
    disabled ? 'tag-input--disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass} data-testid="tag-input">
      <div
        className="tag-input__container"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className={`tag-input__chip${flashTag === tag ? ' tag-input__chip--flash' : ''}`}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                className="tag-input__chip-remove"
                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                aria-label={`Remove ${tag}`}
              >
                x
              </button>
            )}
          </span>
        ))}
        {!maxReached ? (
          <input
            ref={inputRef}
            type="text"
            className="tag-input__field"
            value={input}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => input.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
        ) : (
          <span className="tag-input__hint">(max reached)</span>
        )}
      </div>
      {showSuggestions && filtered.length > 0 && (
        <ul className="tag-input__suggestions" role="listbox">
          {filtered.map((s) => (
            <li
              key={s}
              role="option"
              aria-selected={false}
              className="tag-input__suggestion"
              onMouseDown={() => addTag(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
