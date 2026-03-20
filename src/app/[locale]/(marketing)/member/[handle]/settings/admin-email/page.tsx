'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminEmailPage() {
  return (
    <AdminSettingsForm
      settingKey="smtp"
      title="Admin: Email (SMTP)"
      fields={[
        { key: 'host', label: 'Host' },
        { key: 'port', label: 'Port', type: 'number' },
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password' },
        { key: 'from_name', label: 'From Name' },
        { key: 'from_email', label: 'From Email', type: 'email' },
      ]}
    />
  )
}
