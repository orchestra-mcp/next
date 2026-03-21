'use client'

import { useState, useMemo } from 'react'

const COLORS = ['#a900ff','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#8b5cf6','#06b6d4','#f97316','#14b8a6','#00e5ff','#e11d48']

// Comprehensive boxicons list (regular icons, no bxl- brand icons)
const ALL_ICONS = [
  // General / UI
  'bx-home','bx-star','bx-heart','bx-bell','bx-bookmark','bx-flag','bx-pin','bx-crown',
  'bx-diamond','bx-trophy','bx-medal','bx-gift','bx-cake','bx-party',
  // People
  'bx-user','bx-user-circle','bx-user-plus','bx-user-check','bx-group','bx-face','bx-id-card',
  // Communication
  'bx-chat','bx-message','bx-message-rounded','bx-message-square','bx-envelope','bx-send',
  'bx-phone','bx-phone-call','bx-video','bx-microphone','bx-support',
  // Files / Docs
  'bx-file','bx-file-blank','bx-file-find','bx-notepad','bx-note','bx-book','bx-book-open',
  'bx-book-bookmark','bx-book-reader','bx-library','bx-folder','bx-folder-open','bx-archive',
  'bx-paperclip','bx-clipboard','bx-spreadsheet','bx-receipt',
  // Code / Dev
  'bx-code','bx-code-alt','bx-code-block','bx-code-curly','bx-terminal','bx-chip',
  'bx-bug','bx-git-branch','bx-git-commit','bx-git-merge','bx-git-pull-request',
  'bx-git-repo-forked','bx-brackets','bx-data','bx-server','bx-cloud',
  'bx-cloud-upload','bx-cloud-download','bx-cloud-lightning','bx-database',
  // Media
  'bx-play','bx-pause','bx-stop','bx-skip-next','bx-skip-previous',
  'bx-music','bx-headphone','bx-camera','bx-film','bx-image','bx-image-alt',
  'bx-images','bx-photo-album','bx-video-recording','bx-broadcast',
  // Tools / Settings
  'bx-cog','bx-wrench','bx-tool','bx-build','bx-paint','bx-paint-roll',
  'bx-brush','bx-eraser','bx-pencil','bx-edit','bx-edit-alt','bx-scissors',
  'bx-crop','bx-filter','bx-sort-alt-2','bx-slider','bx-slider-alt',
  // Navigation / Location
  'bx-map','bx-map-pin','bx-map-alt','bx-navigation','bx-compass',
  'bx-current-location','bx-location-plus','bx-radar',
  // Science / Nature
  'bx-bulb','bx-atom','bx-dna','bx-leaf','bx-planet','bx-moon','bx-sun',
  'bx-cloud-rain','bx-cloud-snow','bx-cycling','bx-walk','bx-run',
  // Business / Finance
  'bx-dollar','bx-euro','bx-pound','bx-bitcoin','bx-credit-card','bx-wallet',
  'bx-trending-up','bx-trending-down','bx-bar-chart','bx-pie-chart','bx-chart',
  'bx-briefcase','bx-buildings','bx-store','bx-store-alt','bx-cart','bx-purchase-tag',
  // Security
  'bx-shield','bx-shield-alt','bx-shield-alt-2','bx-shield-quarter','bx-lock',
  'bx-lock-alt','bx-lock-open','bx-lock-open-alt','bx-key','bx-fingerprint',
  // Health
  'bx-health','bx-heart-square','bx-capsule','bx-first-aid','bx-pulse',
  // Arrows / Direction
  'bx-arrow-back','bx-arrow-to-top','bx-right-arrow','bx-up-arrow','bx-down-arrow',
  'bx-link','bx-link-alt','bx-link-external','bx-share','bx-share-alt','bx-export',
  'bx-import','bx-upload','bx-download','bx-log-in','bx-log-out',
  // Math / Science symbols
  'bx-plus','bx-minus','bx-x','bx-check','bx-check-circle','bx-check-shield',
  'bx-error','bx-error-circle','bx-info-circle','bx-question-mark','bx-help-circle',
  // Objects
  'bx-coffee','bx-restaurant','bx-food-menu','bx-bowl-hot','bx-pizza',
  'bx-car','bx-bus','bx-train','bx-plane','bx-ship','bx-rocket',
  'bx-laptop','bx-mobile','bx-desktop','bx-tv','bx-joystick','bx-game',
  'bx-headphones','bx-printer','bx-scanner','bx-usb','bx-battery',
  // Misc
  'bx-world','bx-globe','bx-wifi','bx-bluetooth','bx-qr','bx-barcode',
  'bx-list-ul','bx-list-ol','bx-list-check','bx-table','bx-columns',
  'bx-grid','bx-grid-alt','bx-layout','bx-sidebar','bx-window',
  'bx-cube','bx-cube-alt','bx-pyramid','bx-cylinder','bx-shape-square',
  'bx-shape-circle','bx-time','bx-time-five','bx-alarm','bx-timer',
  'bx-calendar','bx-calendar-check','bx-calendar-event','bx-calendar-plus',
  'bx-tag','bx-tag-alt','bx-label','bx-hash','bx-at','bx-mail-send',
  'bx-move','bx-move-horizontal','bx-move-vertical','bx-fullscreen',
  'bx-collapse','bx-expand','bx-zoom-in','bx-zoom-out','bx-search',
  'bx-search-alt','bx-trash','bx-trash-alt','bx-recycle','bx-refresh',
  'bx-sync','bx-transfer','bx-transfer-alt','bx-copy','bx-cut','bx-paste',
  'bx-undo','bx-redo','bx-history','bx-revision','bx-dots-horizontal',
  'bx-dots-horizontal-rounded','bx-dots-vertical','bx-dots-vertical-rounded',
  'bx-menu','bx-menu-alt-left','bx-menu-alt-right','bx-x-circle',
  'bx-power-off','bx-stop-circle','bx-show','bx-hide','bx-low-vision',
  'bx-like','bx-dislike','bx-happy','bx-sad','bx-confused','bx-wink-smile',
  'bx-laugh','bx-meh','bx-angry',
  // Solid variants (bxs-)
  'bxs-star','bxs-heart','bxs-bookmark','bxs-pin','bxs-flag','bxs-crown',
  'bxs-diamond','bxs-trophy','bxs-medal','bxs-gift','bxs-bulb','bxs-key',
  'bxs-check-circle','bxs-error-circle','bxs-info-circle','bxs-lock',
  'bxs-shield','bxs-bell','bxs-cog','bxs-home','bxs-user','bxs-wallet',
  'bxs-plane-alt','bxs-rocket','bxs-car','bxs-cart','bxs-store',
  'bxs-zap','bxs-camera','bxs-video','bxs-microphone','bxs-image',
  'bxs-folder','bxs-file','bxs-book','bxs-calendar','bxs-map-pin',
  'bxs-badge-check','bxs-patch-check','bxs-terminal','bxs-chip','bxs-data',
  'bxs-cloud','bxs-server','bxs-message-rounded','bxs-chat','bxs-envelope',
]

interface IconPickerProps {
  icon: string
  color: string
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
  onClose: () => void
  cardBorder: string
  textPrimary: string
}

export default function IconPicker({ icon, color, onIconChange, onColorChange, onClose, cardBorder, textPrimary }: IconPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return ALL_ICONS
    return ALL_ICONS.filter(ic => ic.replace(/^bxs?-/, '').replace(/-/g, ' ').includes(q))
  }, [search])

  return (
    <div
      className="absolute top-full left-0 mt-1 rounded-xl border shadow-xl z-20"
      style={{ background: 'var(--color-bg)', borderColor: cardBorder, width: 260 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Color swatches */}
      <div className="flex gap-1.5 flex-wrap p-3 pb-2" style={{ borderBottom: `1px solid ${cardBorder}` }}>
        {COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(color === c ? '' : c)}
            className="w-5 h-5 rounded-full border-2 cursor-pointer"
            style={{ background: c, borderColor: color === c ? 'var(--color-fg,#fff)' : 'transparent', flexShrink: 0 }}
          />
        ))}
      </div>

      {/* Search */}
      <div className="px-2 pt-2 pb-1">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: 'var(--color-bg-active, rgba(255,255,255,0.06))', border: `1px solid ${cardBorder}` }}>
          <i className="bx bx-search" style={{ fontSize: 13, color: 'var(--color-fg-dim)', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search icons..."
            autoFocus
            className="flex-1 min-w-0 text-xs bg-transparent border-none outline-none"
            style={{ color: textPrimary }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="bg-transparent border-none cursor-pointer p-0 flex">
              <i className="bx bx-x" style={{ fontSize: 13, color: 'var(--color-fg-dim)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Icons grid */}
      <div className="overflow-y-auto p-1.5" style={{ maxHeight: 220 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-4 text-xs" style={{ color: 'var(--color-fg-dim)' }}>No icons found</div>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {filtered.map(ic => (
              <button
                key={ic}
                type="button"
                title={ic.replace(/^bxs?-/, '').replace(/-/g, ' ')}
                onClick={() => { onIconChange(ic); onClose() }}
                className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer"
                style={{
                  background: icon === ic ? 'var(--color-bg-active,rgba(255,255,255,0.1))' : 'transparent',
                  color: color || textPrimary,
                  outline: icon === ic ? `1.5px solid ${color || 'var(--color-accent,#00e5ff)'}` : 'none',
                }}
              >
                <i className={`bx ${ic}`} style={{ fontSize: 15 }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
