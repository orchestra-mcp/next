import { render, screen, fireEvent } from '@testing-library/react';
import { SearchSpotlight } from './SearchSpotlight';
import type { SearchResult, SearchCategory } from './SearchSpotlight';

const mockResults: SearchResult[] = [
  { id: '1', title: 'Open File', description: 'Open a file', category: 'actions' },
  { id: '2', title: 'Settings', description: 'App settings', category: 'actions', shortcut: 'Cmd+,' },
  { id: '3', title: 'README.md', category: 'files' },
];

const mockCategories: SearchCategory[] = [
  { id: 'actions', label: 'Actions' },
  { id: 'files', label: 'Files' },
];

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSearch: vi.fn(),
  results: [] as SearchResult[],
  onSelect: vi.fn(),
};

describe('SearchSpotlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<SearchSpotlight {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Search input')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SearchSpotlight {...defaultProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('fires onSearch when typing', () => {
    render(<SearchSpotlight {...defaultProps} />);
    const input = screen.getByLabelText('Search input');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(defaultProps.onSearch).toHaveBeenCalledWith('test');
  });

  it('displays results', () => {
    render(<SearchSpotlight {...defaultProps} results={mockResults} />);
    expect(screen.getByText('Open File')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('groups results by category', () => {
    render(
      <SearchSpotlight
        {...defaultProps}
        results={mockResults}
        categories={mockCategories}
      />,
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
  });

  it('fires onSelect when clicking a result', () => {
    render(<SearchSpotlight {...defaultProps} results={mockResults} />);
    fireEvent.click(screen.getByText('Open File'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('navigates with ArrowDown and ArrowUp', () => {
    render(<SearchSpotlight {...defaultProps} results={mockResults} />);
    const input = screen.getByLabelText('Search input');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const second = screen.getByTestId('spotlight-result-2');
    expect(second).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const first = screen.getByTestId('spotlight-result-1');
    expect(first).toHaveAttribute('aria-selected', 'true');
  });

  it('selects with Enter key', () => {
    render(<SearchSpotlight {...defaultProps} results={mockResults} />);
    const input = screen.getByLabelText('Search input');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('closes with Escape key', () => {
    render(<SearchSpotlight {...defaultProps} />);
    const input = screen.getByLabelText('Search input');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<SearchSpotlight {...defaultProps} loading />);
    expect(screen.getByTestId('spotlight-loading')).toBeInTheDocument();
  });

  it('shows recent searches when query is empty', () => {
    render(
      <SearchSpotlight {...defaultProps} recentSearches={['react', 'typescript']} />,
    );
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  it('shows empty state when no results and query present', () => {
    render(<SearchSpotlight {...defaultProps} />);
    const input = screen.getByLabelText('Search input');
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('displays shortcut badges on results', () => {
    render(<SearchSpotlight {...defaultProps} results={mockResults} />);
    expect(screen.getByText('Cmd+,')).toBeInTheDocument();
  });
});
