import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toaster } from './Toaster';
import { useToaster } from './ToasterContext';

/** Helper component that exposes toast actions for testing */
const ToastTrigger = ({
  type = 'info' as const,
  title = 'Test',
  message,
  duration = 0,
  action,
}: {
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title?: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}) => {
  const { toast, dismiss, dismissAll } = useToaster();
  return (
    <>
      <button
        data-testid="trigger"
        onClick={() => toast({ type, title, message, duration, action })}
      >
        Add Toast
      </button>
      <button data-testid="dismiss-all" onClick={dismissAll}>
        Dismiss All
      </button>
    </>
  );
};

describe('Toaster', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders toaster container', () => {
    render(
      <Toaster>
        <div>App</div>
      </Toaster>,
    );
    expect(screen.getByText('App')).toBeInTheDocument();
  });

  it('shows a toast when triggered', () => {
    render(
      <Toaster>
        <ToastTrigger title="Hello World" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders toast with message', () => {
    render(
      <Toaster>
        <ToastTrigger title="Title" message="Detail text" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Detail text')).toBeInTheDocument();
  });

  it('dismisses toast via close button', () => {
    render(
      <Toaster>
        <ToastTrigger title="Dismiss Me" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Dismiss Me')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Dismiss toast'));
    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.queryByText('Dismiss Me')).not.toBeInTheDocument();
  });

  it('auto-dismisses after duration', () => {
    render(
      <Toaster>
        <ToastTrigger title="Auto Dismiss" duration={3000} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Auto Dismiss')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(3200); });
    expect(screen.queryByText('Auto Dismiss')).not.toBeInTheDocument();
  });

  it('does not auto-dismiss when duration is 0', () => {
    render(
      <Toaster>
        <ToastTrigger title="Persistent" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText('Persistent')).toBeInTheDocument();
  });

  it('renders action button and fires callback', () => {
    const onAction = vi.fn();
    render(
      <Toaster>
        <ToastTrigger title="With Action" duration={0} action={{ label: 'Undo', onClick: onAction }} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByText('Undo'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('limits visible toasts to maxVisible', () => {
    render(
      <Toaster maxVisible={2}>
        <ToastTrigger title="Toast" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByTestId('trigger'));
    const toasts = screen.getAllByRole('alert');
    expect(toasts).toHaveLength(2);
  });

  it('dismissAll clears all toasts', () => {
    render(
      <Toaster>
        <ToastTrigger title="Toast" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getAllByRole('alert')).toHaveLength(2);

    fireEvent.click(screen.getByTestId('dismiss-all'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders correct type classes', () => {
    render(
      <Toaster>
        <ToastTrigger type="success" title="Success" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByRole('alert')).toHaveClass('toast--success');
  });

  it('renders at different positions', () => {
    const { container } = render(
      <Toaster position="bottom-left">
        <ToastTrigger title="Positioned" duration={0} />
      </Toaster>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    const toaster = container.querySelector('.toaster');
    expect(toaster).toHaveClass('toaster--bottom-left');
  });

  it('throws when useToaster is used outside provider', () => {
    const Bad = () => { useToaster(); return null; };
    expect(() => render(<Bad />)).toThrow('useToaster must be used within a ToasterProvider');
  });
});
