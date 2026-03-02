import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DragProvider, DragItem } from './Draggable';
import { DragBoard } from './DragBoard';
import { DragGroup } from './DragGroup';
import type { DragProviderProps } from './Draggable';
import type { DragMoveResult } from './DragBoard.types';

/**
 * Draggable primitives for reorderable lists, grids, kanban boards.
 * - Single-list reorder with DragProvider + DragItem
 * - Group-to-group drag with DragBoard + DragGroup + DragItem
 * - 26 color themes, 3 component variants, keyboard support
 */
const meta = {
  title: 'UI/Draggable',
  component: DragProvider,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal', 'grid'],
      description: 'Layout direction for drag items',
    },
  },
} satisfies Meta<typeof DragProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Helpers ──────────────────────────────────

const useReorderableList = (initial: string[]) => {
  const [items, setItems] = useState(initial);
  const onReorder = ({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };
  return { items, onReorder };
};

const itemStyle = { padding: '8px 16px' };

const ListTemplate = (props: Partial<DragProviderProps> & { items?: string[] }) => {
  const { items, onReorder } = useReorderableList(
    props.items || ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
  );
  return (
    <DragProvider onReorder={onReorder} direction={props.direction || 'vertical'}>
      {items.map((item, i) => (
        <DragItem key={item} id={item} index={i}>
          <span style={itemStyle}>{item}</span>
        </DragItem>
      ))}
    </DragProvider>
  );
};

// ── Single-list stories ─────────────────────

export const VerticalList: Story = {
  args: { direction: 'vertical', onReorder: () => {} },
  render: () => <ListTemplate direction="vertical" />,
};

export const HorizontalList: Story = {
  args: { direction: 'horizontal', onReorder: () => {} },
  render: () => <ListTemplate direction="horizontal" />,
};

export const Grid: Story = {
  args: { direction: 'grid', onReorder: () => {} },
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <ListTemplate
        direction="grid"
        items={['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Pink']}
      />
    </div>
  ),
};

export const WithHandles: Story = {
  args: { direction: 'vertical', onReorder: () => {} },
  render: () => {
    const { items, onReorder } = useReorderableList(['Task A', 'Task B', 'Task C']);
    return (
      <DragProvider onReorder={onReorder}>
        {items.map((item, i) => (
          <DragItem key={item} id={item} index={i} handle>
            {({ dragHandleProps }) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span {...dragHandleProps} style={{ cursor: 'grab' }}>
                  &#x2630;
                </span>
                <span>{item}</span>
              </div>
            )}
          </DragItem>
        ))}
      </DragProvider>
    );
  },
};

export const WithDisabled: Story = {
  args: { direction: 'vertical', onReorder: () => {} },
  render: () => {
    const { items, onReorder } = useReorderableList(['Movable 1', 'Locked', 'Movable 2']);
    return (
      <DragProvider onReorder={onReorder}>
        {items.map((item, i) => (
          <DragItem key={item} id={item} index={i} disabled={item === 'Locked'}>
            <span style={itemStyle}>{item}</span>
          </DragItem>
        ))}
      </DragProvider>
    );
  },
};

// ── Kanban board stories ────────────────────

interface KanbanState {
  [groupId: string]: { id: string; label: string }[];
}

const colStyle: React.CSSProperties = { minWidth: 220, flex: 1 };
const headStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 13,
  marginBottom: 8,
  padding: '0 4px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: 'var(--color-fg)',
};
const kanbanItemStyle: React.CSSProperties = { padding: '6px 10px', fontSize: 13 };

const useKanban = (initial: KanbanState) => {
  const [state, setState] = useState(initial);

  const handleMove = (r: DragMoveResult) => {
    setState((prev) => {
      const next = { ...prev };
      const src = [...(next[r.fromGroupId] ?? [])];
      const dst = [...(next[r.toGroupId] ?? [])];
      const [moved] = src.splice(r.fromIndex, 1);
      if (!moved) return prev;
      dst.splice(r.toIndex, 0, moved);
      next[r.fromGroupId] = src;
      next[r.toGroupId] = dst;
      return next;
    });
  };

  const handleReorder = (gid: string) => (r: { fromIndex: number; toIndex: number }) => {
    setState((prev) => {
      const items = [...(prev[gid] ?? [])];
      const [moved] = items.splice(r.fromIndex, 1);
      items.splice(r.toIndex, 0, moved);
      return { ...prev, [gid]: items };
    });
  };

  return { state, handleMove, handleReorder };
};

export const KanbanBoard: Story = {
  args: { direction: 'vertical', onReorder: () => {} },
  render: () => {
    const { state, handleMove, handleReorder } = useKanban({
      todo: [
        { id: 't1', label: 'Design mockups' },
        { id: 't2', label: 'Write specs' },
        { id: 't3', label: 'Set up CI' },
      ],
      progress: [
        { id: 't4', label: 'Build API' },
        { id: 't5', label: 'Auth flow' },
      ],
      done: [{ id: 't6', label: 'Project setup' }],
    });
    const titles: Record<string, string> = {
      todo: 'To Do',
      progress: 'In Progress',
      done: 'Done',
    };
    return (
      <DragBoard onMove={handleMove}>
        {Object.keys(state).map((gid) => (
          <div key={gid} style={colStyle}>
            <div style={headStyle}>{titles[gid] ?? gid}</div>
            <DragGroup groupId={gid} onReorder={handleReorder(gid)} emptyContent="No items">
              {state[gid].map((item, i) => (
                <DragItem key={item.id} id={item.id} index={i}>
                  <span style={kanbanItemStyle}>{item.label}</span>
                </DragItem>
              ))}
            </DragGroup>
          </div>
        ))}
      </DragBoard>
    );
  },
};

export const KanbanWithEmptyColumns: Story = {
  args: { direction: 'vertical', onReorder: () => {} },
  render: () => {
    const { state, handleMove, handleReorder } = useKanban({
      backlog: [
        { id: 'b1', label: 'Task A' },
        { id: 'b2', label: 'Task B' },
        { id: 'b3', label: 'Task C' },
      ],
      active: [],
      review: [],
      complete: [],
    });
    return (
      <DragBoard onMove={handleMove}>
        {Object.keys(state).map((gid) => (
          <div key={gid} style={colStyle}>
            <div style={headStyle}>{gid.charAt(0).toUpperCase() + gid.slice(1)}</div>
            <DragGroup groupId={gid} onReorder={handleReorder(gid)} emptyContent="Drop here">
              {state[gid].map((item, i) => (
                <DragItem key={item.id} id={item.id} index={i}>
                  <span style={kanbanItemStyle}>{item.label}</span>
                </DragItem>
              ))}
            </DragGroup>
          </div>
        ))}
      </DragBoard>
    );
  },
};
