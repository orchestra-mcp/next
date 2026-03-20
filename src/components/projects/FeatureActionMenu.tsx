'use client'
import { useState } from 'react'
import { useRoleStore } from '@/store/roles'
import { useFeaturesStore } from '@/store/features'
import { useSmartActions } from '@/hooks/useSmartActions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import type { Feature, FeatureStatus } from '@/types/models'

interface FeatureActionMenuProps {
  feature: Feature
  onSmartAction?: () => void
}

const ALL_STATUSES: { value: FeatureStatus; label: string; icon: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', icon: 'bx-archive', color: 'rgba(255, 255, 255, 0.4)' },
  { value: 'todo', label: 'Todo', icon: 'bx-circle', color: 'rgba(255, 255, 255, 0.5)' },
  { value: 'in-progress', label: 'In Progress', icon: 'bx-loader-circle', color: '#a900ff' },
  { value: 'in-testing', label: 'In Testing', icon: 'bx-test-tube', color: '#00e5ff' },
  { value: 'in-docs', label: 'In Docs', icon: 'bx-file', color: '#f59e0b' },
  { value: 'in-review', label: 'In Review', icon: 'bx-show', color: '#8b5cf6' },
  { value: 'needs-edits', label: 'Needs Edits', icon: 'bx-edit', color: '#ef4444' },
  { value: 'done', label: 'Done', icon: 'bx-check-circle', color: '#22c55e' },
]

export function FeatureActionMenu({ feature, onSmartAction }: FeatureActionMenuProps) {
  const { members } = useRoleStore()
  const { updateStatus, assignFeature } = useFeaturesStore()
  const { canExecute } = useSmartActions()
  const [open, setOpen] = useState(false)

  const activeMembers = members.filter(m => m.status === 'active')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 6,
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.background = 'none'
          }}
        >
          <i className="bx bx-dots-vertical-rounded" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Status submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <i className="bx bx-transfer-alt" style={{ fontSize: 14, opacity: 0.5 }} />
            Change Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ALL_STATUSES.map(s => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => {
                  updateStatus(feature.id, s.value)
                  setOpen(false)
                }}
                style={{
                  color: feature.status === s.value ? s.color : undefined,
                  fontWeight: feature.status === s.value ? 600 : undefined,
                }}
              >
                <i className={`bx ${s.icon}`} style={{ fontSize: 14, color: s.color }} />
                {s.label}
                {feature.status === s.value && (
                  <i
                    className="bx bx-check"
                    style={{
                      marginLeft: 'auto',
                      fontSize: 14,
                      color: s.color,
                    }}
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Assign submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <i className="bx bx-user-plus" style={{ fontSize: 14, opacity: 0.5 }} />
            Assign to
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {activeMembers.length === 0 ? (
              <DropdownMenuItem disabled style={{ opacity: 0.4, cursor: 'default' }}>
                <i className="bx bx-info-circle" style={{ fontSize: 14, opacity: 0.5 }} />
                No team members
              </DropdownMenuItem>
            ) : (
              activeMembers.map(member => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => {
                    assignFeature(feature.id, member.id)
                    setOpen(false)
                  }}
                  style={{
                    fontWeight: feature.assignee_id === member.id ? 600 : undefined,
                    color: feature.assignee_id === member.id ? '#a900ff' : undefined,
                  }}
                >
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt=""
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'rgba(169, 0, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#a900ff',
                      flexShrink: 0,
                    }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {member.name}
                  {feature.assignee_id === member.id && (
                    <i
                      className="bx bx-check"
                      style={{
                        marginLeft: 'auto',
                        fontSize: 14,
                        color: '#a900ff',
                      }}
                    />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Smart Action */}
        <DropdownMenuItem
          disabled={!canExecute}
          onClick={() => {
            setOpen(false)
            onSmartAction?.()
          }}
          style={{
            opacity: !canExecute ? 0.35 : 1,
            cursor: !canExecute ? 'not-allowed' : 'pointer',
            color: canExecute ? '#a900ff' : undefined,
          }}
        >
          <i className="bx bx-bolt" style={{ fontSize: 14, color: canExecute ? '#a900ff' : 'rgba(255, 255, 255, 0.3)' }} />
          Start Smart Action
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
