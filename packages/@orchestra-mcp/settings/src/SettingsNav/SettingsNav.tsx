import './SettingsNav.css';

export interface SettingsNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SettingsNavProps {
  title?: string;
  subtitle?: string;
  items: SettingsNavItem[];
  activeId: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelect: (id: string) => void;
  showSearch?: boolean;
}

export const SettingsNav = ({
  title = 'Settings',
  subtitle = 'Customize your workspace',
  items,
  activeId,
  searchQuery = '',
  onSearchChange,
  onSelect,
  showSearch = true,
}: SettingsNavProps) => {
  return (
    <div className="settings-nav">
      {/* Header */}
      <div className="settings-nav__header">
        <h2 className="settings-nav__title">{title}</h2>
        {subtitle && <p className="settings-nav__subtitle">{subtitle}</p>}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="settings-nav__search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="settings-nav__search-input"
          />
        </div>
      )}

      {/* Navigation Items */}
      <nav className="settings-nav__list">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`settings-nav__item ${activeId === item.id ? 'settings-nav__item--active' : ''}`}
          >
            {item.icon && <span className="settings-nav__icon">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

function SearchIcon() {
  return (
    <svg
      className="settings-nav__search-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
