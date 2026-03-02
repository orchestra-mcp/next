'use client'
import { useThemeStore } from '@/store/theme'

const sections = [
  {
    title: 'Information We Collect',
    body: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes: account information (name, email, password); usage data (features used, commands run, session duration); project data you choose to store in our cloud services; and communication data when you contact us.",
  },
  {
    title: 'How We Use Your Information',
    body: 'We use the information we collect to: provide, maintain, and improve our services; process transactions and send related information; send technical notices and support messages; respond to your comments and questions; monitor and analyze usage patterns to improve user experience; detect and prevent fraudulent transactions and other illegal activities; and comply with legal obligations.',
  },
  {
    title: 'Data Storage and Security',
    body: "Your data is stored on infrastructure hosted in the United States. We use industry-standard encryption (TLS in transit, AES-256 at rest) to protect your data. Orchestra does not store AI provider API keys — these are stored locally on your device or in your environment's secret management system. We employ mTLS authentication between all internal services.",
  },
  {
    title: 'Local vs. Cloud Data',
    body: 'Orchestra is designed with a privacy-first architecture. When running Orchestra locally (orchestra serve), all data stays on your machine by default. Cloud sync is opt-in. Self-hosted enterprise deployments can configure Orchestra to never connect to external services. API keys for AI providers (Anthropic, OpenAI, etc.) are stored locally in your environment and are never transmitted to Orchestra servers.',
  },
  {
    title: 'Data Sharing',
    body: 'We do not sell your personal data to third parties. We may share data with: service providers who assist in our operations (hosting, analytics, email) under strict confidentiality agreements; law enforcement when required by law; and successor entities in the event of a merger or acquisition, with advance notice to users.',
  },
  {
    title: 'Cookies and Tracking',
    body: 'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. We use analytics services to understand how the service is used. You can opt out of analytics tracking in your account settings.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your account and associated data; export your data in a machine-readable format; opt out of marketing communications at any time; and lodge a complaint with your local data protection authority.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer. Project data stored in our cloud services will be deleted within 90 days of account deletion.',
  },
  {
    title: "Children's Privacy",
    body: 'Orchestra does not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us and we will take steps to delete such information.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. For material changes, we will send an email notification to the address associated with your account.',
  },
]

export default function PrivacyPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const textBody = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)'
  const introBg = isDark ? 'rgba(0,229,255,0.04)' : 'rgba(0,229,255,0.05)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 12 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: textMuted }}>Last updated: February 28, 2026</p>
      </div>

      <div style={{ fontSize: 15, color: textBody, lineHeight: 1.75, marginBottom: 40, padding: '20px', borderRadius: 10, background: introBg, border: '1px solid rgba(0,229,255,0.15)' }}>
        <i className="bx bx-shield-quarter" style={{ color: '#00e5ff', marginRight: 8 }} />
        Orchestra is designed privacy-first. Your API keys never leave your device. Local mode keeps all data on your machine. Cloud sync is always opt-in.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {sections.map(s => (
          <div key={s.title}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: textBody, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${dividerColor}`, fontSize: 14, color: textMuted }}>
        Privacy questions? <a href="mailto:privacy@orchestra-mcp.dev" style={{ color: '#00e5ff', textDecoration: 'none' }}>privacy@orchestra-mcp.dev</a>
      </div>
    </div>
  )
}
