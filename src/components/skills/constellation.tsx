'use client'

import Link from 'next/link'
import { useMemo, useState, type CSSProperties } from 'react'
import { sparklePath } from '@/components/illustrations/primitives/sparkle'
import type { Accent, Project, Skill } from '@/content/profile'
import { TINT_BG, TINT_CHIP } from '@/lib/accent'
import { cn } from '@/lib/cn'
import { EYEBROW, SURFACE } from '@/lib/surface'

/*
 * The skills constellation: each area is a cluster of stars around its name. Hovering, focusing or
 * tapping a skill lights it in brand blue and draws lines to every skill that shares a project
 * with it; the card beside it explains the skill and links the projects. Below `md` the same
 * skills are grouped chips driving the same card. Every skill is a real <button>, so it all works
 * from the keyboard, and the explanations are also in /llms-full.txt for agents.
 */

const W = 1400
const H = 900

type AreaStyle = { hub: [number, number]; accent: Accent }

const AREAS: Record<Skill['area'], AreaStyle> = {
  'AI & agents': { hub: [230, 200], accent: 'sky' },
  Languages: { hub: [700, 140], accent: 'lavender' },
  'Frontend & mobile': { hub: [1170, 200], accent: 'mint' },
  'Backend & data': { hub: [230, 680], accent: 'sun' },
  'Cloud & tools': { hub: [700, 740], accent: 'sky' },
  'How I work': { hub: [1170, 680], accent: 'sun' }
}

const DOT: Record<Accent, string> = {
  sky: 'bg-illo-sky',
  mint: 'bg-illo-mint',
  sun: 'bg-illo-sun',
  lavender: 'bg-illo-lavender'
}

type Star = Skill & { x: number; y: number; i: number }

/**
 * Lays each area's skills around its hub, starting at the top. Big clusters alternate between an
 * inner and an outer ring so neighbouring labels don't collide.
 */
function layout(skills: Skill[]): Star[] {
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
      const r = big ? (outer ? 150 : 104) : 128
      const a = -Math.PI / 2 + (k / list.length) * Math.PI * 2
      stars.push({
        ...s,
        x: Math.round(cx + r * Math.cos(a)),
        y: Math.round(cy + r * 0.72 * Math.sin(a)),
        i: i++
      })
    })
  }
  return stars
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`

export function SkillsConstellation({
  skills,
  projects
}: {
  skills: Skill[]
  projects: Project[]
}) {
  const stars = useMemo(() => layout(skills), [skills])
  const [active, setActive] = useState(skills[0].name)
  const current = stars.find((s) => s.name === active) ?? stars[0]
  const related = useMemo(
    () =>
      new Set(
        stars
          .filter(
            (s) =>
              s.name !== current.name &&
              s.projects.some((p) => current.projects.includes(p))
          )
          .map((s) => s.name)
      ),
    [stars, current]
  )
  const used = current.projects
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => !!p)

  const select = (name: string) => () => setActive(name)

  const card = (
    <div className={cn(SURFACE, 'p-5 sm:p-6')} aria-live="polite">
      <p className={EYEBROW}>{current.area}</p>
      <h3 className="mt-1 text-title">{current.name}</h3>
      <p className="mt-3 text-pretty text-foreground/85">
        {current.explanation}
      </p>
      {used.length > 0 && (
        <>
          <p className={cn(EYEBROW, 'mt-5')}>Used in</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {used.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/projects/${p.slug}`}
                  className={cn(
                    'inline-block rounded-full px-3 py-1 text-xs font-semibold focus-ring transition-opacity hover:opacity-80',
                    TINT_CHIP[p.accent]
                  )}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )

  return (
    <div className="grid gap-8">
      {/* The constellation, from xl up, with the card in its middle. */}
      <div
        className="relative hidden xl:block"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 size-full"
          aria-hidden
          focusable="false"
        >
          {/* A few stars in the background. */}
          {[
            [440, 420, 10],
            [960, 480, 8],
            [60, 450, 7],
            [1340, 430, 9],
            [470, 60, 6],
            [930, 840, 6]
          ].map(([x, y, r], k) => (
            <path
              key={k}
              d={sparklePath(x, y, r)}
              className="fill-foreground/15"
            />
          ))}
          {/* Hub to skill. */}
          {stars.map((s) => {
            const [hx, hy] = AREAS[s.area].hub
            const lit = s.name === current.name
            return (
              <line
                key={s.name}
                x1={hx}
                y1={hy}
                x2={s.x}
                y2={s.y}
                className={cn(
                  'transition-colors duration-300',
                  lit ? 'stroke-brand' : 'stroke-foreground/12'
                )}
                strokeWidth={lit ? 2 : 1.5}
              />
            )
          })}
          {/* The active skill to every skill that shares a project with it. */}
          {stars
            .filter((s) => related.has(s.name))
            .map((s) => (
              <line
                key={`${current.name}-${s.name}`}
                x1={current.x}
                y1={current.y}
                x2={s.x}
                y2={s.y}
                pathLength={1}
                className="constellation-link stroke-brand"
                strokeWidth={1.5}
                strokeDasharray="1"
              />
            ))}
        </svg>

        {Object.entries(AREAS).map(([area, { hub, accent }]) => (
          <span
            key={area}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/80 px-3 py-1 text-sm font-semibold whitespace-nowrap text-foreground',
              TINT_BG[accent]
            )}
            style={{ left: pct(hub[0], W), top: pct(hub[1], H) }}
          >
            {area}
          </span>
        ))}

        {stars.map((s) => {
          const isActive = s.name === current.name
          const isRelated = related.has(s.name)
          return (
            <button
              key={s.name}
              type="button"
              onMouseEnter={select(s.name)}
              onFocus={select(s.name)}
              onClick={select(s.name)}
              aria-pressed={isActive}
              className="constellation-star group absolute flex -translate-x-1/2 flex-col items-center gap-1 rounded-md px-1.5 py-1 focus-ring"
              style={
                {
                  left: pct(s.x, W),
                  top: `calc(${pct(s.y, H)} - 0.6rem)`,
                  '--i': s.i
                } as CSSProperties
              }
            >
              <span
                className={cn(
                  'size-3 rounded-full border-2 border-foreground transition-[transform,background-color] duration-300 group-hover:scale-125',
                  isActive
                    ? 'scale-150 border-brand bg-brand'
                    : DOT[AREAS[s.area].accent],
                  isRelated && 'scale-125'
                )}
              />
              <span
                className={cn(
                  'text-[13px] leading-tight font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'font-semibold text-link'
                    : isRelated
                      ? 'text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {s.name}
              </span>
            </button>
          )
        })}

        <div className="absolute top-1/2 left-1/2 w-[22rem] -translate-x-1/2 -translate-y-1/2">
          {card}
        </div>
      </div>

      {/* Below xl: grouped chips, with the card above them. */}
      <div className="max-w-xl xl:hidden">{card}</div>
      <div className="space-y-6 xl:hidden">
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
                      onClick={select(s.name)}
                      aria-pressed={s.name === current.name}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium focus-ring transition-colors',
                        s.name === current.name
                          ? 'border-brand bg-brand text-brand-foreground'
                          : related.has(s.name)
                            ? 'border-foreground/60 bg-card'
                            : 'border-border bg-card'
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
    </div>
  )
}
