import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Tooltip } from './Tooltip';

/** Helper: hover the wrapper and advance timers */
function showTooltip(wrapper: Element, delay = 0) {
  fireEvent.mouseEnter(wrapper);
  act(() => { vi.advanceTimersByTime(delay); });
}

describe('Tooltip', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders trigger children', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: /hover me/i })).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', () => {
    render(
      <Tooltip content="Help text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Hover me').closest('.tooltip-wrapper')!;
    showTooltip(wrapper, 100);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Help text');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Help text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Hover me').closest('.tooltip-wrapper')!;
    showTooltip(wrapper);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies placement class', () => {
    render(
      <Tooltip content="Tip" placement="bottom" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );
    showTooltip(screen.getByText('Trigger').closest('.tooltip-wrapper')!);
    expect(screen.getByRole('tooltip')).toHaveClass('tooltip--bottom');
  });

  it('renders arrow by default', () => {
    render(
      <Tooltip content="Tip" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );
    showTooltip(screen.getByText('Trigger').closest('.tooltip-wrapper')!);
    expect(screen.getByTestId('tooltip-arrow')).toBeInTheDocument();
  });

  it('hides arrow when arrow=false', () => {
    render(
      <Tooltip content="Tip" delay={0} arrow={false}>
        <button>Trigger</button>
      </Tooltip>
    );
    showTooltip(screen.getByText('Trigger').closest('.tooltip-wrapper')!);
    expect(screen.queryByTestId('tooltip-arrow')).not.toBeInTheDocument();
  });

  it('displays shortcut in kbd element', () => {
    render(
      <Tooltip content="Save" shortcut="Cmd+S" delay={0}>
        <button>Save btn</button>
      </Tooltip>
    );
    showTooltip(screen.getByText('Save btn').closest('.tooltip-wrapper')!);
    const kbd = screen.getByRole('tooltip').querySelector('kbd');
    expect(kbd).toHaveTextContent('Cmd+S');
  });

  it('renders rich content', () => {
    render(
      <Tooltip content={<span data-testid="rich">Bold tip</span>} delay={0}>
        <button>Trigger</button>
      </Tooltip>
    );
    showTooltip(screen.getByText('Trigger').closest('.tooltip-wrapper')!);
    expect(screen.getByTestId('rich')).toHaveTextContent('Bold tip');
  });

  it('shows tooltip on focus and hides on blur', () => {
    render(
      <Tooltip content="Focused" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Focus me').closest('.tooltip-wrapper')!;
    fireEvent.focus(wrapper);
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Focused');

    fireEvent.blur(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
