import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@powersync/web'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@powersync/web']
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }
    return config
  },
  transpilePackages: [
    '@orchestra-mcp/ui',
    '@orchestra-mcp/icons',
    '@orchestra-mcp/theme',
    '@orchestra-mcp/editor',
    '@orchestra-mcp/ai',
    '@orchestra-mcp/tasks',
    '@orchestra-mcp/widgets',
    '@orchestra-mcp/devtools',
    '@orchestra-mcp/search',
    '@orchestra-mcp/voice',
    '@orchestra-mcp/settings',
    '@orchestra-mcp/shared',
    '@orchestra-mcp/marketplace',
    '@orchestra-mcp/explorer',
    '@orchestra-mcp/desktop',
    '@orchestra-mcp/chrome',
    '@orchestra-mcp/account-center',
    '@orchestra-mcp/tracking',
    '@orchestra-mcp/app-shell',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8080/uploads/:path*',
      },
    ]
  },
}

export default withNextIntl(nextConfig)
