import type { McpConfirmationResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ConfirmationCard.css';

export interface ConfirmationCardProps {
  data: McpConfirmationResult;
  className?: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  delete_note:         { label: 'Note Deleted',        icon: 'bx-trash' },
  delete_task:         { label: 'Task Deleted',         icon: 'bx-trash' },
  delete_story:        { label: 'Story Deleted',        icon: 'bx-trash' },
  delete_epic:         { label: 'Epic Deleted',         icon: 'bx-trash' },
  install_docs:        { label: 'Docs Installed',       icon: 'bx-download' },
  install_agents:      { label: 'Agents Installed',     icon: 'bx-download' },
  install_skills:      { label: 'Skills Installed',     icon: 'bx-download' },
  send_notification:   { label: 'Notification Sent',    icon: 'bx-bell' },
  play_sound:          { label: 'Sound Played',         icon: 'bx-volume-full' },
  save_memory:         { label: 'Memory Saved',         icon: 'bx-brain' },
  record_usage:        { label: 'Usage Recorded',       icon: 'bx-bar-chart' },
  reset_session_usage: { label: 'Session Reset',        icon: 'bx-refresh' },
  regenerate_readme:   { label: 'README Regenerated',   icon: 'bx-file' },
  log_request:         { label: 'Request Logged',       icon: 'bx-log' },
  open_desktop_window: { label: 'Window Opened',        icon: 'bx-window-open' },
  assign_task:         { label: 'Task Assigned',        icon: 'bx-user-check' },
  unassign_task:       { label: 'Task Unassigned',      icon: 'bx-user-x' },
  add_labels:          { label: 'Labels Added',         icon: 'bx-tag' },
  remove_labels:       { label: 'Labels Removed',       icon: 'bx-tag' },
  add_dependency:      { label: 'Dependency Added',     icon: 'bx-link' },
  remove_dependency:   { label: 'Dependency Removed',   icon: 'bx-unlink' },
  add_link:            { label: 'Link Added',           icon: 'bx-link-external' },
  add_sprint_tasks:    { label: 'Tasks Added to Sprint', icon: 'bx-run' },
  remove_sprint_tasks: { label: 'Tasks Removed',        icon: 'bx-run' },
  set_estimate:        { label: 'Estimate Set',         icon: 'bx-stopwatch' },
  share_with_team:     { label: 'Shared with Team',     icon: 'bx-share' },
  invite_member:       { label: 'Member Invited',       icon: 'bx-user-plus' },
};

function humanizeAction(action?: string): string {
  if (!action) return 'Done';
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ConfirmationCard = ({ data, className }: ConfirmationCardProps) => {
  const meta = ACTION_LABELS[data.action ?? ''] ?? {
    label: humanizeAction(data.action),
    icon: 'bx-check-circle',
  };

  const success = data.ok !== false && data.success !== false;
  const message = data.message;

  return (
    <CardBase
      title={meta.label}
      icon={<BoxIcon name={meta.icon as 'bx-check-circle'} size={16} />}
      badge={success ? 'OK' : 'Failed'}
      badgeColor={success ? 'success' : 'danger'}
      defaultCollapsed={false}
      className={`confirmation-card${className ? ` ${className}` : ''}`}
    >
      <div className="confirmation-card__body">
        <span
          className="confirmation-card__icon"
          style={{ color: success ? '#22c55e' : '#ef4444', display: 'flex' }}
        >
          <BoxIcon name={success ? 'bx-check-circle' : 'bx-x-circle'} size={14} />
        </span>
        <span className={`confirmation-card__message${!message ? ' confirmation-card__message--muted' : ''}`}>
          {message ?? (success ? 'Operation completed successfully.' : 'Operation failed.')}
        </span>
      </div>
    </CardBase>
  );
};
