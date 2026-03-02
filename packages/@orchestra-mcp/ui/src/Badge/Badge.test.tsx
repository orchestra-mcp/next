import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders filled badge with label', () => {
    render(<Badge label="New" variant="filled" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders outlined badge', () => {
    render(<Badge label="Draft" variant="outlined" color="info" />);
    const badge = screen.getByText('Draft').closest('.badge');
    expect(badge).toHaveClass('badge--outlined', 'badge--info');
  });

  it('renders soft badge', () => {
    render(<Badge label="Active" variant="soft" color="success" />);
    const badge = screen.getByText('Active').closest('.badge');
    expect(badge).toHaveClass('badge--soft', 'badge--success');
  });

  it('defaults to filled variant', () => {
    render(<Badge label="Default" />);
    const badge = screen.getByText('Default').closest('.badge');
    expect(badge).toHaveClass('badge--filled');
  });

  it('renders xs size', () => {
    render(<Badge label="XS" size="xs" />);
    const badge = screen.getByText('XS').closest('.badge');
    expect(badge).toHaveClass('badge--xs');
  });

  it('renders sm size', () => {
    render(<Badge label="Small" size="sm" />);
    const badge = screen.getByText('Small').closest('.badge');
    expect(badge).toHaveClass('badge--sm');
  });

  it('renders md size by default', () => {
    render(<Badge label="Medium" />);
    const badge = screen.getByText('Medium').closest('.badge');
    expect(badge).toHaveClass('badge--md');
  });

  it('renders lg size', () => {
    render(<Badge label="Large" size="lg" />);
    const badge = screen.getByText('Large').closest('.badge');
    expect(badge).toHaveClass('badge--lg');
  });

  it('renders all color variants', () => {
    const colors = ['primary', 'success', 'warning', 'danger', 'info', 'gray'] as const;
    colors.forEach((color) => {
      const { container } = render(<Badge label={color} color={color} />);
      const badge = container.querySelector('.badge');
      expect(badge).toHaveClass(`badge--${color}`);
    });
  });

  it('shows count instead of label', () => {
    render(<Badge label="Messages" count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('Messages')).not.toBeInTheDocument();
  });

  it('shows 99+ when count exceeds 99', () => {
    render(<Badge count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('shows exact count at 99', () => {
    render(<Badge count={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('shows remove button when removable', () => {
    render(<Badge label="Tag" removable />);
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', () => {
    const handleRemove = vi.fn();
    render(<Badge label="Tag" removable onRemove={handleRemove} />);
    screen.getByRole('button', { name: /remove/i }).click();
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(<Badge label="Star" icon={<span data-testid="star-icon">*</span>} />);
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.getByText('Star')).toBeInTheDocument();
  });

  it('renders dot indicator', () => {
    const { container } = render(<Badge label="Online" dot />);
    expect(container.querySelector('.badge__dot')).toBeInTheDocument();
  });

  it('applies disabled class', () => {
    render(<Badge label="Off" disabled />);
    const badge = screen.getByText('Off').closest('.badge');
    expect(badge).toHaveClass('badge--disabled');
  });
});
