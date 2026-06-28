import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['fitnes.lan', '127.0.0.1'],
  generateBuildId: async () => {
    const date = new Date().toISOString().replace(/[:.]/g, '-')
    return `build-${date}`
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/:path((?!_next/static|favicon\\.svg|apple-touch-icon\\.png|icon-\\d+x\\d+\\.png|manifest\\.json).*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
        {
          key: 'X-Build-Version',
          value: new Date().getTime().toString(),
        },
      ],
    },
  ],
}

export default nextConfig
