import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('RadioGroup', () => {
  it('renders all options', () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders radio inputs for each option', () => {
    render(<RadioGroup options={options} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('selects the controlled value', () => {
    render(<RadioGroup options={options} value="b" />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  it('calls onChange with correct value', () => {
    const handleChange = vi.fn();
    render(<RadioGroup options={options} onChange={handleChange} />);
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[2]);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('c');
  });

  it('disables all options when group is disabled', () => {
    render(<RadioGroup options={options} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('disables individual option', () => {
    const mixed = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
      { value: 'c', label: 'Option C' },
    ];
    render(<RadioGroup options={mixed} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeDisabled();
    expect(radios[1]).toBeDisabled();
    expect(radios[2]).not.toBeDisabled();
  });

  it('does not fire onChange when disabled option is clicked', () => {
    const handleChange = vi.fn();
    const mixed = [
      { value: 'a', label: 'Option A', disabled: true },
    ];
    render(<RadioGroup options={mixed} onChange={handleChange} />);
    const radio = screen.getByRole('radio');
    fireEvent.click(radio);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies horizontal direction class', () => {
    const { container } = render(
      <RadioGroup options={options} direction="horizontal" />,
    );
    const group = container.querySelector('.radio-group');
    expect(group).toHaveClass('radio-group--horizontal');
  });

  it('applies vertical direction class by default', () => {
    const { container } = render(<RadioGroup options={options} />);
    const group = container.querySelector('.radio-group');
    expect(group).toHaveClass('radio-group--vertical');
  });

  it('displays error message', () => {
    render(<RadioGroup options={options} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('does not render error when not provided', () => {
    const { container } = render(<RadioGroup options={options} />);
    expect(container.querySelector('.radio-group__error')).toBeNull();
  });

  it('renders description text', () => {
    const withDesc = [
      { value: 'a', label: 'Option A', description: 'First option' },
      { value: 'b', label: 'Option B', description: 'Second option' },
    ];
    render(<RadioGroup options={withDesc} />);
    expect(screen.getByText('First option')).toBeInTheDocument();
    expect(screen.getByText('Second option')).toBeInTheDocument();
  });

  it('has radiogroup role on container', () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <RadioGroup options={options} className="custom-class" />,
    );
    const group = container.querySelector('.radio-group');
    expect(group).toHaveClass('custom-class');
  });

  it('applies selected class to checked option label', () => {
    const { container } = render(<RadioGroup options={options} value="a" />);
    const labels = container.querySelectorAll('.radio-group__option');
    expect(labels[0]).toHaveClass('radio-group__option--selected');
    expect(labels[1]).not.toHaveClass('radio-group__option--selected');
  });
});
