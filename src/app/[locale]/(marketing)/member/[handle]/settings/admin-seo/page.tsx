'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminSeoPage() {
  return (
    <AdminSettingsForm
      settingKey="seo"
      title="Admin: SEO"
      defaults={{
        title_template: '%s | Orchestra',
        meta_description: 'AI-agentic IDE framework. 300+ MCP tools, 38 plugins, 9 IDEs, 6 platforms.',
        og_image_url: '',
        robots_txt: 'User-agent: *\nAllow: /\nSitemap: https://orchestra-mcp.dev/sitemap.xml',
        sitemap_url: 'https://orchestra-mcp.dev/sitemap.xml',
      }}
      fields={[
        { key: 'title_template', label: 'Title Template' },
        { key: 'meta_description', label: 'Meta Description', type: 'textarea' },
        { key: 'og_image_url', label: 'OG Image URL', type: 'url' },
        { key: 'robots_txt', label: 'robots.txt', type: 'textarea' },
        { key: 'sitemap_url', label: 'Sitemap URL', type: 'url' },
      ]}
    />
  )
}
