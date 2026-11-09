import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Illustration,
  hasIllustration
} from '@/components/illustrations/registry'
import { JsonLd } from '@/components/json-ld'
import { CtaLink } from '@/components/site/cta-link'
import { ProjectMedia } from '@/components/site/project-media'
import { Container } from '@/components/site/section'
import {
  PROJECT_PAGES_ENABLED,
  PROJECTS,
  formatDates,
  getProject,
  type Project
} from '@/content/profile'
import { TINT_BG, TINT_CHIP } from '@/lib/accent'
import { cn } from '@/lib/cn'
import { projectJsonLd, projectPath, statusLabel } from '@/lib/machine'
import { EYEBROW, SURFACE, SURFACE_HOVER } from '@/lib/surface'

export const dynamicParams = false

// Switched off for now (PROJECT_PAGES_ENABLED): no pages are built and every slug 404s.
export function generateStaticParams() {
  return PROJECT_PAGES_ENABLED ? PROJECTS.map((p) => ({ slug: p.slug })) : []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug)
  if (!p) return {}
  return {
    title: p.title,
    description: p.summary,
    alternates: {
      canonical: projectPath(p.slug),
      types: { 'text/markdown': `${projectPath(p.slug)}.md` }
    }
  }
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project || !PROJECT_PAGES_ENABLED) notFound()
  const i = PROJECTS.indexOf(project)
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length]
  const next = PROJECTS[(i + 1) % PROJECTS.length]

  return (
    <article>
      <JsonLd data={projectJsonLd(project)} />

      <header className="border-b border-border bg-card py-14 sm:py-20">
        <Container>
          <Link
            href="/#skills"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground focus-ring transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon weight="bold" aria-hidden className="size-4" />
            All projects
          </Link>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl min-w-0">
              <h1 className="text-headline text-balance sm:text-display">
                {project.title}
              </h1>
              <p className="mt-5 text-lg text-pretty text-muted-foreground sm:text-lede">
                {project.summary}
              </p>
            </div>
            {project.links.length > 0 && (
              <div className="flex shrink-0 flex-wrap gap-3">
                {project.links.map((l, n) => (
                  <CtaLink
                    key={l.href}
                    href={l.href}
                    variant={n === 0 ? 'primary' : 'secondary'}
                    arrow
                  >
                    {l.label}
                  </CtaLink>
                ))}
              </div>
            )}
          </div>
          <ProjectMedia
            project={project}
            className="mt-12 aspect-[4/3] rounded-xl sm:aspect-[16/9] lg:aspect-[21/9]"
            artClassName="w-[64%] sm:w-[40%] lg:w-[30%]"
          />
        </Container>
      </header>

      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="min-w-0 space-y-16">
          {project.image && (
            <figure
              className={cn(
                'flex items-center justify-center overflow-hidden rounded-xl px-6 py-10 sm:py-14',
                TINT_BG[project.accent]
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={`${project.title} screenshot`}
                className={
                  project.imageKind === 'mobile'
                    ? 'h-auto w-full max-w-md'
                    : 'h-auto w-full max-w-3xl'
                }
              />
            </figure>
          )}
          {project.story.length > 0 ? (
            <div className="space-y-16">
              {project.story.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  aria-labelledby={`${s.id}-heading`}
                >
                  <h2 id={`${s.id}-heading`} className="text-title">
                    {s.heading}
                  </h2>
                  <div className="mt-5 max-w-prose space-y-4 text-lg text-pretty text-foreground/90">
                    {s.paragraphs.map((para, n) => (
                      <p key={n}>{para}</p>
                    ))}
                  </div>
                  {hasIllustration(s.illustration) && (
                    <figure className="mt-10">
                      <Illustration
                        name={s.illustration!}
                        className="h-auto w-full max-w-2xl"
                      />
                    </figure>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <p className="text-lg text-muted-foreground">
              The full write-up for this project is coming soon.
            </p>
          )}
        </div>

        <aside
          aria-label="Project facts"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <Facts project={project} />
        </aside>
      </Container>

      <nav
        aria-label="More projects"
        className="border-t border-border bg-card py-12 sm:py-16"
      >
        <Container className="grid gap-4 sm:grid-cols-2">
          <PagerLink project={prev} direction="prev" />
          <PagerLink project={next} direction="next" />
        </Container>
      </nav>
    </article>
  )
}

/** The facts box: one flat card, rows separated by space, empty facts left out. */
function Facts({ project: p }: { project: Project }) {
  const rows: { label: string; value: React.ReactNode }[] = []
  if (p.role) rows.push({ label: 'Role', value: p.role })
  if (p.dates) rows.push({ label: 'Dates', value: formatDates(p.dates) })
  if (p.status) rows.push({ label: 'Status', value: statusLabel(p.status) })
  if (p.stack.length > 0)
    rows.push({
      label: 'Stack',
      value: (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <li
              key={s}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                TINT_CHIP[p.accent]
              )}
            >
              {s}
            </li>
          ))}
        </ul>
      )
    })
  if (p.highlights.length > 0)
    rows.push({
      label: 'Highlights',
      value: (
        <ul className="mt-1 list-disc space-y-1.5 pl-4 marker:text-muted-foreground">
          {p.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )
    })

  return (
    <dl className={cn(SURFACE, 'space-y-5 p-5 text-sm sm:p-6')}>
      {rows.map((r) => (
        <div key={r.label}>
          <dt className={EYEBROW}>{r.label}</dt>
          <dd className="mt-1 text-pretty">{r.value}</dd>
        </div>
      ))}
      <div>
        <dt className={EYEBROW}>For agents</dt>
        <dd className="mt-1">
          <a
            href={`${projectPath(p.slug)}.md`}
            className="rounded-sm font-mono text-xs text-link underline-offset-4 focus-ring hover:underline"
          >
            {projectPath(p.slug)}.md
          </a>
        </dd>
      </div>
    </dl>
  )
}

function PagerLink({
  project,
  direction
}: {
  project: Project
  direction: 'prev' | 'next'
}) {
  const Icon = direction === 'prev' ? ArrowLeftIcon : ArrowRightIcon
  return (
    <Link
      href={projectPath(project.slug)}
      className={cn(
        SURFACE,
        SURFACE_HOVER,
        'group flex items-center gap-4 p-5 focus-ring',
        direction === 'next' && 'flex-row-reverse text-right'
      )}
    >
      <Icon
        weight="bold"
        aria-hidden
        className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-link"
      />
      <div className="min-w-0">
        <p className={EYEBROW}>{direction === 'prev' ? 'Previous' : 'Next'}</p>
        <p className="mt-0.5 truncate font-semibold transition-colors group-hover:text-link">
          {project.title}
        </p>
      </div>
    </Link>
  )
}
