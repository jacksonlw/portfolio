import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // A Markdown twin of every Story, for agents: /projects/<slug>.md and /work/<slug>.md
    return [
      { source: '/projects/:slug.md', destination: '/md/projects/:slug' },
      { source: '/work/:slug.md', destination: '/md/work/:slug' }
    ]
  },
  experimental: {
    // Phosphor's RSC-safe entry is a barrel of ~1,500 icons; only load the ones we import.
    optimizePackageImports: ['@phosphor-icons/react/ssr']
  }
}

export default nextConfig
