'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminGithubPage() {
  return (
    <AdminSettingsForm
      settingKey="github"
      title="Admin: GitHub"
      fields={[
        { key: 'token', label: 'Token' },
        { key: 'default_repos', label: 'Default Repos', type: 'textarea' },
        { key: 'sync_interval', label: 'Sync Interval' },
      ]}
    />
  )
}
