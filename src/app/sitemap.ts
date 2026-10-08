import type { MetadataRoute } from 'next'
import { PROFILE, PROJECTS } from '@/content/profile'
import { projectPath } from '@/lib/machine'

export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (path: string) => new URL(path, PROFILE.url).toString()
  return [
    { url: abs('/'), priority: 1 },
    ...PROJECTS.map((p) => ({ url: abs(projectPath(p.slug)), priority: 0.8 })),
    { url: abs('/llms.txt'), priority: 0.5 },
    { url: abs('/llms-full.txt'), priority: 0.5 },
    { url: abs('/profile.json'), priority: 0.5 }
  ]
}
