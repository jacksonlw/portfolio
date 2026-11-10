import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { Home } from '@/components/site/home'
import { PROJECTS, getProject, storyPath } from '@/content/profile'
import { storyJsonLd } from '@/lib/machine'

// A Story's own address: the constellation with that Story open (docs/adr/0001).
export const dynamicParams = false

export function generateStaticParams() {
  return PROJECTS.map((b) => ({ slug: b.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = getProject((await params).slug)
  if (!b) return {}
  return {
    title: b.title,
    description: b.summary,
    alternates: {
      canonical: storyPath(b.slug),
      types: { 'text/markdown': `${storyPath(b.slug)}.md` }
    },
    openGraph: {
      title: b.title,
      description: b.summary,
      url: storyPath(b.slug)
    }
  }
}

export default async function Page({ params }: Props) {
  const b = getProject((await params).slug)
  if (!b) notFound()
  return (
    <>
      <JsonLd data={storyJsonLd(b)} />
      <Home story={b.slug} />
    </>
  )
}
