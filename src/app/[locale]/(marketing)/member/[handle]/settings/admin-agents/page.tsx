'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminAgentsPage() {
  return (
    <AdminSettingsForm
      settingKey="agents"
      title="Admin: AI Agents"
      fields={[
        { key: 'headline', label: 'Headline' },
        { key: 'subtext', label: 'Subtext', type: 'textarea' },
        { key: 'featured_ids', label: 'Featured IDs' },
      ]}
    />
  )
}
