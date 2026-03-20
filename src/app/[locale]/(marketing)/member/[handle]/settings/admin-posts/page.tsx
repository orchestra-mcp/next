'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminPostsPage() {
  return (
    <AdminSettingsForm
      settingKey="blog"
      title="Admin: Blog Posts"
      fields={[
        { key: 'posts_per_page', label: 'Posts Per Page', type: 'number' },
        { key: 'enable_comments', label: 'Enable Comments', type: 'toggle' },
        { key: 'enable_reactions', label: 'Enable Reactions', type: 'toggle' },
        { key: 'featured_post_ids', label: 'Featured Post IDs' },
      ]}
    />
  )
}
