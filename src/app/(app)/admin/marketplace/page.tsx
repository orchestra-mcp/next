'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRoleStore } from '@/store/roles'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface MarketplacePack {
  name: string
  version: string
  downloads: number
  status: 'active' | 'pending'
}

const MOCK_PACKS: MarketplacePack[] = [
  { name: 'orchestra-go-backend', version: '1.2.0', downloads: 1234, status: 'active' },
  { name: 'orchestra-rust-engine', version: '0.9.1', downloads: 876, status: 'active' },
  { name: 'orchestra-react-ui', version: '2.0.4', downloads: 3421, status: 'active' },
  { name: 'orchestra-devtools', version: '1.0.0', downloads: 512, status: 'pending' },
  { name: 'orchestra-ai-agents', version: '0.5.0-beta', downloads: 289, status: 'pending' },
  { name: 'orchestra-proto-grpc', version: '1.1.2', downloads: 2100, status: 'active' },
]

export default function AdminMarketplacePage() {
  const router = useRouter()
  const t = useTranslations('admin')
  const { can, roleLoaded } = useRoleStore()
  const [search, setSearch] = useState('')
  const [packs, setPacks] = useState(MOCK_PACKS)
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const rowBorder = 'var(--color-bg-alt)'
  const searchBg = 'var(--color-bg-alt)'

  const filtered = packs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  function handleApprove(name: string) {
    setPacks(prev => prev.map(p => p.name === name ? { ...p, status: 'active' } : p))
  }

  function handleReject(name: string) {
    setConfirmDialog({
      message: t('rejectConfirm', { name }),
      onConfirm: () => {
        setConfirmDialog(null)
        setPacks(prev => prev.filter(p => p.name !== name))
      },
    })
  }

  function VersionBadge({ version }: { version: string }) {
    return (
      <span style={{ fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)', fontWeight: 600 }}>
        v{version}
      </span>
    )
  }

  function StatusBadge({ status }: { status: 'active' | 'pending' }) {
    if (status === 'active') {
      return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600 }}>{t('active')}</span>
    }
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', fontWeight: 600 }}>{t('pending')}</span>
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('backToAdmin')}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('marketplace')}</h1>
            <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{t('marketplaceDesc')}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper" style={{ marginBottom: 20, position: 'relative', maxWidth: 340 }}>
        <i className="bx bx-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: textDim, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchPacks')}
          style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: searchBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 120px 100px 100px 1fr', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>{t('packNameColumn')}</div>
          <div className="hide-mobile">{t('versionColumn')}</div>
          <div className="hide-mobile">{t('downloadsColumn')}</div>
          <div>{t('statusColumn')}</div>
          <div style={{ textAlign: 'end' }}>{t('actionsColumn')}</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-package" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>{t('noPacksFound')}</div>
            <div style={{ fontSize: 12, color: textDim }}>{t('noPacksDesc')}</div>
          </div>
        ) : filtered.map((p, idx) => (
          <div key={p.name} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 120px 100px 100px 1fr', padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(169,0,255,0.1)', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-package" style={{ fontSize: 15, color: '#a900ff' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary, fontFamily: 'monospace' }}>{p.name}</span>
            </div>
            <div className="hide-mobile"><VersionBadge version={p.version} /></div>
            <div className="hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{p.downloads.toLocaleString()}</div>
            <div><StatusBadge status={p.status} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
              {p.status === 'pending' ? (
                <>
                  <button onClick={() => handleApprove(p.name)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {t('approve')}
                  </button>
                  <button onClick={() => handleReject(p.name)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {t('reject')}
                  </button>
                </>
              ) : (
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>{t('active')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title={t('rejectPack')}
        message={confirmDialog?.message ?? ''}
        confirmLabel={t('reject')}
        variant="warning"
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
