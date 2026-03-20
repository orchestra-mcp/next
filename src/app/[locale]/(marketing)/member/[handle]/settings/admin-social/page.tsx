'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminSocialPage() {
  return (
    <AdminSettingsForm
      settingKey="social_platforms"
      title="Admin: Social Platforms"
      fields={[
        { key: 'platforms_json', label: 'Social Platforms (JSON array of {value, label, icon, placeholder})', type: 'textarea' },
      ]}
    />
  )
}
