"use client";

import { useEffect, useRef, useState } from 'react';
import './DatePicker.css';
import { formatWithPattern, getMonthName } from './helpers';
import { CalendarGrid } from './CalendarGrid';
import { TimePicker } from './TimePicker';
import type { TimeValue } from './TimePicker';
import { TimezonePicker } from './TimezonePicker';
import type { DateTimeValue } from './DatePickerTypes';

export interface DatePickerProps {
  value?: Date;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  /** Display format token string. Default: "MMM D, YYYY" */
  format?: string;
  /** Show hour/minute inputs in dropdown */
  showTime?: boolean;
  /** Show seconds input (requires showTime) */
  showSeconds?: boolean;
  /** Use 12-hour clock with AM/PM toggle (requires showTime) */
  use12Hour?: boolean;
  /** Show searchable timezone selector */
  showTimezone?: boolean;
  /** Fires with full value when timezone is enabled */
  onChangeFull?: (value: DateTimeValue) => void;
}

export const DatePicker = ({
  value,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  onChange,
  className,
  format,
  showTime,
  showSeconds,
  use12Hour,
  showTimezone,
  onChangeFull,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const initialDate = value ?? today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [time, setTime] = useState<TimeValue>({
    hours: value?.getHours() ?? 0,
    minutes: value?.getMinutes() ?? 0,
    seconds: value?.getSeconds() ?? 0,
  });
  const [timezone, setTimezone] = useState('UTC');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resolveFormat = (): string => {
    if (format) return format;
    if (!showTime) return 'MMM D, YYYY';
    return use12Hour ? 'MMM D, YYYY hh:mm A' : 'MMM D, YYYY HH:mm';
  };
  const displayFormat = resolveFormat();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const buildDate = (date: Date, t: TimeValue): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.hours, t.minutes, t.seconds);
  };

  const handleSelect = (date: Date) => {
    const full = showTime ? buildDate(date, time) : date;
    onChange?.(full);
    if (showTimezone) onChangeFull?.({ date: full, timezone });
    if (!showTime && !showTimezone) setOpen(false);
  };

  const handleTimeChange = (t: TimeValue) => {
    setTime(t);
    if (value) {
      const full = buildDate(value, t);
      onChange?.(full);
      if (showTimezone) onChangeFull?.({ date: full, timezone });
    }
  };

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    if (value) {
      const full = showTime ? buildDate(value, time) : value;
      onChangeFull?.({ date: full, timezone: tz });
    }
  };

  const inputValue = value ? formatWithPattern(value, displayFormat) : '';

  return (
    <div className={['datepicker', className].filter(Boolean).join(' ')} ref={wrapperRef}>
      <input
        type="text"
        className="datepicker__input"
        readOnly
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        data-testid="datepicker-input"
      />
      {open && (
        <div className="datepicker__dropdown" data-testid="datepicker-dropdown">
          <div className="datepicker__header">
            <button type="button" className="datepicker__nav-btn" onClick={handlePrev} aria-label="Previous month">&#8249;</button>
            <span className="datepicker__header-title" data-testid="datepicker-title">
              {getMonthName(viewMonth)} {viewYear}
            </span>
            <button type="button" className="datepicker__nav-btn" onClick={handleNext} aria-label="Next month">&#8250;</button>
          </div>
          <CalendarGrid
            viewYear={viewYear}
            viewMonth={viewMonth}
            selectedDate={value}
            today={today}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={handleSelect}
          />
          {showTime && (
            <TimePicker value={time} showSeconds={showSeconds} use12Hour={use12Hour} onChange={handleTimeChange} />
          )}
          {showTimezone && (
            <TimezonePicker value={timezone} onChange={handleTimezoneChange} />
          )}
        </div>
      )}
    </div>
  );
};
