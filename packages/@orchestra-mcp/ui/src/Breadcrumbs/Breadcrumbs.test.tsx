import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from './Breadcrumbs';

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget' },
];

describe('Breadcrumbs', () => {
  it('renders all breadcrumb items', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
  });

  it('renders a nav with aria-label', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('marks the last item as current page', () => {
    render(<Breadcrumbs items={items} />);
    const current = screen.getByText('Widget');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('breadcrumbs__current');
  });

  it('renders non-last items as links', () => {
    render(<Breadcrumbs items={items} />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveClass('breadcrumbs__item');
  });

  it('last item is not a link', () => {
    render(<Breadcrumbs items={items} />);
    const current = screen.getByText('Widget');
    expect(current.tagName).toBe('SPAN');
    expect(current.closest('a')).toBeNull();
  });

  it('renders default separator', () => {
    render(<Breadcrumbs items={items} />);
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });

  it('renders custom separator', () => {
    render(<Breadcrumbs items={items} separator=">" />);
    const separators = screen.getAllByText('>');
    expect(separators).toHaveLength(2);
  });

  it('truncates items with maxItems and shows ellipsis', () => {
    const longItems: BreadcrumbItem[] = [
      { label: 'Root', href: '/' },
      { label: 'Level 1', href: '/l1' },
      { label: 'Level 2', href: '/l2' },
      { label: 'Level 3', href: '/l3' },
      { label: 'Current' },
    ];
    render(<Breadcrumbs items={longItems} maxItems={3} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.queryByText('Level 1')).toBeNull();
    expect(screen.queryByText('Level 2')).toBeNull();
  });

  it('fires onNavigate with correct item and index', () => {
    const handleNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={handleNavigate} />);
    const productsLink = screen.getByText('Products');
    productsLink.click();
    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledWith(items[1], 1);
  });

  it('returns null for empty items', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders single item as current (not a link)', () => {
    render(<Breadcrumbs items={[{ label: 'Only Page' }]} />);
    const only = screen.getByText('Only Page');
    expect(only).toHaveAttribute('aria-current', 'page');
    expect(only.closest('a')).toBeNull();
  });

  it('renders icons alongside labels', () => {
    const iconItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: <span data-testid="home-icon">H</span> },
      { label: 'Page' },
    ];
    render(<Breadcrumbs items={iconItems} />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Breadcrumbs items={items} className="my-crumbs" />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('breadcrumbs', 'my-crumbs');
  });

  it('does not truncate when maxItems exceeds item count', () => {
    render(<Breadcrumbs items={items} maxItems={10} />);
    expect(screen.queryByText('...')).toBeNull();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
  });
});
