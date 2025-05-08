import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'standalone'
  images: {
    domains: ['ask.rwaka.rw'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ask.rwaka.rw',
        port: '',
        pathname: '/**',
      },
    ],
}

export default nextConfig
