import { render } from '@testing-library/react';
import { CommandIcon } from './Command';
import { StarIcon } from './Star';
import { RaycastSearchIcon } from './Search';
import { TrashIcon } from './Trash';
import { CopyIcon } from './Copy';

const icons = [
  { name: 'CommandIcon', Component: CommandIcon },
  { name: 'StarIcon', Component: StarIcon },
  { name: 'RaycastSearchIcon', Component: RaycastSearchIcon },
  { name: 'TrashIcon', Component: TrashIcon },
  { name: 'CopyIcon', Component: CopyIcon },
];

describe('Launcher icons', () => {
  it.each(icons)('$name renders as SVG', ({ Component }) => {
    const { container } = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName).toBe('svg');
  });

  it.each(icons)('$name accepts size prop', ({ Component }) => {
    const { container } = render(<Component size={48} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it.each(icons)('$name accepts className prop', ({ Component }) => {
    const { container } = render(<Component className="launcher-cls" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('launcher-cls');
  });
});
