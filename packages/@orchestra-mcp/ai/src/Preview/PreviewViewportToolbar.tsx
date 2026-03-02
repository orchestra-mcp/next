"use client";

import type { FC } from 'react';
import type { PreviewViewport } from './PreviewFrame';

export interface PreviewViewportToolbarProps {
  viewport: PreviewViewport;
  onChange: (viewport: PreviewViewport) => void;
  framework: string;
  sessionId?: string;
}

interface PresetOption {
  preset: PreviewViewport['preset'];
  width: number;
  height: number;
  label: string;
  icon: FC;
}

const PhoneIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="4" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="12.5" r="0.75" fill="currentColor" />
  </svg>
);

const TabletIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="12" r="0.75" fill="currentColor" />
  </svg>
);

const MonitorIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 14h6M8 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PRESETS: PresetOption[] = [
  { preset: 'mobile', width: 375, height: 667, label: 'Mobile (375px)', icon: PhoneIcon },
  { preset: 'tablet', width: 768, height: 1024, label: 'Tablet (768px)', icon: TabletIcon },
  { preset: 'desktop', width: 1280, height: 800, label: 'Desktop (1280px)', icon: MonitorIcon },
];

function formatFramework(framework: string): string {
  if (!framework) return '';
  const map: Record<string, string> = {
    html: 'HTML',
    react: 'React',
    vue: 'Vue',
    svelte: 'Svelte',
    angular: 'Angular',
    'react-native': 'React Native',
    flutter: 'Flutter',
  };
  return map[framework] ?? framework.charAt(0).toUpperCase() + framework.slice(1);
}

export const PreviewViewportToolbar: FC<PreviewViewportToolbarProps> = ({
  viewport,
  onChange,
  framework,
}) => {
  const handlePreset = (option: PresetOption) => {
    onChange({
      preset: option.preset,
      width: option.width,
      height: option.height,
    });
  };

  const currentWidth =
    viewport.preset !== 'custom'
      ? (PRESETS.find(p => p.preset === viewport.preset)?.width ?? viewport.width)
      : viewport.width;
  const currentHeight =
    viewport.preset !== 'custom'
      ? (PRESETS.find(p => p.preset === viewport.preset)?.height ?? viewport.height)
      : viewport.height;

  return (
    <div className="preview-frame__toolbar">
      <div className="preview-frame__toolbar-presets">
        {PRESETS.map((option) => {
          const Icon = option.icon;
          const isActive = viewport.preset === option.preset;
          return (
            <button
              key={option.preset}
              type="button"
              className={`preview-frame__preset-btn${isActive ? ' preview-frame__preset-btn--active' : ''}`}
              onClick={() => handlePreset(option)}
              title={option.label}
              aria-pressed={isActive}
            >
              <Icon />
            </button>
          );
        })}
      </div>
      <span className="preview-frame__dimensions">
        {currentWidth} x {currentHeight}
      </span>
      {framework && (
        <span className="preview-frame__framework-badge">
          {formatFramework(framework)}
        </span>
      )}
    </div>
  );
};
