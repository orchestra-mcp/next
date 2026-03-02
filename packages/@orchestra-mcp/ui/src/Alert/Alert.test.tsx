import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders children content', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('applies info variant class by default', () => {
    render(<Alert>Info message</Alert>);
    const el = screen.getByRole('alert');
    expect(el).toHaveClass('alert', 'alert--info');
  });

  it('applies success variant class', () => {
    render(<Alert variant="success">Done</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert--success');
  });

  it('applies warning variant class', () => {
    render(<Alert variant="warning">Careful</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert--warning');
  });

  it('applies error variant class', () => {
    render(<Alert variant="error">Failure</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert--error');
  });

  it('renders title when provided', () => {
    render(<Alert title="Heads up">Body text</Alert>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toHaveClass('alert__title');
  });

  it('does not render title when not provided', () => {
    const { container } = render(<Alert>No title</Alert>);
    expect(container.querySelector('.alert__title')).toBeNull();
  });

  it('shows dismiss button when dismissible', () => {
    render(<Alert dismissible>Closeable</Alert>);
    expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
  });

  it('does not show dismiss button when not dismissible', () => {
    render(<Alert>Not closeable</Alert>);
    expect(screen.queryByLabelText('Dismiss alert')).toBeNull();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    render(<Alert dismissible onDismiss={handleDismiss}>Close me</Alert>);
    screen.getByLabelText('Dismiss alert').click();
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders custom icon when provided', () => {
    render(<Alert icon={<span data-testid="custom-icon">!</span>}>Custom</Alert>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders default icon per variant', () => {
    const { container } = render(<Alert variant="warning">Watch out</Alert>);
    const iconEl = container.querySelector('.alert__icon');
    expect(iconEl).not.toBeNull();
    expect(iconEl!.textContent).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<Alert className="my-custom">Styled</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('my-custom');
  });

  it('has role="alert" for accessibility', () => {
    render(<Alert>Accessible</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
