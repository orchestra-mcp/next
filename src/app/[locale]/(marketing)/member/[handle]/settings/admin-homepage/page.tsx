'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminHomepagePage() {
  return (
    <AdminSettingsForm
      settingKey="homepage"
      title="Admin: Homepage"
      defaults={{
        hero_headline: 'The AI-Agentic IDE Framework',
        hero_subtext: '300+ MCP tools. 9 IDEs. Every platform. One framework to build, test, deploy, and orchestrate AI-powered development.',
        cta_primary: 'Get Started',
        cta_secondary: 'Read the Docs',
        stats_tools: '300+',
        stats_plugins: '38',
        stats_platforms: '6',
        stats_packs: '24',
        seo_title: 'The AI-Agentic IDE Framework',
        seo_description: '300+ MCP tools. 9 IDEs. Every platform. Build, test, deploy, and orchestrate AI-powered development with Orchestra.',
      }}
      fields={[
        { key: 'hero_headline', label: 'Hero Headline' },
        { key: 'hero_subtext', label: 'Hero Subtext', type: 'textarea' },
        { key: 'cta_primary', label: 'Primary CTA' },
        { key: 'cta_secondary', label: 'Secondary CTA' },
        { key: 'stats_tools', label: 'Stats: Tools' },
        { key: 'stats_plugins', label: 'Stats: Plugins' },
        { key: 'stats_platforms', label: 'Stats: Platforms' },
        { key: 'stats_packs', label: 'Stats: Packs' },
        { key: 'seo_title', label: 'SEO Title' },
        { key: 'seo_description', label: 'SEO Description', type: 'textarea' },
      ]}
    />
  )
}
