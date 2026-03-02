import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders text variant by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton', 'skeleton--text');
  });

  it('renders circular variant with border-radius class', () => {
    const { container } = render(<Skeleton variant="circular" width={40} />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton--circular');
  });

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton--rectangular');
  });

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width={200} height={40} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('40px');
  });

  it('accepts string width and height', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('2rem');
  });

  it('renders correct number of lines', () => {
    render(<Skeleton lines={4} />);
    const lines = screen.getAllByTestId('skeleton-line');
    expect(lines).toHaveLength(4);
  });

  it('renders last line shorter at 60% width', () => {
    render(<Skeleton lines={3} />);
    const lines = screen.getAllByTestId('skeleton-line');
    const lastLine = lines[lines.length - 1];
    expect(lastLine.style.width).toBe('60%');
  });

  it('renders non-last lines at 100% by default', () => {
    render(<Skeleton lines={3} />);
    const lines = screen.getAllByTestId('skeleton-line');
    expect(lines[0].style.width).toBe('100%');
    expect(lines[1].style.width).toBe('100%');
  });

  it('has animated class when animate is true (default)', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton--animated');
  });

  it('has no animated class when animate is false', () => {
    const { container } = render(<Skeleton animate={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toHaveClass('skeleton--animated');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="my-custom" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('my-custom');
  });

  it('applies gap between lines', () => {
    const { container } = render(<Skeleton lines={3} gap={12} />);
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass('skeleton-group');
    expect(group.style.gap).toBe('12px');
  });

  it('circular variant sets equal width and height', () => {
    const { container } = render(<Skeleton variant="circular" width={48} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });
});
