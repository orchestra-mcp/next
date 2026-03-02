import { render, screen } from '@testing-library/react';
import { BoxIcon } from './BoxIcon';

describe('BoxIcon', () => {
  it('renders a known icon', () => {
    const { container } = render(<BoxIcon name="bx-home" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'bx-home');
  });

  it('renders with custom size', () => {
    const { container } = render(<BoxIcon name="bx-home" size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('renders with custom color', () => {
    const { container } = render(<BoxIcon name="bx-home" color="#ff0000" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ color: '#ff0000' });
  });

  it('renders with custom className', () => {
    const { container } = render(<BoxIcon name="bx-home" className="my-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('my-icon');
  });

  it('renders null for unknown icon', () => {
    const { container } = render(<BoxIcon name="bx-nonexistent-icon-xyz" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders solid icons', () => {
    const { container } = render(<BoxIcon name="bxs-star" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'bxs-star');
  });

  it('renders logo icons', () => {
    const { container } = render(<BoxIcon name="bxl-github" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'bxl-github');
  });

  it('uses fill="currentColor" for inheriting color', () => {
    const { container } = render(<BoxIcon name="bx-home" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('defaults to 24px size', () => {
    const { container } = render(<BoxIcon name="bx-home" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('has role="img" for accessibility', () => {
    const { container } = render(<BoxIcon name="bx-home" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('sets aria-label to the icon name', () => {
    const { container } = render(<BoxIcon name="bxs-heart" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', 'bxs-heart');
  });
});
