import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';
import type { SelectOption } from './Select';

const defaultOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Select', () => {
  it('renders all options correctly', () => {
    render(<Select options={defaultOptions} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('renders with controlled value', () => {
    render(<Select options={defaultOptions} value="banana" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('banana');
  });

  it('calls onChange with selected value', () => {
    const handleChange = vi.fn();
    render(<Select options={defaultOptions} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cherry' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('cherry');
  });

  it('renders placeholder option when provided', () => {
    render(<Select options={defaultOptions} placeholder="Pick a fruit" />);
    const placeholder = screen.getByText('Pick a fruit');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it('selects placeholder by default when no value set', () => {
    render(<Select options={defaultOptions} placeholder="Pick a fruit" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('');
  });

  it('renders disabled state', () => {
    const { container } = render(<Select options={defaultOptions} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(container.firstChild).toHaveClass('select--disabled');
  });

  it('displays error message', () => {
    const { container } = render(
      <Select options={defaultOptions} error="Selection required" />
    );
    expect(screen.getByText('Selection required')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('select--error');
  });

  it('does not display error text when no error', () => {
    render(<Select options={defaultOptions} />);
    const errorEl = document.querySelector('.select__error');
    expect(errorEl).not.toBeInTheDocument();
  });

  it('renders disabled option as not selectable', () => {
    const opts: SelectOption[] = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
    ];
    render(<Select options={opts} />);
    const disabledOpt = screen.getByText('Option B') as HTMLOptionElement;
    expect(disabledOpt.disabled).toBe(true);
  });

  it('renders with empty options array', () => {
    render(<Select options={[]} placeholder="No options" />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    // Only the placeholder option exists
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(1);
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <Select options={defaultOptions} className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('select', 'my-custom-class');
  });

  it('renders chevron indicator', () => {
    const { container } = render(<Select options={defaultOptions} />);
    const chevron = container.querySelector('.select__chevron');
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not call onChange when no handler provided', () => {
    render(<Select options={defaultOptions} />);
    const select = screen.getByRole('combobox');
    // Should not throw
    fireEvent.change(select, { target: { value: 'apple' } });
  });
});
