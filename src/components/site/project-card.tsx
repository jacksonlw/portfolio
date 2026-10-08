import Link from 'next/link'
import type { Project } from '@/content/profile'
import { projectPath } from '@/lib/machine'
import { cn } from '@/lib/cn'
import { SURFACE, SURFACE_HOVER } from '@/lib/surface'
import { ProjectMedia } from './project-media'

/** A project on the home grid: a flat card linking to the project's page. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={projectPath(project.slug)}
      className={cn(SURFACE, SURFACE_HOVER, 'group block p-5 focus-ring sm:p-6')}
    >
      <ProjectMedia project={project} />
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] transition-colors group-hover:text-link">
        {project.title}
      </h3>
      <p className="mt-1 text-pretty text-muted-foreground">{project.summary}</p>
    </Link>
  )
}
