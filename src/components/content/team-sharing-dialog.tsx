'use client'

import { useState, useEffect } from 'react'
import { apiFetch, uploadUrl } from '@/lib/api'

interface Team {
  id: number
  name: string
  avatar_url: string
}

interface TeamSharingDialogProps {
  contentId: number
  currentTeamId?: number | null
  onClose: () => void
  onShared: () => void
}

export function TeamSharingDialog({
  contentId,
  currentTeamId,
  onClose,
  onShared,
}: TeamSharingDialogProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(currentTeamId ?? null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiFetch<{ teams: Team[] }>('/api/teams')
      .then((res) => {
        if (!cancelled) setTeams(res.teams)
      })
      .catch(() => {
        if (!cancelled) setTeams([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleShare() {
    if (!selectedTeamId || submitting) return
    setSubmitting(true)
    try {
      await apiFetch(`/api/community/teams/${selectedTeamId}/content/${contentId}/share`, {
        method: 'POST',
      })
      onShared()
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove() {
    if (!currentTeamId || submitting) return
    setSubmitting(true)
    try {
      await apiFetch(`/api/community/teams/${currentTeamId}/content/${contentId}/share`, {
        method: 'DELETE',
      })
      onShared()
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  const overlaySt: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const cardSt: React.CSSProperties = {
    width: 400,
    maxHeight: '80vh',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  }

  const headerSt: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const titleSt: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-fg)',
    margin: 0,
  }

  const closeBtnSt: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-fg-dim)',
    fontSize: 20,
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const listSt: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    overflowY: 'auto',
    flex: 1,
  }

  const shareBtnSt: React.CSSProperties = {
    background: '#00e5ff',
    color: '#000',
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    cursor: submitting || !selectedTeamId ? 'not-allowed' : 'pointer',
    opacity: submitting || !selectedTeamId ? 0.5 : 1,
    fontSize: 14,
  }

  const removeBtnSt: React.CSSProperties = {
    background: '#ef4444',
    color: '#fff',
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    cursor: submitting ? 'not-allowed' : 'pointer',
    opacity: submitting ? 0.5 : 1,
    fontSize: 14,
  }

  return (
    <div style={overlaySt} onClick={onClose}>
      <div style={cardSt} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerSt}>
          <h3 style={titleSt}>Share with Team</h3>
          <button style={closeBtnSt} onClick={onClose} aria-label="Close">
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Team list */}
        <div style={listSt}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                fontSize: 13,
                color: 'var(--color-fg-dim)',
              }}
            >
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                fontSize: 13,
                color: 'var(--color-fg-dim)',
              }}
            >
              No teams available
            </div>
          ) : (
            teams.map((team) => (
              <TeamRow
                key={team.id}
                team={team}
                selected={selectedTeamId === team.id}
                onSelect={() => setSelectedTeamId(team.id)}
              />
            ))
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            style={shareBtnSt}
            onClick={handleShare}
            disabled={submitting || !selectedTeamId}
          >
            {submitting ? 'Sharing...' : 'Share'}
          </button>
          {currentTeamId != null && (
            <button
              style={removeBtnSt}
              onClick={handleRemove}
              disabled={submitting}
            >
              {submitting ? 'Removing...' : 'Remove'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamRow({
  team,
  selected,
  onSelect,
}: {
  team: Team
  selected: boolean
  onSelect: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const rowSt: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    border: selected ? '1px solid #00e5ff' : '1px solid var(--color-border)',
    background: hovered ? 'var(--color-bg-alt)' : 'transparent',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  }

  const avatarSt: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    background: 'var(--color-bg-alt)',
  }

  const nameSt: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-fg)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const radioSt: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: selected ? '5px solid #00e5ff' : '2px solid var(--color-border)',
    background: 'var(--color-bg)',
    flexShrink: 0,
    transition: 'border 0.15s ease',
  }

  return (
    <div
      style={rowSt}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={uploadUrl(team.avatar_url)}
        alt={team.name}
        style={avatarSt}
      />
      <span style={nameSt}>{team.name}</span>
      <span style={radioSt} />
    </div>
  )
}
