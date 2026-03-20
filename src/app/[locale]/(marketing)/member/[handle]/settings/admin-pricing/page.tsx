'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminPricingPage() {
  return (
    <AdminSettingsForm
      settingKey="pricing"
      title="Admin: Pricing"
      fields={[
        { key: 'free_name', label: 'Free: Name' },
        { key: 'free_price', label: 'Free: Price' },
        { key: 'free_period', label: 'Free: Period' },
        { key: 'free_cta', label: 'Free: CTA' },
        { key: 'free_features', label: 'Free: Features', type: 'textarea' },
        { key: 'pro_name', label: 'Pro: Name' },
        { key: 'pro_price', label: 'Pro: Price' },
        { key: 'pro_period', label: 'Pro: Period' },
        { key: 'pro_cta', label: 'Pro: CTA' },
        { key: 'pro_features', label: 'Pro: Features', type: 'textarea' },
        { key: 'enterprise_name', label: 'Enterprise: Name' },
        { key: 'enterprise_price', label: 'Enterprise: Price' },
        { key: 'enterprise_period', label: 'Enterprise: Period' },
        { key: 'enterprise_cta', label: 'Enterprise: CTA' },
        { key: 'enterprise_features', label: 'Enterprise: Features', type: 'textarea' },
      ]}
    />
  )
}
