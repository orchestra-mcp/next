import type { ReactNode } from 'react';
import { useDragPosition } from '../hooks/useDragPosition';
import './BubbleButton.css';

export interface BubbleAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export interface BubbleButtonProps {
  /** Icon rendered inside the main button */
  icon: ReactNode;
  /** @deprecated Use draggable positioning instead */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Optional tooltip text */
  tooltip?: string;
  /** Whether the action menu is expanded */
  expanded: boolean;
  /** Toggle callback for expanded state */
  onToggle: () => void;
  /** Action items shown when expanded */
  actions?: BubbleAction[];
  /** Pulse animation for attention */
  pulse?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disable all interaction */
  disabled?: boolean;
  /** Enable free-form drag */
  draggable?: boolean;
  /** Snap to nearest edge on release */
  snapToEdge?: boolean;
}

export const BubbleButton = ({
  icon,
  position = 'bottom-right',
  tooltip,
  expanded,
  onToggle,
  actions = [],
  pulse = false,
  size = 'md',
  disabled = false,
  draggable = false,
  snapToEdge = true,
}: BubbleButtonProps) => {
  const drag = useDragPosition({ snapToEdge, edgeMargin: 24 });

  const handleTriggerClick = () => {
    if (disabled) return;
    if (draggable && drag.wasDragged) return;
    onToggle();
  };

  const containerCls = [
    'bubble',
    !draggable && `bubble--${position}`,
    draggable && 'bubble--draggable',
    expanded && 'bubble--expanded',
  ].filter(Boolean).join(' ');

  const triggerCls = [
    'bubble__trigger',
    `bubble__trigger--${size}`,
    pulse && 'bubble__trigger--pulse',
    drag.isDragging && 'bubble__trigger--dragging',
  ].filter(Boolean).join(' ');

  const style = draggable
    ? { left: drag.position.x, top: drag.position.y }
    : undefined;

  return (
    <div
      className={containerCls}
      style={style}
      data-testid="bubble-container"
      {...(draggable ? drag.handlers : {})}
    >
      {actions.length > 0 && (
        <div className="bubble__actions" data-testid="bubble-actions">
          {actions.map((action, i) => (
            <button
              key={i}
              type="button"
              className="bubble__action"
              style={{ transitionDelay: expanded ? `${i * 40}ms` : '0ms' }}
              onClick={action.onClick}
              aria-label={action.label}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={triggerCls}
        onClick={handleTriggerClick}
        disabled={disabled}
        aria-label={tooltip ?? 'Toggle actions'}
        aria-expanded={expanded}
        title={tooltip}
      >
        {icon}
      </button>
    </div>
  );
};
