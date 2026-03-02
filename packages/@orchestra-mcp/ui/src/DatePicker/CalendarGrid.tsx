import { buildCalendarGrid, getDayLabels, isDateDisabled, isInRange, isSameDay } from './helpers';

export interface CalendarGridProps {
  viewYear: number;
  viewMonth: number;
  selectedDate?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hoverDate?: Date | null;
  today: Date;
  minDate?: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onHover?: (date: Date | null) => void;
}

export const CalendarGrid = ({
  viewYear,
  viewMonth,
  selectedDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  today,
  minDate,
  maxDate,
  onSelect,
  onHover,
}: CalendarGridProps) => {
  const days = buildCalendarGrid(viewYear, viewMonth);
  const effectiveEnd = rangeEnd ?? hoverDate;

  return (
    <div className="datepicker__grid">
      {getDayLabels().map((label) => (
        <span key={label} className="datepicker__weekday">{label}</span>
      ))}
      {days.map((day, i) => {
        const isToday = isSameDay(day.date, today);
        const isSelected = selectedDate ? isSameDay(day.date, selectedDate) : false;
        const disabled = isDateDisabled(day.date, minDate, maxDate);
        const inRange = isInRange(day.date, rangeStart ?? null, effectiveEnd ?? null);
        const isRangeStart = rangeStart ? isSameDay(day.date, rangeStart) : false;
        const isRangeEnd = effectiveEnd ? isSameDay(day.date, effectiveEnd) : false;

        const cls = [
          'datepicker__day',
          isToday ? 'datepicker__day--today' : '',
          isSelected ? 'datepicker__day--selected' : '',
          disabled ? 'datepicker__day--disabled' : '',
          !day.isCurrentMonth ? 'datepicker__day--outside' : '',
          inRange ? 'datepicker__day--in-range' : '',
          isRangeStart ? 'datepicker__day--range-start' : '',
          isRangeEnd ? 'datepicker__day--range-end' : '',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={i}
            type="button"
            className={cls}
            disabled={disabled}
            onClick={() => onSelect(day.date)}
            onMouseEnter={() => onHover?.(day.date)}
            onMouseLeave={() => onHover?.(null)}
            data-testid={`day-${day.date.getDate()}-${day.isCurrentMonth ? 'current' : 'other'}`}
          >
            {day.date.getDate()}
          </button>
        );
      })}
    </div>
  );
};
