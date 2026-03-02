"use client";

import { useState, useMemo } from 'react';
import type { SubAgentEvent, SubAgentActivity, ClaudeCodeEvent } from '../types/events';
import { TimelineLayout } from '../TimelineLayout';
import { TimelineNode } from '../TimelineLayout';
import { EventCardRenderer } from '../cards/EventCardRenderer';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SubAgentPage.css';

export interface SubAgentPageProps {
  /** The sub-agent event with metadata */
  event: SubAgentEvent;
  /** Full list of tool call events from this agent's conversation */
  events?: ClaudeCodeEvent[];
  /** Called when user clicks a file path in any child card */
  onFileClick?: (filePath: string, line?: number) => void;
  /** Called when user clicks back/close */
  onBack?: () => void;
  className?: string;
}

const AGENT_ICONS: Record<string, string> = {
  'go-architect': 'bxl-go-lang', 'rust-engineer': 'bx-cog',
  'frontend-dev': 'bxl-react', 'ui-ux-designer': 'bx-palette',
  'dba': 'bx-data', 'mobile-dev': 'bx-mobile-alt',
  'devops': 'bxl-docker', 'ai-engineer': 'bx-brain',
  'qa-go': 'bx-test-tube', 'qa-rust': 'bx-test-tube',
  'qa-node': 'bx-test-tube', 'qa-playwright': 'bx-test-tube',
  'scrum-master': 'bx-task', 'platform-engineer': 'bx-chip',
  'extension-architect': 'bx-extension', 'widget-engineer': 'bx-widgets',
  'Explore': 'bx-search-alt', 'Plan': 'bx-map', 'Bash': 'bx-terminal',
};

function getAgentIcon(agentType: string): string {
  return AGENT_ICONS[agentType] ?? 'bx-bot';
}

function statusLabel(status?: string): string {
  if (status === 'running') return 'Running';
  if (status === 'done') return 'Completed';
  if (status === 'error') return 'Error';
  return 'Pending';
}

function ActivityFallbackItem({ activity }: { activity: SubAgentActivity }) {
  return (
    <div className={`sub-agent-page__activity-item sub-agent-page__activity-item--${activity.status}`}>
      <span className="sub-agent-page__activity-dot" />
      <span className="sub-agent-page__activity-tool">{activity.tool}</span>
      {activity.summary && (
        <span className="sub-agent-page__activity-summary">{activity.summary}</span>
      )}
    </div>
  );
}

export const SubAgentPage = ({
  event,
  events,
  onFileClick,
  onBack,
  className,
}: SubAgentPageProps) => {
  const [promptOpen, setPromptOpen] = useState(false);
  const activities = event.activities ?? [];
  const hasEvents = events && events.length > 0;

  const { doneCount, totalCount } = useMemo(() => {
    if (hasEvents) {
      const done = events.filter((e) => e.status === 'done').length;
      return { doneCount: done, totalCount: events.length };
    }
    const done = activities.filter((a) => a.status === 'done').length;
    return { doneCount: done, totalCount: activities.length };
  }, [events, activities, hasEvents]);

  const isRunning = event.status === 'running';
  const statusCls = isRunning ? 'running' : event.status === 'error' ? 'error' : 'done';

  return (
    <div className={`sub-agent-page${className ? ` ${className}` : ''}`}>
      {/* Header */}
      <div className="sub-agent-page__header">
        {onBack && (
          <button type="button" className="sub-agent-page__back-btn" onClick={onBack}>
            <BoxIcon name="bx-arrow-back" size={16} />
            <span>Back</span>
          </button>
        )}

        <div className="sub-agent-page__agent-info">
          <div className="sub-agent-page__agent-type">
            <BoxIcon name={getAgentIcon(event.agentType)} size={16} />
            <span>{event.agentType}</span>
          </div>
          <div className="sub-agent-page__description">{event.description}</div>
        </div>

        <div className="sub-agent-page__stats">
          <span className={`sub-agent-page__status sub-agent-page__status--${statusCls}`}>
            {statusLabel(event.status)}
          </span>
          {event.duration && (
            <span className="sub-agent-page__duration">{event.duration}</span>
          )}
          {totalCount > 0 && (
            <span className="sub-agent-page__tool-count">{doneCount}/{totalCount} tools</span>
          )}
        </div>
      </div>

      {/* Prompt section */}
      {event.prompt && (
        <div className="sub-agent-page__prompt-section">
          <button
            type="button"
            className="sub-agent-page__prompt-toggle"
            onClick={() => setPromptOpen((o) => !o)}
            aria-expanded={promptOpen}
          >
            <BoxIcon name={promptOpen ? 'bx-chevron-down' : 'bx-chevron-right'} size={14} />
            <span>Prompt</span>
          </button>
          {promptOpen && (
            <pre className="sub-agent-page__prompt">{event.prompt}</pre>
          )}
        </div>
      )}

      {/* Progress bar */}
      {isRunning && totalCount > 0 && (
        <div className="sub-agent-page__progress-bar">
          <div
            className="sub-agent-page__progress-fill"
            style={{ width: `${(doneCount / Math.max(totalCount, 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Timeline content */}
      <div className="sub-agent-page__timeline">
        {hasEvents ? (
          <TimelineLayout>
            {events.map((ev) => (
              <TimelineNode
                key={ev.id}
                status={ev.status === 'running' ? 'running' : ev.status === 'error' ? 'error' : 'done'}
                nodeType="tool"
              >
                <EventCardRenderer
                  event={ev}
                  onFileClick={onFileClick}
                />
              </TimelineNode>
            ))}
          </TimelineLayout>
        ) : activities.length > 0 ? (
          <TimelineLayout>
            {activities.map((a, i) => (
              <TimelineNode
                key={`${a.tool}-${i}`}
                status={a.status === 'running' ? 'running' : a.status === 'error' ? 'error' : 'done'}
                nodeType="tool"
              >
                <ActivityFallbackItem activity={a} />
              </TimelineNode>
            ))}
          </TimelineLayout>
        ) : (
          <div className="sub-agent-page__empty">
            {isRunning ? 'Waiting for agent activity...' : 'No activity recorded'}
          </div>
        )}
      </div>
    </div>
  );
};
