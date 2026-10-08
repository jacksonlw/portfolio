import Link from 'next/link'
import type { Project } from '@/content/profile'
import { projectPath } from '@/lib/machine'
import { ProjectMedia } from './project-media'

/** A project on the home grid: its art on a tinted panel, then the title and summary. No frame. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={projectPath(project.slug)} className="group block rounded-md focus-ring">
      <ProjectMedia
        project={project}
        className="transition-[filter] duration-200 group-hover:brightness-[0.97]"
        artClassName="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
      />
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] transition-colors group-hover:text-link">
        {project.title}
      </h3>
      <p className="mt-1 text-pretty text-muted-foreground">{project.summary}</p>
    </Link>
  )
}
