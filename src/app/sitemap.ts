import type { MetadataRoute } from 'next'
import { PROFILE, PROJECTS, WORK, storyPath } from '@/content/profile'

export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (path: string) => new URL(path, PROFILE.url).toString()
  const lastModified = new Date()
  return [
    { url: abs('/'), lastModified, priority: 1 },
    ...[...PROJECTS, ...WORK].map((p) => ({
      url: abs(storyPath(p.slug)),
      lastModified,
      priority: 0.8
    })),
    { url: abs('/llms.txt'), lastModified, priority: 0.5 },
    { url: abs(PROFILE.resume), lastModified, priority: 0.6 },
    { url: abs('/llms-full.txt'), priority: 0.5 },
    { url: abs('/profile.json'), priority: 0.5 }
  ]
}
