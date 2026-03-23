'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminGeneralPage() {
  const [comingSoon, setComingSoon] = useState<boolean | null>(null)

  // Load the separate coming_soon setting to show its real state
  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        const { data, error } = await sb
          .from('system_settings')
          .select('value')
          .eq('key', 'coming_soon')
          .maybeSingle()

        if (error) throw error
        setComingSoon(data?.value?.enabled ?? false)
      } catch {
        setComingSoon(false)
      }
    }
    load()
  }, [])

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
        allow_register: true,
        ...(comingSoon !== null ? { coming_soon: comingSoon } : { coming_soon: false }),
      }}
      fields={[
        { key: 'site_name', label: 'Site Name' },
        { key: 'tagline', label: 'Tagline' },
        { key: 'url', label: 'Site URL', type: 'url' },
        { key: 'support_email', label: 'Support Email', type: 'email' },
        { key: 'allow_register', label: 'Allow Registration', type: 'toggle' },
        { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
        { key: 'coming_soon', label: 'Coming Soon Mode', type: 'toggle' },
      ]}
    />
  )
}
