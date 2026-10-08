/* eslint-disable @next/next/no-img-element */
import type { Project } from '@/content/profile'
import { Illustration, hasIllustration } from '@/components/illustrations/registry'
import { cn } from '@/lib/cn'
import { INSET } from '@/lib/surface'

/**
 * A project's visual on a quiet inset: its illustration once drawn, else its screenshot, else its
 * name set large and muted.
 */
export function ProjectMedia({ project, className }: { project: Project; className?: string }) {
  const { slug, title, image, imageKind } = project
  return (
    <div className={cn(INSET, 'flex aspect-video items-center justify-center overflow-hidden', className)}>
      {hasIllustration(slug) ? (
        <Illustration name={slug} className="h-5/6 w-auto" />
      ) : image ? (
        <img src={image} alt="" className={imageKind === 'mobile' ? 'ml-[-5%] h-4/6' : 'h-5/6'} />
      ) : (
        <span className="text-title text-muted-foreground/60" aria-hidden>
          {title}
        </span>
      )}
    </div>
  )
}
