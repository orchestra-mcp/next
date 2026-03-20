'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminDiscordPage() {
  return (
    <AdminSettingsForm
      settingKey="discord"
      title="Admin: Discord"
      fields={[
        { key: 'enabled', label: 'Enabled', type: 'toggle' },
        { key: 'bot_token', label: 'Bot Token' },
        { key: 'application_id', label: 'Application ID' },
        { key: 'guild_id', label: 'Guild ID' },
        { key: 'channel_id', label: 'Channel ID' },
        { key: 'command_prefix', label: 'Command Prefix' },
        { key: 'webhook_url', label: 'Webhook URL', type: 'url' },
        { key: 'allowed_users', label: 'Allowed Users', type: 'textarea' },
      ]}
    />
  )
}
