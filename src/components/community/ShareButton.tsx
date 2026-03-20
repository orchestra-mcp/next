'use client'
import { useState } from 'react'
import { useCommunityStore } from '@/store/community'

interface Props {
  entityType: 'note' | 'skill' | 'agent' | 'workflow'
  entityId: string
  title: string
  description?: string
  content?: string
  icon?: string
  color?: string
}

export function ShareButton({ entityType, entityId, title, description, content, icon, color }: Props) {
  const [isSharing, setIsSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const { shareEntity } = useCommunityStore()

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await shareEntity({
        entity_type: entityType,
        entity_id: entityId,
        title,
        description: description ?? '',
        content: content ?? '',
        visibility: 'public',
        tags: [],
        icon: icon ?? '',
        color: color ?? '',
      })
      setShared(true)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={isSharing || shared}
      style={{
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        border: shared ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--color-border, rgba(255,255,255,0.1))',
        background: shared ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
        color: shared ? '#22c55e' : 'var(--color-fg-muted, rgba(255,255,255,0.5))',
        cursor: isSharing || shared ? 'default' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s ease',
      }}
    >
      <i className={`bx ${shared ? 'bx-check' : 'bx-share-alt'}`} style={{ fontSize: 15 }} />
      {shared ? 'Shared' : isSharing ? 'Sharing...' : 'Share to Profile'}
    </button>
  )
}
