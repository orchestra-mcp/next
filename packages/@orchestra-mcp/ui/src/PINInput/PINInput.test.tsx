import { render, screen, fireEvent } from '@testing-library/react';
import { PINInput } from './PINInput';

describe('PINInput', () => {
  it('renders correct number of inputs for length=4', () => {
    render(<PINInput length={4} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('renders correct number of inputs for length=6', () => {
    render(<PINInput length={6} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('typing a digit advances focus to next input', () => {
    render(<PINInput length={4} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], { target: { value: '1' } });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('backspace clears current and focuses previous', () => {
    render(<PINInput length={4} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    // Type in first two boxes
    fireEvent.input(inputs[0], { target: { value: '1' } });
    fireEvent.input(inputs[1], { target: { value: '2' } });

    // Backspace on empty third box goes to second
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('paste fills all boxes and calls onComplete', () => {
    const onComplete = vi.fn();
    render(<PINInput length={4} onComplete={onComplete} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '1234' },
    });

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('onComplete fires when all boxes are filled', () => {
    const onComplete = vi.fn();
    render(<PINInput length={4} onComplete={onComplete} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], { target: { value: '1' } });
    fireEvent.input(inputs[1], { target: { value: '2' } });
    fireEvent.input(inputs[2], { target: { value: '3' } });
    fireEvent.input(inputs[3], { target: { value: '4' } });

    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('masked mode renders password inputs', () => {
    const { container } = render(<PINInput length={4} masked autoFocus={false} />);
    const inputs = container.querySelectorAll('input[type="password"]');
    expect(inputs).toHaveLength(4);
  });

  it('error state applies error class to all boxes', () => {
    const { container } = render(
      <PINInput length={4} error errorMessage="Invalid PIN" autoFocus={false} />,
    );
    const boxes = container.querySelectorAll('.pin-input__box--error');
    expect(boxes).toHaveLength(4);
  });

  it('error message is displayed', () => {
    render(<PINInput length={4} error errorMessage="Invalid PIN" autoFocus={false} />);
    expect(screen.getByText('Invalid PIN')).toBeInTheDocument();
  });

  it('disabled state disables all inputs', () => {
    render(<PINInput length={4} disabled autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('onChange fires on every input', () => {
    const onChange = vi.fn();
    render(<PINInput length={4} onChange={onChange} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], { target: { value: '5' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('rejects non-digit input', () => {
    render(<PINInput length={4} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], { target: { value: 'a' } });
    expect(inputs[0]).toHaveValue('');
  });
});
