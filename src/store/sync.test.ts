import { describe, it, expect, beforeEach } from 'vitest'
import { useSyncStore } from './sync'
import type { SyncConflict } from './sync'

describe('SyncStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useSyncStore.setState({
      syncStatus: 'idle',
      lastSyncAt: null,
      connectedTunnels: [],
      recentEvents: [],
      pendingChanges: 0,
      pendingWrites: 0,
      conflicts: [],
      autoRefresh: true,
      autoRefreshInterval: 30,
    })
  })

  // ── Pending Writes ────────────────────────────────────────────────────────

  it('sets pending writes count', () => {
    useSyncStore.getState().setPendingWrites(5)
    expect(useSyncStore.getState().pendingWrites).toBe(5)
  })

  it('resets pending writes to zero', () => {
    useSyncStore.getState().setPendingWrites(10)
    useSyncStore.getState().setPendingWrites(0)
    expect(useSyncStore.getState().pendingWrites).toBe(0)
  })

  // ── Conflicts ─────────────────────────────────────────────────────────────

  it('adds a conflict', () => {
    const conflict: SyncConflict = {
      id: 'c1',
      entity_type: 'note',
      entity_id: 'NOTE-123',
      local_version: 3,
      remote_version: 4,
      resolution: 'pending',
      timestamp: Date.now(),
    }
    useSyncStore.getState().addConflict(conflict)
    expect(useSyncStore.getState().conflicts).toHaveLength(1)
    expect(useSyncStore.getState().conflicts[0].id).toBe('c1')
  })

  it('limits conflicts to 50', () => {
    for (let i = 0; i < 55; i++) {
      useSyncStore.getState().addConflict({
        id: `c${i}`,
        entity_type: 'note',
        entity_id: `NOTE-${i}`,
        local_version: 1,
        remote_version: 2,
        resolution: 'pending',
        timestamp: Date.now(),
      })
    }
    expect(useSyncStore.getState().conflicts).toHaveLength(50)
    // Newest should be first
    expect(useSyncStore.getState().conflicts[0].id).toBe('c54')
  })

  it('resolves a conflict', () => {
    useSyncStore.getState().addConflict({
      id: 'c1',
      entity_type: 'feature',
      entity_id: 'FEAT-1',
      local_version: 2,
      remote_version: 3,
      resolution: 'pending',
      timestamp: Date.now(),
    })
    useSyncStore.getState().resolveConflict('c1', 'local_wins')
    expect(useSyncStore.getState().conflicts[0].resolution).toBe('local_wins')
  })

  it('clears all conflicts', () => {
    useSyncStore.getState().addConflict({
      id: 'c1',
      entity_type: 'note',
      entity_id: 'N-1',
      local_version: 1,
      remote_version: 2,
      resolution: 'pending',
      timestamp: Date.now(),
    })
    useSyncStore.getState().clearConflicts()
    expect(useSyncStore.getState().conflicts).toHaveLength(0)
  })

  // ── Auto-refresh ──────────────────────────────────────────────────────────

  it('toggles auto-refresh', () => {
    expect(useSyncStore.getState().autoRefresh).toBe(true)
    useSyncStore.getState().setAutoRefresh(false)
    expect(useSyncStore.getState().autoRefresh).toBe(false)
    useSyncStore.getState().setAutoRefresh(true)
    expect(useSyncStore.getState().autoRefresh).toBe(true)
  })

  // ── Existing functionality still works ────────────────────────────────────

  it('handles sync events and updates lastSyncAt', () => {
    useSyncStore.getState().handleSyncEvent({
      type: 'sync',
      entity_type: 'note',
      entity_id: 'NOTE-1',
      action: 'created',
      user_id: 1,
      timestamp: Date.now(),
    })
    expect(useSyncStore.getState().recentEvents).toHaveLength(1)
    expect(useSyncStore.getState().lastSyncAt).not.toBeNull()
  })

  it('limits recent events to 50', () => {
    for (let i = 0; i < 55; i++) {
      useSyncStore.getState().handleSyncEvent({
        type: 'sync',
        entity_type: 'note',
        entity_id: `N-${i}`,
        action: 'updated',
        user_id: 1,
        timestamp: Date.now(),
      })
    }
    expect(useSyncStore.getState().recentEvents).toHaveLength(50)
  })

  it('sets sync status', () => {
    useSyncStore.getState().setSyncStatus('syncing')
    expect(useSyncStore.getState().syncStatus).toBe('syncing')
  })

  it('clears events', () => {
    useSyncStore.getState().handleSyncEvent({
      type: 'sync',
      entity_type: 'note',
      entity_id: 'N-1',
      action: 'created',
      user_id: 1,
      timestamp: Date.now(),
    })
    useSyncStore.getState().clearEvents()
    expect(useSyncStore.getState().recentEvents).toHaveLength(0)
  })
})
