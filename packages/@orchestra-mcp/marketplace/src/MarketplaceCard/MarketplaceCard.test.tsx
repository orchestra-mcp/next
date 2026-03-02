import { render, screen, fireEvent } from '@testing-library/react';
import { MarketplaceCard } from './MarketplaceCard';

const baseProps = {
  name: 'Code Formatter',
  author: 'Orchestra Team',
  description: 'Auto-format your code on save.',
  icon: 'https://example.com/icon.png',
  type: 'extension' as const,
  rating: 4,
  installCount: 1200,
};

describe('MarketplaceCard', () => {
  it('renders name, author, and description', () => {
    render(<MarketplaceCard {...baseProps} />);
    expect(screen.getByText('Code Formatter')).toBeInTheDocument();
    expect(screen.getByText('Orchestra Team')).toBeInTheDocument();
    expect(screen.getByText('Auto-format your code on save.')).toBeInTheDocument();
  });

  it('displays the type badge', () => {
    render(<MarketplaceCard {...baseProps} type="ai-tool" />);
    expect(screen.getByText('AI Tool')).toBeInTheDocument();
  });

  it('displays extension badge', () => {
    render(<MarketplaceCard {...baseProps} type="extension" />);
    expect(screen.getByText('Extension')).toBeInTheDocument();
  });

  it('displays os-service badge', () => {
    render(<MarketplaceCard {...baseProps} type="os-service" />);
    expect(screen.getByText('OS Service')).toBeInTheDocument();
  });

  it('renders star rating with correct filled count', () => {
    render(<MarketplaceCard {...baseProps} rating={3} />);
    const stars = screen.getByLabelText('3 out of 5 stars');
    expect(stars).toBeInTheDocument();
    const filled = stars.querySelectorAll('.mc-star--filled');
    const empty = stars.querySelectorAll('.mc-star--empty');
    expect(filled).toHaveLength(3);
    expect(empty).toHaveLength(2);
  });

  it('formats install count as 1.2k', () => {
    render(<MarketplaceCard {...baseProps} installCount={1200} />);
    expect(screen.getByText('1.2k installs')).toBeInTheDocument();
  });

  it('formats large install count with k+ suffix', () => {
    render(<MarketplaceCard {...baseProps} installCount={500000} />);
    expect(screen.getByText('500k+ installs')).toBeInTheDocument();
  });

  it('formats mid-range count without + suffix', () => {
    render(<MarketplaceCard {...baseProps} installCount={50000} />);
    expect(screen.getByText('50k installs')).toBeInTheDocument();
  });

  it('formats small install count as plain number', () => {
    render(<MarketplaceCard {...baseProps} installCount={42} />);
    expect(screen.getByText('42 installs')).toBeInTheDocument();
  });

  it('calls onInstall when Install button clicked', () => {
    const onInstall = vi.fn();
    render(<MarketplaceCard {...baseProps} onInstall={onInstall} />);
    fireEvent.click(screen.getByText('Install'));
    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it('shows Uninstall button when installed', () => {
    const onUninstall = vi.fn();
    render(<MarketplaceCard {...baseProps} installed onUninstall={onUninstall} />);
    const btn = screen.getByText('Uninstall');
    fireEvent.click(btn);
    expect(onUninstall).toHaveBeenCalledTimes(1);
  });

  it('shows Update button when hasUpdate is true', () => {
    const onUpdate = vi.fn();
    render(<MarketplaceCard {...baseProps} installed hasUpdate onUpdate={onUpdate} />);
    const btn = screen.getByText('Update');
    fireEvent.click(btn);
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('renders verified badge when verified', () => {
    render(<MarketplaceCard {...baseProps} verified />);
    expect(screen.getByLabelText('Verified')).toBeInTheDocument();
  });

  it('does not render verified badge when not verified', () => {
    render(<MarketplaceCard {...baseProps} />);
    expect(screen.queryByLabelText('Verified')).not.toBeInTheDocument();
  });

  it('renders ReactNode as icon', () => {
    render(<MarketplaceCard {...baseProps} icon={<span data-testid="custom-icon">IC</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
