import { useState, useCallback } from 'react';
import type { EvidenceEntry } from '../hooks';
import './EvidenceLog.css';

export interface EvidenceLogProps {
  evidence: EvidenceEntry[];
}

const GATE_LABELS: Record<string, string> = {
  testing: 'Testing',
  verification: 'Verification',
  documentation: 'Documentation',
  review: 'Review',
};

const GATE_ICONS: Record<string, string> = {
  testing: '\u{1F9EA}',
  verification: '\u2705',
  documentation: '\u{1F4DD}',
  review: '\u{1F50D}',
};

const TRUNCATE_LENGTH = 120;

export function EvidenceLog({ evidence }: EvidenceLogProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const toggle = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  if (evidence.length === 0) return null;

  return (
    <section className="evidence-log">
      <h3 className="task-detail__section-title">Evidence Log</h3>
      <div className="evidence-log__timeline">
        {evidence.map((entry, i) => {
          const isExpanded = expanded.has(i);
          const text = entry.description;
          const isLong = text.length > TRUNCATE_LENGTH;

          return (
            <div key={i} className="evidence-log__entry">
              <div className="evidence-log__marker" />
              <div className="evidence-log__content">
                <div className="evidence-log__header">
                  <span className="evidence-log__icon">
                    {GATE_ICONS[entry.gate] ?? '\u{1F4CB}'}
                  </span>
                  <span className="evidence-log__gate">
                    {GATE_LABELS[entry.gate] ?? entry.gate}
                  </span>
                  <span className="evidence-log__time">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="evidence-log__text">
                  {isExpanded || !isLong
                    ? text
                    : text.slice(0, TRUNCATE_LENGTH) + '...'}
                </p>
                {isLong && (
                  <button
                    className="evidence-log__toggle"
                    onClick={() => toggle(i)}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
