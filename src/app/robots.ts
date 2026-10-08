import type { MetadataRoute } from 'next'
import { PROFILE } from '@/content/profile'

// AI-first: every crawler, AI agents included, is welcome to read everything.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          '*',
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot'
        ],
        allow: '/'
      }
    ],
    sitemap: new URL('/sitemap.xml', PROFILE.url).toString()
  }
}
