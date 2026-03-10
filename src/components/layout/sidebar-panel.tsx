'use client'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useTunnelStore } from '@/store/tunnels'

// ── Types ──────────────────────────────────────────────────────
export type SidebarSection = 'projects' | 'notes' | 'plans' | 'tunnels' | 'chat' | 'wiki' | 'devtools' | 'settings'

interface SidebarPanelProps {
  section: SidebarSection
  loading?: boolean
  /** Total item count shown as badge in header */
  count?: number
  /** Search value + setter */
  search: string
  onSearchChange: (v: string) => void
  /** + button action */
  onAdd?: () => void
  /** List body content */
  children: ReactNode
}

// Section metadata
const SECTION_META: Record<SidebarSection, { icon: string; label: string }> = {
  projects: { icon: 'bx-folder', label: 'Projects' },
  notes: { icon: 'bx-note', label: 'Notes' },
  plans: { icon: 'bx-map', label: 'Plans' },
  tunnels: { icon: 'bx-transfer-alt', label: 'Tunnels' },
  chat: { icon: 'bx-message-rounded-dots', label: 'AI Chat' },
  wiki: { icon: 'bx-book-open', label: 'Wiki' },
  devtools: { icon: 'bx-wrench', label: 'DevTools' },
  settings: { icon: 'bx-cog', label: 'Settings' },
}

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonLine({ width }: { width: string }) {
  return (
    <div className="skeleton-shimmer" style={{
      height: 42, borderRadius: 8, marginBottom: 4,
      background: 'var(--color-bg-alt)',
      width,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

// ── Main component ─────────────────────────────────────────────
export function SidebarPanel({
  section, loading, count, search, onSearchChange, onAdd, children,
}: SidebarPanelProps) {
  const t = useTranslations('sidebar')
  const meta = SECTION_META[section]
  const { tunnels, connectionStatus, activeTunnelId } = useTunnelStore()

  // Active tunnel for footer
  const activeTunnel = tunnels.find(tun => tun.id === activeTunnelId) ?? null
  const tunnelStatus = activeTunnel
    ? (connectionStatus[activeTunnel.id] ?? 'disconnected')
    : 'disconnected'
  const tunnelDotColor = tunnelStatus === 'connected' ? '#22c55e'
    : tunnelStatus === 'connecting' ? '#f59e0b'
    : tunnelStatus === 'error' ? '#ef4444'
    : '#6b7280'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        {/* Section title row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px 6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className={`bx ${meta.icon}`} style={{ fontSize: 14, color: 'var(--color-fg-muted)' }} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--color-fg-dim)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>
              {meta.label}
            </span>
            {typeof count === 'number' && count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: 'var(--color-fg-dim)',
                background: 'var(--color-bg-alt)', borderRadius: 4, padding: '1px 5px',
              }}>
                {count}
              </span>
            )}
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              title="New"
              style={{
                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 5, border: '1px solid var(--color-border)',
                background: 'transparent', cursor: 'pointer', color: 'var(--color-fg-muted)', fontSize: 14,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-active)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <i className="bx bx-plus" />
            </button>
          )}
        </div>

        {/* Search */}
        {section !== 'settings' && (
          <div style={{ padding: '0 10px 8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 8px', borderRadius: 7,
              background: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
            }}>
              <i className="bx bx-search" style={{ fontSize: 13, color: 'var(--color-fg-muted)', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={t('search')}
                style={{
                  flex: 1, fontSize: 12, background: 'transparent', border: 'none',
                  outline: 'none', color: 'var(--color-fg)',
                }}
              />
              {search && (
                <button
                  onClick={() => onSearchChange('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg-muted)', fontSize: 12, display: 'flex', padding: 0 }}
                >
                  <i className="bx bx-x" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {loading ? (
          <div style={{ padding: '4px 4px' }}>
            <SkeletonLine width="100%" />
            <SkeletonLine width="90%" />
            <SkeletonLine width="95%" />
            <SkeletonLine width="85%" />
          </div>
        ) : children}
      </div>

      {/* ── Footer: tunnel status ──────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid var(--color-border)',
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {activeTunnel ? (
          <>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: tunnelDotColor, flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 500, color: 'var(--color-fg-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {activeTunnel.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-fg-dim)', marginTop: 1 }}>
                {tunnelStatus === 'connected' ? 'Connected' : tunnelStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </div>
            </div>
            <Link
              href="/tunnels"
              style={{
                fontSize: 11, color: 'var(--color-fg-dim)', textDecoration: 'none',
                display: 'flex', alignItems: 'center',
              }}
              title="Manage tunnels"
            >
              <i className="bx bx-cog" style={{ fontSize: 13 }} />
            </Link>
          </>
        ) : (
          <Link
            href="/tunnels"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              textDecoration: 'none', color: 'var(--color-fg-dim)',
              fontSize: 11, fontWeight: 500,
            }}
          >
            <i className="bx bx-plus-circle" style={{ fontSize: 13 }} />
            Connect tunnel
          </Link>
        )}
      </div>
    </div>
  )
}
