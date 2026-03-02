"use client";

import { useState } from 'react';
import type { SubAgentEvent, SubAgentActivity } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SubAgentCard.css';

export interface SubAgentCardProps {
  event: SubAgentEvent;
  defaultCollapsed?: boolean;
  /** Opens the full agent conversation view at /agent/:agentId. */
  onOpenFullView?: (agentId: string) => void;
  /** Generic open-in-window callback (from EventCardRenderer). */
  onOpenInWindow?: () => void;
  className?: string;
}

/** Map agent types to BoxIcon names for role-specific icons. */
const AGENT_ICONS: Record<string, string> = {
  'go-architect': 'bxl-go-lang',
  'rust-engineer': 'bx-cog',
  'frontend-dev': 'bxl-react',
  'ui-ux-designer': 'bx-palette',
  'dba': 'bx-data',
  'mobile-dev': 'bx-mobile-alt',
  'devops': 'bxl-docker',
  'ai-engineer': 'bx-brain',
  'qa-go': 'bx-test-tube',
  'qa-rust': 'bx-test-tube',
  'qa-node': 'bx-test-tube',
  'qa-playwright': 'bx-test-tube',
  'scrum-master': 'bx-task',
  'platform-engineer': 'bx-chip',
  'extension-architect': 'bx-extension',
  'widget-engineer': 'bx-widgets',
  'Explore': 'bx-search-alt',
  'Plan': 'bx-map',
  'Bash': 'bx-terminal',
};

function getAgentIcon(agentType: string): string {
  return AGENT_ICONS[agentType] ?? 'bx-bot';
}

function ActivityItem({ activity }: { activity: SubAgentActivity }) {
  return (
    <div className={`sub-agent-card__activity sub-agent-card__activity--${activity.status}`}>
      <span className="sub-agent-card__activity-dot" />
      <span className="sub-agent-card__activity-tool">{activity.tool}</span>
      {activity.summary && (
        <span className="sub-agent-card__activity-summary">{activity.summary}</span>
      )}
      {activity.status === 'running' && (
        <svg className="sub-agent-card__activity-spin" width="12" height="12" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="var(--color-border)" strokeWidth="1.5" />
          <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

export const SubAgentCard = ({
  event,
  defaultCollapsed,
  onOpenFullView,
  onOpenInWindow,
  className,
}: SubAgentCardProps) => {
  const [showLog, setShowLog] = useState(false);
  const activities = event.activities ?? [];
  const doneCount = activities.filter((a) => a.status === 'done').length;
  const hasActivities = activities.length > 0;
  const isRunning = event.status === 'running';

  const headerActions = (
    <span className="sub-agent-card__actions">
      {hasActivities && (
        <button
          type="button"
          className="sub-agent-card__log-btn"
          onClick={() => setShowLog((s) => !s)}
          title={showLog ? 'Hide activity log' : 'Show activity log'}
          aria-label={showLog ? 'Hide activity log' : 'Show activity log'}
        >
          <BoxIcon name={showLog ? 'bx-chevron-up' : 'bx-list-ul'} size={14} />
          {activities.length > 0 && (
            <span className="sub-agent-card__log-count">{activities.length}</span>
          )}
        </button>
      )}
      {(onOpenFullView || onOpenInWindow) && (
        <button
          type="button"
          className="sub-agent-card__open-btn"
          onClick={() => {
            if (onOpenFullView && event.agentId) onOpenFullView(event.agentId);
            else onOpenInWindow?.();
          }}
          title="Open Full View"
          aria-label="Open agent full view"
        >
          <BoxIcon name="bx-link-external" size={14} />
        </button>
      )}
    </span>
  );

  return (
    <CardBase
      title={event.description}
      icon={<BoxIcon name={getAgentIcon(event.agentType)} size={16} />}
      badge={event.agentType}
      badgeColor="info"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      headerActions={headerActions}
      className={`sub-agent-card${className ? ` ${className}` : ''}`}
    >
      {/* Role badge + duration + progress */}
      <div className="sub-agent-card__meta">
        <span className="sub-agent-card__role-badge">
          <BoxIcon name={getAgentIcon(event.agentType)} size={12} />
          <span>{event.agentType}</span>
        </span>
        {event.duration && (
          <span className="sub-agent-card__duration">{event.duration}</span>
        )}
        {hasActivities && (
          <span className="sub-agent-card__progress-count">
            {doneCount}/{activities.length} tools
          </span>
        )}
      </div>

      {/* Progress bar when running */}
      {isRunning && hasActivities && (
        <div className="sub-agent-card__progress-bar">
          <div
            className="sub-agent-card__progress-fill"
            style={{ width: `${(doneCount / Math.max(activities.length, 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Prompt preview */}
      {event.prompt && (
        <pre className="sub-agent-card__prompt">{event.prompt}</pre>
      )}

      {/* Activity log (expandable) */}
      {showLog && hasActivities && (
        <div className="sub-agent-card__log">
          {activities.map((a, i) => (
            <ActivityItem key={`${a.tool}-${i}`} activity={a} />
          ))}
        </div>
      )}
    </CardBase>
  );
};
