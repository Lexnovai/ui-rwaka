import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false
      }
    }
    return config
  },
  devIndicators: false,
  output: 'standalone'
}

export default nextConfig
