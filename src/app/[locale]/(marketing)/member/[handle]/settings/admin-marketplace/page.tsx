'use client'
import { useState, useEffect, useCallback } from 'react'

interface Submission {
  id: string
  type: string
  slug: string
  title: string
  description: string
  repo_url: string
  status: string
  author_handle: string
  author_name: string
  author_avatar: string
  review_note: string
  created_at: string
  reviewed_at: string | null
}

const TYPE_COLORS: Record<string, string> = {
  pack: '#00e5ff',
  plugin: '#a900ff',
  skill: '#22c55e',
  agent: '#f59e0b',
  workflow: '#8b5cf6',
}

export default function AdminMarketplacePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/marketplace/submissions?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.data ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const handleReview = async (id: string, status: 'approved' | 'rejected', note: string = '') => {
    setReviewingId(id)
    try {
      const res = await fetch(`/api/admin/marketplace/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, review_note: note }),
      })
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id))
      }
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 32px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-fg, #f8f8f8)', marginBottom: 8, letterSpacing: '-0.03em' }}>
        Marketplace Submissions
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', marginBottom: 32 }}>
        Review and approve community submissions to the marketplace.
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: filter === s ? '1px solid #00e5ff' : '1px solid var(--color-border, rgba(255,255,255,0.1))',
              background: filter === s ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
              color: filter === s ? '#00e5ff' : 'var(--color-fg-muted, rgba(255,255,255,0.5))',
              cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {loading ? (
        <p style={{ color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', fontSize: 14 }}>Loading...</p>
      ) : submissions.length === 0 ? (
        <p style={{ color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', fontSize: 14 }}>No {filter} submissions.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {submissions.map(sub => (
            <div key={sub.id} style={{
              padding: '20px', borderRadius: 14,
              border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
              background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5,
                  background: `${TYPE_COLORS[sub.type] ?? '#888'}15`,
                  color: TYPE_COLORS[sub.type] ?? '#888',
                  textTransform: 'uppercase',
                }}>{sub.type}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)' }}>{sub.title}</span>
                <span style={{ fontSize: 13, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>by @{sub.author_handle}</span>
              </div>

              {sub.description && (
                <p style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.5))', marginBottom: 8 }}>{sub.description}</p>
              )}

              {sub.repo_url && (
                <a href={sub.repo_url} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none' }}>
                  <i className="bx bxl-github" /> {sub.repo_url}
                </a>
              )}

              <div style={{ fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', marginTop: 8 }}>
                Submitted {new Date(sub.created_at).toLocaleDateString()}
              </div>

              {filter === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => handleReview(sub.id, 'approved')}
                    disabled={reviewingId === sub.id}
                    style={{
                      padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(sub.id, 'rejected')}
                    disabled={reviewingId === sub.id}
                    style={{
                      padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: 'transparent', color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer',
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
