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

/** Try to parse a JSON result string into a human-readable summary */
function parseResultSummary(result: string): { summary: string; details: Array<{ label: string; value: string }> } | null {
  try {
    const data = typeof result === 'string' ? JSON.parse(result) : result;
    if (!data || typeof data !== 'object') return null;

    const details: Array<{ label: string; value: string }> = [];
    let summary = '';

    // Handle arrays (list results)
    if (Array.isArray(data)) {
      summary = `${data.length} item${data.length !== 1 ? 's' : ''}`;
      for (const item of data.slice(0, 5)) {
        if (typeof item === 'object' && item !== null) {
          const label = item.title || item.name || item.id || '';
          const status = item.status || item.state || '';
          details.push({ label: String(label), value: status ? String(status) : '' });
        }
      }
      if (data.length > 5) details.push({ label: `... and ${data.length - 5} more`, value: '' });
      return { summary, details };
    }

    // Handle objects with known patterns
    if (data.project || data.slug) {
      summary = data.project || data.slug;
      if (data.total_tasks != null) details.push({ label: 'Total', value: String(data.total_tasks) });
      if (data.completed_tasks != null) details.push({ label: 'Done', value: String(data.completed_tasks) });
      if (data.completion_percentage != null) details.push({ label: 'Progress', value: `${data.completion_percentage}%` });
    } else if (data.id && data.title) {
      summary = data.title;
      if (data.status) details.push({ label: 'Status', value: data.status });
      if (data.priority) details.push({ label: 'Priority', value: data.priority });
      if (data.kind) details.push({ label: 'Kind', value: data.kind });
    } else if (data.message || data.msg) {
      summary = data.message || data.msg;
    } else if (data.ok !== undefined || data.success !== undefined) {
      summary = (data.ok || data.success) ? 'Success' : 'Failed';
      if (data.message) details.push({ label: 'Message', value: data.message });
    } else {
      // Generic: show top-level keys as summary
      const keys = Object.keys(data);
      if (keys.length <= 4) {
        for (const key of keys) {
          const val = data[key];
          if (val == null) continue;
          const display = typeof val === 'string' ? val
            : typeof val === 'number' ? String(val)
            : typeof val === 'boolean' ? (val ? 'Yes' : 'No')
            : Array.isArray(val) ? `${val.length} items`
            : JSON.stringify(val).slice(0, 60);
          details.push({ label: humanizeKey(key), value: display });
        }
        summary = keys.length > 0 ? `${keys.length} field${keys.length !== 1 ? 's' : ''}` : '';
      } else {
        return null; // Too complex, fall back to raw JSON
      }
    }

    return details.length > 0 || summary ? { summary, details } : null;
  } catch {
    return null;
  }
}

/** Check if the tool belongs to Orchestra MCP */
function isOrchestraTool(toolName: string, serverName?: string): boolean {
  return serverName === 'orchestra' || serverName === 'orchestra-mcp'
    || toolName.includes('orchestra');
}

export const McpCard = ({
  event,
  defaultCollapsed,
  className,
}: McpCardProps) => {
  const hasArgs = event.arguments && Object.keys(event.arguments).length > 0;
  const hasResult = !!event.result;
  const displayName = humanizeToolName(event.toolName);
  const isOrch = isOrchestraTool(event.toolName, event.serverName);
  const parsed = hasResult ? parseResultSummary(event.result!) : null;

  // Use Orchestra icon for orchestra tools, wrench for others
  const icon = isOrch
    ? <span className="mcp-card__orchestra-icon">
        <svg viewBox="0 0 725 725" width="16" height="16" fill="none">
          <defs>
            <linearGradient id="mc-orch" x1="672" y1="600" x2="188" y2="219" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#a900ff"/><stop offset="1" stopColor="#00e5ff"/>
            </linearGradient>
          </defs>
          <path fill="url(#mc-orch)" d="M670.75,54.19c-8.34-8.34-21.81-8.54-30.39-.45L61.86,599.32c-6.59,6.22-11.12,14.18-13.08,23.03-3.36,15.13,1.17,30.71,12.14,41.68,8.58,8.58,19.99,13.22,31.8,13.22,3.28,0,6.59-.36,9.87-1.09,8.84-1.96,16.81-6.49,23.03-13.08L671.19,84.58c8.09-8.58,7.9-22.05-.45-30.39Z"/>
          <path fill="url(#mc-orch)" d="M661.8,158.12l-54.6,57.88c25.67,42.78,40.44,92.88,40.44,146.41,0,157.51-127.72,285.23-285.23,285.23-47.55,0-92.41-11.64-131.84-32.28l-54.56,57.88c54.46,32.75,118.25,51.58,186.41,51.58,200.16,0,362.41-162.25,362.41-362.41,0-75.77-23.25-146.11-63.02-204.29ZM362.41,77.18c53.59,0,103.72,14.8,146.54,40.54l57.88-54.6C508.65,23.29,438.25,0,362.41,0,162.25,0,0,162.25,0,362.41c0,68.22,18.86,132.04,51.68,186.54l57.85-54.56c-20.67-39.46-32.35-84.36-32.35-131.98,0-157.51,127.72-285.23,285.23-285.23Z"/>
          <path fill="url(#mc-orch)" d="M362.41,130.87c-127.88,0-231.54,103.66-231.54,231.54,0,33.22,6.98,64.8,19.6,93.35l58.82-55.47c-3.02-12.15-4.6-24.83-4.6-37.89,0-87.11,70.6-157.72,157.72-157.72,16.31,0,32.01,2.48,46.81,7.05l58.79-55.44c-31.64-16.27-67.55-25.44-105.6-25.44ZM568.58,256.94l-55.47,58.82c4.56,14.73,7.01,30.4,7.01,46.64,0,87.11-70.6,157.72-157.72,157.72-12.99,0-25.64-1.58-37.72-4.53l-55.5,58.82c28.52,12.55,60.03,19.53,93.22,19.53,127.88,0,231.54-103.66,231.54-231.54,0-37.99-9.16-73.86-25.37-105.47Z"/>
        </svg>
      </span>
    : <BoxIcon name="bx-wrench" size={16} />;

  return (
    <CardBase
      title={displayName}
      icon={icon}
      badge={event.serverName}
      badgeColor={isOrch ? 'info' : 'gray'}
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      className={`mcp-card${isOrch ? ' mcp-card--orchestra' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="mcp-card__body">
        {hasArgs && (
          <div className="mcp-card__section">
            {renderArgs(event.arguments!)}
          </div>
        )}
        {hasArgs && hasResult && <hr className="mcp-card__divider" />}
        {hasResult && parsed ? (
          <div className="mcp-card__section">
            {parsed.summary && (
              <span className="mcp-card__summary">{parsed.summary}</span>
            )}
            {parsed.details.length > 0 && (
              <div className="mcp-card__details">
                {parsed.details.map((d, i) => (
                  <div key={i} className="mcp-card__detail">
                    <span className="mcp-card__detail-label">{d.label}</span>
                    {d.value && <span className="mcp-card__detail-value">{d.value}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : hasResult ? (
          <div className="mcp-card__section">
            <span className="mcp-card__label">Result</span>
            <pre className="mcp-card__pre">{event.result}</pre>
          </div>
        ) : null}
      </div>
    </CardBase>
  );
};
