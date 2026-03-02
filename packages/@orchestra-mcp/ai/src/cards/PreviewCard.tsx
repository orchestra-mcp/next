"use client";

import { useState } from 'react';
import type { FC, ReactElement } from 'react';
import { CardBase } from './CardBase';
import { CardRegistry } from './CardRegistry';
import { PreviewFrame, buildSrcdoc } from '../Preview/PreviewFrame';
import { PreviewViewportToolbar } from '../Preview/PreviewViewportToolbar';
import type { PreviewCode, PreviewViewport } from '../Preview/PreviewFrame';
import './PreviewCard.css';

export interface PreviewCardData {
  session_id: string;
  framework: string;
  ws_url?: string;
  code?: PreviewCode;
}

export interface PreviewCardProps {
  data: PreviewCardData;
  className?: string;
}

const DEFAULT_VIEWPORT: PreviewViewport = {
  preset: 'desktop',
  width: 1280,
  height: 800,
};

function ExternalLinkIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 2h4m0 0v4m0-4L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 14h6M8 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function normalizeFramework(framework: string): PreviewCode['framework'] {
  const map: Record<string, PreviewCode['framework']> = {
    html: 'html',
    react: 'react',
    vue: 'vue',
    svelte: 'svelte',
    angular: 'angular',
    'react-native': 'react-native',
    flutter: 'flutter',
  };
  return map[framework?.toLowerCase()] ?? 'html';
}

function buildPreviewCode(data: PreviewCardData): PreviewCode {
  if (data.code) {
    return {
      ...data.code,
      framework: normalizeFramework(data.code.framework ?? data.framework),
    };
  }
  return {
    framework: normalizeFramework(data.framework),
    html: '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6b7b95;font-family:sans-serif">Waiting for preview content...</div>',
  };
}

export const PreviewCard: FC<PreviewCardProps> = ({ data, className }) => {
  const [viewport, setViewport] = useState<PreviewViewport>(DEFAULT_VIEWPORT);
  const [previewError, setPreviewError] = useState<Error | null>(null);

  const code = buildPreviewCode(data);
  const frameworkLabel =
    data.framework.charAt(0).toUpperCase() + data.framework.slice(1);

  const handleOpenInBrowser = () => {
    const doc = buildSrcdoc(code);
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    // Revoke after a short delay to allow the browser to open it
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const headerActions = (
    <div className="preview-card__header-actions">
      <PreviewViewportToolbar
        viewport={viewport}
        onChange={setViewport}
        framework={data.framework}
        sessionId={data.session_id}
      />
      <button
        type="button"
        className="preview-card__open-btn card-base__action-btn"
        onClick={handleOpenInBrowser}
        title="Open in browser"
        aria-label="Open preview in browser"
      >
        <ExternalLinkIcon />
      </button>
    </div>
  );

  return (
    <CardBase
      title="Component Preview"
      icon={<MonitorIcon />}
      badge={frameworkLabel}
      badgeColor="info"
      defaultCollapsed={false}
      headerActions={headerActions}
      className={`preview-card${className ? ` ${className}` : ''}`}
    >
      <div className="preview-card__body">
        {previewError && (
          <div className="preview-card__error-banner" role="alert">
            {previewError.message}
          </div>
        )}
        <PreviewFrame
          code={code}
          viewport={viewport}
          sessionId={data.session_id}
          onError={setPreviewError}
          className="preview-card__frame"
        />
      </div>
    </CardBase>
  );
};

export function registerPreviewCard(): void {
  CardRegistry.register('preview_component', {
    component: PreviewCard as any,
    category: 'preview' as any,
    label: 'Component Preview',
  });

  CardRegistry.register('update_preview', {
    component: PreviewCard as any,
    category: 'preview' as any,
    label: 'Update Preview',
  });
}
