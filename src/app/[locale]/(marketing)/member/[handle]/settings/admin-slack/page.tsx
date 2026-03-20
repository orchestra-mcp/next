'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminSlackPage() {
  return (
    <AdminSettingsForm
      settingKey="slack"
      title="Admin: Slack"
      fields={[
        { key: 'enabled', label: 'Enabled', type: 'toggle' },
        { key: 'bot_token', label: 'Bot Token' },
        { key: 'app_token', label: 'App Token' },
        { key: 'signing_secret', label: 'Signing Secret' },
        { key: 'app_id', label: 'App ID' },
        { key: 'channel_id', label: 'Channel ID' },
        { key: 'team_id', label: 'Team ID' },
        { key: 'command_prefix', label: 'Command Prefix' },
        { key: 'webhook_url', label: 'Webhook URL', type: 'url' },
        { key: 'allowed_users', label: 'Allowed Users', type: 'textarea' },
      ]}
    />
  )
}
