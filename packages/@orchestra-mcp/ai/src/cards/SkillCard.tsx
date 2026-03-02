import type { SkillEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SkillCard.css';

export interface SkillCardProps {
  event: SkillEvent;
  className?: string;
}

/** Map skill names to icons for well-known skills */
const SKILL_ICONS: Record<string, string> = {
  'go-backend': 'bx-server',
  'rust-engine': 'bx-cog',
  'typescript-react': 'bxl-react',
  'ui-design': 'bx-palette',
  'database-sync': 'bx-data',
  'proto-grpc': 'bx-transfer',
  'chrome-extension': 'bxl-chrome',
  'wails-desktop': 'bx-desktop',
  'react-native-mobile': 'bx-mobile-alt',
  'native-widgets': 'bx-widget',
  'ai-agentic': 'bx-bot',
  'gcp-infrastructure': 'bx-cloud',
  'project-manager': 'bx-calendar-check',
  'qa-testing': 'bx-test-tube',
  'docs': 'bx-book',
};

export const SkillCard = ({ event, className }: SkillCardProps) => {
  const iconName = SKILL_ICONS[event.skillName] ?? 'bx-code-alt';
  const triggerLabel = event.trigger === 'command' ? `/${event.skillName}` : 'auto';

  return (
    <CardBase
      title={event.skillName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      icon={<BoxIcon name={iconName} size={16} />}
      badge={triggerLabel}
      badgeColor={event.trigger === 'command' ? 'info' : 'gray'}
      status={event.status}
      defaultCollapsed
      timestamp={event.timestamp}
      className={`skill-card${className ? ` ${className}` : ''}`}
    >
      {event.description && (
        <p className="skill-card__desc">{event.description}</p>
      )}

      {event.technologies && event.technologies.length > 0 && (
        <div className="skill-card__techs">
          {event.technologies.map((tech) => (
            <span key={tech} className="skill-card__tech">{tech}</span>
          ))}
        </div>
      )}
    </CardBase>
  );
};
