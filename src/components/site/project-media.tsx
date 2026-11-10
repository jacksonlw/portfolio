import type { Project } from '@/content/profile'
import { Illustration } from '@/components/illustrations/registry'
import { TINT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'

/** A project's panel in its pastel accent: its illustration. */
export function ProjectMedia({
  project,
  className,
  artClassName
}: {
  project: Project
  className?: string
  artClassName?: string
}) {
  return (
    <div
      className={cn(
        'flex aspect-video items-center justify-center overflow-hidden rounded-md',
        TINT_BG[project.accent],
        className
      )}
    >
      <Illustration
        name={project.slug}
        className={cn('h-auto w-[24%]', artClassName)}
      />
    </div>
  )
}
