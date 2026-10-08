/* eslint-disable @next/next/no-img-element */
import type { Project } from '@/content/profile'
import { cn } from '@/lib/cn'
import { INSET, SURFACE, SURFACE_HOVER } from '@/lib/surface'

/**
 * A project on the home grid: a flat card with the project's image (an illustration once it
 * lands) on a quiet inset, then the title and summary. Links out until project pages exist.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { title, summary, url, image, imageKind } = project
  const body = (
    <>
      <div className={cn(INSET, 'flex aspect-video items-center justify-center overflow-hidden')}>
        {image ? (
          <img
            src={image}
            alt=""
            className={imageKind === 'mobile' ? 'ml-[-5%] h-4/6' : 'h-5/6'}
          />
        ) : (
          <span className="text-title text-muted-foreground/60" aria-hidden>
            {title}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] transition-colors group-hover:text-link">
        {title}
      </h3>
      <p className="mt-1 text-pretty text-muted-foreground">{summary}</p>
    </>
  )
  const frame = cn(SURFACE, 'group block p-5 sm:p-6')
  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(frame, SURFACE_HOVER, 'focus-ring')}
    >
      {body}
    </a>
  ) : (
    <article className={frame}>{body}</article>
  )
}
