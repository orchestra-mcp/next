import type { McpAgentBriefingResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import { ChatMarkdown } from '../ChatMarkdown/ChatMarkdown';
import './AgentBriefingCard.css';

export interface AgentBriefingCardProps {
  data: McpAgentBriefingResult;
  className?: string;
}

export const AgentBriefingCard = ({ data, className }: AgentBriefingCardProps) => {
  const focusAreas = data.focus_areas ?? [];

  return (
    <CardBase
      title="Agent Briefing"
      icon={<BoxIcon name="bx-bot" size={16} />}
      badge={data.role}
      badgeColor="info"
      defaultCollapsed={false}
      className={`agent-briefing-card${className ? ` ${className}` : ''}`}
    >
      <div className="agent-briefing-card__briefing">
        <ChatMarkdown content={data.briefing} />
      </div>
      {focusAreas.length > 0 && (
        <div className="agent-briefing-card__focus">
          <span className="agent-briefing-card__focus-title">Focus Areas</span>
          {focusAreas.map((area, i) => (
            <div key={i} className="agent-briefing-card__focus-item">
              <div className="agent-briefing-card__focus-dot" />
              {area}
            </div>
          ))}
        </div>
      )}
    </CardBase>
  );
};
