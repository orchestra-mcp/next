'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminFeaturesPage() {
  return (
    <AdminSettingsForm
      settingKey="features"
      title="Admin: Features"
      fields={[
        { key: 'enable_ai_chat', label: 'AI Chat', type: 'toggle' },
        { key: 'enable_rag_memory', label: 'RAG Memory', type: 'toggle' },
        { key: 'enable_multi_agent', label: 'Multi-Agent', type: 'toggle' },
        { key: 'enable_marketplace', label: 'Marketplace', type: 'toggle' },
        { key: 'enable_community', label: 'Community', type: 'toggle' },
        { key: 'enable_notifications', label: 'Notifications', type: 'toggle' },
        { key: 'enable_push', label: 'Push Notifications', type: 'toggle' },
        { key: 'enable_voice', label: 'Voice', type: 'toggle' },
        { key: 'enable_extensions', label: 'Extensions', type: 'toggle' },
        { key: 'enable_devtools', label: 'DevTools', type: 'toggle' },
        { key: 'enable_projects', label: 'Projects', type: 'toggle' },
        { key: 'enable_notes', label: 'Notes', type: 'toggle' },
      ]}
    />
  )
}
