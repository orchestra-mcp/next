// Sidebar data types shared between layout components and hooks

export interface SidebarProject { id: string; name: string; description?: string; team_id?: string; owner_id?: number }
export interface SidebarNote { id: string; title: string; pinned: boolean; tags: string[]; icon?: string; color?: string; team_id?: string }
export interface SidebarPlan { id: string; title: string; status: string; featureCount: number; project_id?: string; team_id?: string }
export interface SidebarSession {
  id: string
  name: string
  account: string
  status: string
  messages: number
  team_id?: string
}
export interface SidebarDocFile { name: string; path: string; folder: string; pinned?: boolean; icon?: string; color?: string; team_id?: string }
export interface SidebarDevPlugin { key: string; label: string; icon: string; color: string; toolCount: number }
export interface SidebarRepo { id: string; name: string; repo_owner: string; repo_name: string; language: string; status: string; branch: string; is_private: boolean; description: string; team_id?: string }
export interface SidebarSkill { id: string; name: string; slug: string; scope: string; icon?: string; team_id?: string }
export interface SidebarAgent { id: string; name: string; slug: string; scope: string; icon?: string; team_id?: string }
export interface SidebarWorkflow { id: string; workflow_id?: string; name: string; project_slug?: string; is_default?: boolean; team_id?: string }
export interface SidebarDelegation { id: string; question: string; status: string; feature_id?: string; from_person?: string; team_id?: string }
export interface SidebarTerminalSession { id: string; name: string; type: 'terminal' | 'ssh' | 'claude'; status: 'active' | 'closed'; host?: string; createdAt: string }
