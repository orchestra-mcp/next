'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminGeneralPage() {
  return (
    <AdminSettingsForm
      settingKey="general"
      title="Admin: General"
      defaults={{
        site_name: 'Orchestra',
        tagline: 'AI-agentic IDE framework. 300+ MCP tools, 38 plugins, 9 IDEs, 6 platforms.',
        url: 'https://orchestra-mcp.dev',
        support_email: 'support@orchestra-mcp.dev',
        maintenance_mode: false,
        coming_soon: false,
      }}
      fields={[
        { key: 'site_name', label: 'Site Name' },
        { key: 'tagline', label: 'Tagline' },
        { key: 'url', label: 'Site URL', type: 'url' },
        { key: 'support_email', label: 'Support Email', type: 'email' },
        { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
        { key: 'coming_soon', label: 'Coming Soon Mode', type: 'toggle' },
      ]}
    />
  )
}
