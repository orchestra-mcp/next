import './Avatar.css';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Full name used to derive initials */
  name?: string;
  /** Avatar size */
  size?: 'small' | 'medium' | 'large';
  /** Online status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0 || words[0] === '') return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export const Avatar = ({
  src,
  alt = '',
  name,
  size = 'medium',
  status,
  onClick,
  className = '',
}: AvatarProps) => {
  const initials = name ? getInitials(name) : '';
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`avatar avatar--${size} ${isClickable ? 'avatar--clickable' : ''} ${className}`.trim()}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick?.();
            }
          : undefined
      }
    >
      {src ? (
        <img className="avatar__image" src={src} alt={alt} />
      ) : initials ? (
        <span className="avatar__initials">{initials}</span>
      ) : (
        <span className="avatar__initials" />
      )}
      {status && (
        <span
          className={`avatar__status avatar__status--${status}`}
          data-testid="avatar-status"
        />
      )}
    </div>
  );
};
