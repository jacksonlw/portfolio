'use client'

import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react'
import { Illustration } from '@/components/illustrations/registry'
import type { Accent, Project, Skill, WorkNode } from '@/content/profile'
import { TINT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'

/*
 * The skills constellation, filling the screen. Work and projects float in the middle as bubbles,
 * sized by how much they matter and scattered rather than gridded; the skill areas flank them,
 * each a cluster of skills around its illustration. Hover (or focus, or tap) a skill and lines run
 * to where it was used; hover a job or a project and lines run to every skill it used. A dark ink
 * popover explains whatever is active.
 *
 * It moves: every node drifts on its own slow cycle, the layers shift with the pointer (bubbles
 * most, skills least) for depth, linked nodes lean toward the active one, and active links flow.
 * One requestAnimationFrame loop (useConstellationMotion) writes transforms and line ends straight
 * to the DOM, so React doesn't re-render per frame. Under reduced motion it all holds still.
 *
 * Positions are percentages of the board; lines are drawn in a pixel-space SVG sized to it.
 * Below `xl` the same content is a list of work, projects and grouped chips, with the
 * explanation in an ink card. Every node is a real link or button.
 */

type AreaDef = { key: string; accent: Accent; hub: [number, number] }

const AREAS: Record<Skill['area'], AreaDef> = {
  'AI & agents': { key: 'area/ai', accent: 'sky', hub: [14, 17] },
  Languages: { key: 'area/languages', accent: 'lavender', hub: [14, 50] },
  'Frontend & mobile': { key: 'area/frontend', accent: 'mint', hub: [14, 83] },
  'Backend & data': { key: 'area/backend', accent: 'sun', hub: [86, 17] },
  'Cloud & tools': { key: 'area/cloud', accent: 'sky', hub: [86, 50] },
  'How I work': { key: 'area/work', accent: 'lavender', hub: [86, 83] }
}

type BubbleSize = 'xl' | 'lg' | 'md' | 'sm'

/**
 * Where each bubble floats and how big it is: size follows importance (Jackson's current work
 * largest, older projects smallest). Hand-placed so the middle reads as a loose cluster.
 */
const BUBBLES: Record<string, { x: number; y: number; size: BubbleSize }> = {
  oracle: { x: 50, y: 33, size: 'xl' },
  anyform: { x: 36, y: 20, size: 'lg' },
  cratest: { x: 63, y: 16, size: 'lg' },
  trailblaze: { x: 39, y: 60, size: 'lg' },
  careerfoundry: { x: 64, y: 48, size: 'md' },
  koistream: { x: 59, y: 75, size: 'md' },
  tedx: { x: 35, y: 85, size: 'sm' },
  branch: { x: 66, y: 87, size: 'sm' }
}

const BUBBLE_STYLE: Record<
  BubbleSize,
  { disc: string; art: string; label: string; depth: number }
> = {
  xl: { disc: 'size-36', art: 'w-28', label: 'text-base', depth: 18 },
  lg: { disc: 'size-[7.5rem]', art: 'w-24', label: 'text-sm', depth: 14 },
  md: { disc: 'size-24', art: 'w-[4.5rem]', label: 'text-sm', depth: 11 },
  sm: { disc: 'size-20', art: 'w-14', label: 'text-xs', depth: 8 }
}

const DOT: Record<Accent, string> = {
  sky: 'bg-illo-sky',
  mint: 'bg-illo-mint',
  sun: 'bg-illo-sun',
  lavender: 'bg-illo-lavender'
}

type Star = Skill & { x: number; y: number; i: number; above: boolean }
type ProjectNode = (Project | WorkNode) & {
  x: number
  y: number
  kind: 'project' | 'work'
  size: BubbleSize
}
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
      const outer =
        k % 2 === 0 && !(list.length % 2 === 1 && k === list.length - 1)
      const [rx, ry] = big ? (outer ? [9.5, 12.5] : [6, 8.5]) : [8.5, 11]
      const a = -Math.PI / 2 + (k / list.length) * Math.PI * 2
      const sin = Math.sin(a)
      stars.push({
        ...s,
        x: cx + rx * Math.cos(a),
        y: cy + ry * sin,
        i: i++,
        above: sin < -0.05
      })
    })
  }
  return stars
}

const pos = (x: number, y: number): CSSProperties => ({
  left: `${x}%`,
  top: `${y}%`
})

/* ---------- motion ---------- */

/** A node the motion loop moves: its base position (% of the board), drift and parallax depth. */
type MotionNode = { x: number; y: number; amp: number; depth: number }

/** A stable 0–1 number from a string, so every node gets its own phase and period. */
function hash(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++)
    h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10000) / 10000
}

/**
 * The constellation's motion. Elements opt in with `data-node="<id>"` (moved by a transform) and
 * lines with `data-a`/`data-b` (their ends follow those nodes). `active` and `linked` drive the
 * lean: linked nodes ease a few pixels toward the active one. Returns the board's pixel size,
 * which the SVG needs to draw lines before the loop starts (and when motion is off).
 */
function useConstellationMotion(
  board: React.RefObject<HTMLDivElement | null>,
  nodes: Record<string, MotionNode>,
  active: string | null,
  linked: Set<string>
) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const state = useRef({ nodes, active, linked })
  useLayoutEffect(() => {
    state.current = { nodes, active, linked }
  }, [nodes, active, linked])

  useLayoutEffect(() => {
    const el = board.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [board])

  useEffect(() => {
    const el = board.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return

    const target = { x: 0, y: 0 }
    const pointer = { x: 0, y: 0 }
    const lean = new Map<string, { x: number; y: number }>()
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    let raf = 0
    const tick = (now: number) => {
      const { nodes, active, linked } = state.current
      const w = el.clientWidth
      const h = el.clientHeight
      const t = now / 1000
      pointer.x += (target.x - pointer.x) * 0.06
      pointer.y += (target.y - pointer.y) * 0.06
      const a = active ? nodes[active] : undefined

      const offset: Record<string, { x: number; y: number }> = {}
      for (const id in nodes) {
        const n = nodes[id]
        const r = hash(id)
        const period = 7 + r * 5
        const phase = r * Math.PI * 2
        // Drift on two out-of-step sines, so the path never looks like a simple bob.
        let x = Math.sin((t / period) * Math.PI * 2 + phase) * n.amp
        let y = Math.cos((t / (period * 1.3)) * Math.PI * 2 + phase) * n.amp
        x += pointer.x * n.depth
        y += pointer.y * n.depth
        // Lean toward the active node, eased in and out.
        const l = lean.get(id) ?? { x: 0, y: 0 }
        let lx = 0
        let ly = 0
        if (a && linked.has(id)) {
          const dx = ((a.x - n.x) / 100) * w
          const dy = ((a.y - n.y) / 100) * h
          const d = Math.hypot(dx, dy) || 1
          lx = (dx / d) * 10
          ly = (dy / d) * 10
        }
        l.x += (lx - l.x) * 0.08
        l.y += (ly - l.y) * 0.08
        lean.set(id, l)
        offset[id] = { x: x + l.x, y: y + l.y }
      }

      for (const node of el.querySelectorAll<HTMLElement>('[data-node]')) {
        const o = offset[node.dataset.node!]
        if (o)
          node.style.transform = `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, 0)`
      }
      for (const line of el.querySelectorAll<SVGLineElement>('line[data-a]')) {
        const A = nodes[line.dataset.a!]
        const B = nodes[line.dataset.b!]
        const oa = offset[line.dataset.a!]
        const ob = offset[line.dataset.b!]
        if (!A || !B || !oa || !ob) continue
        line.setAttribute('x1', ((A.x / 100) * w + oa.x).toFixed(1))
        line.setAttribute('y1', ((A.y / 100) * h + oa.y).toFixed(1))
        line.setAttribute('x2', ((B.x / 100) * w + ob.x).toFixed(1))
        line.setAttribute('y2', ((B.y / 100) * h + ob.y).toFixed(1))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [board])

  return size
}

/* ---------- the board ---------- */

const hubId = (area: string) => `hub:${area}`
const starId = (name: string) => `skill:${name}`
const bubbleId = (slug: string) => `bubble:${slug}`

export function SkillsConstellation({
  skills,
  projects,
  work
}: {
  skills: Skill[]
  projects: Project[]
  work: WorkNode[]
}) {
  const stars = useMemo(() => layoutStars(skills), [skills])
  const nodes: ProjectNode[] = useMemo(
    () =>
      [
        ...work.map((w) => ({ ...w, kind: 'work' as const })),
        ...projects.map((p) => ({ ...p, kind: 'project' as const }))
      ]
        .filter((n) => BUBBLES[n.slug])
        .map((n) => ({ ...n, ...BUBBLES[n.slug] })),
    [projects, work]
  )
  const [active, setActive] = useState<Active>(null)

  // What the active node connects to: a skill's projects, or a project's skills.
  const linked = useMemo(() => {
    if (!active)
      return { skills: new Set<string>(), projects: new Set<string>() }
    if (active.kind === 'skill') {
      const s = stars.find((x) => x.name === active.id)
      return { skills: new Set<string>(), projects: new Set(s?.projects ?? []) }
    }
    return {
      skills: new Set(
        stars.filter((s) => s.projects.includes(active.id)).map((s) => s.name)
      ),
      projects: new Set<string>()
    }
  }, [active, stars])

  const activeStar =
    active?.kind === 'skill'
      ? stars.find((s) => s.name === active.id)
      : undefined
  const activeProject =
    active?.kind === 'project'
      ? nodes.find((p) => p.slug === active.id)
      : undefined
  const anchor = activeStar ?? activeProject

  // Everything that moves, keyed by its motion id.
  const motionNodes = useMemo(() => {
    const m: Record<string, MotionNode> = {}
    for (const [area, { hub }] of Object.entries(AREAS))
      m[hubId(area)] = { x: hub[0], y: hub[1], amp: 3, depth: 6 }
    for (const s of stars)
      m[starId(s.name)] = { x: s.x, y: s.y, amp: 2.5, depth: 4 }
    for (const n of nodes)
      m[bubbleId(n.slug)] = {
        x: n.x,
        y: n.y,
        amp: 6,
        depth: BUBBLE_STYLE[n.size].depth
      }
    return m
  }, [stars, nodes])

  const activeId = activeStar
    ? starId(activeStar.name)
    : activeProject
      ? bubbleId(activeProject.slug)
      : null
  const linkedIds = useMemo(
    () =>
      new Set([
        ...[...linked.skills].map(starId),
        ...[...linked.projects].map(bubbleId)
      ]),
    [linked]
  )

  const board = useRef<HTMLDivElement>(null)
  const { w, h } = useConstellationMotion(
    board,
    motionNodes,
    activeId,
    linkedIds
  )
  const px = (x: number, y: number) => ({ x: (x / 100) * w, y: (y / 100) * h })

  const on = (a: NonNullable<Active>) => ({
    onMouseEnter: () => setActive(a),
    onFocus: () => setActive(a)
  })

  const links: { a: string; b: string }[] = []
  if (activeId) for (const id of linkedIds) links.push({ a: activeId, b: id })

  return (
    <>
      {/* The board, from xl up. */}
      <div
        ref={board}
        className="relative hidden h-[calc(100svh-4rem)] min-h-[52rem] w-full xl:block"
        onMouseLeave={() => setActive(null)}
      >
        {w > 0 && (
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="pointer-events-none absolute inset-0 size-full"
            aria-hidden
            focusable="false"
          >
            {stars.map((s) => {
              const [hx, hy] = AREAS[s.area].hub
              const A = px(hx, hy)
              const B = px(s.x, s.y)
              return (
                <line
                  key={s.name}
                  data-a={hubId(s.area)}
                  data-b={starId(s.name)}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  className="stroke-foreground/12"
                  strokeWidth={1.5}
                />
              )
            })}
            {links.map((l) => {
              const A = motionNodes[l.a]
              const B = motionNodes[l.b]
              const pa = px(A.x, A.y)
              const pb = px(B.x, B.y)
              return (
                <g key={`${l.a}-${l.b}`}>
                  <line
                    data-a={l.a}
                    data-b={l.b}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    className="stroke-brand/35"
                    strokeWidth={2}
                  />
                  <line
                    data-a={l.a}
                    data-b={l.b}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    className="constellation-flow stroke-brand"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </g>
              )
            })}
          </svg>
        )}

        {/* Area hubs: the area's illustration over its name. */}
        {Object.entries(AREAS).map(([area, { key, accent, hub }]) => (
          <div
            key={area}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={pos(hub[0], hub[1])}
          >
            <div
              data-node={hubId(area)}
              className="flex flex-col items-center will-change-transform"
            >
              <Illustration name={key} className="w-16" decorative />
              <span
                className={cn(
                  '-mt-1 rounded-full border border-foreground/80 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                  TINT_BG[accent]
                )}
              >
                {area}
              </span>
            </div>
          </div>
        ))}

        {/* Work and projects, floating in the middle. */}
        {nodes.map((p) => {
          const isActive = activeProject?.slug === p.slug
          const isLinked = linked.projects.has(p.slug)
          const dim = active && !isActive && !isLinked
          const lit = isActive || isLinked
          const style = BUBBLE_STYLE[p.size]
          const className = cn(
            'constellation-star group flex flex-col items-center rounded-xl p-2 transition-opacity duration-300 focus-ring',
            dim && 'opacity-35'
          )
          const body = (
            <>
              <span
                className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-[border-color,scale,box-shadow] duration-300 group-hover:scale-105',
                  style.disc,
                  TINT_BG[p.accent],
                  lit
                    ? 'scale-105 border-brand shadow-[0_0_0_6px_color-mix(in_oklab,var(--brand)_14%,transparent)]'
                    : 'border-foreground/80'
                )}
              >
                <Illustration name={p.slug} className={style.art} decorative />
              </span>
              <span
                className={cn(
                  'mt-2 font-semibold whitespace-nowrap',
                  style.label,
                  lit && 'text-link'
                )}
              >
                {p.title}
              </span>
              {p.kind === 'work' && (
                <span className="text-xs text-muted-foreground">Work</span>
              )}
            </>
          )
          return (
            <div
              key={p.slug}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={pos(p.x, p.y)}
            >
              <div
                data-node={bubbleId(p.slug)}
                className="will-change-transform"
              >
                {p.kind === 'project' ? (
                  <Link
                    href={`/projects/${p.slug}`}
                    {...on({ kind: 'project', id: p.slug })}
                    className={className}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    {...on({ kind: 'project', id: p.slug })}
                    onClick={() => setActive({ kind: 'project', id: p.slug })}
                    className={className}
                  >
                    {body}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Skills. */}
        {stars.map((s) => {
          const isActive = activeStar?.name === s.name
          const isLinked = linked.skills.has(s.name)
          const dim = active && !isActive && !isLinked
          return (
            <div
              key={s.name}
              className="absolute"
              style={
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  // Put the dot (0.75rem, inside 0.25rem of padding) exactly on the star.
                  translate: s.above
                    ? '-50% calc(-100% + 0.625rem)'
                    : '-50% -0.625rem'
                } as CSSProperties
              }
            >
              <div data-node={starId(s.name)} className="will-change-transform">
                <button
                  type="button"
                  {...on({ kind: 'skill', id: s.name })}
                  onClick={() => setActive({ kind: 'skill', id: s.name })}
                  aria-pressed={isActive}
                  className={cn(
                    'constellation-star group flex items-center gap-1.5 rounded-md px-1.5 py-1 focus-ring transition-opacity duration-300',
                    s.above ? 'flex-col-reverse' : 'flex-col',
                    dim && 'opacity-35'
                  )}
                  style={{ '--i': s.i } as CSSProperties}
                >
                  <span
                    className={cn(
                      'size-3 rounded-full border-2 border-foreground transition-[scale,background-color] duration-300 group-hover:scale-125',
                      isActive || isLinked
                        ? 'scale-150 border-brand bg-brand'
                        : DOT[AREAS[s.area].accent]
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
              </div>
            </div>
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
              left: `calc(${anchor.x}% ${anchor.x > 50 ? '- 2.5rem' : '+ 2.5rem'})`,
              top: `calc(${anchor.y}% ${anchor.y > 60 ? '- 0.5rem' : '+ 0.5rem'})`
            }}
          >
            <Explain
              star={activeStar}
              project={activeProject}
              nodes={nodes}
              stars={stars}
            />
          </div>
        )}
      </div>

      {/* Below xl: projects and grouped chips, with the explanation in an ink card. */}
      <MobileSkills
        stars={stars}
        nodes={nodes}
        active={active}
        setActive={setActive}
      />
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
        <p className="mt-2 text-sm text-pretty text-foreground/85">
          {star.explanation}
        </p>
        {used.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Used in{' '}
            <span className="font-semibold text-foreground">
              {used.map((p) => p.title).join(', ')}
            </span>
          </p>
        )}
      </>
    )
  }
  if (project) {
    const used = stars.filter((s) => s.projects.includes(project.slug))
    return (
      <>
        <p className="text-xs font-medium text-muted-foreground">
          {project.kind === 'work' ? 'Work' : 'Project'}
        </p>
        <p className="mt-0.5 text-lg font-semibold">{project.title}</p>
        <p className="mt-2 text-sm text-pretty text-foreground/85">
          {project.summary}
        </p>
        {used.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Built with{' '}
            <span className="font-semibold text-foreground">
              {used.map((s) => s.name).join(', ')}
            </span>
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
  const star =
    active?.kind === 'skill'
      ? stars.find((s) => s.name === active.id)
      : undefined
  const project =
    active?.kind === 'project'
      ? nodes.find((p) => p.slug === active.id)
      : undefined
  const linkedProjects = new Set(star?.projects ?? [])
  const linkedSkills = new Set(
    project
      ? stars
          .filter((s) => s.projects.includes(project.slug))
          .map((s) => s.name)
      : []
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
      <div
        className="dark min-h-32 max-w-xl rounded-lg bg-background p-5 text-foreground"
        aria-live="polite"
      >
        {star || project ? (
          <>
            <Explain
              star={star}
              project={project}
              nodes={nodes}
              stars={stars}
            />
            {project?.kind === 'project' && (
              <Link
                href={`/projects/${project.slug}`}
                className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-link underline-offset-4 focus-ring hover:underline"
              >
                Read about {project.title}
                <ArrowRightIcon weight="bold" aria-hidden className="size-4" />
              </Link>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap a project or a skill to see how they connect.
          </p>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold">Work and projects</h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {nodes.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => setActive({ kind: 'project', id: p.slug })}
                aria-pressed={project?.slug === p.slug}
                className={chip(
                  project?.slug === p.slug,
                  linkedProjects.has(p.slug)
                )}
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
            <span
              className={cn(
                'size-2.5 rounded-full border-2 border-foreground',
                DOT[accent]
              )}
              aria-hidden
            />
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
                    className={chip(
                      star?.name === s.name,
                      linkedSkills.has(s.name)
                    )}
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
