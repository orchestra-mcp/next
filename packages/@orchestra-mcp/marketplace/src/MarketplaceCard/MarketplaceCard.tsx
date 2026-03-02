import type { ReactNode } from 'react';
import './MarketplaceCard.css';

export interface MarketplaceCardProps {
  /** Extension/tool name */
  name: string;
  /** Author name */
  author: string;
  /** Short description */
  description: string;
  /** Icon as ReactNode or image URL */
  icon: ReactNode | string;
  /** Item type */
  type: 'extension' | 'ai-tool' | 'os-service';
  /** Star rating 0-5 */
  rating: number;
  /** Total installs */
  installCount: number;
  /** Whether currently installed */
  installed?: boolean;
  /** Whether author is verified */
  verified?: boolean;
  /** Whether an update is available */
  hasUpdate?: boolean;
  /** Install callback */
  onInstall?: () => void;
  /** Uninstall callback */
  onUninstall?: () => void;
  /** Update callback */
  onUpdate?: () => void;
}

const TYPE_LABELS: Record<MarketplaceCardProps['type'], string> = {
  extension: 'Extension',
  'ai-tool': 'AI Tool',
  'os-service': 'OS Service',
};

function formatCount(n: number): string {
  if (n >= 100_000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="mc-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'mc-star--filled' : 'mc-star--empty'}>
          {i < Math.round(rating) ? '\u2605' : '\u2606'}
        </span>
      ))}
    </span>
  );
}

export const MarketplaceCard = ({
  name,
  author,
  description,
  icon,
  type,
  rating,
  installCount,
  installed = false,
  verified = false,
  hasUpdate = false,
  onInstall,
  onUninstall,
  onUpdate,
}: MarketplaceCardProps) => {
  const iconNode =
    typeof icon === 'string' ? (
      <img src={icon} alt={`${name} icon`} className="mc-icon-img" />
    ) : (
      icon
    );

  return (
    <div className="mc-card" data-type={type}>
      <div className="mc-header">
        <div className="mc-icon">{iconNode}</div>
        <div className="mc-info">
          <div className="mc-title-row">
            <span className="mc-name">{name}</span>
            <span className={`mc-badge mc-badge--${type}`}>{TYPE_LABELS[type]}</span>
          </div>
          <div className="mc-author">
            {author}
            {verified && <span className="mc-verified" title="Verified" aria-label="Verified">&#10003;</span>}
          </div>
          <p className="mc-desc">{description}</p>
        </div>
      </div>
      <div className="mc-footer">
        <div className="mc-stats">
          <StarRating rating={rating} />
          <span className="mc-installs">{formatCount(installCount)} installs</span>
        </div>
        <div className="mc-actions">
          {hasUpdate && <button type="button" className="mc-btn mc-btn--update" onClick={onUpdate}>Update</button>}
          {installed && !hasUpdate && <button type="button" className="mc-btn mc-btn--uninstall" onClick={onUninstall}>Uninstall</button>}
          {!installed && !hasUpdate && <button type="button" className="mc-btn mc-btn--install" onClick={onInstall}>Install</button>}
        </div>
      </div>
    </div>
  );
};
