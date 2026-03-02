"use client";

import { useState } from 'react';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './MemoryCard.css';

export interface MemorySearchData {
  results: Array<{
    summary: string;
    content: string;
    tags?: string[];
    source?: string;
    source_id?: string;
    score?: number;
  }>;
  query: string;
}

export interface MemoryCardProps {
  data: MemorySearchData;
  className?: string;
}

function ResultItem({ result }: { result: MemorySearchData['results'][number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      className="memory-card__result"
      onClick={() => setExpanded((e) => !e)}
      aria-expanded={expanded}
    >
      <div className="memory-card__result-header">
        <span className="memory-card__summary">{result.summary}</span>
        {result.score != null && (
          <span className="memory-card__score">{Math.round(result.score * 100)}%</span>
        )}
      </div>

      {result.tags && result.tags.length > 0 && (
        <div className="memory-card__tags">
          {result.tags.map((tag) => (
            <span key={tag} className="memory-card__tag">{tag}</span>
          ))}
        </div>
      )}

      {result.source && (
        <span className="memory-card__source">{result.source}</span>
      )}

      {expanded && (
        <p className="memory-card__content">{result.content}</p>
      )}
    </button>
  );
}

export const MemoryCard = ({ data, className }: MemoryCardProps) => {
  return (
    <CardBase
      title="Memory Search"
      icon={<BoxIcon name="bx-brain" size={16} />}
      badge={String(data.results.length)}
      badgeColor="info"
      defaultCollapsed={false}
      className={`memory-card${className ? ` ${className}` : ''}`}
    >
      <div className="memory-card__query">
        <BoxIcon name="bx-search" size={12} />
        <span>{data.query}</span>
      </div>

      {data.results.map((result, i) => (
        <ResultItem key={result.source_id ?? i} result={result} />
      ))}
    </CardBase>
  );
};
