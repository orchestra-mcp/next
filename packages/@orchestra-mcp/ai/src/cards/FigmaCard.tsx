"use client";

import { useState, useEffect, useRef } from 'react';
import type { FC, ReactElement } from 'react';
import { CardBase } from './CardBase';
import { CardRegistry } from './CardRegistry';
import './FigmaCard.css';

export interface FigmaCardData {
  figma_url: string;
  node_id?: string;
  title?: string;
  thumbnail_url?: string;
}

export interface FigmaCardProps {
  data: FigmaCardData;
  className?: string;
}

function FigmaLogoIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 38 57" fill="currentColor" aria-hidden="true">
      <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
      <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" />
      <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
      <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
      <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
    </svg>
  );
}

const EMBED_TIMEOUT_MS = 10_000;

export const FigmaCard: FC<FigmaCardProps> = ({ data, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const embedUrl =
    `https://www.figma.com/embed?embed_host=orchestra&url=${encodeURIComponent(data.figma_url)}` +
    (data.node_id ? `&node-id=${data.node_id}` : '');

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, EMBED_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loaded]);

  const handleLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoaded(true);
  };

  const handleError = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFailed(true);
  };

  return (
    <CardBase
      title={data.title ?? 'Figma Design'}
      icon={<FigmaLogoIcon />}
      defaultCollapsed={false}
      className={`figma-card${className ? ` ${className}` : ''}`}
    >
      {failed ? (
        <div className="figma-card__fallback">
          {data.thumbnail_url && (
            <img
              src={data.thumbnail_url}
              alt={data.title ?? 'Figma design thumbnail'}
              className="figma-card__thumbnail"
            />
          )}
          <p className="figma-card__fallback-msg">Preview unavailable</p>
          <a
            href={data.figma_url}
            target="_blank"
            rel="noopener noreferrer"
            className="figma-card__open-btn"
          >
            ↗ Open in Figma
          </a>
        </div>
      ) : (
        <div className="figma-card__embed">
          <iframe
            src={embedUrl}
            title="Figma embed"
            className="figma-card__iframe"
            onLoad={handleLoad}
            onError={handleError}
            allow="clipboard-write;"
          />
          {!loaded && (
            <div className="figma-card__loading">
              <div className="figma-card__spinner" />
              Loading Figma…
            </div>
          )}
        </div>
      )}
      {!failed && (
        <a
          href={data.figma_url}
          target="_blank"
          rel="noopener noreferrer"
          className="figma-card__open-link"
        >
          ↗ Open in Figma
        </a>
      )}
    </CardBase>
  );
};

export function registerFigmaCard(): void {
  CardRegistry.register('figma_embed', {
    component: FigmaCard as any,
    category: 'design' as any,
    label: 'Figma Embed',
  });
}
