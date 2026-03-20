'use client'
import AdminSettingsForm from '../_shared/AdminSettingsForm'

export default function AdminDownloadPage() {
  return (
    <AdminSettingsForm
      settingKey="download"
      title="Admin: Downloads"
      fields={[
        { key: 'macos_url', label: 'macOS URL', type: 'url' },
        { key: 'macos_version', label: 'macOS Version' },
        { key: 'macos_release_date', label: 'macOS Release Date' },
        { key: 'windows_url', label: 'Windows URL', type: 'url' },
        { key: 'windows_version', label: 'Windows Version' },
        { key: 'windows_release_date', label: 'Windows Release Date' },
        { key: 'linux_url', label: 'Linux URL', type: 'url' },
        { key: 'linux_version', label: 'Linux Version' },
        { key: 'linux_release_date', label: 'Linux Release Date' },
      ]}
    />
  )
}
