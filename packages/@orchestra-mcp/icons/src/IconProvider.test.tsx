import { render, screen } from '@testing-library/react';
import { IconProvider, useIconResolvers } from './IconProvider';
import type { IconPack } from './IconProvider';

function TestConsumer() {
  const { resolvers } = useIconResolvers();
  return <div data-testid="count">{resolvers.size}</div>;
}

describe('IconProvider', () => {
  it('provides empty resolvers by default', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('registers icon packs', () => {
    const pack1: IconPack = { prefix: 'a', resolve: () => null };
    const pack2: IconPack = { prefix: 'b', resolve: () => null };

    render(
      <IconProvider packs={[pack1, pack2]}>
        <TestConsumer />
      </IconProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('last pack wins on prefix collision', () => {
    const pack1: IconPack = {
      prefix: 'same',
      resolve: () => <span data-testid="first" />,
    };
    const pack2: IconPack = {
      prefix: 'same',
      resolve: () => <span data-testid="second" />,
    };

    function ResolverTest() {
      const { resolvers } = useIconResolvers();
      const resolver = resolvers.get('same');
      if (!resolver) return null;
      return resolver('test', {});
    }

    render(
      <IconProvider packs={[pack1, pack2]}>
        <ResolverTest />
      </IconProvider>
    );
    expect(screen.getByTestId('second')).toBeInTheDocument();
  });

  it('returns default empty resolvers outside provider', () => {
    render(<TestConsumer />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('handles empty packs array', () => {
    render(
      <IconProvider packs={[]}>
        <TestConsumer />
      </IconProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('registers pack even when resolve returns null', () => {
    const pack: IconPack = { prefix: 'nil', resolve: () => null };
    render(
      <IconProvider packs={[pack]}>
        <TestConsumer />
      </IconProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
