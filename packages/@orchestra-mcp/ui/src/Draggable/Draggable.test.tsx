import { render, screen, fireEvent } from '@testing-library/react';
import { DragProvider, DragItem, DropZone } from './Draggable';

const renderList = (props?: { disabled?: boolean; handle?: boolean }) => {
  const onReorder = vi.fn();
  const items = ['Alpha', 'Beta', 'Gamma'];
  const result = render(
    <DragProvider onReorder={onReorder}>
      {items.map((item, i) => (
        <DragItem
          key={item}
          id={item}
          index={i}
          disabled={props?.disabled}
          handle={props?.handle}
        >
          {item}
        </DragItem>
      ))}
    </DragProvider>,
  );
  return { ...result, onReorder };
};

describe('Draggable', () => {
  it('renders all items', () => {
    renderList();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('items have correct data attributes', () => {
    renderList();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-drag-id', 'Alpha');
    expect(items[0]).toHaveAttribute('data-drag-index', '0');
    expect(items[1]).toHaveAttribute('data-drag-id', 'Beta');
    expect(items[2]).toHaveAttribute('data-drag-index', '2');
  });

  it('items are draggable by default', () => {
    renderList();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('draggable', 'true');
  });

  it('disabled items are not draggable', () => {
    renderList({ disabled: true });
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('draggable', 'false');
    expect(items[0]).toHaveClass('drag-item--disabled');
    expect(items[0]).toHaveAttribute('aria-disabled', 'true');
  });

  it('handle mode disables whole-item drag', () => {
    renderList({ handle: true });
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('draggable', 'false');
  });

  it('drag start sets dragging class', () => {
    renderList();
    const item = screen.getAllByRole('listitem')[0];
    fireEvent.dragStart(item, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    expect(item).toHaveClass('drag-item--dragging');
  });

  it('drag over sets over class on target', () => {
    renderList();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.dragOver(items[1], { dataTransfer: { dropEffect: '' } });
    expect(items[1]).toHaveClass('drag-item--over');
  });

  it('drop triggers onReorder with correct indices', () => {
    const { onReorder } = renderList();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[0], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.drop(items[2]);
    expect(onReorder).toHaveBeenCalledWith({ fromIndex: 0, toIndex: 2 });
  });

  it('drop on same index does not call onReorder', () => {
    const { onReorder } = renderList();
    const items = screen.getAllByRole('listitem');
    fireEvent.dragStart(items[1], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.drop(items[1]);
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('drag end clears dragging state', () => {
    renderList();
    const item = screen.getAllByRole('listitem')[0];
    fireEvent.dragStart(item, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    expect(item).toHaveClass('drag-item--dragging');
    fireEvent.dragEnd(item);
    expect(item).not.toHaveClass('drag-item--dragging');
  });

  it('keyboard arrow moves item', () => {
    const { onReorder } = renderList();
    const items = screen.getAllByRole('listitem');
    fireEvent.keyDown(items[1], { key: 'ArrowUp' });
    expect(onReorder).toHaveBeenCalledWith({ fromIndex: 1, toIndex: 0 });
  });

  it('renders container with direction class', () => {
    const { container } = render(
      <DragProvider onReorder={vi.fn()} direction="horizontal">
        <DragItem id="a" index={0}>A</DragItem>
      </DragProvider>,
    );
    expect(container.querySelector('.drag-list--horizontal')).toBeInTheDocument();
  });

  it('DropZone shows active class during drag over', () => {
    const onReorder = vi.fn();
    render(
      <DragProvider onReorder={onReorder}>
        <DragItem id="a" index={0}>A</DragItem>
        <DropZone index={1}>Drop here</DropZone>
      </DragProvider>,
    );
    const items = screen.getAllByRole('listitem');
    const item = items[0];
    const zone = items[1]; // DropZone renders as role="listitem"
    fireEvent.dragStart(item, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.dragOver(zone, { dataTransfer: { dropEffect: '' } });
    expect(zone).toHaveClass('drop-zone--active');
  });

  it('render function receives isDragging and dragHandleProps', () => {
    render(
      <DragProvider onReorder={vi.fn()}>
        <DragItem id="a" index={0} handle>
          {({ isDragging, dragHandleProps }) => (
            <div>
              <span data-testid="status">{isDragging ? 'dragging' : 'idle'}</span>
              <button {...dragHandleProps}>Grip</button>
            </div>
          )}
        </DragItem>
      </DragProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByText('Grip')).toHaveAttribute('data-drag-handle');
  });
});
