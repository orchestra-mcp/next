import { render } from '@testing-library/react';
import { FileIcon } from './File';
import { SettingsIcon } from './Settings';
import { SearchIcon } from './Search';
import { AddIcon } from './Add';
import { CloseIcon } from './Close';

const icons = [
  { name: 'FileIcon', Component: FileIcon },
  { name: 'SettingsIcon', Component: SettingsIcon },
  { name: 'SearchIcon', Component: SearchIcon },
  { name: 'AddIcon', Component: AddIcon },
  { name: 'CloseIcon', Component: CloseIcon },
];

describe('Code icons', () => {
  it.each(icons)('$name renders as SVG', ({ Component }) => {
    const { container } = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.tagName).toBe('svg');
  });

  it.each(icons)('$name accepts size prop', ({ Component }) => {
    const { container } = render(<Component size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it.each(icons)('$name accepts className prop', ({ Component }) => {
    const { container } = render(<Component className="test-cls" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('test-cls');
  });

  it.each(icons)('$name has default viewBox 0 0 24 24', ({ Component }) => {
    const { container } = render(<Component />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });
});
