import { render } from '@testing-library/react';
import { OrchestraLogo } from './OrchestraLogo';

describe('OrchestraLogo', () => {
  it('renders an SVG element', () => {
    const { container } = render(<OrchestraLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName).toBe('svg');
  });

  it('has viewBox 0 0 32 32', () => {
    const { container } = render(<OrchestraLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
  });

  it('accepts size prop', () => {
    const { container } = render(<OrchestraLogo size={64} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('accepts color prop', () => {
    const { container } = render(<OrchestraLogo color="#ff0000" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ color: '#ff0000' });
  });

  it('accepts className prop', () => {
    const { container } = render(<OrchestraLogo className="logo-cls" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('logo-cls');
  });
});
