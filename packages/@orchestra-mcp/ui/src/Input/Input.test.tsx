import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders text input with label', () => {
    render(<Input label="Username" variant="text" size="medium" />);
    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders password input', () => {
    const { container } = render(<Input label="Password" variant="password" size="medium" />);
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders email input', () => {
    render(<Input label="Email" variant="email" size="medium" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders number input', () => {
    render(<Input label="Age" variant="number" size="medium" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('renders search input', () => {
    render(<Input label="Search" variant="search" size="medium" />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('type', 'search');
  });

  it('renders small input', () => {
    render(<Input label="Small Input" variant="text" size="small" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--small');
  });

  it('renders medium input', () => {
    render(<Input label="Medium Input" variant="text" size="medium" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--medium');
  });

  it('renders large input', () => {
    render(<Input label="Large Input" variant="text" size="large" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--large');
  });

  it('renders disabled input', () => {
    render(<Input label="Disabled Input" variant="text" size="medium" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders error state with error message', () => {
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        error="Username is required"
      />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--error');
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
  });

  it('renders helper text when no error', () => {
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        helperText="Enter your username"
      />
    );
    expect(screen.getByText(/enter your username/i)).toBeInTheDocument();
  });

  it('hides helper text when error is present', () => {
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        error="Username is required"
        helperText="Enter your username"
      />
    );
    expect(screen.queryByText(/enter your username/i)).not.toBeInTheDocument();
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
  });

  it('calls onChange handler when value changes', () => {
    const handleChange = vi.fn();
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        onChange={handleChange}
      />
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'john_doe' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('john_doe');
  });

  it('calls onFocus handler when input is focused', () => {
    const handleFocus = vi.fn();
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        onFocus={handleFocus}
      />
    );
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur handler when input loses focus', () => {
    const handleBlur = vi.fn();
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        onBlur={handleBlur}
      />
    );
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('renders with placeholder text', () => {
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        placeholder="Enter username"
      />
    );
    const input = screen.getByPlaceholderText(/enter username/i);
    expect(input).toBeInTheDocument();
  });

  it('renders with controlled value', () => {
    render(
      <Input
        label="Username"
        variant="text"
        size="medium"
        value="john_doe"
      />
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('john_doe');
  });

  it('applies correct CSS classes for base input', () => {
    const { container } = render(
      <Input label="Test" variant="text" size="medium" />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('input', 'input--medium');
  });

  it('renders without label when label prop is not provided', () => {
    const { container } = render(
      <Input variant="text" size="medium" placeholder="No label" />
    );
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });
});
