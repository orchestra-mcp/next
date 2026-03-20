'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminPagesPage() {
  return (
    <AdminSettingsForm
      settingKey="pages"
      title="Admin: Pages"
      fields={[
        { key: 'terms_content', label: 'Terms Content', type: 'textarea' },
        { key: 'privacy_content', label: 'Privacy Content', type: 'textarea' },
        { key: 'about_content', label: 'About Content', type: 'textarea' },
      ]}
    />
  )
}
