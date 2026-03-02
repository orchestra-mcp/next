import { fireEvent, render, screen } from '@testing-library/react';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('renders input with placeholder', () => {
    render(<DatePicker placeholder="Pick a date" />);
    const input = screen.getByTestId('datepicker-input');
    expect(input).toHaveAttribute('placeholder', 'Pick a date');
  });

  it('renders default placeholder when none provided', () => {
    render(<DatePicker />);
    const input = screen.getByTestId('datepicker-input');
    expect(input).toHaveAttribute('placeholder', 'Select date');
  });

  it('displays formatted value when date is provided', () => {
    const date = new Date(2025, 5, 15); // Jun 15, 2025
    render(<DatePicker value={date} />);
    const input = screen.getByTestId('datepicker-input');
    expect(input).toHaveValue('Jun 15, 2025');
  });

  it('opens calendar dropdown on click', () => {
    render(<DatePicker />);
    expect(screen.queryByTestId('datepicker-dropdown')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('datepicker-dropdown')).toBeInTheDocument();
  });

  it('displays current month and year in header', () => {
    const date = new Date(2025, 3, 10); // April 2025
    render(<DatePicker value={date} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('datepicker-title')).toHaveTextContent('April 2025');
  });

  it('navigates to next month', () => {
    const date = new Date(2025, 0, 1);
    render(<DatePicker value={date} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByTestId('datepicker-title')).toHaveTextContent('February 2025');
  });

  it('navigates to previous month', () => {
    const date = new Date(2025, 5, 1);
    render(<DatePicker value={date} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByTestId('datepicker-title')).toHaveTextContent('May 2025');
  });

  it('wraps year when navigating past December', () => {
    const date = new Date(2025, 11, 1);
    render(<DatePicker value={date} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByTestId('datepicker-title')).toHaveTextContent('January 2026');
  });

  it('wraps year when navigating before January', () => {
    const date = new Date(2025, 0, 1);
    render(<DatePicker value={date} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByTestId('datepicker-title')).toHaveTextContent('December 2024');
  });

  it('selects a date, closes dropdown, and fires onChange', () => {
    const onChange = vi.fn();
    const date = new Date(2025, 5, 1);
    render(<DatePicker value={date} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByTestId('day-15-current'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const selected = onChange.mock.calls[0][0] as Date;
    expect(selected.getFullYear()).toBe(2025);
    expect(selected.getMonth()).toBe(5);
    expect(selected.getDate()).toBe(15);
    expect(screen.queryByTestId('datepicker-dropdown')).not.toBeInTheDocument();
  });

  it('highlights today with the --today class', () => {
    const today = new Date();
    render(<DatePicker />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    const todayBtn = screen.getByTestId(`day-${today.getDate()}-current`);
    expect(todayBtn).toHaveClass('datepicker__day--today');
  });

  it('highlights selected date with the --selected class', () => {
    const date = new Date(2025, 5, 20);
    render(<DatePicker value={date} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    const selectedBtn = screen.getByTestId('day-20-current');
    expect(selectedBtn).toHaveClass('datepicker__day--selected');
  });

  it('disables dates before minDate', () => {
    const minDate = new Date(2025, 5, 10);
    const value = new Date(2025, 5, 15);
    render(<DatePicker value={value} minDate={minDate} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    const day5 = screen.getByTestId('day-5-current');
    expect(day5).toBeDisabled();
    expect(day5).toHaveClass('datepicker__day--disabled');
  });

  it('disables dates after maxDate', () => {
    const maxDate = new Date(2025, 5, 20);
    const value = new Date(2025, 5, 15);
    render(<DatePicker value={value} maxDate={maxDate} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    const day25 = screen.getByTestId('day-25-current');
    expect(day25).toBeDisabled();
    expect(day25).toHaveClass('datepicker__day--disabled');
  });

  it('does not open when disabled', () => {
    render(<DatePicker disabled />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.queryByTestId('datepicker-dropdown')).not.toBeInTheDocument();
  });

  it('closes dropdown on click outside', () => {
    render(
      <div>
        <DatePicker />
        <button data-testid="outside">Outside</button>
      </div>,
    );
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('datepicker-dropdown')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('datepicker-dropdown')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<DatePicker className="my-custom" />);
    expect(container.firstChild).toHaveClass('datepicker', 'my-custom');
  });

  // ── Custom format tests ────────────────────────

  it('displays custom format string', () => {
    const date = new Date(2025, 5, 15);
    render(<DatePicker value={date} format="DD/MM/YYYY" />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('15/06/2025');
  });

  it('displays ISO format', () => {
    const date = new Date(2025, 0, 5);
    render(<DatePicker value={date} format="YYYY-MM-DD" />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('2025-01-05');
  });

  // ── Time picker tests (24h) ────────────────────

  it('shows time panel when showTime is true', () => {
    render(<DatePicker showTime />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('timepicker-panel')).toBeInTheDocument();
  });

  it('does not close on date select when showTime is true', () => {
    const date = new Date(2025, 5, 1);
    render(<DatePicker value={date} showTime onChange={() => {}} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByTestId('day-15-current'));
    expect(screen.getByTestId('datepicker-dropdown')).toBeInTheDocument();
  });

  it('shows seconds input when showSeconds is true', () => {
    render(<DatePicker showTime showSeconds />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
  });

  it('does not show seconds by default', () => {
    render(<DatePicker showTime />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.queryByLabelText('Seconds')).not.toBeInTheDocument();
  });

  // ── 12-hour mode tests ─────────────────────────

  it('shows AM/PM toggle when use12Hour is true', () => {
    render(<DatePicker showTime use12Hour />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('ampm-toggle')).toBeInTheDocument();
  });

  it('does not show AM/PM toggle when use12Hour is false', () => {
    render(<DatePicker showTime />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.queryByTestId('ampm-toggle')).not.toBeInTheDocument();
  });

  it('displays 12-hour time in AM', () => {
    const date = new Date(2025, 5, 15, 9, 30);
    render(<DatePicker value={date} showTime use12Hour />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Jun 15, 2025 09:30 AM');
  });

  it('displays 12-hour time in PM', () => {
    const date = new Date(2025, 5, 15, 14, 30);
    render(<DatePicker value={date} showTime use12Hour />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Jun 15, 2025 02:30 PM');
  });

  it('displays 12:00 PM for noon', () => {
    const date = new Date(2025, 5, 15, 12, 0);
    render(<DatePicker value={date} showTime use12Hour />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Jun 15, 2025 12:00 PM');
  });

  it('displays 12:00 AM for midnight', () => {
    const date = new Date(2025, 5, 15, 0, 0);
    render(<DatePicker value={date} showTime use12Hour />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Jun 15, 2025 12:00 AM');
  });

  it('toggles AM to PM', () => {
    const onChange = vi.fn();
    const date = new Date(2025, 5, 15, 9, 0);
    render(<DatePicker value={date} showTime use12Hour onChange={onChange} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByTestId('ampm-toggle'));
    expect(onChange).toHaveBeenCalled();
    const newDate = onChange.mock.calls[0][0] as Date;
    expect(newDate.getHours()).toBe(21); // 9 AM + 12 = 21
  });

  it('toggles PM to AM', () => {
    const onChange = vi.fn();
    const date = new Date(2025, 5, 15, 15, 0);
    render(<DatePicker value={date} showTime use12Hour onChange={onChange} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByTestId('ampm-toggle'));
    expect(onChange).toHaveBeenCalled();
    const newDate = onChange.mock.calls[0][0] as Date;
    expect(newDate.getHours()).toBe(3); // 3 PM - 12 = 3
  });

  // ── Timezone tests ─────────────────────────────

  it('shows timezone panel when showTimezone is true', () => {
    render(<DatePicker showTimezone />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('timezone-panel')).toBeInTheDocument();
  });

  it('shows timezone trigger button with default UTC', () => {
    render(<DatePicker showTimezone />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.getByTestId('timezone-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('timezone-trigger')).toHaveTextContent('UTC');
  });

  it('opens timezone dropdown on trigger click', () => {
    render(<DatePicker showTimezone />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    expect(screen.queryByTestId('timezone-dropdown')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('timezone-trigger'));
    expect(screen.getByTestId('timezone-dropdown')).toBeInTheDocument();
  });

  it('selects a timezone and closes dropdown', () => {
    const onChangeFull = vi.fn();
    const date = new Date(2025, 5, 15);
    render(<DatePicker value={date} showTimezone onChangeFull={onChangeFull} />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByTestId('timezone-trigger'));
    const options = screen.getAllByRole('option');
    fireEvent.click(options[1]); // second timezone
    expect(onChangeFull).toHaveBeenCalled();
    expect(onChangeFull.mock.calls[0][0]).toHaveProperty('timezone');
    expect(screen.queryByTestId('timezone-dropdown')).not.toBeInTheDocument();
  });

  it('filters timezones by search', () => {
    render(<DatePicker showTimezone />);
    fireEvent.click(screen.getByTestId('datepicker-input'));
    fireEvent.click(screen.getByTestId('timezone-trigger'));
    const searchInput = screen.getByLabelText('Search timezone');
    fireEvent.change(searchInput, { target: { value: 'Eastern' } });
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(1);
    expect(options[0]).toHaveTextContent('Eastern');
  });

  // ── Backward compat ────────────────────────────

  it('uses default MMM D, YYYY format when no format prop', () => {
    const date = new Date(2025, 11, 25);
    render(<DatePicker value={date} />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Dec 25, 2025');
  });

  it('uses HH:mm format when showTime is true and no format prop (24h)', () => {
    const date = new Date(2025, 5, 15, 14, 30);
    render(<DatePicker value={date} showTime />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Jun 15, 2025 14:30');
  });

  it('uses hh:mm A format when showTime + use12Hour and no format prop', () => {
    const date = new Date(2025, 5, 15, 14, 30);
    render(<DatePicker value={date} showTime use12Hour />);
    expect(screen.getByTestId('datepicker-input')).toHaveValue('Jun 15, 2025 02:30 PM');
  });
});
