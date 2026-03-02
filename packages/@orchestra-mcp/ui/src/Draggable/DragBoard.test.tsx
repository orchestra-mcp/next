import { render, screen, fireEvent } from '@testing-library/react';
import { DragBoard } from './DragBoard';
import { DragGroup } from './DragGroup';
import { DragItem } from './Draggable';

const dt = () => ({ setData: vi.fn(), effectAllowed: '', dropEffect: '' });

const renderBoard = () => {
  const onMove = vi.fn();
  const onReorderA = vi.fn();
  const onReorderB = vi.fn();
  const result = render(
    <DragBoard onMove={onMove}>
      <DragGroup groupId="a" onReorder={onReorderA}>
        <DragItem id="a1" index={0}>Item A1</DragItem>
        <DragItem id="a2" index={1}>Item A2</DragItem>
      </DragGroup>
      <DragGroup groupId="b" onReorder={onReorderB}>
        <DragItem id="b1" index={0}>Item B1</DragItem>
      </DragGroup>
    </DragBoard>,
  );
  return { ...result, onMove, onReorderA, onReorderB };
};

describe('DragBoard', () => {
  // ── Rendering ──────────────────────────────────

  it('renders board with multiple groups', () => {
    renderBoard();
    expect(screen.getByText('Item A1')).toBeInTheDocument();
    expect(screen.getByText('Item B1')).toBeInTheDocument();
  });

  it('renders groups with data-group-id', () => {
    const { container } = renderBoard();
    expect(container.querySelector('[data-group-id="a"]')).toBeInTheDocument();
    expect(container.querySelector('[data-group-id="b"]')).toBeInTheDocument();
  });

  it('renders board container with drag-board class', () => {
    const { container } = renderBoard();
    expect(container.querySelector('.drag-board')).toBeInTheDocument();
  });

  // ── Within-group reorder ──────────────────────

  it('within-group drag calls onReorder, not onMove', () => {
    const { onMove, onReorderA } = renderBoard();
    const items = screen.getAllByRole('listitem');
    const a1 = items[0]; // Item A1
    const a2 = items[1]; // Item A2
    fireEvent.dragStart(a1, { dataTransfer: dt() });
    fireEvent.drop(a2);
    expect(onReorderA).toHaveBeenCalledWith({ fromIndex: 0, toIndex: 1 });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('within-group same index is no-op', () => {
    const { onReorderA } = renderBoard();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: dt() });
    fireEvent.drop(items[0]);
    expect(onReorderA).not.toHaveBeenCalled();
  });

  // ── Cross-group moves ─────────────────────────

  it('cross-group drag calls onMove with correct result', () => {
    const { onMove } = renderBoard();
    const items = screen.getAllByRole('listitem');
    const a1 = items[0]; // group a, index 0
    const b1 = items[2]; // group b, index 0
    fireEvent.dragStart(a1, { dataTransfer: dt() });
    fireEvent.dragOver(b1, { dataTransfer: { dropEffect: '' } });
    fireEvent.drop(b1);
    expect(onMove).toHaveBeenCalledWith({
      itemId: 'a1',
      fromGroupId: 'a',
      fromIndex: 0,
      toGroupId: 'b',
      toIndex: 0,
    });
  });

  it('reverse cross-group drag (B to A)', () => {
    const { onMove } = renderBoard();
    const items = screen.getAllByRole('listitem');
    const b1 = items[2]; // group b
    const a2 = items[1]; // group a, index 1
    fireEvent.dragStart(b1, { dataTransfer: dt() });
    fireEvent.dragOver(a2, { dataTransfer: { dropEffect: '' } });
    fireEvent.drop(a2);
    expect(onMove).toHaveBeenCalledWith({
      itemId: 'b1',
      fromGroupId: 'b',
      fromIndex: 0,
      toGroupId: 'a',
      toIndex: 1,
    });
  });

  // ── Visual states ──────────────────────────────

  it('dragging item gets dragging class', () => {
    renderBoard();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: dt() });
    expect(items[0]).toHaveClass('drag-item--dragging');
  });

  it('drag over target gets over class', () => {
    renderBoard();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: dt() });
    fireEvent.dragOver(items[1], { dataTransfer: { dropEffect: '' } });
    expect(items[1]).toHaveClass('drag-item--over');
  });

  it('drag end clears all states', () => {
    renderBoard();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: dt() });
    fireEvent.dragOver(items[2], { dataTransfer: { dropEffect: '' } });
    fireEvent.dragEnd(items[0]);
    expect(items[0]).not.toHaveClass('drag-item--dragging');
    expect(items[2]).not.toHaveClass('drag-item--over');
  });

  it('foreign hover adds class to target group', () => {
    const { container } = renderBoard();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: dt() }); // from group a
    fireEvent.dragOver(items[2], { dataTransfer: { dropEffect: '' } }); // over group b
    const groupB = container.querySelector('[data-group-id="b"]');
    expect(groupB).toHaveClass('drag-group--foreign-hover');
  });

  // ── Empty group ────────────────────────────────

  it('empty group shows emptyContent', () => {
    render(
      <DragBoard onMove={vi.fn()}>
        <DragGroup groupId="empty" emptyContent="Nothing here" />
      </DragBoard>,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('empty group accepts drop', () => {
    const onMove = vi.fn();
    render(
      <DragBoard onMove={onMove}>
        <DragGroup groupId="src">
          <DragItem id="x1" index={0}>X1</DragItem>
        </DragGroup>
        <DragGroup groupId="empty" emptyContent="Drop" />
      </DragBoard>,
    );
    const item = screen.getByText('X1').closest('[role="listitem"]')!;
    const emptyZone = screen.getByText('Drop');
    fireEvent.dragStart(item, { dataTransfer: dt() });
    fireEvent.dragOver(emptyZone, { dataTransfer: { dropEffect: '' } });
    fireEvent.drop(emptyZone);
    expect(onMove).toHaveBeenCalledWith({
      itemId: 'x1',
      fromGroupId: 'src',
      fromIndex: 0,
      toGroupId: 'empty',
      toIndex: 0,
    });
  });

  // ── Keyboard ───────────────────────────────────

  it('arrow key reorders within group', () => {
    const { onReorderA } = renderBoard();
    const items = screen.getAllByRole('listitem');
    fireEvent.keyDown(items[1], { key: 'ArrowUp' }); // A2 up
    expect(onReorderA).toHaveBeenCalledWith({ fromIndex: 1, toIndex: 0 });
  });

  // ── Custom className ───────────────────────────

  it('applies custom className to board', () => {
    const { container } = render(
      <DragBoard onMove={vi.fn()} className="my-board">
        <DragGroup groupId="g1">
          <DragItem id="i1" index={0}>I1</DragItem>
        </DragGroup>
      </DragBoard>,
    );
    expect(container.querySelector('.drag-board')).toHaveClass('my-board');
  });
});
