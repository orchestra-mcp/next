"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimePickerProps {
  value: TimeValue;
  showSeconds?: boolean;
  /** Use 12-hour clock with AM/PM toggle. Default: false (24h) */
  use12Hour?: boolean;
  onChange: (time: TimeValue) => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const pad = (n: number) => String(n).padStart(2, '0');

export const TimePicker = ({ value, showSeconds, use12Hour, onChange }: TimePickerProps) => {
  const is12 = use12Hour ?? false;
  const isPM = value.hours >= 12;
  const display12 = value.hours === 0 ? 12 : value.hours > 12 ? value.hours - 12 : value.hours;

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const commitRef = useRef<(() => void) | null>(null);

  const displayHours = is12 ? pad(display12) : pad(value.hours);

  const commitValue = useCallback(
    (field: keyof TimeValue, raw: string) => {
      const n = parseInt(raw, 10);
      if (isNaN(n)) return;
      if (field === 'hours' && is12) {
        const h12 = clamp(n, 1, 12);
        const h24 = isPM ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12);
        onChange({ ...value, hours: h24 });
      } else if (field === 'hours') {
        onChange({ ...value, hours: clamp(n, 0, 23) });
      } else {
        onChange({ ...value, [field]: clamp(n, 0, 59) });
      }
    },
    [value, onChange, is12, isPM],
  );

  const handleFocus = (field: string, currentDisplay: string) => {
    setEditingField(field);
    setEditValue(currentDisplay);
  };

  const handleBlur = (field: keyof TimeValue) => {
    commitValue(field, editValue);
    setEditingField(null);
    setEditValue('');
  };

  useEffect(() => {
    commitRef.current = () => {
      if (editingField) {
        commitValue(editingField as keyof TimeValue, editValue);
        setEditingField(null);
        setEditValue('');
      }
    };
  }, [editingField, editValue, commitValue]);

  const handleKeyDown = (e: React.KeyboardEvent, field: keyof TimeValue) => {
    if (e.key === 'Enter') {
      commitValue(field, editValue);
      setEditingField(null);
      setEditValue('');
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 2);
    setEditValue(cleaned);
  };

  const toggleAmPm = useCallback(() => {
    const newHours = isPM ? value.hours - 12 : value.hours + 12;
    onChange({ ...value, hours: clamp(newHours, 0, 23) });
  }, [value, onChange, isPM]);

  return (
    <div className="datepicker__time-panel" data-testid="timepicker-panel">
      <span className="datepicker__time-label">Time</span>
      <div className="datepicker__time-fields">
        <input
          type="text"
          className="datepicker__time-input"
          value={editingField === 'hours' ? editValue : displayHours}
          onFocus={() => handleFocus('hours', displayHours)}
          onBlur={() => handleBlur('hours')}
          onKeyDown={(e) => handleKeyDown(e, 'hours')}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Hours"
          maxLength={2}
        />
        <span className="datepicker__time-sep">:</span>
        <input
          type="text"
          className="datepicker__time-input"
          value={editingField === 'minutes' ? editValue : pad(value.minutes)}
          onFocus={() => handleFocus('minutes', pad(value.minutes))}
          onBlur={() => handleBlur('minutes')}
          onKeyDown={(e) => handleKeyDown(e, 'minutes')}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Minutes"
          maxLength={2}
        />
        {showSeconds && (
          <>
            <span className="datepicker__time-sep">:</span>
            <input
              type="text"
              className="datepicker__time-input"
              value={editingField === 'seconds' ? editValue : pad(value.seconds)}
              onFocus={() => handleFocus('seconds', pad(value.seconds))}
              onBlur={() => handleBlur('seconds')}
              onKeyDown={(e) => handleKeyDown(e, 'seconds')}
              onChange={(e) => handleChange(e.target.value)}
              aria-label="Seconds"
              maxLength={2}
            />
          </>
        )}
        {is12 && (
          <button
            type="button"
            className="datepicker__ampm-btn"
            onClick={toggleAmPm}
            aria-label="Toggle AM/PM"
            data-testid="ampm-toggle"
          >
            {isPM ? 'PM' : 'AM'}
          </button>
        )}
      </div>
    </div>
  );
};
