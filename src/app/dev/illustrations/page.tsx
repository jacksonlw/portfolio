import { notFound } from 'next/navigation'
import { ILLUSTRATIONS } from '@/components/illustrations/registry'
import { AgentsSketch, AnyFormSketch, OracleSketch } from '@/components/illustrations/sketch/pilot'
import { PROJECTS } from '@/content/profile'
import { TINT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'

// A contact sheet of every illustration, for drawing and review. Development only.
export const metadata = { robots: { index: false } }

export default function IllustrationGallery() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      {/* The sketch-style pilot: old beside new, large and at bubble sizes. */}
      <section id="pilot" className="space-y-6">
        <h2 className="text-title">Sketch pilot</h2>
        {(
          [
            ['oracle', OracleSketch, 'bg-illo-rose-tint'],
            ['anyform', AnyFormSketch, 'bg-illo-sky-tint'],
            ['area/ai', AgentsSketch, 'bg-illo-sky-tint']
          ] as const
        ).map(([key, Sketch, tint]) => {
          const Old = ILLUSTRATIONS[key].component
          return (
            <div key={key} className="flex flex-wrap items-end gap-6">
              <div className="w-56">
                <Old />
                <p className="mt-1 font-mono text-xs">{key} (current)</p>
              </div>
              <div className="w-96">
                <Sketch />
                <p className="mt-1 font-mono text-xs">{key} (sketch)</p>
              </div>
              {[112, 96, 72].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <span className={`flex items-center justify-center rounded-full border-2 border-foreground/80 ${tint}`} style={{ width: s + 24, height: s + 24 }}>
                    <Sketch size={s} />
                  </span>
                  <span className="font-mono text-xs">{s}px</span>
                </div>
              ))}
              <div className="dark w-40 rounded-md bg-background p-3">
                <Sketch />
              </div>
            </div>
          )
        })}
      </section>

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
          <figure key={key} className="dark rounded-md bg-background p-4 text-foreground">
            <Art surface="ink" />
          </figure>
        ))}
      </div>
      <div className="grid grid-cols-4 items-end gap-4">
        {Object.entries(ILLUSTRATIONS).slice(0, 4).map(([key, { component: Art }]) => (
          <Art key={key} size={56} />
        ))}
      </div>
    </div>
  )
}
