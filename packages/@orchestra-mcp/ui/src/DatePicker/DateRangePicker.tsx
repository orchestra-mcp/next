"use client";

import { useEffect, useRef, useState } from 'react';
import './DatePicker.css';
import { formatRange, formatWithPattern, getMonthName, isSameDay } from './helpers';
import { CalendarGrid } from './CalendarGrid';
import type { DateRange } from './DatePickerTypes';

export interface DateRangePickerProps {
  value?: DateRange;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (range: DateRange) => void;
  /** Display format for each date. Default: "MMM D, YYYY" */
  format?: string;
  className?: string;
}

export const DateRangePicker = ({
  value,
  placeholder = 'Select date range',
  disabled = false,
  minDate,
  maxDate,
  onChange,
  format = 'MMM D, YYYY',
  className,
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const initial = value?.startDate ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState<Date | null>(value?.startDate ?? null);
  const [tempEnd, setTempEnd] = useState<Date | null>(value?.endDate ?? null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
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

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const handleSelect = (date: Date) => {
    if (selecting === 'start') {
      setTempStart(date);
      setTempEnd(null);
      setSelecting('end');
    } else {
      // Ensure start < end
      let start = tempStart!;
      let end = date;
      if (end < start) { [start, end] = [end, start]; }
      setTempStart(start);
      setTempEnd(end);
      setSelecting('start');
      onChange?.({ startDate: start, endDate: end });
      setOpen(false);
    }
  };

  const displayValue = formatRange(
    value?.startDate ?? tempStart,
    value?.endDate ?? tempEnd,
    format,
  );

  return (
    <div className={['datepicker datepicker--range', className].filter(Boolean).join(' ')} ref={wrapperRef}>
      <input
        type="text"
        className="datepicker__input"
        readOnly
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        data-testid="daterange-input"
      />
      {open && (
        <div className="datepicker__dropdown datepicker__dropdown--range" data-testid="daterange-dropdown">
          <div className="datepicker__header">
            <button type="button" className="datepicker__nav-btn" onClick={handlePrev} aria-label="Previous month">&#8249;</button>
            <span className="datepicker__header-title" data-testid="daterange-title">
              {getMonthName(viewMonth)} {viewYear}
            </span>
            <button type="button" className="datepicker__nav-btn" onClick={handleNext} aria-label="Next month">&#8250;</button>
          </div>
          <div className="datepicker__range-hint" data-testid="daterange-hint">
            {selecting === 'start' ? 'Select start date' : 'Select end date'}
          </div>
          <CalendarGrid
            viewYear={viewYear}
            viewMonth={viewMonth}
            today={today}
            minDate={minDate}
            maxDate={maxDate}
            rangeStart={tempStart}
            rangeEnd={tempEnd}
            hoverDate={selecting === 'end' ? hoverDate : null}
            onSelect={handleSelect}
            onHover={setHoverDate}
          />
        </div>
      )}
    </div>
  );
};
