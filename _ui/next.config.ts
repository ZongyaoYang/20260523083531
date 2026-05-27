import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.backblazeb2.com' },
      { protocol: 'https', hostname: '**.closehack.com' },
    ],
  },
}

export default nextConfig
