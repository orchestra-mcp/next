import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders as an SVG element', () => {
    const { container } = render(
      <Icon>
        <path d="M0 0" />
      </Icon>
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName).toBe('svg');
  });

  it('renders children SVG content', () => {
    const { container } = render(
      <Icon>
        <circle cx="12" cy="12" r="10" />
      </Icon>
    );
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('uses default viewBox of 0 0 24 24', () => {
    const { container } = render(
      <Icon>
        <path d="M0 0" />
      </Icon>
    );
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('accepts custom viewBox override', () => {
    const { container } = render(
      <Icon viewBox="0 0 32 32">
        <path d="M0 0" />
      </Icon>
    );
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 32 32');
  });

  it('applies custom size as width and height', () => {
    const { container } = render(
      <Icon size={48}>
        <path d="M0 0" />
      </Icon>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('defaults to size 24', () => {
    const { container } = render(
      <Icon>
        <path d="M0 0" />
      </Icon>
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('applies custom color via inline style', () => {
    const { container } = render(
      <Icon color="#ff0000">
        <path d="M0 0" />
      </Icon>
    );
    expect(container.querySelector('svg')).toHaveStyle({ color: '#ff0000' });
  });

  it('applies custom className', () => {
    const { container } = render(
      <Icon className="my-custom-class">
        <path d="M0 0" />
      </Icon>
    );
    expect(container.querySelector('svg')).toHaveClass('my-custom-class');
  });

  it('sets fill to none', () => {
    const { container } = render(
      <Icon>
        <path d="M0 0" />
      </Icon>
    );
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none');
  });
});
