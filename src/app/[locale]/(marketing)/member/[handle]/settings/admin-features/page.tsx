'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminFeaturesPage() {
  return (
    <AdminSettingsForm
      settingKey="features"
      title="Admin: Features"
      showLocale={false}
      defaults={{
        // Public pages (web)
        community: true,
        marketplace: true,
        blog: true,
        docs: true,
        download: true,
        solutions: true,
        contact: true,
        sponsors: true,
        issues: true,
        badges: true,
        // App features (web + desktop + mobile)
        projects: true,
        notes: true,
        plans: true,
        wiki: true,
        devtools: true,
        notifications: true,
        push_notifications: true,
        // AI features
        ai_chat: true,
        rag_memory: true,
        multi_agent: true,
        voice: true,
        // Desktop/Mobile specific
        extensions: true,
        terminal: true,
        tunnels: true,
        health: true,
        sync: true,
        // Profile features
        wallet: true,
        activity: true,
      }}
      fields={[
        // ── Public Pages ──
        { key: 'community', label: 'Community', type: 'toggle' },
        { key: 'marketplace', label: 'Marketplace', type: 'toggle' },
        { key: 'blog', label: 'Blog', type: 'toggle' },
        { key: 'docs', label: 'Documentation', type: 'toggle' },
        { key: 'download', label: 'Download Page', type: 'toggle' },
        { key: 'solutions', label: 'Solutions Page', type: 'toggle' },
        { key: 'contact', label: 'Contact Page', type: 'toggle' },
        { key: 'sponsors', label: 'Sponsors Page', type: 'toggle' },
        { key: 'issues', label: 'Public Issues', type: 'toggle' },
        { key: 'badges', label: 'Badges System', type: 'toggle' },
        // ── App Features ──
        { key: 'projects', label: 'Projects', type: 'toggle' },
        { key: 'notes', label: 'Notes', type: 'toggle' },
        { key: 'plans', label: 'Plans', type: 'toggle' },
        { key: 'wiki', label: 'Wiki / Docs Editor', type: 'toggle' },
        { key: 'devtools', label: 'DevTools', type: 'toggle' },
        { key: 'notifications', label: 'Notifications', type: 'toggle' },
        { key: 'push_notifications', label: 'Push Notifications', type: 'toggle' },
        // ── AI Features ──
        { key: 'ai_chat', label: 'AI Chat', type: 'toggle' },
        { key: 'rag_memory', label: 'RAG Memory', type: 'toggle' },
        { key: 'multi_agent', label: 'Multi-Agent', type: 'toggle' },
        { key: 'voice', label: 'Voice', type: 'toggle' },
        // ── Desktop / Mobile ──
        { key: 'extensions', label: 'Extensions', type: 'toggle' },
        { key: 'terminal', label: 'Terminal', type: 'toggle' },
        { key: 'tunnels', label: 'Tunnels', type: 'toggle' },
        { key: 'health', label: 'Health Tracking', type: 'toggle' },
        { key: 'sync', label: 'Sync / PowerSync', type: 'toggle' },
        // ── Profile ──
        { key: 'wallet', label: 'Wallet / Points', type: 'toggle' },
        { key: 'activity', label: 'Activity Feed', type: 'toggle' },
      ]}
    />
  )
}
