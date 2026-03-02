/**
 * DatePicker helper utilities
 * Pure date arithmetic — no external libraries
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Format a Date as "MMM D, YYYY" (legacy default) */
export function formatDate(date: Date): string {
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));

/**
 * Format a Date using a token pattern string.
 * Tokens: YYYY, MMM, MM, M, DD, D, HH, H, mm, ss, A (AM/PM)
 */
export function formatWithPattern(date: Date, pattern: string): string {
  const h24 = date.getHours();
  const h12 = h24 % 12 || 12;
  const entries: [string, string][] = [
    ['YYYY', String(date.getFullYear())],
    ['MMM', SHORT_MONTHS[date.getMonth()]],
    ['MM', pad(date.getMonth() + 1)],
    ['DD', pad(date.getDate())],
    ['HH', pad(h24)],
    ['hh', pad(h12)],
    ['mm', pad(date.getMinutes())],
    ['ss', pad(date.getSeconds())],
    ['A', h24 < 12 ? 'AM' : 'PM'],
    ['M', String(date.getMonth() + 1)],
    ['D', String(date.getDate())],
    ['H', String(h24)],
    ['h', String(h12)],
  ];
  // Two-pass: replace tokens with placeholders, then substitute values
  // This prevents token values (e.g. "Dec") from being matched by later tokens ("D")
  let result = pattern;
  const values: string[] = [];
  for (const [token, value] of entries) {
    const placeholder = `\x00${values.length}\x00`;
    values.push(value);
    result = result.replaceAll(token, placeholder);
  }
  for (let i = 0; i < values.length; i++) {
    result = result.replaceAll(`\x00${i}\x00`, values[i]);
  }
  return result;
}

/** Format a date range as "start — end" using the given pattern */
export function formatRange(
  start: Date | null,
  end: Date | null,
  pattern: string,
): string {
  if (!start && !end) return '';
  if (start && !end) return formatWithPattern(start, pattern);
  if (!start && end) return formatWithPattern(end, pattern);
  return `${formatWithPattern(start!, pattern)} — ${formatWithPattern(end!, pattern)}`;
}

/** Check if a date falls strictly between start and end (for range highlight) */
export function isInRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > s && t < e;
}

/** Get the full month name */
export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}

/** Get the short weekday labels */
export function getDayLabels(): string[] {
  return DAY_LABELS;
}

/** Check if two dates are the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check if a date is outside the allowed range */
export function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    if (date < min) return true;
  }
  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    if (date > max) return true;
  }
  return false;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

/** Build a 6-row x 7-col grid of days for a given month */
export function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const days: CalendarDay[] = [];

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Fill trailing days to complete the grid (always 42 cells = 6 rows)
  while (days.length < 42) {
    const next = new Date(year, month + 1, days.length - daysInMonth - startDow + 1);
    days.push({ date: next, isCurrentMonth: false });
  }

  return days;
}
