'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminPromptsPage() {
  return (
    <AdminSettingsForm
      settingKey="prompts"
      title="Admin: Smart Prompts"
      fields={[
        { key: 'startup_prompt', label: 'Startup Prompt', type: 'textarea' },
        { key: 'system_instructions', label: 'System Instructions', type: 'textarea' },
        { key: 'quick_actions_json', label: 'Quick Actions (JSON)', type: 'textarea' },
      ]}
    />
  )
}
