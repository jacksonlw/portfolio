import type { Project } from '@/content/profile'
import {
  Illustration,
  hasIllustration
} from '@/components/illustrations/registry'
import { TINT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'

/**
 * A project's art on a panel in its pastel accent: its badge once drawn, else its name set large.
 * `size` is the badge's rendered width (it sets the outline weight for small renders).
 */
export function ProjectMedia({
  project,
  className,
  artClassName,
  size
}: {
  project: Project
  className?: string
  artClassName?: string
  size?: number
}) {
  return (
    <div
      className={cn(
        'flex aspect-video items-center justify-center overflow-hidden rounded-md',
        TINT_BG[project.accent],
        className
      )}
    >
      {hasIllustration(project.slug) ? (
        <Illustration
          name={project.slug}
          size={size}
          className={cn('h-auto w-[44%]', artClassName)}
        />
      ) : (
        <span className="text-title text-foreground/40" aria-hidden>
          {project.title}
        </span>
      )}
    </div>
  )
}
