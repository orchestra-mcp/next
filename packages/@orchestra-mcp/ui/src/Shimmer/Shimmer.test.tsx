import { render, screen } from '@testing-library/react';
import { Shimmer, ShimmerGroup } from './Shimmer';

describe('Shimmer', () => {
  it('renders line shape by default', () => {
    render(<Shimmer />);
    const el = screen.getByTestId('shimmer-line');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('shimmer', 'shimmer--line', 'shimmer--animate');
  });

  it('renders circle shape', () => {
    render(<Shimmer shape="circle" />);
    const el = screen.getByTestId('shimmer-circle');
    expect(el).toHaveClass('shimmer--circle');
    expect(el).toHaveStyle({ width: '48px', height: '48px', borderRadius: '50%' });
  });

  it('renders rect shape', () => {
    render(<Shimmer shape="rect" />);
    const el = screen.getByTestId('shimmer-rect');
    expect(el).toHaveClass('shimmer--rect');
    expect(el).toHaveStyle({ height: '100px' });
  });

  it('renders card shape', () => {
    render(<Shimmer shape="card" />);
    const el = screen.getByTestId('shimmer-card');
    expect(el).toHaveClass('shimmer--card');
    expect(el).toHaveStyle({ height: '200px', borderRadius: '8px' });
  });

  it('applies custom width and height', () => {
    render(<Shimmer shape="line" width="200px" height="32px" />);
    const el = screen.getByTestId('shimmer-line');
    expect(el).toHaveStyle({ width: '200px', height: '32px' });
  });

  it('applies custom borderRadius', () => {
    render(<Shimmer shape="rect" borderRadius="16px" />);
    const el = screen.getByTestId('shimmer-rect');
    expect(el).toHaveStyle({ borderRadius: '16px' });
  });

  it('removes animation class when animate is false', () => {
    render(<Shimmer animate={false} />);
    const el = screen.getByTestId('shimmer-line');
    expect(el).not.toHaveClass('shimmer--animate');
  });

  it('has aria-hidden for accessibility', () => {
    render(<Shimmer />);
    const el = screen.getByTestId('shimmer-line');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ShimmerGroup', () => {
  it('renders children', () => {
    render(
      <ShimmerGroup>
        <Shimmer shape="line" />
        <Shimmer shape="circle" />
      </ShimmerGroup>,
    );
    expect(screen.getByTestId('shimmer-group')).toBeInTheDocument();
    expect(screen.getByTestId('shimmer-line')).toBeInTheDocument();
    expect(screen.getByTestId('shimmer-circle')).toBeInTheDocument();
  });

  it('applies custom gap', () => {
    render(
      <ShimmerGroup gap="24px">
        <Shimmer />
      </ShimmerGroup>,
    );
    expect(screen.getByTestId('shimmer-group')).toHaveStyle({ gap: '24px' });
  });
});
