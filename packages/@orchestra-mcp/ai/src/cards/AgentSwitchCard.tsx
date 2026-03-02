import type { AgentSwitchEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './AgentSwitchCard.css';

export interface AgentSwitchCardProps {
  event: AgentSwitchEvent;
  className?: string;
}

/** Map agent types to role-specific icons */
const AGENT_ICONS: Record<string, string> = {
  'go-architect': 'bx-server',
  'rust-engineer': 'bx-cog',
  'frontend-dev': 'bxl-react',
  'ui-ux-designer': 'bx-palette',
  'dba': 'bx-data',
  'mobile-dev': 'bx-mobile-alt',
  'scrum-master': 'bx-calendar-check',
  'widget-engineer': 'bx-widget',
  'platform-engineer': 'bx-chip',
  'extension-architect': 'bx-extension',
  'ai-engineer': 'bx-bot',
  'devops': 'bx-cloud',
  'qa-go': 'bx-test-tube',
  'qa-rust': 'bx-test-tube',
  'qa-node': 'bx-test-tube',
  'qa-playwright': 'bx-test-tube',
};

/** Map agent types to accent colors */
const AGENT_COLORS: Record<string, string> = {
  'go-architect': '#00acd7',
  'rust-engineer': '#dea584',
  'frontend-dev': '#61dafb',
  'ui-ux-designer': '#f472b6',
  'dba': '#22c55e',
  'mobile-dev': '#a78bfa',
  'scrum-master': '#f59e0b',
  'devops': '#6366f1',
  'ai-engineer': '#ec4899',
};

export const AgentSwitchCard = ({ event, className }: AgentSwitchCardProps) => {
  const iconName = AGENT_ICONS[event.agentType] ?? 'bx-user';
  const accentColor = AGENT_COLORS[event.agentType] ?? 'var(--color-accent)';

  return (
    <CardBase
      title={event.agentName}
      icon={<BoxIcon name={iconName} size={16} />}
      badge={event.role ?? event.agentType}
      badgeColor="info"
      status={event.status}
      defaultCollapsed
      timestamp={event.timestamp}
      className={`agent-switch-card${className ? ` ${className}` : ''}`}
    >
      {event.reason && (
        <p className="agent-switch__reason">{event.reason}</p>
      )}

      {event.capabilities && event.capabilities.length > 0 && (
        <div className="agent-switch__caps">
          {event.capabilities.map((cap) => (
            <span
              key={cap}
              className="agent-switch__cap"
              style={{ color: accentColor, background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
            >
              {cap}
            </span>
          ))}
        </div>
      )}
    </CardBase>
  );
};
