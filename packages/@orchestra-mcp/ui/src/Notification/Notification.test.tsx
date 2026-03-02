import { render, screen, fireEvent } from '@testing-library/react';
import { Notification } from './Notification';

describe('Notification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders notification with message', () => {
    render(<Notification message="Test notification" />);
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('renders notification with title and message', () => {
    render(<Notification title="Success" message="Operation completed" />);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('renders different notification types', () => {
    const { rerender } = render(<Notification message="Info" type="info" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--info');

    rerender(<Notification message="Success" type="success" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--success');

    rerender(<Notification message="Warning" type="warning" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--warning');

    rerender(<Notification message="Error" type="error" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--error');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Notification message="Test" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close notification'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration', () => {
    const onClose = vi.fn();
    render(<Notification message="Test" duration={3000} onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onClose = vi.fn();
    render(<Notification message="Test" duration={0} onClose={onClose} />);
    vi.advanceTimersByTime(10000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders action button when provided', () => {
    const onAction = vi.fn();
    render(<Notification message="Test" action={{ label: 'Undo', onClick: onAction }} />);
    fireEvent.click(screen.getByText('Undo'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders at different positions', () => {
    const { rerender } = render(<Notification message="Test" position="top-left" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--top-left');

    rerender(<Notification message="Test" position="bottom-right" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--bottom-right');

    rerender(<Notification message="Test" position="top-center" />);
    expect(screen.getByRole('alert')).toHaveClass('notification--top-center');
  });

  it('has correct ARIA attributes', () => {
    render(<Notification message="Test" />);
    const notification = screen.getByRole('alert');
    expect(notification).toHaveAttribute('aria-live', 'polite');
  });

  it('hides close button when no onClose provided', () => {
    render(<Notification message="Test" />);
    expect(screen.queryByLabelText('Close notification')).not.toBeInTheDocument();
  });
});
