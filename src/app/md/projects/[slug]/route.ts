import { PROJECTS, getProject } from '@/content/profile'
import { projectMarkdown } from '@/lib/machine'

// Served at /projects/<slug>.md through a rewrite in next.config.ts.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }))
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug)
  if (!project) return new Response('Not found', { status: 404 })
  return new Response(projectMarkdown(project), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
