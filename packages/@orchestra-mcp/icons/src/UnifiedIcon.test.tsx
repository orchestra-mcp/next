import { render } from '@testing-library/react';
import { UnifiedIcon } from './UnifiedIcon';
import { IconProvider } from './IconProvider';
import type { IconPack } from './IconProvider';

const mockPack: IconPack = {
  prefix: 'test',
  resolve: (name, props) => {
    if (name === 'check') {
      return (
        <svg data-testid="test-icon" width={props.size} height={props.size}>
          <path d="M0 0" />
        </svg>
      );
    }
    return null;
  },
};

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <IconProvider packs={[mockPack]}>
      {ui}
    </IconProvider>
  );
}

describe('UnifiedIcon', () => {
  it('renders boxicon by name (bx- prefix)', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="bx-home" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'bx-home');
  });

  it('renders boxicon solid (bxs- prefix)', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="bxs-star" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders boxicon logo (bxl- prefix)', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="bxl-github" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('resolves pack-prefixed icon (test:check)', () => {
    const { getByTestId } = renderWithProvider(<UnifiedIcon name="test:check" />);
    expect(getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders null for unknown pack prefix', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="unknown:icon" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders null for completely unknown icon', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="nonexistent" />);
    expect(container.innerHTML).toBe('');
  });

  it('passes size prop through to resolved icons', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="bx-home" size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
  });

  it('passes color prop through to resolved icons', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="bx-home" color="#ff0000" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ color: '#ff0000' });
  });

  it('renders null for empty string name', () => {
    const { container } = renderWithProvider(<UnifiedIcon name="" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders null for name with only colon prefix', () => {
    const { container } = renderWithProvider(<UnifiedIcon name=":icon" />);
    expect(container.innerHTML).toBe('');
  });

  it('forwards className to resolved pack icon', () => {
    const classPack = {
      prefix: 'cls',
      resolve: (_name: string, props: { className?: string }) => (
        <svg data-testid="cls-icon" className={props.className}>
          <path d="M0 0" />
        </svg>
      ),
    };
    const { getByTestId } = render(
      <IconProvider packs={[classPack]}>
        <UnifiedIcon name="cls:test" className="forwarded-class" />
      </IconProvider>
    );
    expect(getByTestId('cls-icon')).toHaveClass('forwarded-class');
  });
});
