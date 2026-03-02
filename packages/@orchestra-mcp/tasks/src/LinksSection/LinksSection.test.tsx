import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinksSection } from './LinksSection';

vi.mock('../mcp/client', () => ({ mcpCall: vi.fn() }));
import { mcpCall } from '../mcp/client';
const mockMcpCall = vi.mocked(mcpCall);

const params = { project: 'test', epicId: 'E-1', storyId: 'S-1', taskId: 'T-1' };

const mockLinks = [
  { type: 'pr', url: 'https://github.com/pr/1', title: 'PR #1' },
  { type: 'commit', url: 'https://github.com/commit/abc', title: '' },
  { type: 'url', url: 'https://docs.example.com' },
];

beforeEach(() => {
  mockMcpCall.mockReset();
  mockMcpCall.mockResolvedValue(undefined);
});

describe('LinksSection', () => {
  it('renders all links', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    expect(screen.getByText('PR #1')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/commit/abc')).toBeInTheDocument();
    expect(screen.getByText('https://docs.example.com')).toBeInTheDocument();
  });

  it('shows type badge for each link type', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    expect(screen.getByText('PR')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('links have correct href and target="_blank"', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    const link = screen.getByText('PR #1').closest('a');
    expect(link).toHaveAttribute('href', 'https://github.com/pr/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows link title when provided, falls back to URL when no title', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    // PR has title "PR #1"
    expect(screen.getByText('PR #1')).toBeInTheDocument();
    // Commit has empty title, falls back to URL
    expect(screen.getByText('https://github.com/commit/abc')).toBeInTheDocument();
    // URL has no title, falls back to URL
    expect(screen.getByText('https://docs.example.com')).toBeInTheDocument();
  });

  it('shows add button when not in form mode', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    expect(screen.getByText('+ Add link')).toBeInTheDocument();
  });

  it('clicking "Add link" shows the form', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    fireEvent.click(screen.getByText('+ Add link'));
    expect(screen.getByPlaceholderText('URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Title (optional)')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('form has type select with all options', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    fireEvent.click(screen.getByText('+ Add link'));
    const select = screen.getByLabelText('Link type') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.value);
    expect(options).toEqual(['pr', 'commit', 'url', 'issue']);
  });

  it('clicking Save calls mcpCall with correct args', async () => {
    render(<LinksSection links={mockLinks} {...params} />);
    fireEvent.click(screen.getByText('+ Add link'));

    const select = screen.getByLabelText('Link type');
    fireEvent.change(select, { target: { value: 'pr' } });

    const urlInput = screen.getByPlaceholderText('URL');
    fireEvent.change(urlInput, { target: { value: 'https://github.com/pr/99' } });

    const titleInput = screen.getByPlaceholderText('Title (optional)');
    fireEvent.change(titleInput, { target: { value: 'My PR' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockMcpCall).toHaveBeenCalledWith('add_link', {
        project: 'test',
        epic_id: 'E-1',
        story_id: 'S-1',
        task_id: 'T-1',
        type: 'pr',
        url: 'https://github.com/pr/99',
        title: 'My PR',
      });
    });
  });

  it('calls onUpdate after saving', async () => {
    const onUpdate = vi.fn();
    render(<LinksSection links={mockLinks} {...params} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText('+ Add link'));

    const urlInput = screen.getByPlaceholderText('URL');
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('clicking Cancel hides the form', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    fireEvent.click(screen.getByText('+ Add link'));
    expect(screen.getByPlaceholderText('URL')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('URL')).not.toBeInTheDocument();
    expect(screen.getByText('+ Add link')).toBeInTheDocument();
  });

  it('pressing Escape hides the form', () => {
    render(<LinksSection links={mockLinks} {...params} />);
    fireEvent.click(screen.getByText('+ Add link'));
    expect(screen.getByPlaceholderText('URL')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByPlaceholderText('URL'), { key: 'Escape' });
    expect(screen.queryByPlaceholderText('URL')).not.toBeInTheDocument();
  });

  it('shows "No links" text when links array is empty', () => {
    render(<LinksSection links={[]} {...params} />);
    expect(screen.getByText('No links')).toBeInTheDocument();
  });

  it('shows add button when no links exist', () => {
    render(<LinksSection links={[]} {...params} />);
    expect(screen.getByLabelText('Add link')).toBeInTheDocument();
  });

  it('does not call mcpCall when URL is empty', async () => {
    render(<LinksSection links={mockLinks} {...params} />);
    fireEvent.click(screen.getByText('+ Add link'));
    fireEvent.click(screen.getByText('Save'));

    // Wait a tick to let async handler run
    await waitFor(() => {
      expect(mockMcpCall).not.toHaveBeenCalled();
    });
  });
});
