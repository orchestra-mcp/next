'use client'

import { AdminContentTable } from '@/components/dashboard/admin-content-table'

export default function AdminContentPage() {
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 4 }}>
          Content Management
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>
          Manage all shared content across the platform
        </p>
      </div>
      <AdminContentTable />
    </div>
  )
}
