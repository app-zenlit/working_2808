/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [
      // Removed all external image domains - using local images only
    ],
  },
  // PWA Configuration
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },
  // Enable service worker
  // Optimize for mobile
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Security headers for PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'microphone=(), geolocation=(self)'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

export default nextConfig
