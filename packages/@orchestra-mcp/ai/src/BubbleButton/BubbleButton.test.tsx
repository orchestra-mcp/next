import { render, screen, fireEvent } from '@testing-library/react';
import { BubbleButton } from './BubbleButton';

const icon = <span data-testid="test-icon">+</span>;
const actions = [
  { icon: <span>A</span>, label: 'Action A', onClick: vi.fn() },
  { icon: <span>B</span>, label: 'Action B', onClick: vi.fn() },
];

describe('BubbleButton', () => {
  it('renders the trigger button', () => {
    render(<BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /toggle actions/i })).toBeInTheDocument();
  });

  it('renders the icon inside the trigger', () => {
    render(<BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<BubbleButton icon={icon} expanded={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /toggle actions/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows actions when expanded', () => {
    render(
      <BubbleButton icon={icon} expanded={true} onToggle={vi.fn()} actions={actions} />,
    );
    expect(screen.getByTestId('bubble-actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action B' })).toBeInTheDocument();
  });

  it('actions are in the DOM but not expanded when collapsed', () => {
    render(
      <BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} actions={actions} />,
    );
    // Component always renders bubble__actions when actions array is non-empty,
    // visibility is controlled via CSS (expanded class on container)
    expect(screen.getByTestId('bubble-actions')).toBeInTheDocument();
    expect(screen.getByTestId('bubble-container')).not.toHaveClass('bubble--expanded');
  });

  it('calls action onClick when action is clicked', () => {
    const clickA = vi.fn();
    const testActions = [{ icon: <span>A</span>, label: 'Do A', onClick: clickA }];
    render(
      <BubbleButton icon={icon} expanded={true} onToggle={vi.fn()} actions={testActions} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Do A' }));
    expect(clickA).toHaveBeenCalledTimes(1);
  });

  it('applies position class', () => {
    render(
      <BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} position="top-left" />,
    );
    expect(screen.getByTestId('bubble-container')).toHaveClass('bubble--top-left');
  });

  it('applies pulse class when pulse is true', () => {
    render(
      <BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} pulse={true} />,
    );
    const trigger = screen.getByRole('button', { name: /toggle actions/i });
    expect(trigger).toHaveClass('bubble__trigger--pulse');
  });

  it('does not apply pulse class by default', () => {
    render(<BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /toggle actions/i });
    expect(trigger).not.toHaveClass('bubble__trigger--pulse');
  });

  it('disables the trigger when disabled', () => {
    render(
      <BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} disabled={true} />,
    );
    expect(screen.getByRole('button', { name: /toggle actions/i })).toBeDisabled();
  });

  it('renders tooltip as aria-label', () => {
    render(
      <BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} tooltip="AI Chat" />,
    );
    expect(screen.getByRole('button', { name: 'AI Chat' })).toBeInTheDocument();
  });

  it('applies size class', () => {
    render(
      <BubbleButton icon={icon} expanded={false} onToggle={vi.fn()} size="lg" />,
    );
    const trigger = screen.getByRole('button', { name: /toggle actions/i });
    expect(trigger).toHaveClass('bubble__trigger--lg');
  });

  it('sets aria-expanded attribute', () => {
    render(<BubbleButton icon={icon} expanded={true} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: /toggle actions/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
