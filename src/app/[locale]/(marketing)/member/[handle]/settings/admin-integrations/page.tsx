'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminIntegrationsPage() {
  return (
    <AdminSettingsForm
      settingKey="integrations"
      title="Admin: Integrations"
      fields={[
        { key: 'github_client_id', label: 'GitHub Client ID' },
        { key: 'github_client_secret', label: 'GitHub Client Secret' },
        { key: 'google_client_id', label: 'Google Client ID' },
        { key: 'google_client_secret', label: 'Google Client Secret' },
        { key: 'discord_client_id', label: 'Discord Client ID' },
        { key: 'discord_client_secret', label: 'Discord Client Secret' },
      ]}
    />
  )
}
