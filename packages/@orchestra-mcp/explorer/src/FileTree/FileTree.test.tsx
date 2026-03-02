import { render, screen, fireEvent } from '@testing-library/react';
import { FileTree } from './FileTree';
import type { FileNode } from './FileTree';

const sampleItems: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      { id: 'index', name: 'index.ts', type: 'file' },
      { id: 'app', name: 'App.tsx', type: 'file', modified: true },
    ],
  },
  { id: 'readme', name: 'README.md', type: 'file' },
];

describe('FileTree', () => {
  it('renders root items', () => {
    render(<FileTree items={sampleItems} />);
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('expands a folder on click', () => {
    render(<FileTree items={sampleItems} />);
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('src'));
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
  });

  it('collapses an expanded folder on click', () => {
    render(<FileTree items={sampleItems} defaultExpanded={['src']} />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    fireEvent.click(screen.getByText('src'));
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });

  it('renders nested items when folder is expanded', () => {
    render(<FileTree items={sampleItems} defaultExpanded={['src']} />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
  });

  it('fires onSelect when a node is clicked', () => {
    const handleSelect = vi.fn();
    render(<FileTree items={sampleItems} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText('README.md'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'readme', name: 'README.md' }),
    );
  });

  it('highlights the selected item', () => {
    render(<FileTree items={sampleItems} selectedId="readme" />);
    const row = screen.getByText('README.md').closest('.file-tree__row');
    expect(row).toHaveClass('file-tree__row--selected');
  });

  it('expands folders in defaultExpanded', () => {
    render(<FileTree items={sampleItems} defaultExpanded={['src']} />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('shows modified indicator', () => {
    render(<FileTree items={sampleItems} defaultExpanded={['src']} />);
    expect(screen.getByTestId('modified-app')).toBeInTheDocument();
  });

  it('renders file vs folder with different structure', () => {
    render(<FileTree items={sampleItems} />);
    // Folder has a chevron, file does not
    expect(screen.getByTestId('chevron-src')).toBeInTheDocument();
  });

  it('handles deep nesting', () => {
    const deep: FileNode[] = [
      {
        id: 'a',
        name: 'a',
        type: 'folder',
        children: [
          {
            id: 'b',
            name: 'b',
            type: 'folder',
            children: [
              {
                id: 'c',
                name: 'c',
                type: 'folder',
                children: [{ id: 'd', name: 'd.ts', type: 'file' }],
              },
            ],
          },
        ],
      },
    ];
    render(<FileTree items={deep} defaultExpanded={['a', 'b', 'c']} />);
    expect(screen.getByText('d.ts')).toBeInTheDocument();
  });

  it('renders empty folder without errors', () => {
    const items: FileNode[] = [
      { id: 'empty', name: 'empty', type: 'folder', children: [] },
    ];
    render(<FileTree items={items} defaultExpanded={['empty']} />);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('selects a node on Enter key', () => {
    const handleSelect = vi.fn();
    render(<FileTree items={sampleItems} onSelect={handleSelect} />);
    const row = screen.getByText('README.md').closest('.file-tree__row')!;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'readme' }),
    );
  });

  it('renders custom icon when provided', () => {
    const items: FileNode[] = [
      {
        id: 'f1',
        name: 'file.ts',
        type: 'file',
        icon: <span data-testid="custom-icon">IC</span>,
      },
    ];
    render(<FileTree items={items} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
