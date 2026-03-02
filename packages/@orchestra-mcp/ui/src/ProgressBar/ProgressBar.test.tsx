import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders determinate bar', () => {
    render(<ProgressBar value={50} mode="determinate" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders indeterminate bar', () => {
    render(<ProgressBar mode="indeterminate" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    const fill = bar.querySelector('.progress-bar-fill--indeterminate');
    expect(fill).toBeInTheDocument();
  });

  it('renders sm size', () => {
    render(<ProgressBar value={30} size="sm" />);
    expect(screen.getByRole('progressbar')).toHaveClass('progress-bar--sm');
  });

  it('renders md size', () => {
    render(<ProgressBar value={30} size="md" />);
    expect(screen.getByRole('progressbar')).toHaveClass('progress-bar--md');
  });

  it('renders lg size', () => {
    render(<ProgressBar value={30} size="lg" />);
    expect(screen.getByRole('progressbar')).toHaveClass('progress-bar--lg');
  });

  it('renders primary color', () => {
    const { container } = render(<ProgressBar value={60} color="primary" />);
    expect(container.querySelector('.progress-bar-fill--primary')).toBeInTheDocument();
  });

  it('renders success color', () => {
    const { container } = render(<ProgressBar value={60} color="success" />);
    expect(container.querySelector('.progress-bar-fill--success')).toBeInTheDocument();
  });

  it('renders warning color', () => {
    const { container } = render(<ProgressBar value={60} color="warning" />);
    expect(container.querySelector('.progress-bar-fill--warning')).toBeInTheDocument();
  });

  it('renders danger color', () => {
    const { container } = render(<ProgressBar value={60} color="danger" />);
    expect(container.querySelector('.progress-bar-fill--danger')).toBeInTheDocument();
  });

  it('shows label text', () => {
    render(<ProgressBar value={70} label="Upload Progress" />);
    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
  });

  it('shows value percentage', () => {
    render(<ProgressBar value={42} showValue />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('does not show value in indeterminate mode', () => {
    const { container } = render(<ProgressBar mode="indeterminate" showValue />);
    expect(container.querySelector('.progress-bar-value')).not.toBeInTheDocument();
  });

  it('applies striped class', () => {
    const { container } = render(<ProgressBar value={50} striped />);
    expect(container.querySelector('.progress-bar-fill--striped')).toBeInTheDocument();
  });

  it('clamps value to 0-100 range', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('has correct accessibility attributes', () => {
    render(<ProgressBar value={25} label="Loading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '25');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', 'Loading');
  });
});
