import './LoadingLogo.css';

export interface LoadingLogoProps {
  size?: number;
  className?: string;
  /** Logo SVG path - must be provided by consuming app */
  logoSrc: string;
}

/**
 * Animated Orchestra logo for loading states
 */
export function LoadingLogo({ size = 32, className = '', logoSrc }: LoadingLogoProps) {
  return (
    <div className={`loading-logo ${className}`}>
      <img
        src={logoSrc}
        alt="Orchestra MCP"
        className="loading-logo__image"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
