'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminContactPage() {
  return (
    <AdminSettingsForm
      settingKey="contact"
      title="Admin: Contact"
      fields={[
        { key: 'headline', label: 'Headline' },
        { key: 'support_email', label: 'Support Email', type: 'email' },
        { key: 'hours', label: 'Hours' },
        { key: 'twitter', label: 'Twitter', type: 'url' },
        { key: 'github', label: 'GitHub', type: 'url' },
        { key: 'discord', label: 'Discord', type: 'url' },
      ]}
    />
  )
}
