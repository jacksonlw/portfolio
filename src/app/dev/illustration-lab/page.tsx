import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Lab } from './lab'

// Development only: the live site 404s here, and search engines are told to skip it.
export const metadata: Metadata = {
  title: 'Illustration lab',
  robots: { index: false, follow: false }
}

export default function IllustrationLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <Lab />
}
