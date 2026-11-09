import { notFound } from 'next/navigation'
import { ILLUSTRATIONS } from '@/components/illustrations/registry'
import { PROJECTS } from '@/content/profile'
import { TINT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'

// A contact sheet of every illustration, for drawing and review. Development only.
export const metadata = { robots: { index: false } }

export default function IllustrationGallery() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(ILLUSTRATIONS).map(([key, { component: Art }]) => {
          const accent = PROJECTS.find((p) => p.slug === key)?.accent ?? 'sky'
          return (
            <figure key={key} className={cn('rounded-md p-4', TINT_BG[accent])}>
              <Art />
              <figcaption className="mt-2 font-mono text-xs">{key}</figcaption>
            </figure>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(ILLUSTRATIONS).map(([key, { component: Art }]) => (
          <figure
            key={key}
            className="dark rounded-md bg-background p-4 text-foreground"
          >
            <Art surface="ink" />
          </figure>
        ))}
      </div>
      <div className="grid grid-cols-4 items-end gap-4">
        {Object.entries(ILLUSTRATIONS)
          .slice(0, 4)
          .map(([key, { component: Art }]) => (
            <Art key={key} size={56} />
          ))}
      </div>
    </div>
  )
}
