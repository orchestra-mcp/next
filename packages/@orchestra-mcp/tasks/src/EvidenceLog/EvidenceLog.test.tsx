import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EvidenceLog } from './EvidenceLog';

const mockEvidence = [
  { gate: 'testing', description: 'All 15 tests pass.', timestamp: '2026-01-15T10:00:00Z' },
  { gate: 'verification', description: 'Coverage at 95%.', timestamp: '2026-01-15T11:00:00Z' },
  { gate: 'documentation', description: 'x'.repeat(150), timestamp: '2026-01-15T12:00:00Z' },
  { gate: 'review', description: 'Code looks good.', timestamp: '2026-01-15T13:00:00Z' },
];

describe('EvidenceLog', () => {
  it('returns null when evidence is empty', () => {
    const { container } = render(<EvidenceLog evidence={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders all evidence entries', () => {
    render(<EvidenceLog evidence={mockEvidence} />);
    const entries = document.querySelectorAll('.evidence-log__entry');
    expect(entries.length).toBe(4);
  });

  it('shows gate label for each entry', () => {
    render(<EvidenceLog evidence={mockEvidence} />);
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('shows gate icon for each entry', () => {
    render(<EvidenceLog evidence={mockEvidence} />);
    expect(screen.getByText('\u{1F9EA}')).toBeInTheDocument();
    expect(screen.getByText('\u2705')).toBeInTheDocument();
    expect(screen.getByText('\u{1F4DD}')).toBeInTheDocument();
    expect(screen.getByText('\u{1F50D}')).toBeInTheDocument();
  });

  it('shows formatted timestamp', () => {
    render(<EvidenceLog evidence={[mockEvidence[0]]} />);
    const formatted = new Date('2026-01-15T10:00:00Z').toLocaleDateString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it('shows evidence description text', () => {
    render(<EvidenceLog evidence={[mockEvidence[0]]} />);
    expect(screen.getByText('All 15 tests pass.')).toBeInTheDocument();
  });

  it('truncates long text with ellipsis', () => {
    const longEntry = mockEvidence[2]; // 150 chars of 'x'
    render(<EvidenceLog evidence={[longEntry]} />);
    const text = screen.getByText(/^x+\.\.\.$/);
    expect(text).toBeInTheDocument();
    expect(text.textContent).toBe('x'.repeat(120) + '...');
  });

  it('shows "Show more" button for long text', () => {
    render(<EvidenceLog evidence={[mockEvidence[2]]} />);
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('clicking "Show more" expands full text', () => {
    render(<EvidenceLog evidence={[mockEvidence[2]]} />);
    fireEvent.click(screen.getByText('Show more'));
    expect(screen.getByText('x'.repeat(150))).toBeInTheDocument();
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('clicking "Show less" re-truncates text', () => {
    render(<EvidenceLog evidence={[mockEvidence[2]]} />);
    fireEvent.click(screen.getByText('Show more'));
    expect(screen.getByText('x'.repeat(150))).toBeInTheDocument();
    fireEvent.click(screen.getByText('Show less'));
    expect(screen.getByText('x'.repeat(120) + '...')).toBeInTheDocument();
  });

  it('short text has no "Show more" button', () => {
    render(<EvidenceLog evidence={[mockEvidence[0]]} />);
    expect(screen.queryByText('Show more')).toBeNull();
  });

  it('shows timeline markers for each entry', () => {
    render(<EvidenceLog evidence={mockEvidence} />);
    const markers = document.querySelectorAll('.evidence-log__marker');
    expect(markers.length).toBe(4);
  });

  it('falls back to raw gate name for unknown gates', () => {
    const unknownGate = { gate: 'custom-gate', description: 'Custom evidence.', timestamp: '2026-01-15T14:00:00Z' };
    render(<EvidenceLog evidence={[unknownGate]} />);
    expect(screen.getByText('custom-gate')).toBeInTheDocument();
  });

  it('renders section title', () => {
    render(<EvidenceLog evidence={mockEvidence} />);
    expect(screen.getByText('Evidence Log')).toBeInTheDocument();
  });
});
