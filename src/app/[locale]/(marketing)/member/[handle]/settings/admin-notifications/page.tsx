'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminNotificationsPage() {
  return (
    <AdminSettingsForm
      settingKey="notifications"
      title="Admin: Notifications"
      fields={[
        { key: 'vapid_public_key', label: 'VAPID Public Key' },
        { key: 'vapid_private_key', label: 'VAPID Private Key' },
        { key: 'vapid_email', label: 'VAPID Email', type: 'email' },
        { key: 'enable_email_notifications', label: 'Email Notifications', type: 'toggle' },
        { key: 'enable_push_notifications', label: 'Push Notifications', type: 'toggle' },
      ]}
    />
  )
}
