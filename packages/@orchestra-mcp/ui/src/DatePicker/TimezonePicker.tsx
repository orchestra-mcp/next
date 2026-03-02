"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { TIMEZONE_OPTIONS } from './timezones';

export interface TimezonePickerProps {
  value: string;
  onChange: (tz: string) => void;
}

export const TimezonePicker = ({ value, onChange }: TimezonePickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = TIMEZONE_OPTIONS.find((tz) => tz.value === value);
  const selectedLabel = selectedOption?.label ?? value;
  const selectedDesc = selectedOption?.description ?? '';

  const filtered = useMemo(() => {
    if (!search) return TIMEZONE_OPTIONS;
    const q = search.toLowerCase();
    return TIMEZONE_OPTIONS.filter(
      (tz) => tz.label.toLowerCase().includes(q) || tz.value.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (tz: string) => {
    onChange(tz);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="datepicker__tz-panel" ref={wrapperRef} data-testid="timezone-panel">
      <span className="datepicker__time-label">Timezone</span>
      <button
        type="button"
        className="datepicker__tz-trigger"
        onClick={() => setOpen(!open)}
        data-testid="timezone-trigger"
      >
        <span className="datepicker__tz-trigger-label">{selectedLabel}</span>
        <span className="datepicker__tz-trigger-desc">{selectedDesc}</span>
        <span className="datepicker__tz-trigger-arrow">{open ? '\u25B4' : '\u25BE'}</span>
      </button>
      {open && (
        <div className="datepicker__tz-dropdown" data-testid="timezone-dropdown">
          <input
            ref={searchRef}
            type="text"
            className="datepicker__tz-search"
            placeholder="Search timezone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search timezone"
          />
          <div className="datepicker__tz-list" role="listbox">
            {filtered.map((tz) => (
              <button
                key={tz.value}
                type="button"
                className={[
                  'datepicker__tz-option',
                  tz.value === value ? 'datepicker__tz-option--active' : '',
                ].filter(Boolean).join(' ')}
                role="option"
                aria-selected={tz.value === value}
                onClick={() => handleSelect(tz.value)}
              >
                <span className="datepicker__tz-option-label">{tz.label}</span>
                <span className="datepicker__tz-option-desc">{tz.description}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="datepicker__tz-empty">No timezones found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
