import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('renders existing tags', () => {
    render(<TagInput tags={['react', 'vue']} onChange={vi.fn()} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('adds tag on Enter key', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'typescript' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['typescript']);
  });

  it('adds tag on comma key', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'node' } });
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenCalledWith(['node']);
  });

  it('trims whitespace from tags', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  rust  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['rust']);
  });

  it('removes tag on X click', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['react', 'vue', 'svelte']} onChange={onChange} />);
    const removeBtn = screen.getByLabelText('Remove vue');
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(['react', 'svelte']);
  });

  it('removes last tag on Backspace when input is empty', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['react', 'vue']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('does not remove tag on Backspace when input has text', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['react']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'v' } });
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows suggestions dropdown filtered by input', () => {
    render(
      <TagInput
        tags={[]}
        onChange={vi.fn()}
        suggestions={['react', 'redux', 'angular']}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 're' } });
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('redux')).toBeInTheDocument();
    expect(screen.queryByText('angular')).not.toBeInTheDocument();
  });

  it('adds suggestion on click', () => {
    const onChange = vi.fn();
    render(
      <TagInput
        tags={[]}
        onChange={onChange}
        suggestions={['react', 'vue']}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.mouseDown(screen.getByText('react'));
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('disables input when maxTags reached', () => {
    render(
      <TagInput tags={['a', 'b']} onChange={vi.fn()} maxTags={2} />,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('(max reached)')).toBeInTheDocument();
  });

  it('prevents duplicate tags by default', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['react']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows duplicates when allowDuplicates is true', () => {
    const onChange = vi.fn();
    render(
      <TagInput tags={['react']} onChange={onChange} allowDuplicates />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['react', 'react']);
  });

  it('renders disabled state', () => {
    render(<TagInput tags={['react']} onChange={vi.fn()} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(screen.getByTestId('tag-input')).toHaveClass('tag-input--disabled');
  });

  it('does not add empty tags', () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows placeholder when no tags', () => {
    render(
      <TagInput tags={[]} onChange={vi.fn()} placeholder="Type here..." />,
    );
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });
});
