import type React from 'react';
import type { McpEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import { humanizeKey } from './humanize';
import './McpCard.css';

export interface McpCardProps {
  event: McpEvent;
  defaultCollapsed?: boolean;
  className?: string;
}

/** Convert "mcp__orchestra-mcp__get_workflow_status" to "Get Workflow Status" */
function humanizeToolName(name: string): string {
  const parts = name.split('__');
  const tool = parts.length >= 3 ? parts.slice(2).join('__') : parts[parts.length - 1];
  return tool
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Render arguments as readable key-value pairs */
function renderArgs(args: Record<string, unknown>): React.JSX.Element {
  const entries = Object.entries(args);
  if (entries.length === 0) return <></>;
  return (
    <div className="mcp-card__args">
      {entries.map(([key, val]) => (
        <div key={key} className="mcp-card__arg">
          <span className="mcp-card__arg-key">{humanizeKey(key)}</span>
          <span className="mcp-card__arg-val">
            {typeof val === 'string' ? val : JSON.stringify(val)}
          </span>
        </div>
      ))}
    </div>
  );
}

export const McpCard = ({
  event,
  defaultCollapsed,
  className,
}: McpCardProps) => {
  const hasArgs = event.arguments && Object.keys(event.arguments).length > 0;
  const hasResult = !!event.result;
  const displayName = humanizeToolName(event.toolName);

  return (
    <CardBase
      title={displayName}
      icon={<BoxIcon name="bx-wrench" size={16} />}
      badge={event.serverName}
      badgeColor="info"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      className={`mcp-card${className ? ` ${className}` : ''}`}
    >
      <div className="mcp-card__body">
        {hasArgs && (
          <div className="mcp-card__section">
            {renderArgs(event.arguments!)}
          </div>
        )}
        {hasArgs && hasResult && <hr className="mcp-card__divider" />}
        {hasResult && (
          <div className="mcp-card__section">
            <span className="mcp-card__label">Result</span>
            <pre className="mcp-card__pre">{event.result}</pre>
          </div>
        )}
      </div>
    </CardBase>
  );
};
