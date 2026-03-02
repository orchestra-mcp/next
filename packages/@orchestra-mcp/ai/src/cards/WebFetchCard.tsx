"use client";

import { useState } from 'react';
import type { WebFetchEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './WebFetchCard.css';

export interface WebFetchCardProps {
  event: WebFetchEvent;
  className?: string;
}

const TRUNCATE_LENGTH = 300;

export const WebFetchCard = ({ event, className }: WebFetchCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const title = event.title || 'Web Fetch';
  const hasLongContent = !event.summary && !!event.content && event.content.length > TRUNCATE_LENGTH;

  return (
    <CardBase
      title={title}
      icon={<BoxIcon name="bx-globe" size={16} />}
      badgeColor="gray"
      defaultCollapsed={false}
      className={`web-fetch-card${className ? ` ${className}` : ''}`}
    >
      <a
        className="web-fetch-card__url"
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {event.url}
      </a>

      {event.summary && (
        <p className="web-fetch-card__summary">{event.summary}</p>
      )}

      {!event.summary && event.content && (
        <div className="web-fetch-card__content">
          <p>
            {expanded ? event.content : event.content.slice(0, TRUNCATE_LENGTH)}
            {!expanded && hasLongContent && '...'}
          </p>
          {hasLongContent && (
            <button
              type="button"
              className="web-fetch-card__toggle"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}
    </CardBase>
  );
};
