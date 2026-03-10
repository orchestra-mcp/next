'use client'

import type { ReactNode } from 'react'
import { DragProvider, DragItem } from '@orchestra-mcp/ui'
import type { WidgetLayout } from '@/types/dashboard'

interface DashboardGridProps {
  widgets: WidgetLayout[]
  editMode: boolean
  onReorder: (fromIndex: number, toIndex: number) => void
  children: (widget: WidgetLayout, index: number) => ReactNode
}

export function DashboardGrid({ widgets, editMode, onReorder, children }: DashboardGridProps) {
  const visible = editMode ? widgets : widgets.filter(w => !w.hidden)

  return (
    <>
      <style>{`
        .drag-list.drag-list--grid {
          display: grid !important;
          grid-template-columns: repeat(12, 1fr);
          gap: 14px;
          flex-wrap: nowrap;
        }
        .drag-list--grid > .drag-item {
          background: transparent;
          border: none;
          padding: 0;
          cursor: default;
          align-self: stretch;
        }
        .drag-list--grid > .drag-item.drag-item--disabled {
          opacity: 1;
          cursor: default;
        }
        .drag-list--grid > .drag-item > div {
          height: 100%;
        }
        .drag-list--grid > .drag-item:hover {
          background: transparent;
        }
        .drag-list--grid > .drag-item--dragging {
          opacity: 0.4;
          transform: scale(0.97);
        }
        .drag-list--grid > .drag-item--over::before {
          top: 0;
          left: -3px;
          bottom: 0;
          width: 3px;
          height: auto;
          right: auto;
        }
        ${visible.map(w => `.drag-list--grid > .drag-item[data-drag-id="${w.id}"] { grid-column: span ${w.colSpan}; }`).join('\n        ')}
      `}</style>
      <DragProvider
        direction="grid"
        onReorder={({ fromIndex, toIndex }) => onReorder(fromIndex, toIndex)}
      >
        {visible.map((widget, index) => (
          <DragItem
            key={widget.id}
            id={widget.id}
            index={index}
            disabled={!editMode || widget.locked}
            handle
          >
            {({ dragHandleProps }) => (
              <div
                {...(editMode && !widget.locked ? dragHandleProps : {})}
              >
                {children(widget, index)}
              </div>
            )}
          </DragItem>
        ))}
      </DragProvider>
    </>
  )
}
