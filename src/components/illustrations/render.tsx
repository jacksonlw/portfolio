import { useId, type CSSProperties } from 'react'
import type { Accent } from '@/content/types'
import { cn } from '@/lib/cn'
import './illustrations.css'

/*
 * Illustrations are data, drawn by one renderer. A drawing is a list of shapes on a 48 square,
 * each saying what it is (a line, a box, a dot) and what it's filled with (paper, the accent, ink
 * or nothing). Every filled piece is drawn the same way: a soft shadow under it, its colour, a
 * white gloss across the top and a fine ink edge. The two-tone colours live in illustrations.css.
 */

export type Pt = readonly [number, number]
/** paper: a pale wash of the accent; white: the drawing's paper; accent; ink; none. */
export type Fill = 'paper' | 'white' | 'accent' | 'ink' | 'none'

export type Shape =
  | {
      t: 'line'
      pts: Pt[]
      closed?: boolean
      fill?: Fill
      /** A heavier stroke, for a heading or the main line of a drawing. */
      bold?: boolean
    }
  | {
      t: 'box'
      x: number
      y: number
      w: number
      h: number
      r?: number
      fill?: Fill
      bold?: boolean
    }
  | { t: 'dot'; cx: number; cy: number; r: number; fill?: Fill; bold?: boolean }

export type Drawing = {
  /** What it shows, for screen readers. */
  label: string
  accent: Accent
  shapes: Shape[]
  /** Keep white paper and black ink in dark mode too (a document should still look like one). */
  keepLight?: boolean
}

/** How every drawing is drawn. */
export const SITE_PARAMS = {
  /** The line weight, in 48-square units (half again for a bold shape). */
  stroke: 0.8,
  /** How far the shadow under each filled piece falls (down, and a little right). */
  shadow: 0.9
} as const

/** The shape's outline as points (boxes get their corners rounded off). */
function outlineOf(s: Exclude<Shape, { t: 'dot' }>): {
  pts: Pt[]
  closed: boolean
} {
  if (s.t === 'line') return { pts: s.pts, closed: !!s.closed }
  const { x, y, w, h } = s
  const r = Math.min(s.r ?? 0, w / 2, h / 2)
  if (!r)
    return {
      pts: [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h]
      ],
      closed: true
    }
  const c = r * 0.29 // where a quarter circle's midpoint sits from the corner, roughly
  return {
    pts: [
      [x + r, y],
      [x + w - r, y],
      [x + w - c, y + c],
      [x + w, y + r],
      [x + w, y + h - r],
      [x + w - c, y + h - c],
      [x + w - r, y + h],
      [x + r, y + h],
      [x + c, y + h - c],
      [x, y + h - r],
      [x, y + r],
      [x + c, y + c]
    ],
    closed: true
  }
}

const f = (n: number) => +n.toFixed(2)

/**
 * A path through `points`. Each segment is written as a quadratic with its control point at the
 * midpoint, so it draws straight.
 */
function linePath(points: Pt[], closed: boolean) {
  const pts = closed ? [...points, points[0]] : points
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    d += ` Q${f((ax + bx) / 2)} ${f((ay + by) / 2)} ${f(bx)} ${f(by)}`
  }
  return closed ? `${d} Z` : d
}

/** A circle, as a closed Catmull-Rom spline through eight points on it. */
function circlePath(cx: number, cy: number, radius: number) {
  const n = 8
  const pts: Pt[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]
  })
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return `${d} Z`
}

function pathOf(s: Shape) {
  if (s.t === 'dot') return circlePath(s.cx, s.cy, s.r)
  const { pts, closed } = outlineOf(s)
  return linePath(pts, closed)
}

/** The class each fill is painted with (paper is the pale accent wash). */
const FILL_CLASS: Record<Exclude<Fill, 'none'>, string> = {
  paper: 'ill-tint',
  white: 'ill-paper',
  accent: 'ill-accent',
  ink: 'ill-ink'
}

/** The SVG for one drawing. */
export function DrawingSvg({
  drawing,
  label,
  className,
  style
}: {
  drawing: Drawing
  /** Pass to make it `role="img"`; leave out for a decorative drawing. */
  label?: string
  className?: string
  style?: CSSProperties
}) {
  const { stroke, shadow } = SITE_PARAMS
  const id = useId().replace(/:/g, '')
  const sheen = `${id}-sheen`
  return (
    <svg
      className={cn('ill', drawing.keepLight && 'ill-keep-light', className)}
      viewBox="0 0 48 48"
      focusable="false"
      style={
        {
          '--ill-accent': `var(--af-${drawing.accent})`,
          '--ill-deep': `var(--af-${drawing.accent}-deep)`,
          ...style
        } as CSSProperties
      }
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id={sheen} x1="0" y1="0" x2="0.35" y2="1">
          <stop
            offset="0"
            style={{ stopColor: '#fbfcfd', stopOpacity: 0.75 }}
          />
          <stop
            offset="0.42"
            style={{ stopColor: '#fbfcfd', stopOpacity: 0 }}
          />
        </linearGradient>
      </defs>
      {drawing.shapes.map((s, i) => {
        const fill = s.fill ?? 'none'
        const d = pathOf(s)
        return (
          <g key={i}>
            {fill !== 'none' && (
              <>
                <path
                  d={d}
                  className="ill-shadow"
                  transform={`translate(${shadow * 0.6} ${shadow})`}
                />
                <path d={d} className={FILL_CLASS[fill]} />
                <path d={d} fill={`url(#${sheen})`} />
              </>
            )}
            <path
              d={d}
              className="ill-line"
              style={{ strokeWidth: stroke * (s.bold ? 1.5 : 1) }}
            />
          </g>
        )
      })}
    </svg>
  )
}
