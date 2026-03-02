import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click Me" />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('defaults to filled primary md', () => {
    const { container } = render(<Button label="Test" />);
    const btn = container.querySelector('button');
    expect(btn).toHaveClass('btn', 'btn--filled', 'btn--primary', 'btn--md');
  });

  it('renders all 4 variants', () => {
    const variants = ['filled', 'soft', 'outlined', 'ghost'] as const;
    variants.forEach((v) => {
      const { container } = render(<Button label={v} variant={v} />);
      expect(container.querySelector('button')).toHaveClass(`btn--${v}`);
    });
  });

  it('renders all 6 colors', () => {
    const colors = ['primary', 'success', 'warning', 'danger', 'info', 'gray'] as const;
    colors.forEach((c) => {
      const { container } = render(<Button label={c} color={c} />);
      expect(container.querySelector('button')).toHaveClass(`btn--${c}`);
    });
  });

  it('renders all 4 sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;
    sizes.forEach((s) => {
      const { container } = render(<Button label={s} size={s} />);
      expect(container.querySelector('button')).toHaveClass(`btn--${s}`);
    });
  });

  it('renders icon-only with aria-label', () => {
    render(
      <Button
        label="Add"
        iconLeft={<span data-testid="icon">+</span>}
        iconOnly
      />
    );
    const btn = screen.getByRole('button', { name: /add/i });
    expect(btn).toHaveClass('btn--icon-only');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  it('renders iconLeft and iconRight', () => {
    render(
      <Button
        label="Go"
        iconLeft={<span data-testid="left">L</span>}
        iconRight={<span data-testid="right">R</span>}
      />
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    const { container } = render(<Button label="Save" loading />);
    expect(container.querySelector('.btn__spinner')).toBeInTheDocument();
    expect(container.querySelector('button')).toBeDisabled();
  });

  it('hides icons when loading', () => {
    render(
      <Button label="Save" iconLeft={<span data-testid="icon">X</span>} loading />
    );
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('applies full-width class', () => {
    const { container } = render(<Button label="Full" fullWidth />);
    expect(container.querySelector('button')).toHaveClass('btn--full');
  });

  it('is disabled when disabled prop set', () => {
    render(<Button label="Off" disabled />);
    expect(screen.getByRole('button', { name: /off/i })).toBeDisabled();
  });

  it('calls onClick', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses custom ariaLabel over label for icon-only', () => {
    render(
      <Button
        label="Add"
        ariaLabel="Create new item"
        iconLeft={<span>+</span>}
        iconOnly
      />
    );
    expect(screen.getByRole('button', { name: /create new item/i })).toBeInTheDocument();
  });
});
