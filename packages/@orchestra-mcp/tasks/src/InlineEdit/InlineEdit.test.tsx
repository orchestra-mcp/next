import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditableText, EditableTextarea, EditableSelect } from './InlineEdit';

describe('EditableText', () => {
  it('renders text value', () => {
    render(<EditableText value="Hello" onSave={vi.fn()} />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('enters edit mode on click', () => {
    render(<EditableText value="Hello" onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('Hello'));
    expect(screen.getByDisplayValue('Hello')).toBeTruthy();
  });

  it('saves on Enter', () => {
    const onSave = vi.fn();
    render(<EditableText value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText('Hello'));
    const input = screen.getByDisplayValue('Hello');
    fireEvent.change(input, { target: { value: 'World' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledWith('World');
  });

  it('cancels on Escape', () => {
    const onSave = vi.fn();
    render(<EditableText value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText('Hello'));
    const input = screen.getByDisplayValue('Hello');
    fireEvent.change(input, { target: { value: 'World' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('saves on blur', () => {
    const onSave = vi.fn();
    render(<EditableText value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText('Hello'));
    const input = screen.getByDisplayValue('Hello');
    fireEvent.change(input, { target: { value: 'World' } });
    fireEvent.blur(input);
    expect(onSave).toHaveBeenCalledWith('World');
  });

  it('does not save if value unchanged', () => {
    const onSave = vi.fn();
    render(<EditableText value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText('Hello'));
    fireEvent.blur(screen.getByDisplayValue('Hello'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows saving indicator', () => {
    const { container } = render(<EditableText value="Hello" onSave={vi.fn()} saving />);
    expect(container.querySelector('.inline-edit__indicator')).toBeTruthy();
  });
});

describe('EditableTextarea', () => {
  it('renders text value', () => {
    render(<EditableTextarea value="Some text" onSave={vi.fn()} />);
    expect(screen.getByText('Some text')).toBeTruthy();
  });

  it('shows placeholder when empty', () => {
    render(<EditableTextarea value="" onSave={vi.fn()} placeholder="Add description" />);
    expect(screen.getByText('Add description')).toBeTruthy();
  });

  it('enters edit mode on click', () => {
    render(<EditableTextarea value="Some text" onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('Some text'));
    expect(screen.getByDisplayValue('Some text')).toBeTruthy();
  });

  it('cancels on Escape', () => {
    const onSave = vi.fn();
    render(<EditableTextarea value="Original" onSave={onSave} />);
    fireEvent.click(screen.getByText('Original'));
    const textarea = screen.getByDisplayValue('Original');
    fireEvent.change(textarea, { target: { value: 'Modified' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('EditableSelect', () => {
  const options = [
    { value: 'high', label: 'High' },
    { value: 'low', label: 'Low' },
  ];

  it('renders current label', () => {
    render(<EditableSelect value="high" options={options} onSave={vi.fn()} />);
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('opens select on click', () => {
    render(<EditableSelect value="high" options={options} onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('High'));
    expect(screen.getByDisplayValue('High')).toBeTruthy();
  });

  it('saves on change', () => {
    const onSave = vi.fn();
    render(<EditableSelect value="high" options={options} onSave={onSave} />);
    fireEvent.click(screen.getByText('High'));
    fireEvent.change(screen.getByDisplayValue('High'), { target: { value: 'low' } });
    expect(onSave).toHaveBeenCalledWith('low');
  });
});
