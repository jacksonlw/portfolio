'use client'

import Link from 'next/link'
import { useMemo, useState, type CSSProperties } from 'react'
import { Illustration } from '@/components/illustrations/registry'
import type { Accent, Project, Skill } from '@/content/profile'
import { TINT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'

/*
 * The skills constellation, filling the screen. The projects sit in the middle as bubbles; the
 * skill areas flank them, each a cluster of skills around its illustration. Hover (or focus, or
 * tap) a skill and lines run to the projects it was used in; hover a project and lines run to
 * every skill it used. A dark ink popover beside the pointer explains what's under it.
 *
 * Positions are percentages of the board, so it stretches to any screen; the lines are drawn in
 * a 100×100 SVG with non-scaling strokes. Below `xl` the same content is a list of projects and
 * grouped chips, with the explanation in an ink card. Every node is a real link or button.
 */

type AreaDef = { key: string; accent: Accent; hub: [number, number] }

const AREAS: Record<Skill['area'], AreaDef> = {
  'AI & agents': { key: 'area/ai', accent: 'sky', hub: [15, 19] },
  Languages: { key: 'area/languages', accent: 'lavender', hub: [15, 50] },
  'Frontend & mobile': { key: 'area/frontend', accent: 'mint', hub: [15, 81] },
  'Backend & data': { key: 'area/backend', accent: 'sun', hub: [85, 19] },
  'Cloud & tools': { key: 'area/cloud', accent: 'sky', hub: [85, 50] },
  'How I work': { key: 'area/work', accent: 'lavender', hub: [85, 81] }
}

/** The projects' places in the middle: two columns, three rows. */
const PROJECT_SLOTS: [number, number][] = [
  [41, 19],
  [59, 19],
  [41, 50],
  [59, 50],
  [41, 81],
  [59, 81]
]

const DOT: Record<Accent, string> = {
  sky: 'bg-illo-sky',
  mint: 'bg-illo-mint',
  sun: 'bg-illo-sun',
  lavender: 'bg-illo-lavender'
}

type Star = Skill & { x: number; y: number; i: number }
type ProjectNode = Project & { x: number; y: number }
type Active = { kind: 'skill' | 'project'; id: string } | null

/**
 * Each area's skills on a ring around its hub, starting at the top. Big clusters alternate an
 * outer and an inner ring so neighbouring labels don't collide.
 */
function layoutStars(skills: Skill[]): Star[] {
  const byArea = new Map<Skill['area'], Skill[]>()
  for (const s of skills) byArea.set(s.area, [...(byArea.get(s.area) ?? []), s])
  const stars: Star[] = []
  let i = 0
  for (const [area, list] of byArea) {
    const [cx, cy] = AREAS[area].hub
    const big = list.length > 6
    list.forEach((s, k) => {
      // With an odd count the last star would sit on the outer ring beside the first: keep it in.
      const outer = k % 2 === 0 && !(list.length % 2 === 1 && k === list.length - 1)
      const [rx, ry] = big ? (outer ? [11, 12.5] : [7.5, 8.5]) : [9.5, 10.5]
      const a = -Math.PI / 2 + (k / list.length) * Math.PI * 2
      stars.push({ ...s, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), i: i++ })
    })
  }
  return stars
}

const pos = (x: number, y: number): CSSProperties => ({ left: `${x}%`, top: `${y}%` })

export function SkillsConstellation({ skills, projects }: { skills: Skill[]; projects: Project[] }) {
  const stars = useMemo(() => layoutStars(skills), [skills])
  const nodes: ProjectNode[] = useMemo(
    () => projects.map((p, k) => ({ ...p, x: PROJECT_SLOTS[k][0], y: PROJECT_SLOTS[k][1] })),
    [projects]
  )
  const [active, setActive] = useState<Active>(null)

  // What the active node connects to: a skill's projects, or a project's skills.
  const linked = useMemo(() => {
    if (!active) return { skills: new Set<string>(), projects: new Set<string>() }
    if (active.kind === 'skill') {
      const s = stars.find((x) => x.name === active.id)
      return { skills: new Set<string>(), projects: new Set(s?.projects ?? []) }
    }
    return {
      skills: new Set(stars.filter((s) => s.projects.includes(active.id)).map((s) => s.name)),
      projects: new Set<string>()
    }
  }, [active, stars])

  const activeStar = active?.kind === 'skill' ? stars.find((s) => s.name === active.id) : undefined
  const activeProject = active?.kind === 'project' ? nodes.find((p) => p.slug === active.id) : undefined
  const anchor = activeStar ?? activeProject

  const on = (a: NonNullable<Active>) => ({
    onMouseEnter: () => setActive(a),
    onFocus: () => setActive(a)
  })

  const links: { from: [number, number]; to: [number, number]; key: string }[] = []
  if (activeStar) {
    for (const p of nodes.filter((n) => linked.projects.has(n.slug)))
      links.push({ from: [activeStar.x, activeStar.y], to: [p.x, p.y], key: p.slug })
  }
  if (activeProject) {
    for (const s of stars.filter((x) => linked.skills.has(x.name)))
      links.push({ from: [activeProject.x, activeProject.y], to: [s.x, s.y], key: s.name })
  }

  return (
    <>
      {/* The board, from xl up. */}
      <div
        className="relative hidden h-[calc(100svh-6rem)] min-h-[46rem] w-full xl:block"
        onMouseLeave={() => setActive(null)}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden
          focusable="false"
        >
          {stars.map((s) => {
            const [hx, hy] = AREAS[s.area].hub
            return (
              <line
                key={s.name}
                x1={hx}
                y1={hy}
                x2={s.x}
                y2={s.y}
                vectorEffect="non-scaling-stroke"
                className="stroke-foreground/12"
                strokeWidth={1.5}
              />
            )
          })}
          {links.map((l) => (
            <line
              key={`${active?.id}-${l.key}`}
              x1={l.from[0]}
              y1={l.from[1]}
              x2={l.to[0]}
              y2={l.to[1]}
              vectorEffect="non-scaling-stroke"
              className="constellation-link stroke-brand"
              strokeWidth={2}
            />
          ))}
        </svg>

        {/* Area hubs: the area's illustration over its name. */}
        {Object.entries(AREAS).map(([area, { key, accent, hub }]) => (
          <div
            key={area}
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={pos(hub[0], hub[1])}
          >
            <Illustration name={key} className="w-20" decorative />
            <span
              className={cn(
                '-mt-1 rounded-full border border-foreground/80 px-3 py-0.5 text-sm font-semibold whitespace-nowrap',
                TINT_BG[accent]
              )}
            >
              {area}
            </span>
          </div>
        ))}

        {/* Projects in the middle. */}
        {nodes.map((p) => {
          const isActive = activeProject?.slug === p.slug
          const isLinked = linked.projects.has(p.slug)
          const dim = active && !isActive && !isLinked
          return (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              {...on({ kind: 'project', id: p.slug })}
              className={cn(
                'constellation-star group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl p-2 transition-opacity duration-200 focus-ring',
                dim && 'opacity-35'
              )}
              style={pos(p.x, p.y)}
            >
              <span
                className={cn(
                  'flex size-28 items-center justify-center rounded-full border-2 transition-[border-color,scale] duration-200 group-hover:scale-105',
                  TINT_BG[p.accent],
                  isActive || isLinked ? 'scale-105 border-brand' : 'border-foreground/80'
                )}
              >
                <Illustration name={p.slug} className="w-20" decorative />
              </span>
              <span
                className={cn(
                  'mt-2 text-sm font-semibold whitespace-nowrap',
                  (isActive || isLinked) && 'text-link'
                )}
              >
                {p.title}
              </span>
            </Link>
          )
        })}

        {/* Skills. */}
        {stars.map((s) => {
          const isActive = activeStar?.name === s.name
          const isLinked = linked.skills.has(s.name)
          const dim = active && !isActive && !isLinked
          return (
            <button
              key={s.name}
              type="button"
              {...on({ kind: 'skill', id: s.name })}
              onClick={() => setActive({ kind: 'skill', id: s.name })}
              aria-pressed={isActive}
              className={cn(
                'constellation-star group absolute flex -translate-x-1/2 flex-col items-center gap-1 rounded-md px-1.5 py-1 transition-opacity duration-200 focus-ring',
                dim && 'opacity-35'
              )}
              style={{ left: `${s.x}%`, top: `calc(${s.y}% - 0.6rem)`, '--i': s.i } as CSSProperties}
            >
              <span
                className={cn(
                  'size-3 rounded-full border-2 border-foreground transition-[scale,background-color] duration-200 group-hover:scale-125',
                  isActive || isLinked ? 'scale-150 border-brand bg-brand' : DOT[AREAS[s.area].accent]
                )}
              />
              <span
                className={cn(
                  'text-[13px] leading-tight font-medium whitespace-nowrap',
                  isActive || isLinked
                    ? 'font-semibold text-link'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {s.name}
              </span>
            </button>
          )
        })}

        {/* The ink popover beside whatever is active. */}
        {anchor && (
          <div
            role="tooltip"
            className={cn(
              'dark pointer-events-none absolute z-20 w-80 rounded-lg bg-background p-4 text-foreground shadow-pop',
              anchor.y > 60 && '-translate-y-full',
              anchor.x > 50 && '-translate-x-full'
            )}
            style={{
              left: `calc(${anchor.x}% ${anchor.x > 50 ? '- 1.5rem' : '+ 1.5rem'})`,
              top: `calc(${anchor.y}% ${anchor.y > 60 ? '- 0.5rem' : '+ 0.5rem'})`
            }}
          >
            <Explain star={activeStar} project={activeProject} nodes={nodes} stars={stars} />
          </div>
        )}
      </div>

      {/* Below xl: projects and grouped chips, with the explanation in an ink card. */}
      <MobileSkills stars={stars} nodes={nodes} active={active} setActive={setActive} />
    </>
  )
}

/** The popover's content: a skill and the projects it was used in, or a project and its skills. */
function Explain({
  star,
  project,
  nodes,
  stars
}: {
  star?: Star
  project?: ProjectNode
  nodes: ProjectNode[]
  stars: Star[]
}) {
  if (star) {
    const used = nodes.filter((p) => star.projects.includes(p.slug))
    return (
      <>
        <p className="text-xs font-medium text-muted-foreground">{star.area}</p>
        <p className="mt-0.5 text-lg font-semibold">{star.name}</p>
        <p className="mt-2 text-sm text-pretty text-foreground/85">{star.explanation}</p>
        {used.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Used in{' '}
            <span className="font-semibold text-foreground">{used.map((p) => p.title).join(', ')}</span>
          </p>
        )}
      </>
    )
  }
  if (project) {
    const used = stars.filter((s) => s.projects.includes(project.slug))
    return (
      <>
        <p className="text-xs font-medium text-muted-foreground">Project</p>
        <p className="mt-0.5 text-lg font-semibold">{project.title}</p>
        <p className="mt-2 text-sm text-pretty text-foreground/85">{project.summary}</p>
        {used.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Built with{' '}
            <span className="font-semibold text-foreground">{used.map((s) => s.name).join(', ')}</span>
          </p>
        )}
      </>
    )
  }
  return null
}

function MobileSkills({
  stars,
  nodes,
  active,
  setActive
}: {
  stars: Star[]
  nodes: ProjectNode[]
  active: Active
  setActive: (a: Active) => void
}) {
  const star = active?.kind === 'skill' ? stars.find((s) => s.name === active.id) : undefined
  const project = active?.kind === 'project' ? nodes.find((p) => p.slug === active.id) : undefined
  const linkedProjects = new Set(star?.projects ?? [])
  const linkedSkills = new Set(
    project ? stars.filter((s) => s.projects.includes(project.slug)).map((s) => s.name) : []
  )

  const chip = (selected: boolean, linked: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-ring',
      selected
        ? 'border-brand bg-brand text-brand-foreground'
        : linked
          ? 'border-brand text-link'
          : 'border-border bg-card'
    )

  return (
    <div className="space-y-8 xl:hidden">
      <div className="dark min-h-32 max-w-xl rounded-lg bg-background p-5 text-foreground" aria-live="polite">
        {star || project ? (
          <Explain star={star} project={project} nodes={nodes} stars={stars} />
        ) : (
          <p className="text-sm text-muted-foreground">Tap a project or a skill to see how they connect.</p>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold">Projects</h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {nodes.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => setActive({ kind: 'project', id: p.slug })}
                aria-pressed={project?.slug === p.slug}
                className={chip(project?.slug === p.slug, linkedProjects.has(p.slug))}
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {Object.entries(AREAS).map(([area, { accent }]) => (
        <div key={area}>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className={cn('size-2.5 rounded-full border-2 border-foreground', DOT[accent])} aria-hidden />
            {area}
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {stars
              .filter((s) => s.area === area)
              .map((s) => (
                <li key={s.name}>
                  <button
                    type="button"
                    onClick={() => setActive({ kind: 'skill', id: s.name })}
                    aria-pressed={star?.name === s.name}
                    className={chip(star?.name === s.name, linkedSkills.has(s.name))}
                  >
                    {s.name}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
