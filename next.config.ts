import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // A Markdown twin of every project page, for agents: /projects/<slug>.md
    return [{ source: '/projects/:slug.md', destination: '/md/projects/:slug' }]
  },
  experimental: {
    // Phosphor's RSC-safe entry is a barrel of ~1,500 icons; only load the ones we import.
    optimizePackageImports: ['@phosphor-icons/react/ssr']
  }
}

export default nextConfig
