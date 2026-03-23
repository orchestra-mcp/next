import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase PostgREST query helpers for the browser client.
 * Each function wraps a Supabase query and throws on error,
 * matching the existing apiFetch pattern used in Zustand stores.
 */

function getClient(): SupabaseClient {
  return createClient()
}

/** Throw a descriptive error if a Supabase query fails. */
function throwOnError<T>(result: { data: T | null; error: any }): NonNullable<T> {
  if (result.error) throw new Error(result.error.message || 'Supabase query failed')
  if (result.data == null) throw new Error('Record not found')
  return result.data as NonNullable<T>
}

// ── Projects ──

export async function fetchProjects(opts?: { workspaceId?: string; teamId?: string }) {
  const sb = getClient()
  let q = sb.from('projects').select('*').order('created_at', { ascending: false })
  if (opts?.workspaceId) q = q.eq('workspace_id', opts.workspaceId)
  if (opts?.teamId) q = q.eq('team_id', opts.teamId)
  return throwOnError(await q)
}

export async function fetchProject(id: string) {
  const sb = getClient()
  return throwOnError(await sb.from('projects').select('*').eq('id', id).single())
}

export async function createProject(data: { name: string; description?: string; workspace_id: string }) {
  const sb = getClient()
  return throwOnError(await sb.from('projects').insert(data).select().single())
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('projects').update(data).eq('id', id).select().single())
}

export async function deleteProject(id: string) {
  const sb = getClient()
  throwOnError(await sb.from('projects').delete().eq('id', id))
}

// ── Features ──

export async function fetchFeatures(projectId: string, filters?: {
  status?: string; priority?: string; kind?: string;
  assignee?: string; search?: string; labels?: string[]
}) {
  const sb = getClient()
  let q = sb.from('features').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.priority) q = q.eq('priority', filters.priority)
  if (filters?.kind) q = q.eq('kind', filters.kind)
  if (filters?.assignee) q = q.eq('assignee_id', filters.assignee)
  if (filters?.search) q = q.ilike('title', `%${filters.search}%`)
  if (filters?.labels?.length) q = q.overlaps('labels', filters.labels)
  return throwOnError(await q)
}

export async function updateFeature(id: string, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('features').update(data).eq('id', id).select().single())
}

// ── Workspaces ──

export async function fetchWorkspaces(teamId?: string) {
  const sb = getClient()
  let q = sb.from('workspaces').select('*').order('created_at', { ascending: false })
  if (teamId) q = q.eq('team_id', teamId)
  return throwOnError(await q)
}

export async function createWorkspace(data: { name: string; description?: string; team_id: string }) {
  const sb = getClient()
  return throwOnError(await sb.from('workspaces').insert(data).select().single())
}

export async function updateWorkspace(id: string, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('workspaces').update(data).eq('id', id).select().single())
}

export async function deleteWorkspace(id: string) {
  const sb = getClient()
  throwOnError(await sb.from('workspaces').delete().eq('id', id))
}

// ── Delegations ──

export async function fetchDelegations() {
  const sb = getClient()
  return throwOnError(
    await sb.from('delegations').select('*').order('created_at', { ascending: false })
  )
}

// ── Notifications ──

export async function fetchNotifications() {
  const sb = getClient()
  return throwOnError(
    await sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(100)
  )
}

export async function markNotificationRead(id: number) {
  const sb = getClient()
  throwOnError(
    await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  )
}

// ── User Settings / Dashboard Preferences ──

export async function fetchUserSetting(key: string) {
  const sb = getClient()
  const result = await sb.from('user_settings').select('value').eq('key', key).maybeSingle()
  if (result.error) throw new Error(result.error.message)
  return result.data?.value ?? null
}

export async function upsertUserSetting(key: string, value: unknown) {
  const sb = getClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  const { data: profile } = await sb.from('users').select('id').single()
  if (!profile) return
  throwOnError(
    await sb.from('user_settings').upsert(
      { user_id: profile.id, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  )
}

// ── Feature Flags (public settings) ──

export async function fetchFeatureFlagsSetting() {
  const sb = getClient()
  const result = await sb.from('system_settings').select('value').eq('key', 'features').maybeSingle()
  if (result.error) throw new Error(result.error.message)
  return (result.data?.value ?? {}) as Record<string, unknown>
}

// ── Preferences ──

export async function fetchPreferences() {
  const sb = getClient()
  const result = await sb.from('user_settings').select('value').eq('key', 'preferences').maybeSingle()
  if (result.error) throw new Error(result.error.message)
  return (result.data?.value ?? {}) as Record<string, unknown>
}

export async function updatePreferences(partial: Record<string, unknown>) {
  const sb = getClient()
  // Fetch existing, merge, upsert
  const existing = await fetchPreferences()
  const merged = { ...existing, ...partial }
  throwOnError(
    await sb.from('user_settings').upsert(
      { key: 'preferences', value: merged, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  )
}

// ── Sessions ──

export async function fetchSessions() {
  const sb = getClient()
  return throwOnError(
    await sb.from('sessions').select('*').order('last_seen', { ascending: false })
  )
}

export async function deleteSession(id: string) {
  const sb = getClient()
  throwOnError(await sb.from('sessions').delete().eq('id', id))
}

// ── API Keys ──

export async function fetchApiKeys() {
  const sb = getClient()
  return throwOnError(
    await sb.from('api_keys').select('id,name,prefix,created_at,last_used').order('created_at', { ascending: false })
  )
}

export async function createApiKey(name: string) {
  const sb = getClient()
  return throwOnError(
    await sb.from('api_keys').insert({ name }).select().single()
  )
}

export async function deleteApiKey(id: string) {
  const sb = getClient()
  throwOnError(await sb.from('api_keys').delete().eq('id', id))
}

// ── Connected Accounts ──

export async function fetchConnectedAccounts() {
  const sb = getClient()
  return throwOnError(
    await sb.from('connected_accounts').select('*').order('created_at', { ascending: false })
  )
}

export async function deleteConnectedAccount(provider: string) {
  const sb = getClient()
  throwOnError(await sb.from('connected_accounts').delete().eq('provider', provider))
}

// ── Community Members (public) ──

export async function fetchCommunityMembers(page = 1, search = '', limit = 20) {
  const sb = getClient()
  const offset = (page - 1) * limit
  let q = sb.from('users').select('id,name,username,avatar_url,bio,role,location,created_at,is_public', { count: 'exact' })
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (search) q = q.or(`name.ilike.%${search}%,username.ilike.%${search}%`)
  const result = await q
  if (result.error) throw new Error(result.error.message)
  return { members: result.data ?? [], total: result.count ?? 0 }
}

export async function fetchMemberProfile(handle: string) {
  const sb = getClient()
  return throwOnError(
    await sb.from('users')
      .select('id,name,username,avatar_url,cover_url,bio,about,role,location,created_at,social_links,is_public,show_badges,show_wallet,settings')
      .eq('handle', handle)
      .single()
  )
}

// ── Community Posts ──

export async function fetchCommunityPosts(handle: string, page = 1, limit = 20) {
  const sb = getClient()
  const offset = (page - 1) * limit
  const q = sb.from('community_posts')
    .select('*,author:users!community_posts_author_id_fkey(name,username,avatar_url)')
    .eq('author:users.username', handle)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  // Fallback: filter by join
  const result = await sb.from('community_posts').select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (result.error) throw new Error(result.error.message)
  return result.data ?? []
}

export async function fetchCommunityPost(id: number) {
  const sb = getClient()
  return throwOnError(
    await sb.from('community_posts').select('*').eq('id', id).single()
  )
}

export async function createCommunityPost(data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('community_posts').insert(data).select().single()
  )
}

export async function updateCommunityPost(id: number, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('community_posts').update(data).eq('id', id).select().single()
  )
}

export async function deleteCommunityPost(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('community_posts').delete().eq('id', id))
}

export async function likeCommunityPost(postId: number) {
  const sb = getClient()
  // Toggle: try insert, if conflict (already liked) then delete
  const { error } = await sb.from('post_likes').insert({ post_id: postId })
  if (error && error.code === '23505') {
    // Already liked — unlike
    throwOnError(await sb.from('post_likes').delete().eq('post_id', postId))
    return 'unliked'
  }
  if (error) throw new Error(error.message)
  return 'liked'
}

// ── Post Comments ──

export async function fetchPostComments(postId: number) {
  const sb = getClient()
  return throwOnError(
    await sb.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true })
  )
}

export async function createPostComment(postId: number, content: string, parentId?: number) {
  const sb = getClient()
  const data: Record<string, unknown> = { post_id: postId, content }
  if (parentId != null) data.parent_id = parentId
  return throwOnError(
    await sb.from('post_comments').insert(data).select().single()
  )
}

// ── Activity ──

export async function fetchMemberActivity(handle: string) {
  const sb = getClient()
  return throwOnError(
    await sb.from('activity_log')
      .select('*')
      .eq('user_handle', handle)
      .order('created_at', { ascending: false })
      .limit(50)
  )
}

// ── Shared Entities ──

export async function fetchSharedEntities(handle: string, type?: string) {
  const sb = getClient()
  let q = sb.from('shares').select('*').eq('author_handle', handle).order('created_at', { ascending: false })
  if (type) q = q.eq('entity_type', type)
  return throwOnError(await q)
}

export async function createShare(data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('shares').insert(data).select().single()
  )
}

export async function deleteShare(id: string) {
  const sb = getClient()
  throwOnError(await sb.from('shares').delete().eq('id', id))
}

// ── Teams ──

export async function fetchTeam(teamId?: string) {
  const sb = getClient()
  if (teamId) {
    return throwOnError(await sb.from('teams').select('*').eq('id', teamId).single())
  }
  // Fetch first team the user belongs to
  const { data } = await sb.from('memberships').select('team_id').limit(1).single()
  if (!data) throw new Error('No team found')
  return throwOnError(await sb.from('teams').select('*').eq('id', data.team_id).single())
}

export async function fetchAllTeams() {
  const sb = getClient()
  const memberships = throwOnError(await sb.from('memberships').select('team_id'))
  const teamIds = (memberships as any[]).map((m: any) => m.team_id)
  if (teamIds.length === 0) return []
  return throwOnError(
    await sb.from('teams').select('*').in('id', teamIds).order('created_at', { ascending: false })
  )
}

export async function updateTeam(teamId: string, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('teams').update(data).eq('id', teamId).select().single()
  )
}

export async function deleteTeam(teamId: string) {
  const sb = getClient()
  throwOnError(await sb.from('teams').delete().eq('id', teamId))
}

// ── Team Members / Memberships ──

export async function fetchTeamMembers(teamId?: string) {
  const sb = getClient()
  if (!teamId) throw new Error('Team ID required')
  return throwOnError(
    await sb.from('memberships')
      .select('*, user:users!memberships_user_id_fkey(id,name,email,avatar_url,status)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
  )
}

export async function inviteTeamMember(teamId: string, email: string, role: string) {
  const sb = getClient()
  return throwOnError(
    await sb.from('memberships').insert({ team_id: teamId, email, role, status: 'invited' }).select().single()
  )
}

export async function updateMemberRole(memberId: number, role: string) {
  const sb = getClient()
  return throwOnError(
    await sb.from('memberships').update({ role }).eq('id', memberId).select().single()
  )
}

export async function removeTeamMember(memberId: number) {
  const sb = getClient()
  throwOnError(await sb.from('memberships').delete().eq('id', memberId))
}

// ── User Role ──

export async function fetchMyRole() {
  const sb = getClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const result = await sb.from('users').select('role').eq('auth_uid', user.id).single()
  if (result.error) throw new Error(result.error.message)
  return (result.data?.role ?? 'user') as string
}

// ── Admin: All Users ──

export async function fetchAllUsers() {
  const sb = getClient()
  return throwOnError(
    await sb.from('users').select('*').order('created_at', { ascending: false })
  )
}

export async function suspendUser(userId: number) {
  const sb = getClient()
  return throwOnError(
    await sb.from('users').update({ status: 'suspended' }).eq('id', userId).select().single()
  )
}

export async function unsuspendUser(userId: number) {
  const sb = getClient()
  return throwOnError(
    await sb.from('users').update({ status: 'active' }).eq('id', userId).select().single()
  )
}

// ── Admin: Pages ──

export async function fetchAdminPages() {
  const sb = getClient()
  return throwOnError(
    await sb.from('pages').select('*').order('created_at', { ascending: false })
  )
}

export async function createAdminPage(data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('pages').insert(data).select().single())
}

export async function updateAdminPage(id: number, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('pages').update(data).eq('id', id).select().single())
}

export async function deleteAdminPage(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('pages').delete().eq('id', id))
}

// ── Admin: Posts ──

export async function fetchAdminPosts() {
  const sb = getClient()
  return throwOnError(
    await sb.from('posts').select('*').order('created_at', { ascending: false })
  )
}

export async function createAdminPost(data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('posts').insert(data).select().single())
}

export async function updateAdminPost(id: number, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('posts').update(data).eq('id', id).select().single())
}

export async function deleteAdminPost(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('posts').delete().eq('id', id))
}

// ── Admin: Categories ──

export async function fetchAdminCategories() {
  const sb = getClient()
  return throwOnError(
    await sb.from('categories').select('*').order('name', { ascending: true })
  )
}

export async function createAdminCategory(name: string, type = 'blog') {
  const sb = getClient()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return throwOnError(
    await sb.from('categories').insert({ name, slug, type }).select().single()
  )
}

export async function deleteAdminCategory(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('categories').delete().eq('id', id))
}

// ── Admin: Contact Messages ──

export async function fetchAdminContact() {
  const sb = getClient()
  return throwOnError(
    await sb.from('contact_messages').select('*').order('created_at', { ascending: false })
  )
}

export async function deleteAdminContact(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('contact_messages').delete().eq('id', id))
}

// ── Admin: Issues ──

export async function fetchAdminIssues() {
  const sb = getClient()
  return throwOnError(
    await sb.from('issues').select('*').order('created_at', { ascending: false })
  )
}

export async function updateAdminIssue(id: number, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('issues').update(data).eq('id', id).select().single()
  )
}

// ── Admin: Notifications Sent ──

export async function fetchAdminNotificationsSent(limit = 20, offset = 0) {
  const sb = getClient()
  return throwOnError(
    await sb.from('notifications_sent').select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
  )
}

export async function sendAdminNotification(data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('notifications_sent').insert(data).select().single()
  )
}

// ── Admin: Sponsors ──

export async function fetchAdminSponsors() {
  const sb = getClient()
  return throwOnError(
    await sb.from('sponsors').select('*').order('order', { ascending: true })
  )
}

export async function createAdminSponsor(data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('sponsors').insert(data).select().single())
}

export async function updateAdminSponsor(id: number, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(await sb.from('sponsors').update(data).eq('id', id).select().single())
}

export async function deleteAdminSponsor(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('sponsors').delete().eq('id', id))
}

// ── Admin: Community Posts (moderation) ──

export async function fetchAdminCommunityPosts() {
  const sb = getClient()
  return throwOnError(
    await sb.from('community_posts').select('*').order('created_at', { ascending: false })
  )
}

export async function updateAdminCommunityPost(id: number, data: Record<string, unknown>) {
  const sb = getClient()
  return throwOnError(
    await sb.from('community_posts').update(data).eq('id', id).select().single()
  )
}

export async function deleteAdminCommunityPost(id: number) {
  const sb = getClient()
  throwOnError(await sb.from('community_posts').delete().eq('id', id))
}

// ── Admin: GitHub Issues ──

export async function fetchAdminGitHubIssues(repo?: string) {
  const sb = getClient()
  let q = sb.from('github_issues').select('*').order('created_at', { ascending: false })
  if (repo) q = q.eq('repo', repo)
  return throwOnError(await q)
}

export async function fetchAdminGitHubRepos() {
  const sb = getClient()
  return throwOnError(
    await sb.from('github_issues').select('repo').order('repo', { ascending: true })
  )
}

// ── Admin: Settings ──

export async function fetchAdminSetting(key: string) {
  const sb = getClient()
  const result = await sb.from('system_settings').select('value,updated_at').eq('key', key).maybeSingle()
  if (result.error) throw new Error(result.error.message)
  return (result.data?.value ?? {}) as Record<string, unknown>
}

export async function updateAdminSetting(key: string, value: Record<string, unknown>) {
  const sb = getClient()
  throwOnError(
    await sb.from('system_settings').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
  )
}
