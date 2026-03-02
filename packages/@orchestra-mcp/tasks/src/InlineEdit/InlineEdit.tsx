import { useState, useRef, useEffect, useCallback } from 'react';
import './InlineEdit.css';

export interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  saving?: boolean;
  className?: string;
  tag?: 'h2' | 'span' | 'p';
}

export function EditableText({ value, onSave, saving, className, tag: Tag = 'span' }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    if (draft.trim() && draft !== value) onSave(draft.trim());
    else setDraft(value);
  }, [draft, value, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  }, [save, value]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={`inline-edit__input ${className ?? ''}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <Tag
      className={`inline-edit__text ${className ?? ''}${saving ? ' inline-edit--saving' : ''}`}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
    >
      {value || <span className="inline-edit__placeholder">Click to edit...</span>}
      {saving && <span className="inline-edit__indicator" />}
    </Tag>
  );
}

export interface EditableTextareaProps {
  value: string;
  onSave: (value: string) => void;
  saving?: boolean;
  placeholder?: string;
}

export function EditableTextarea({ value, onSave, saving, placeholder }: EditableTextareaProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    if (draft !== value) onSave(draft);
    else setDraft(value);
  }, [draft, value, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  }, [value]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        className="inline-edit__textarea"
        value={draft}
        onChange={handleInput}
        onBlur={save}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <p
      className={`inline-edit__text inline-edit__text--multiline${saving ? ' inline-edit--saving' : ''}`}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
    >
      {value || <span className="inline-edit__placeholder">{placeholder ?? 'Click to add...'}</span>}
      {saving && <span className="inline-edit__indicator" />}
    </p>
  );
}

export interface EditableSelectProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onSave: (value: string) => void;
  saving?: boolean;
  placeholder?: string;
}

export function EditableSelect({ value, options, onSave, saving, placeholder }: EditableSelectProps) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => { if (editing) selectRef.current?.focus(); }, [editing]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditing(false);
    if (e.target.value !== value) onSave(e.target.value);
  }, [value, onSave]);

  const label = options.find((o) => o.value === value)?.label ?? value;

  if (editing) {
    return (
      <select
        ref={selectRef}
        className="inline-edit__select"
        value={value}
        onChange={handleChange}
        onBlur={() => setEditing(false)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <span
      className={`inline-edit__text${saving ? ' inline-edit--saving' : ''}`}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
    >
      {label || placeholder || '—'}
      {saving && <span className="inline-edit__indicator" />}
    </span>
  );
}
