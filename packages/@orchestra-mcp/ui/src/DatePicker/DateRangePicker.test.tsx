import { fireEvent, render, screen } from '@testing-library/react';
import { DateRangePicker } from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders input with placeholder', () => {
    render(<DateRangePicker placeholder="Pick range" />);
    expect(screen.getByTestId('daterange-input')).toHaveAttribute('placeholder', 'Pick range');
  });

  it('renders default placeholder when none provided', () => {
    render(<DateRangePicker />);
    expect(screen.getByTestId('daterange-input')).toHaveAttribute('placeholder', 'Select date range');
  });

  it('opens dropdown on click', () => {
    render(<DateRangePicker />);
    expect(screen.queryByTestId('daterange-dropdown')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('daterange-input'));
    expect(screen.getByTestId('daterange-dropdown')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<DateRangePicker disabled />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    expect(screen.queryByTestId('daterange-dropdown')).not.toBeInTheDocument();
  });

  it('shows "Select start date" hint initially', () => {
    render(<DateRangePicker />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    expect(screen.getByTestId('daterange-hint')).toHaveTextContent('Select start date');
  });

  it('switches to "Select end date" after first click', () => {
    render(<DateRangePicker />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    fireEvent.click(screen.getByTestId('day-10-current'));
    expect(screen.getByTestId('daterange-hint')).toHaveTextContent('Select end date');
  });

  it('fires onChange with range after two clicks', () => {
    const onChange = vi.fn();
    const value = { startDate: null, endDate: null };
    render(<DateRangePicker value={value} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    fireEvent.click(screen.getByTestId('day-10-current'));
    fireEvent.click(screen.getByTestId('day-20-current'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0];
    expect(range.startDate.getDate()).toBe(10);
    expect(range.endDate.getDate()).toBe(20);
  });

  it('auto-swaps when end is before start', () => {
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    fireEvent.click(screen.getByTestId('day-20-current'));
    fireEvent.click(screen.getByTestId('day-5-current'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0];
    expect(range.startDate.getDate()).toBe(5);
    expect(range.endDate.getDate()).toBe(20);
  });

  it('closes dropdown after selecting range', () => {
    render(<DateRangePicker />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    fireEvent.click(screen.getByTestId('day-10-current'));
    fireEvent.click(screen.getByTestId('day-20-current'));
    expect(screen.queryByTestId('daterange-dropdown')).not.toBeInTheDocument();
  });

  it('displays range value', () => {
    const value = {
      startDate: new Date(2025, 5, 10),
      endDate: new Date(2025, 5, 20),
    };
    render(<DateRangePicker value={value} />);
    expect(screen.getByTestId('daterange-input')).toHaveValue('Jun 10, 2025 — Jun 20, 2025');
  });

  it('displays custom format', () => {
    const value = {
      startDate: new Date(2025, 5, 10),
      endDate: new Date(2025, 5, 20),
    };
    render(<DateRangePicker value={value} format="DD/MM/YYYY" />);
    expect(screen.getByTestId('daterange-input')).toHaveValue('10/06/2025 — 20/06/2025');
  });

  it('navigates months', () => {
    render(<DateRangePicker />);
    fireEvent.click(screen.getByTestId('daterange-input'));
    const title = screen.getByTestId('daterange-title');
    const initialText = title.textContent;
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(title.textContent).not.toBe(initialText);
  });

  it('closes dropdown on click outside', () => {
    render(
      <div>
        <DateRangePicker />
        <button data-testid="outside">Outside</button>
      </div>,
    );
    fireEvent.click(screen.getByTestId('daterange-input'));
    expect(screen.getByTestId('daterange-dropdown')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('daterange-dropdown')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<DateRangePicker className="custom-range" />);
    expect(container.firstChild).toHaveClass('datepicker', 'datepicker--range', 'custom-range');
  });
});
