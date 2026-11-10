import { PROJECTS, getProject } from '@/content/profile'
import { bubbleMarkdown } from '@/lib/machine'

// Served at /projects/<slug>.md through a rewrite in next.config.ts.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return PROJECTS.map((b) => ({ slug: b.slug }))
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const b = getProject((await params).slug)
  if (!b) return new Response('Not found', { status: 404 })
  return new Response(bubbleMarkdown(b), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
