import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LabelsSection } from './LabelsSection';

vi.mock('../mcp/client', () => ({ mcpCall: vi.fn() }));
import { mcpCall } from '../mcp/client';
const mockMcpCall = vi.mocked(mcpCall);

const params = { project: 'test', epicId: 'E-1', storyId: 'S-1', taskId: 'T-1' };

beforeEach(() => {
  mockMcpCall.mockReset();
  mockMcpCall.mockResolvedValue(undefined);
});

describe('LabelsSection', () => {
  it('renders all labels as pills', () => {
    render(<LabelsSection labels={['frontend', 'urgent', 'bug']} {...params} />);
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('shows remove button on each label', () => {
    render(<LabelsSection labels={['frontend', 'urgent']} {...params} />);
    expect(screen.getByLabelText('Remove frontend')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove urgent')).toBeInTheDocument();
  });

  it('clicking remove calls mcpCall with correct args', async () => {
    render(<LabelsSection labels={['frontend']} {...params} />);
    fireEvent.click(screen.getByLabelText('Remove frontend'));
    await waitFor(() => {
      expect(mockMcpCall).toHaveBeenCalledWith('remove_labels', {
        project: 'test',
        epic_id: 'E-1',
        story_id: 'S-1',
        task_id: 'T-1',
        labels: ['frontend'],
      });
    });
  });

  it('calls onUpdate after removing a label', async () => {
    const onUpdate = vi.fn();
    render(<LabelsSection labels={['frontend']} {...params} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByLabelText('Remove frontend'));
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('shows add button when not in add mode', () => {
    render(<LabelsSection labels={['frontend']} {...params} />);
    expect(screen.getByLabelText('Add label')).toBeInTheDocument();
  });

  it('clicking + shows input field', () => {
    render(<LabelsSection labels={['frontend']} {...params} />);
    fireEvent.click(screen.getByLabelText('Add label'));
    expect(screen.getByPlaceholderText('Label...')).toBeInTheDocument();
  });

  it('pressing Enter in input calls mcpCall with trimmed value', async () => {
    render(<LabelsSection labels={['frontend']} {...params} />);
    fireEvent.click(screen.getByLabelText('Add label'));
    const input = screen.getByPlaceholderText('Label...');
    fireEvent.change(input, { target: { value: '  bugfix  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(mockMcpCall).toHaveBeenCalledWith('add_labels', {
        project: 'test',
        epic_id: 'E-1',
        story_id: 'S-1',
        task_id: 'T-1',
        labels: ['bugfix'],
      });
    });
  });

  it('calls onUpdate after adding a label', async () => {
    const onUpdate = vi.fn();
    render(<LabelsSection labels={['frontend']} {...params} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByLabelText('Add label'));
    const input = screen.getByPlaceholderText('Label...');
    fireEvent.change(input, { target: { value: 'newlabel' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('pressing Escape in input cancels add mode', () => {
    render(<LabelsSection labels={['frontend']} {...params} />);
    fireEvent.click(screen.getByLabelText('Add label'));
    const input = screen.getByPlaceholderText('Label...');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Label...')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Add label')).toBeInTheDocument();
  });

  it('empty input on blur closes without calling mcpCall', () => {
    render(<LabelsSection labels={['frontend']} {...params} />);
    fireEvent.click(screen.getByLabelText('Add label'));
    const input = screen.getByPlaceholderText('Label...');
    fireEvent.blur(input);
    expect(mockMcpCall).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('Label...')).not.toBeInTheDocument();
  });

  it('shows "No labels" text when labels array is empty', () => {
    render(<LabelsSection labels={[]} {...params} />);
    expect(screen.getByText('No labels')).toBeInTheDocument();
  });

  it('shows add button even when no labels exist', () => {
    render(<LabelsSection labels={[]} {...params} />);
    expect(screen.getByLabelText('Add label')).toBeInTheDocument();
  });
});
