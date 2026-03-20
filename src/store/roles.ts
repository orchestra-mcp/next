'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'

export type Role = 'admin' | 'team_owner' | 'team_manager' | 'user'

export interface TeamMember {
  id: number
  name: string
  email: string
  role: Role
  avatar_url?: string | null
  joined_at: string
  status: 'active' | 'invited' | 'suspended'
}

export interface Team {
  id: string
  name: string
  slug: string
  description?: string
  avatar_url?: string
  plan: 'free' | 'pro' | 'enterprise'
  member_count: number
  created_at: string
  owner_id: number
}

export interface RolePermissions {
  canManageUsers: boolean
  canManageRoles: boolean
  canManageTeam: boolean
  canViewAdmin: boolean
  canInviteMembers: boolean
  canRemoveMembers: boolean
  canChangeRoles: boolean
  canViewBilling: boolean
  canManageBilling: boolean
  canDeleteTeam: boolean
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageRoles: true,
    canManageTeam: true,
    canViewAdmin: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canViewBilling: true,
    canManageBilling: true,
    canDeleteTeam: true,
  },
  team_owner: {
    canManageUsers: false,
    canManageRoles: false,
    canManageTeam: true,
    canViewAdmin: false,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canViewBilling: true,
    canManageBilling: true,
    canDeleteTeam: true,
  },
  team_manager: {
    canManageUsers: false,
    canManageRoles: false,
    canManageTeam: false,
    canViewAdmin: false,
    canInviteMembers: true,
    canRemoveMembers: false,
    canChangeRoles: false,
    canViewBilling: false,
    canManageBilling: false,
    canDeleteTeam: false,
  },
  user: {
    canManageUsers: false,
    canManageRoles: false,
    canManageTeam: false,
    canViewAdmin: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canViewBilling: false,
    canManageBilling: false,
    canDeleteTeam: false,
  },
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  team_owner: 'Team Owner',
  team_manager: 'Team Manager',
  user: 'User',
}

export const ROLE_COLORS: Record<Role, { bg: string; color: string; border: string }> = {
  admin: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
  team_owner: { bg: 'rgba(169,0,255,0.1)', color: '#a900ff', border: 'rgba(169,0,255,0.25)' },
  team_manager: { bg: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: 'rgba(0,229,255,0.25)' },
  user: { bg: 'rgba(128,128,128,0.1)', color: 'rgba(128,128,128,0.8)', border: 'rgba(128,128,128,0.2)' },
}

// Seed data for dev/demo — realistic mock users and team
const SEED_USERS: TeamMember[] = [
  { id: 1, name: 'Alice Admin', email: 'admin@orchestra.dev', role: 'admin', joined_at: '2024-01-01T00:00:00Z', status: 'active' },
  { id: 2, name: 'Owen Owner', email: 'owner@orchestra.dev', role: 'team_owner', joined_at: '2024-01-05T00:00:00Z', status: 'active' },
  { id: 3, name: 'Mia Manager', email: 'manager@orchestra.dev', role: 'team_manager', joined_at: '2024-02-10T00:00:00Z', status: 'active' },
  { id: 4, name: 'Bob Builder', email: 'bob@orchestra.dev', role: 'user', joined_at: '2024-03-01T00:00:00Z', status: 'active' },
  { id: 5, name: 'Sam Spencer', email: 'sam@orchestra.dev', role: 'user', joined_at: '2024-03-15T00:00:00Z', status: 'invited' },
  { id: 6, name: 'Zoe Zhang', email: 'zoe@orchestra.dev', role: 'user', joined_at: '2024-04-01T00:00:00Z', status: 'suspended' },
  { id: 7, name: 'Carlos Cruz', email: 'carlos@orchestra.dev', role: 'team_manager', joined_at: '2024-04-10T00:00:00Z', status: 'active' },
  { id: 8, name: 'Dana Doe', email: 'dana@orchestra.dev', role: 'user', joined_at: '2024-05-01T00:00:00Z', status: 'active' },
]

const SEED_TEAM: Team = {
  id: 'team_orchestra_dev_01',
  name: 'Orchestra Dev',
  slug: 'orchestra-dev',
  description: 'Core product team building the Orchestra platform.',
  plan: 'pro',
  member_count: 8,
  created_at: '2024-01-01T00:00:00Z',
  owner_id: 2,
}

interface RolesState {
  currentRole: Role
  roleLoaded: boolean       // true once fetchMyRole has resolved at least once
  team: Team | null
  teams: Team[]             // all teams the user belongs to
  members: TeamMember[]
  allUsers: TeamMember[]  // admin view
  loading: boolean
  error: string | null
}

interface RolesActions {
  setCurrentRole: (role: Role) => void  // dev/demo helper
  seedAdmin: () => void                 // inject seed data + set role to admin (dev/demo)
  addTeamLocally: (team: Team) => void  // add a team to the local store (dev/offline)
  fetchMyRole: () => Promise<void>
  fetchTeam: () => Promise<void>
  fetchAllTeams: () => Promise<void>    // fetch all teams user belongs to
  switchTeam: (teamId: string) => void  // switch active team by id
  fetchMembers: () => Promise<void>
  fetchAllUsers: () => Promise<void>  // admin only
  inviteMember: (email: string, role: Role) => Promise<void>
  updateMemberRole: (memberId: number, role: Role) => Promise<void>
  removeMember: (memberId: number) => Promise<void>
  suspendUser: (userId: number) => Promise<void>
  unsuspendUser: (userId: number) => Promise<void>
  updateTeam: (data: Partial<Pick<Team, 'name' | 'description'>>) => Promise<void>
  deleteTeam: () => Promise<void>
  clearError: () => void
  can: (permission: keyof RolePermissions) => boolean
}

export const useRoleStore = create<RolesState & RolesActions>()(
  persist(
    (set, get) => ({
      currentRole: 'user',
      roleLoaded: false,
      team: null,
      teams: [],
      members: [],
      allUsers: [],
      loading: false,
      error: null,

      setCurrentRole: (role) => set({ currentRole: role }),

      seedAdmin: () => {
        set({
          currentRole: 'admin',
          roleLoaded: true,
          allUsers: SEED_USERS,
          members: SEED_USERS.filter(u => u.status !== 'suspended'),
          team: SEED_TEAM,
          teams: [SEED_TEAM],
        })
      },

      addTeamLocally: (newTeam) => {
        set(state => {
          const exists = state.teams.find(t => t.id === newTeam.id)
          const teams = exists ? state.teams : [...state.teams, newTeam]
          // Creator becomes team_owner of the new team
          return { teams, team: newTeam, currentRole: 'team_owner' }
        })
      },

      can: (permission) => ROLE_PERMISSIONS[get().currentRole][permission],

      fetchMyRole: async () => {
        // Skip API call for dev seed sessions — role is already set
        const token = typeof window !== 'undefined' ? localStorage.getItem('orchestra_token') : null
        if (token === 'dev_seed_token') {
          set({ roleLoaded: true })
          return
        }
        try {
          const res = await apiFetch<{ role: Role }>('/api/auth/me/role')
          set({ currentRole: res.role, roleLoaded: true })
        } catch {
          // On error (e.g. no backend), keep existing role but mark as loaded
          set({ roleLoaded: true })
        }
      },

      fetchTeam: async () => {
        set({ loading: true, error: null })
        try {
          const teamId = get().team?.id
          const url = teamId ? `/api/team?team_id=${teamId}` : '/api/team'
          const res = await apiFetch<Team | { team: Team }>(url)
          const team = ('team' in res && res.team) ? res.team : res as Team
          set({ team, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
        }
      },

      fetchAllTeams: async () => {
        try {
          const res = await apiFetch<Array<Team | { team: Team; role?: string }> | { teams: Team[] }>('/api/teams/')
          let teams: Team[]
          if (Array.isArray(res)) {
            // Backend returns [{ team: {...}, role: "..." }] or flat Team[]
            teams = res.map(item => 'team' in item && item.team ? item.team as Team : item as Team)
          } else {
            teams = res.teams ?? []
          }
          // Only update `team` if not already set (don't override active team)
          set(state => ({ teams, team: state.team ?? teams[0] ?? null }))
        } catch {
          // Non-fatal: keep existing teams
        }
      },

      switchTeam: (teamId) => {
        if (!teamId) { set({ team: null, members: [] }); return }
        const found = get().teams.find(t => t.id === teamId)
        if (found) set({ team: found, members: [] })
      },

      fetchMembers: async () => {
        set({ loading: true, error: null })
        try {
          const teamId = get().team?.id
          const url = teamId ? `/api/team/members?team_id=${teamId}` : '/api/team/members'
          const res = await apiFetch<{ members: TeamMember[] }>(url)
          set({ members: res.members, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
        }
      },

      fetchAllUsers: async () => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ users: TeamMember[] }>('/api/admin/users')
          set({ allUsers: res.users, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
        }
      },

      inviteMember: async (email, role) => {
        set({ loading: true, error: null })
        const teamId = get().team?.id
        if (!teamId) { set({ error: 'No team found', loading: false }); throw new Error('No team found') }
        try {
          await apiFetch(`/api/teams/${teamId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email, role }),
          })
          set({ loading: false })
          await get().fetchMembers()
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      updateMemberRole: async (memberId, role) => {
        set({ loading: true, error: null })
        try {
          await apiFetch(`/api/team/members/${memberId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
          })
          set(state => ({
            members: state.members.map(m => m.id === memberId ? { ...m, role } : m),
            allUsers: state.allUsers.map(m => m.id === memberId ? { ...m, role } : m),
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      removeMember: async (memberId) => {
        set({ loading: true, error: null })
        try {
          await apiFetch(`/api/team/members/${memberId}`, { method: 'DELETE' })
          set(state => ({
            members: state.members.filter(m => m.id !== memberId),
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      suspendUser: async (userId) => {
        set({ loading: true, error: null })
        try {
          await apiFetch(`/api/admin/users/${userId}/suspend`, { method: 'POST' })
          set(state => ({
            allUsers: state.allUsers.map(u => u.id === userId ? { ...u, status: 'suspended' as const } : u),
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      unsuspendUser: async (userId) => {
        set({ loading: true, error: null })
        try {
          await apiFetch(`/api/admin/users/${userId}/unsuspend`, { method: 'POST' })
          set(state => ({
            allUsers: state.allUsers.map(u => u.id === userId ? { ...u, status: 'active' as const } : u),
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      updateTeam: async (data) => {
        set({ loading: true, error: null })
        try {
          const teamId = get().team?.id
          const url = teamId ? `/api/team?team_id=${teamId}` : '/api/team'
          const res = await apiFetch<{ team: Team }>(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
          set({ team: res.team, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      deleteTeam: async () => {
        const teamId = get().team?.id
        if (!teamId) return
        set({ loading: true, error: null })
        try {
          await apiFetch(`/api/teams/${teamId}`, { method: 'DELETE' })
          set(state => ({
            team: null,
            teams: state.teams.filter(t => t.id !== teamId),
            members: [],
            currentRole: 'user',
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'orchestra-roles',
      partialize: (state) => ({ currentRole: state.currentRole, roleLoaded: state.roleLoaded, team: state.team, teams: state.teams }),
    }
  )
)
