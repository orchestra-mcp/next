import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders unchecked by default', () => {
    render(<Switch />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked state when checked is true', () => {
    render(<Switch checked />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles on click', () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles off when already checked', () => {
    const handleChange = vi.fn();
    render(<Switch checked onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('toggles on Space key press', () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} onChange={handleChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles on Enter key press', () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} onChange={handleChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch disabled onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not toggle on keypress when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch disabled onChange={handleChange} />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders label text', () => {
    render(<Switch label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('toggles when label is clicked', () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} label="Notifications" onChange={handleChange} />);
    fireEvent.click(screen.getByText('Notifications'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('applies small size class', () => {
    const { container } = render(<Switch size="small" />);
    expect(container.firstChild).toHaveClass('switch--small');
  });

  it('applies medium size class by default', () => {
    const { container } = render(<Switch />);
    expect(container.firstChild).toHaveClass('switch--medium');
  });

  it('applies large size class', () => {
    const { container } = render(<Switch size="large" />);
    expect(container.firstChild).toHaveClass('switch--large');
  });

  it('applies checked class when checked', () => {
    const { container } = render(<Switch checked />);
    expect(container.firstChild).toHaveClass('switch--checked');
  });

  it('applies disabled class when disabled', () => {
    const { container } = render(<Switch disabled />);
    expect(container.firstChild).toHaveClass('switch--disabled');
  });

  it('sets tabIndex to -1 when disabled', () => {
    render(<Switch disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('tabindex', '-1');
  });

  it('sets aria-disabled when disabled', () => {
    render(<Switch disabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Switch className="my-switch" />);
    expect(container.firstChild).toHaveClass('my-switch');
  });
});
