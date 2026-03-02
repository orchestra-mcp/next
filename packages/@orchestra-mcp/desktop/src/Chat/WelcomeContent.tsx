import { useCallback } from 'react';
import './WelcomeContent.css';

export interface WelcomeContentProps {
  logoSrc: string;
  /** Hint text shown below the tagline */
  hint?: string;
  /** Keyboard shortcut key label */
  shortcutKey?: string;
  /** Keyboard shortcut description */
  shortcutLabel?: string;
  onOpenUrl?: (url: string) => void;
}

const defaultOpenUrl = (url: string) => {
  fetch('http://127.0.0.1:19191/api/open-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).catch(() => window.open(url, '_blank'));
};

export function WelcomeContent({
  logoSrc,
  hint = 'Start a new chat or select an existing one',
  shortcutKey = 'N',
  shortcutLabel = 'New chat',
  onOpenUrl,
}: WelcomeContentProps) {
  const openUrl = useCallback(
    (url: string) => (onOpenUrl ?? defaultOpenUrl)(url),
    [onOpenUrl],
  );

  return (
    <div className="welcome">
      <img
        src={logoSrc}
        alt="Orchestra MCP"
        className="welcome__logo"
        draggable={false}
      />

      <h1 className="welcome__title">Orchestra MCP</h1>
      <p className="welcome__tagline">Your AI-agentic IDE</p>

      <p className="welcome__hint">{hint}</p>

      <div className="welcome__links">
        <button
          type="button"
          className="welcome__link"
          onClick={() => openUrl('https://github.com/orchestra-mcp')}
        >
          <svg viewBox="0 0 24 24" className="welcome__link-icon" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </button>
        <span className="welcome__link-sep" />
        <button
          type="button"
          className="welcome__link"
          onClick={() => openUrl('https://orchestra-mcp.dev')}
        >
          <svg viewBox="0 0 24 24" className="welcome__link-icon" fill="currentColor">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          Docs
        </button>
      </div>

      <div className="welcome__keys">
        <kbd className="welcome__kbd">{shortcutKey}</kbd>
        <span className="welcome__keys-label">{shortcutLabel}</span>
      </div>
    </div>
  );
}
