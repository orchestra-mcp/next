import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox, CheckboxCard, TreeCheckbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox />);
    const input = screen.getByRole('checkbox');
    expect(input).not.toBeChecked();
  });

  it('renders checked state', () => {
    render(<Checkbox checked />);
    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
  });

  it('toggles on click via onChange', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} />);
    const input = screen.getByRole('checkbox');
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when unchecking', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked onChange={handleChange} />);
    const input = screen.getByRole('checkbox');
    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('does not toggle when disabled', () => {
    const handleChange = vi.fn();
    render(<Checkbox disabled onChange={handleChange} />);
    const input = screen.getByRole('checkbox');
    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders indeterminate state with aria-checked mixed', () => {
    render(<Checkbox indeterminate />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-checked', 'mixed');
  });

  it('applies indeterminate CSS class', () => {
    const { container } = render(<Checkbox indeterminate />);
    const wrapper = container.querySelector('.checkbox');
    expect(wrapper).toHaveClass('checkbox--indeterminate');
  });

  it('renders label text', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('toggles when label is clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Click me" onChange={handleChange} />);
    const label = screen.getByText('Click me');
    fireEvent.click(label);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('displays error message', () => {
    render(<Checkbox error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error CSS class when error is provided', () => {
    const { container } = render(<Checkbox error="Required" />);
    const wrapper = container.querySelector('.checkbox');
    expect(wrapper).toHaveClass('checkbox--error');
  });

  it('sets aria-checked to true when checked', () => {
    render(<Checkbox checked />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to false when unchecked', () => {
    render(<Checkbox />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Checkbox error="Error" />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies disabled class and disables input', () => {
    const { container } = render(<Checkbox disabled />);
    const wrapper = container.querySelector('.checkbox');
    const input = screen.getByRole('checkbox');
    expect(wrapper).toHaveClass('checkbox--disabled');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<Checkbox className="my-custom" />);
    const wrapper = container.querySelector('.checkbox');
    expect(wrapper).toHaveClass('my-custom');
  });

  it('applies color class when color is set', () => {
    const { container } = render(<Checkbox color="success" checked />);
    const wrapper = container.querySelector('.checkbox');
    expect(wrapper).toHaveClass('checkbox--success');
  });
});

describe('CheckboxCard', () => {
  it('renders title and description', () => {
    render(<CheckboxCard title="Notifications" description="Enable push notifications" />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Enable push notifications')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const { container } = render(
      <CheckboxCard title="Settings" icon={<svg data-testid="icon" />} />,
    );
    expect(container.querySelector('.checkbox-card__icon')).toBeInTheDocument();
  });

  it('toggles on card click', () => {
    const handleChange = vi.fn();
    render(<CheckboxCard title="Toggle me" onChange={handleChange} />);
    const card = screen.getByRole('group');
    fireEvent.click(card);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const handleChange = vi.fn();
    render(<CheckboxCard title="Disabled" disabled onChange={handleChange} />);
    const card = screen.getByRole('group');
    fireEvent.click(card);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies checked class when checked', () => {
    const { container } = render(<CheckboxCard title="Checked" checked />);
    const card = container.querySelector('.checkbox-card');
    expect(card).toHaveClass('checkbox-card--checked');
  });

  it('applies disabled class when disabled', () => {
    const { container } = render(<CheckboxCard title="Disabled" disabled />);
    const card = container.querySelector('.checkbox-card');
    expect(card).toHaveClass('checkbox-card--disabled');
  });

  it('sets aria-label on the card', () => {
    render(<CheckboxCard title="My Card" />);
    const card = screen.getByRole('group');
    expect(card).toHaveAttribute('aria-label', 'My Card');
  });

  it('applies color class on card', () => {
    const { container } = render(<CheckboxCard title="Colored" color="danger" checked />);
    const card = container.querySelector('.checkbox-card');
    expect(card).toHaveClass('checkbox-card--danger');
  });

  it('applies custom className', () => {
    const { container } = render(<CheckboxCard title="Custom" className="my-card" />);
    const card = container.querySelector('.checkbox-card');
    expect(card).toHaveClass('my-card');
  });
});

describe('TreeCheckbox', () => {
  const nodes = [
    {
      id: 'root',
      label: 'Root',
      children: [
        { id: 'child-1', label: 'Child 1' },
        { id: 'child-2', label: 'Child 2' },
      ],
    },
  ];

  it('renders all nodes', () => {
    render(<TreeCheckbox nodes={nodes} selected={[]} onChange={() => {}} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('checks children when parent is toggled', () => {
    const handleChange = vi.fn();
    render(<TreeCheckbox nodes={nodes} selected={[]} onChange={handleChange} />);
    const rootLabel = screen.getByText('Root');
    fireEvent.click(rootLabel);
    const selected = handleChange.mock.calls[0][0] as string[];
    expect(selected).toContain('root');
    expect(selected).toContain('child-1');
    expect(selected).toContain('child-2');
  });

  it('unchecks all when fully-checked parent is toggled', () => {
    const handleChange = vi.fn();
    render(
      <TreeCheckbox
        nodes={nodes}
        selected={['root', 'child-1', 'child-2']}
        onChange={handleChange}
      />,
    );
    const rootLabel = screen.getByText('Root');
    fireEvent.click(rootLabel);
    const selected = handleChange.mock.calls[0][0] as string[];
    expect(selected).not.toContain('root');
    expect(selected).not.toContain('child-1');
    expect(selected).not.toContain('child-2');
  });

  it('shows tree role', () => {
    const { container } = render(
      <TreeCheckbox nodes={nodes} selected={[]} onChange={() => {}} />,
    );
    expect(container.querySelector('[role="tree"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TreeCheckbox nodes={nodes} selected={[]} onChange={() => {}} className="my-tree" />,
    );
    expect(container.querySelector('.tree-checkbox')).toHaveClass('my-tree');
  });

  it('renders collapse/expand toggle for parent nodes', () => {
    render(<TreeCheckbox nodes={nodes} selected={[]} onChange={() => {}} />);
    const toggle = screen.getByLabelText('Collapse');
    expect(toggle).toBeInTheDocument();
  });
});
