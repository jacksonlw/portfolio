import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Phosphor's RSC-safe entry is a barrel of ~1,500 icons; only load the ones we import.
    optimizePackageImports: ['@phosphor-icons/react/ssr']
  }
}

export default nextConfig
