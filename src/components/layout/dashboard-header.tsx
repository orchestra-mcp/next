'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

function getBreadcrumb(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean)
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))
}

export function DashboardHeader() {
  const pathname = usePathname()
  const crumbs = getBreadcrumb(pathname)

  return (
    <header style={{
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(15,15,18,0.8)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>}
            <span style={{ color: i === crumbs.length - 1 ? '#f8f8f8' : 'rgba(255,255,255,0.4)', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>{crumb}</span>
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LanguageSwitcher />
        <a href="https://github.com/orchestra-mcp" target="_blank" rel="noopener" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
          <i className="bx bxl-github" style={{ fontSize: 16 }} />
        </a>
        <Link href="/docs" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
          <i className="bx bx-book-open" style={{ fontSize: 16 }} />
        </Link>
      </div>
    </header>
  )
}
