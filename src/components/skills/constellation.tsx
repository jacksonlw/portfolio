'use client'

import { PlayIcon } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode
} from 'react'
import { Illustration } from '@/components/illustrations/registry'
import { RichText } from '@/components/site/rich-text'
import {
  bubbleWhen,
  PROFILE,
  storyPath,
  type Accent,
  type Project,
  type Satellite,
  type Skill,
  type WorkNode
} from '@/content/profile'
import type { Story } from '@/content/types'
import { StoryPanel } from '@/components/story/story-panel'
import {
  onPageCovered,
  pageCovered,
  setPageCovered,
  useBodyLock,
  useSwipeToClose
} from '@/components/site/overlay'
import { ACCENT_BG } from '@/lib/accent'
import { cn } from '@/lib/cn'
import { discAccent } from './disc'
import { INTRO, type Intro } from './intro'
import { LAYOUT, OFF_BOARD, type BubbleSize, type Layout } from './layouts'
import photo from '../../../public/profile-picture.jpg'

/*
 * The constellation: the whole page. Jackson's Me node sits at the center, his satellites (resume,
 * email, GitHub, press) orbiting it on faint lines. His work and projects float around him as
 * bubbles, each wearing its illustration, and his skills are stars in four areas at the edges, each area's
 * stars joined into a small figure.
 *
 * Lines are kept few: Me node to satellites, star to star within an area, and, only while something
 * is hovered, a star to the bubbles where it was used (or a bubble to its stars, or the press
 * satellite to the bubbles it covers). Nothing ties a bubble to the Me node: they're all his.
 *
 * Hover (or focus) anything and the dark ink popover explains it; the Me node's popover is the full
 * About, and stays open while the pointer moves into it so its links can be clicked. Clicking the Me
 * node does nothing (a tap opens it on touch screens).
 *
 * Nodes float gently on their own, and lean toward the cursor like it has gravity
 * (useCursorGravity); the hovered node never moves. One
 * requestAnimationFrame loop writes transforms and line ends straight to the DOM. Under reduced
 * motion nothing moves at all.
 *
 * From `lg` it fills the screen (Board); below that the same constellation is laid out vertically
 * (Column).
 */

/* ---------- layout ---------- */

/** Each area wears its own pastel. Where things sit comes from the layout (layouts.ts). */
const AREAS: Record<Skill['area'], { accent: Accent }> = {
  'AI & agents': { accent: 'sky' },
  'Product & frontend': { accent: 'mint' },
  'Backend & data': { accent: 'sun' },
  Cloud: { accent: 'peach' }
}

/** The debris's colours: --spark-<tone> in globals.css (deep shades in light mode, pastels in dark). */
const SPARK_TONES = [
  'brand',
  'sun',
  'rose',
  'sky',
  'peach',
  'lavender',
  'mint',
  'magenta',
  'cyan',
  'violet'
]

/** The rainbow that plays across chrome (--iri-* in globals.css), for the supernova's light. */
const IRI = ['magenta', 'violet', 'cyan', 'mint', 'gold', 'coral']

/** Disc diameter (rem) and label size. */
const BUBBLE_STYLE: Record<BubbleSize, { disc: number; label: string }> = {
  lg: { disc: 7, label: 'text-sm' },
  md: { disc: 6, label: 'text-sm' },
  sm: { disc: 5, label: 'text-xs' }
}

type Star = Skill & {
  x: number
  y: number
  i: number
  k: number
  above: boolean
}
type Bubble = (Project | WorkNode) & {
  /** Where it sits on the reference screen (% of the board); the board recomputes it for the real one. */
  x: number
  y: number
  /** Its place around the photo: distance (px, reference screen) and angle (degrees). */
  r: number
  deg: number
  kind: 'project' | 'work'
  size: BubbleSize
}
type Active =
  | { kind: 'skill' | 'project' | 'satellite'; id: string }
  | { kind: 'me' }
  | null

/** One area's stars around its hub, knocked off their even spots by `salt`'s scatter. */
function scatterArea(
  layout: Layout,
  area: Skill['area'],
  list: Skill[],
  salt: number
) {
  const [cx, cy] = layout.areas[area]
  const ring = layout.ring
  const n = list.length
  const big = n > 6
  // Each area turned its own way, so no two figures share an orientation.
  const turn = (hash(`${area}/${salt}`) - 0.5) * 1.6
  return list.map((s, k) => {
    // With an odd count the last star would sit on the outer ring beside the first: keep it in.
    const outer = k % 2 === 0 && !(n % 2 === 1 && k === n - 1)
    const [rx, ry] = (big ? (outer ? [8.5, 13] : [5, 8]) : [7.5, 11]).map(
      (v) => v * ring
    )
    // Knock each star off its even spot, in angle and in distance, like a real sky.
    const slip =
      (hash(`${s.name}/a/${salt}`) - 0.5) * ((Math.PI * 2) / n) * 0.75
    const reach = 0.82 + hash(`${s.name}/r/${salt}`) * 0.32
    const a = -Math.PI / 2 + turn + (k / n) * Math.PI * 2 + slip
    const sin = Math.sin(a)
    return {
      ...s,
      // Rounded, so the server's render and the browser's match exactly.
      x: Math.round((cx + rx * reach * Math.cos(a)) * 100) / 100,
      y: Math.round((cy + ry * reach * sin) * 100) / 100,
      k,
      above: sin < -0.05
    }
  })
}

/**
 * How many labels in an area would collide (with each other or the area's name), measured on a
 * typical 1440×900 board. Label sizes are estimates from the text length.
 */
function collisions(
  layout: Layout,
  area: Skill['area'],
  stars: Omit<Star, 'i'>[]
) {
  const W = 1440
  const H = 900
  const boxes = stars.map((s) => {
    const x = (s.x / 100) * W
    const y = (s.y / 100) * H
    const w = s.name.length * 7 + 14
    return {
      l: x - w / 2,
      r: x + w / 2,
      t: s.above ? y - 30 : y - 8,
      b: s.above ? y + 8 : y + 30
    }
  })
  const [hx, hy] = layout.areas[area]
  const hw = area.length * 8 + 12
  boxes.push({
    l: (hx / 100) * W - hw / 2,
    r: (hx / 100) * W + hw / 2,
    t: (hy / 100) * H - 10,
    b: (hy / 100) * H + 10
  })
  let hits = 0
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i]
      const B = boxes[j]
      if (A.l < B.r && B.l < A.r && A.t < B.b && B.t < A.b) hits++
    }
  return hits
}

/**
 * Each area's stars scattered around its hub like a real constellation: uneven, but never with
 * labels on top of each other. Tries scatters in a fixed order and keeps the first clean one (or
 * the least crowded), so the sky is the same on every visit.
 */
function layoutStars(layout: Layout, skills: Skill[]): Star[] {
  const byArea = new Map<Skill['area'], Skill[]>()
  for (const s of skills) byArea.set(s.area, [...(byArea.get(s.area) ?? []), s])
  const stars: Star[] = []
  let i = 0
  for (const [area, list] of byArea) {
    let best = scatterArea(layout, area, list, 0)
    let bestHits = collisions(layout, area, best)
    for (let salt = 1; salt < 60 && bestHits > 0; salt++) {
      const next = scatterArea(layout, area, list, salt)
      const hits = collisions(layout, area, next)
      if (hits < bestHits) {
        best = next
        bestHits = hits
      }
    }
    for (const s of best) stars.push({ ...s, i: i++ })
  }
  return stars
}

/**
 * The lines that join a set of stars into a figure: each star tied to its nearest neighbour until
 * all are joined (a minimum spanning tree), which branches the way drawn constellations do. `sx`
 * scales x against y so distances match what the eye sees.
 */
function figure(pts: { x: number; y: number }[], sx = 1): [number, number][] {
  if (pts.length < 2) return []
  const inTree = new Set([0])
  const edges: [number, number][] = []
  while (inTree.size < pts.length) {
    let best: [number, number] | null = null
    let bestD = Infinity
    for (const a of inTree)
      for (let b = 0; b < pts.length; b++) {
        if (inTree.has(b)) continue
        const d = Math.hypot((pts[a].x - pts[b].x) * sx, pts[a].y - pts[b].y)
        if (d < bestD) {
          bestD = d
          best = [a, b]
        }
      }
    edges.push(best!)
    inTree.add(best![1])
  }
  return edges
}

/** Every bubble: its hand-placed spot, or the next point on a spiral so none is ever dropped. */
function placeBubbles(
  layout: Layout,
  list: ((Project & { kind: 'project' }) | (WorkNode & { kind: 'work' }))[]
): Bubble[] {
  let k = 0
  return list.map((n) => {
    const spot = layout.bubbles[n.slug] ?? {
      // Not placed by hand: the next point on a golden-angle spiral, so it's never dropped.
      r: 330,
      deg: (k++ * 137.5) % 360,
      size: 'md' as const
    }
    const [x, y] = around(layout, spot.r, spot.deg, 1, layout.reference)
    return { ...n, ...spot, x, y }
  })
}

/** A point `r` px from the photo at `deg`, scaled by `k`, as % of a board `w` × `h`. */
function around(
  layout: Layout,
  r: number,
  deg: number,
  k: number,
  [w, h]: readonly [number, number]
): [number, number] {
  const t = (deg * Math.PI) / 180
  // Rounded, so the server's render and the browser's match exactly.
  const round = (v: number) => Math.round(v * 100) / 100
  return [
    round(layout.me[0] + ((r * k * Math.cos(t)) / w) * 100),
    round(layout.me[1] + ((r * k * Math.sin(t)) / h) * 100)
  ]
}

/**
 * How much the layout scales on this board: the smaller of its width and height against the
 * reference screen, within limits, so the whole constellation keeps its shape.
 */
function layoutScale(layout: Layout, w: number, h: number) {
  if (!w || !h) return 1
  const [rw, rh] = layout.reference
  return Math.min(1.15, Math.max(0.6, Math.min(w / rw, h / rh)))
}

/** What lights up with the active node. */
function linksOf(
  active: Active,
  stars: Star[],
  satellites: Satellite[]
): { skills: Set<string>; projects: Set<string> } {
  const none = { skills: new Set<string>(), projects: new Set<string>() }
  if (!active || active.kind === 'me') return none
  if (active.kind === 'skill') {
    const s = stars.find((x) => x.name === active.id)
    return { skills: none.skills, projects: new Set(s?.projects ?? []) }
  }
  if (active.kind === 'satellite') {
    const s = satellites.find((x) => x.kind === active.id)
    return { skills: none.skills, projects: new Set(s?.covers ?? []) }
  }
  return {
    skills: new Set(
      stars.filter((s) => s.projects.includes(active.id)).map((s) => s.name)
    ),
    projects: none.projects
  }
}

/* ---------- motion ---------- */

/**
 * A node the motion loop moves: its spot (% of the board), how easily it's moved (0 pins it), the
 * radius of its disc or dot (px), and how far past that the cursor can be and still pull it (px).
 */
type MotionNode = {
  x: number
  y: number
  weight: number
  r: number
  reach: number
  /** The farthest gravity can pull it (px); defaults to most of its reach. */
  travel?: number
  /** How far past its edge gravity starts to pull it (px); defaults to its hover reach. */
  pullReach?: number
}

/** A stable 0–1 number from a string, so every node gets its own phase and period. */
function hash(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++)
    h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10000) / 10000
}

/** The board's pixel size, kept current as it resizes. The lines and satellites need it. */
function useBoardSize(board: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = board.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    // Measure straight away, before the first paint, so the layout is right from the start; then
    // keep up with resizes.
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [board])
  return size
}

/** Keyboard focus opens a node and blurring closes it (the pointer uses useIntentHover). */
function useHoverIntent(setActive: (a: Active) => void) {
  return useMemo(
    () => ({
      open: (a: NonNullable<Active>) => setActive(a),
      close: () => setActive(null)
    }),
    [setActive]
  )
}

/** How far a node idly floats from its spot (px), before its weight. */
const FLOAT_PX = 5

/** How far a star can be pulled toward the cursor (px): less than its reach, so stars never collide. */
const STAR_TRAVEL = 5

/** How much of a node's reach it will travel to meet the cursor (a little less than all of it). */
const MEET = 0.85
/** How far a node leans toward a cursor on it, as a share of its radius, and at most (px). */
const LEAN = 0.06
const LEAN_MAX = 3
/** How far past its reach the pull fades out (px, before the node's weight). */
const PULL_FADE = 90
/** How quickly a node glides to where gravity wants it, per frame (0–1; lower is smoother). */
const GLIDE = 0.07

/**
 * Where in the core's intro animation (0–1 of its run) it reaches `size` (its scale), from the
 * keyframes of intro-core in globals.css, so the intro can carry on from a core that grew while
 * waiting. Capped before the collapse, so the burst always plays.
 */
function coreTimeAt(size: number) {
  const keys: [number, number][] = [
    [0, 0.12],
    [0.08, 0.16],
    [0.31, 0.55],
    [0.455, 1]
  ]
  if (size <= keys[0][1]) return 0
  for (let k = 1; k < keys.length; k++) {
    const [t0, s0] = keys[k - 1]
    const [t1, s1] = keys[k]
    if (size <= s1) return t0 + ((size - s0) / (s1 - s0)) * (t1 - t0)
  }
  return keys[keys.length - 1][0]
}

/** 0 below `a`, 1 above `b`, and an S-curve between: for pulls that fade without a seam. */
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * The cursor's gravity, plus each node's idle float. A node the cursor comes within reach of (a
 * little less than its hover reach) glides to meet it, its edge closing the gap to the pointer;
 * farther out the pull eases off smoothly. Nodes glide, never spring, so there's no bounce, and
 * drift back to their spots when the cursor moves on. Elements opt in with `data-node="<id>"`; lines with `data-a`/`data-b` keep their
 * ends on those nodes. `weight` sets how easily a node is moved (0 pins it).
 */
function useCursorGravity(
  board: React.RefObject<HTMLDivElement | null>,
  nodes: Record<string, MotionNode>,
  active: string | null,
  /** False until the supernova has burst: no pull before then. */
  ready: boolean
) {
  const state = useRef({ nodes, active, ready })
  useLayoutEffect(() => {
    state.current = { nodes, active, ready }
  }, [nodes, active, ready])

  useEffect(() => {
    const el = board.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return

    // The pointer as the browser reports it; the board's own corner is read once a frame (in
    // tick), not on every pointer event.
    const pointer = { cx: 0, cy: 0, x: 0, y: 0, inside: false }
    // What the loop keeps for each node between frames: its glide toward the cursor, how calm its
    // float is (eased to a stop while it's the open one, so its popover stays put), where it is
    // this frame, and its own period and phase (worked out once, not every frame).
    type Kept = {
      ox: number
      oy: number
      calm: number
      x: number
      y: number
      period: number
      phase: number
    }
    const kept = new Map<string, Kept>()
    const keep = (id: string) => {
      let k = kept.get(id)
      if (!k) {
        const r = hash(id)
        k = {
          ox: 0,
          oy: 0,
          calm: 1,
          x: 0,
          y: 0,
          period: 9 + r * 6,
          phase: r * Math.PI * 2
        }
        kept.set(id, k)
      }
      return k
    }
    const onMove = (e: PointerEvent) => {
      pointer.cx = e.clientX
      pointer.cy = e.clientY
      pointer.inside = true
    }
    const onLeave = () => {
      pointer.inside = false
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    // Low-end devices (.lite, set in app/layout.tsx) skip the idle float.
    const lite = document.documentElement.classList.contains('lite')
    // The elements are looked up again only now and then, and each is written only when its
    // position has changed by a visible amount, so an idle board costs next to nothing.
    let nodeEls: HTMLElement[] = []
    let lineEls: SVGLineElement[] = []
    let frame = 0
    const written = new WeakMap<Element, string>()
    // Quarter-pixel steps: smooth to the eye, and far fewer writes than every tiny change.
    const q = (n: number) => Math.round(n * 4) / 4
    const half = (n: number) => String(Math.round(n * 2) / 2)
    let raf = 0
    // The loop only runs while there's a board to move: from `lg` up (below that the board isn't
    // drawn at all) and while no Story covers the page. The time it spent stopped is left out of
    // the float's clock, so every node carries on from exactly where it was.
    const wide = window.matchMedia('(min-width: 64rem)')
    const wanted = () => wide.matches && !pageCovered()
    let stoppedAt = 0
    let held = 0
    const tick = (now: number) => {
      if (!wanted()) {
        raf = 0
        stoppedAt = now
        return
      }
      const { nodes, active, ready } = state.current
      if (frame++ % 30 === 0) {
        nodeEls = [...el.querySelectorAll<HTMLElement>('[data-node]')]
        lineEls = [...el.querySelectorAll<SVGLineElement>('line[data-a]')]
      }
      const t = (now - held) / 1000
      const w = el.clientWidth
      const h = el.clientHeight
      if (pointer.inside) {
        const r = el.getBoundingClientRect()
        pointer.x = pointer.cx - r.left
        pointer.y = pointer.cy - r.top
      }

      for (const id in nodes) {
        const n = nodes[id]
        const o = keep(id)
        // Where gravity wants the node: how far it leans toward the cursor depends smoothly on
        // how far the cursor is from its edge, so there's no jump anywhere as the cursor moves.
        let tx = 0
        let ty = 0
        if (ready && pointer.inside && n.weight > 0) {
          const dx = pointer.x - (n.x / 100) * w
          const dy = pointer.y - (n.y / 100) * h
          const d = Math.hypot(dx, dy)
          const edge = Math.max(0, d - n.r)
          const meet = Math.min(
            (n.pullReach ?? n.reach) * MEET,
            n.travel ?? Infinity
          )
          // Up close the node closes the gap entirely (its edge meets the cursor); beyond that the
          // pull eases off to nothing over the next PULL_FADE px.
          const fade = 1 - smoothstep(meet, meet + PULL_FADE, edge)
          // Inside the node it still leans a little toward the cursor, more the farther the
          // cursor is from its centre, so a big disc follows the pointer across its face too.
          const lean =
            Math.min(LEAN_MAX, n.r * LEAN) * Math.min(1, d / n.r) * fade
          const pull = lean + (edge <= meet ? edge : meet * fade)
          if (d > 0) {
            tx = (dx / d) * pull
            ty = (dy / d) * pull
          }
        }
        // Glide there (and home again once the cursor moves on): a plain ease, no spring, so it
        // never overshoots or wobbles.
        o.ox += (tx - o.ox) * GLIDE
        o.oy += (ty - o.oy) * GLIDE
        if (!tx && !ty && Math.abs(o.ox) + Math.abs(o.oy) < 0.02)
          o.ox = o.oy = 0

        // The idle float: each node traces its own small, slow ellipse, never a real orbit.
        o.calm += ((id === active ? 0 : 1) - o.calm) * 0.08
        const amp = lite ? 0 : FLOAT_PX * n.weight * o.calm
        const turn = (t / o.period) * Math.PI * 2 + o.phase
        o.x = o.ox + Math.sin(turn) * amp
        o.y = o.oy + Math.cos(turn) * amp * 0.7
      }

      for (const node of nodeEls) {
        const id = node.dataset.node!
        const o = id in nodes ? kept.get(id) : undefined
        if (!o) continue
        const v = `translate3d(${q(o.x)}px, ${q(o.y)}px, 0)`
        if (written.get(node) === v) continue
        written.set(node, v)
        node.style.transform = v
      }
      for (const line of lineEls) {
        if (!line.isConnected) continue
        const A = nodes[line.dataset.a!]
        const B = nodes[line.dataset.b!]
        if (!A || !B) continue
        const oa = kept.get(line.dataset.a!)!
        const ob = kept.get(line.dataset.b!)!
        const x1 = half((A.x / 100) * w + oa.x)
        const y1 = half((A.y / 100) * h + oa.y)
        const x2 = half((B.x / 100) * w + ob.x)
        const y2 = half((B.y / 100) * h + ob.y)
        const v = `${x1} ${y1} ${x2} ${y2}`
        if (written.get(line) === v) continue
        written.set(line, v)
        line.setAttribute('x1', x1)
        line.setAttribute('y1', y1)
        line.setAttribute('x2', x2)
        line.setAttribute('y2', y2)
      }
      raf = requestAnimationFrame(tick)
    }
    const run = () => {
      if (raf || !wanted()) return
      if (stoppedAt) held += performance.now() - stoppedAt
      stoppedAt = 0
      raf = requestAnimationFrame(tick)
    }
    run()
    wide.addEventListener('change', run)
    const offCovered = onPageCovered(run)
    return () => {
      cancelAnimationFrame(raf)
      wide.removeEventListener('change', run)
      offCovered()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [board])
}

/** How far past its shape (px) the cursor can be and still mean a node, by kind. */
const REACH = { skill: 26, project: 14, satellite: 14, me: 4 } as const
/** The head start (px) the open node gets, so two close nodes don't flicker between each other. */
const STICK = 10

/** The key a node answers to in the picker: `me`, or `<kind>:<id>`. */
const keyOf = (a: Active) =>
  !a ? null : a.kind === 'me' ? 'me' : `${a.kind}:${a.id}`
function fromKey(key: string): NonNullable<Active> {
  if (key === 'me') return { kind: 'me' }
  const i = key.indexOf(':')
  return {
    kind: key.slice(0, i) as 'skill' | 'project' | 'satellite',
    id: key.slice(i + 1)
  }
}

/**
 * Hover by intent rather than by whatever box the pointer is inside. Each node marks its real
 * shapes with `data-hit="<key>"` (`data-shape="circle"` for discs and dots, rect otherwise). On each
 * frame the pointer moves, every shape is measured: how far the cursor is from its edge now, and
 * how far it will be a moment ahead on its current heading. The nearest node within its reach wins,
 * and the open one gets a small head start. So a node opens as the cursor clearly heads into it, a
 * neighbour takes over as soon as the cursor is nearer to it, and empty sky closes everything.
 * Mouse and pen only; touch keeps tap-to-open.
 */
function useIntentHover(
  board: React.RefObject<HTMLDivElement | null>,
  active: Active,
  setActive: (a: Active) => void,
  /** False while nodes are still flying out of the core at the start, so nothing is picked. */
  ready: boolean
) {
  const current = useRef<string | null>(null)
  useLayoutEffect(() => {
    current.current = keyOf(active)
  }, [active])
  const isReady = useRef(ready)
  const repick = useRef<() => void>(() => {})
  useLayoutEffect(() => {
    isReady.current = ready
    // Once everything has landed, pick for wherever the cursor is resting.
    if (ready) repick.current()
  }, [ready])

  useEffect(() => {
    const el = board.current
    if (!el) return
    const p = { x: 0, y: 0, vx: 0, vy: 0, seen: false }
    let raf = 0

    // Each shape is measured once per pick, then asked about both points.
    const distance = (r: DOMRect, circle: boolean, x: number, y: number) => {
      if (circle) {
        const rad = r.width / 2
        return Math.max(
          0,
          Math.hypot(x - (r.left + rad), y - (r.top + r.height / 2)) - rad
        )
      }
      const dx = Math.max(r.left - x, 0, x - r.right)
      const dy = Math.max(r.top - y, 0, y - r.bottom)
      return Math.hypot(dx, dy)
    }

    const pick = () => {
      raf = 0
      if (!isReady.current || !p.seen) return
      const ax = p.x + p.vx * 5
      const ay = p.y + p.vy * 5
      const now = current.current
      let best: string | null = null
      let bestScore = Infinity
      for (const node of el.querySelectorAll<HTMLElement>('[data-hit]')) {
        const key = node.dataset.hit!
        const kind =
          key === 'me'
            ? 'me'
            : (key.slice(0, key.indexOf(':')) as keyof typeof REACH)
        const held = key === now ? STICK : 0
        const rect = node.getBoundingClientRect()
        const circle = node.dataset.shape === 'circle'
        const d = distance(rect, circle, p.x, p.y)
        if (d > REACH[kind] + held) continue
        const score = 0.65 * d + 0.35 * distance(rect, circle, ax, ay) - held
        if (score < bestScore) {
          bestScore = score
          best = key
        }
      }
      if (best !== now) setActive(best ? fromKey(best) : null)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (p.seen) {
        p.vx += (e.clientX - p.x - p.vx) * 0.5
        p.vy += (e.clientY - p.y - p.vy) * 0.5
      }
      p.x = e.clientX
      p.y = e.clientY
      p.seen = true
      if (!raf) raf = requestAnimationFrame(pick)
    }
    // Where the cursor is even if it never moves: the browser reports it (pointerover) when
    // something appears under a resting cursor, as on first paint and when the nodes become
    // hoverable after the intro.
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      p.x = e.clientX
      p.y = e.clientY
      p.seen = true
      if (!raf) raf = requestAnimationFrame(pick)
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      p.seen = false
      if (current.current) setActive(null)
    }
    repick.current = () => {
      if (!raf) raf = requestAnimationFrame(pick)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerover', onOver)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerover', onOver)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [board, setActive])
}

/* ---------- shared pieces ---------- */

const ME_ID = 'me'
const satId = (kind: string) => `sat:${kind}`
const starId = (name: string) => `skill:${name}`
const bubbleId = (slug: string) => `bubble:${slug}`

/** Jackson's photo in its ring, cropped to his face. */
function Portrait({ className, hit }: { className?: string; hit?: string }) {
  return (
    <span
      data-hit={hit}
      data-shape="circle"
      className={cn(
        'chrome-rim relative block overflow-hidden rounded-full border-[3px]',
        className
      )}
    >
      <Image
        src={photo}
        alt={`Portrait of ${PROFILE.name}`}
        fill
        priority
        placeholder="blur"
        sizes="200px"
        className="portrait-photo origin-[62%_31%] scale-[1.6] object-cover object-top"
      />
      {/* A light grade that ties the photo to the theme (globals.css, .portrait-grade). */}
      <span aria-hidden className="portrait-grade" />
    </span>
  )
}

/** A lit node's disc: a brand ring, no change in size (nothing jumps). */
const LIT_RING =
  'border-brand shadow-[0_0_0_5px_color-mix(in_oklab,var(--brand)_16%,transparent)]'

/** A bubble's disc with its illustration. */
function BubbleDisc({
  bubble,
  rem,
  lit,
  hit,
  className
}: {
  bubble: Bubble
  rem: number
  lit?: boolean
  hit?: string
  className?: string
}) {
  return (
    <span
      data-hit={hit}
      data-shape="circle"
      // Where its Story grows from and shrinks back into (components/story/story-panel.tsx).
      data-disc={bubble.slug}
      className={cn(
        'node-disc flex shrink-0 items-center justify-center rounded-full border-2 transition-[border-color,box-shadow,background-color] duration-200',
        lit && LIT_RING,
        className
      )}
      data-lit={lit || undefined}
      style={{
        width: `${rem}rem`,
        height: `${rem}rem`,
        ...discAccent(bubble.slug)
      }}
    >
      <Illustration
        name={bubble.slug}
        decorative
        className="h-auto"
        style={{ width: `${rem * 0.6}rem` }}
      />
    </span>
  )
}

/** A satellite's disc with its drawing. */
function SatelliteDisc({
  satellite,
  lit,
  hit,
  className
}: {
  satellite: Satellite
  lit?: boolean
  hit?: string
  className?: string
}) {
  return (
    <span
      data-hit={hit}
      data-shape="circle"
      className={cn(
        'node-disc flex items-center justify-center rounded-full border-2 transition-[border-color,box-shadow,background-color] duration-200',
        lit && LIT_RING,
        className
      )}
      data-lit={lit || undefined}
      style={discAccent(satellite.kind)}
    >
      <Illustration name={satellite.kind} decorative className="w-[58%]" />
    </span>
  )
}

/** The About, as it reads in the Me node's popover (and the column's panel): just the bio. */
function About() {
  return (
    <>
      <p className="text-lg font-semibold">{PROFILE.name}</p>
      <div className="mt-2 space-y-3 text-sm text-pretty text-foreground/85">
        {[...PROFILE.about.lead, ...PROFILE.about.more].map((para, i) => (
          <p key={i}>
            <RichText text={para} />
          </p>
        ))}
      </div>
    </>
  )
}

/** The popover's content for a star, a bubble or a satellite. */
function Explain({
  star,
  bubble,
  satellite,
  bubbles,
  stars
}: {
  star?: Star
  bubble?: Bubble
  satellite?: Satellite
  bubbles: Bubble[]
  stars: Star[]
}) {
  if (star) {
    const used = bubbles.filter((p) => star.projects.includes(p.slug))
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
  if (bubble) {
    const used = stars.filter((s) => s.projects.includes(bubble.slug))
    return (
      <>
        <p className="text-xs font-medium text-muted-foreground">
          {eyebrow(bubble, false)}
        </p>
        <p className="mt-0.5 text-lg font-semibold">{bubble.title}</p>
        <p className="mt-2 text-sm text-pretty text-foreground/85">
          {bubble.summary}
        </p>
        <p className="mt-3 text-xs font-semibold text-link">
          Click to read the story
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
  if (satellite)
    return (
      <>
        {satellite.kind === 'press' && (
          <p className="text-xs font-medium text-muted-foreground">Press</p>
        )}
        <p className="mt-0.5 text-base font-semibold text-pretty">
          {satellite.title}
        </p>
        <p className="mt-1 text-sm text-foreground/85">{satellite.detail}</p>
      </>
    )
  return null
}

/** The popover's eyebrow for a bubble: work or project, and when (or the tagline, if no date). */
const eyebrow = (b: Bubble, withTagline: boolean) =>
  [
    b.kind === 'work' ? 'Work' : 'Project',
    withTagline && b.tagline,
    bubbleWhen(b)
  ]
    .filter(Boolean)
    .join(' · ')

/**
 * A bubble's own link: to its Story's address, so it works as a plain link too (a new tab, an
 * agent), while a click opens the Story in place over the constellation.
 */
function BubbleTarget({
  bubble,
  className,
  style,
  handlers,
  onOpen,
  lit,
  children
}: {
  bubble: Bubble
  className: string
  style?: CSSProperties
  handlers: Record<string, () => void>
  onOpen: (slug: string) => void
  /** Lit: it stays bright while the rest of the board dims. */
  lit?: boolean
  children: ReactNode
}) {
  return (
    <a
      href={storyPath(bubble.slug)}
      data-on={lit || undefined}
      {...handlers}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
          return
        e.preventDefault()
        onOpen(bubble.slug)
      }}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}

/* ---------- the board's pieces ---------- */

/*
 * Each kind of thing on the board is its own memoized piece, so hovering re-renders only what
 * actually changes (the node that lights up, the ones tied to it), not all of it. What dims while
 * something else is hovered is left to CSS (globals.css, .board-node and .board-line).
 */

/** A node's flight out of the core in the intro, as CSS variables (see Board's `fly`). */
type Fly = (
  x: number,
  y: number,
  id: string,
  px?: [number, number]
) => CSSProperties
const NO_FLIGHT: CSSProperties = {}

type Open = (a: NonNullable<Active>) => void

/** The lines of every area's figure. */
const FigureLines = memo(function FigureLines({
  lines,
  nodes,
  w,
  h,
  introAt,
  chaos
}: {
  lines: { a: string; b: string }[]
  nodes: Record<string, MotionNode>
  w: number
  h: number
  /** When the lines start catching on in the intro (ms), or null once it has played. */
  introAt: number | null
  chaos: number
}) {
  return lines.map((l) => {
    const A = nodes[l.a]
    const B = nodes[l.b]
    return (
      <line
        key={`${l.a}-${l.b}`}
        data-a={l.a}
        data-b={l.b}
        x1={(A.x / 100) * w}
        y1={(A.y / 100) * h}
        x2={(B.x / 100) * w}
        y2={(B.y / 100) * h}
        className={cn(
          'board-line transition-opacity duration-300',
          introAt !== null && 'intro-line',
          l.a === ME_ID ? 'stroke-foreground/20' : 'stroke-foreground/15'
        )}
        style={
          introAt !== null
            ? ({
                '--line-delay': `${Math.round(introAt + (hash(`${l.a}|${l.b}`) - 0.3) * 228 * chaos)}ms`
              } as CSSProperties)
            : undefined
        }
        strokeWidth={1.5}
      />
    )
  })
})

type Spark = {
  id: string
  dx: number
  dy: number
  size: number
  tone: string
  speed: number
  wait: number
  rest: number
  twinkle: number
}

/**
 * Debris: sparks thrown out by the blast that stay on as faint, twinkling dust, floating and
 * pulled by the cursor like everything else.
 */
const Dust = memo(function Dust({
  sparks,
  me,
  live,
  ms,
  blast
}: {
  sparks: Spark[]
  me: readonly [number, number]
  live: boolean
  ms: number
  blast: number
}) {
  return sparks.map((sp, i) => (
    <span
      key={sp.id}
      aria-hidden
      data-extra={i % 2 === 1 || undefined}
      className="pointer-events-none absolute"
      style={{
        left: `calc(${me[0]}% + ${sp.dx}px)`,
        top: `calc(${me[1]}% + ${sp.dy}px)`
      }}
    >
      <span data-node={sp.id} className="block will-change-transform">
        <span
          className={cn(
            'block rounded-full',
            live ? 'intro-spark' : 'spark-twinkle'
          )}
          style={
            {
              width: sp.size,
              height: sp.size,
              marginLeft: -sp.size / 2,
              marginTop: -sp.size / 2,
              background: `var(--spark-${sp.tone})`,
              opacity: sp.rest,
              '--dx': `${sp.dx}px`,
              '--dy': `${sp.dy}px`,
              '--rest': sp.rest,
              animationDuration: live
                ? `${Math.round(ms * sp.speed)}ms`
                : `${sp.twinkle}ms`,
              animationDelay: live
                ? `${Math.round(blast + sp.wait)}ms`
                : `${-sp.wait * 20}ms`
            } as CSSProperties
          }
        />
      </span>
    </span>
  ))
})

/** A bubble on the board: its disc, title, tagline and dates, linking to its Story. */
const BubbleNode = memo(function BubbleNode({
  bubble: b,
  lit,
  live,
  fly,
  open,
  close,
  onOpen
}: {
  bubble: Bubble
  lit: boolean
  live: boolean
  fly: Fly
  open: Open
  close: () => void
  onOpen: (slug: string) => void
}) {
  const style = BUBBLE_STYLE[b.size]
  // The pointer is handled by useIntentHover; these keep the keyboard working.
  const handlers = useMemo(
    () => ({
      onFocus: () => open({ kind: 'project', id: b.slug }),
      onBlur: close
    }),
    [open, close, b.slug]
  )
  const flight = useMemo(() => fly(b.x, b.y, b.slug), [fly, b.x, b.y, b.slug])
  return (
    <div
      className="absolute z-10"
      style={{
        left: `${b.x}%`,
        top: `${b.y}%`,
        // Put the disc's center (inside 0.5rem of padding) on the bubble's point.
        translate: `-50% calc(-${style.disc / 2}rem - 0.5rem)`
      }}
    >
      <div
        data-node={bubbleId(b.slug)}
        className="will-change-transform"
        style={{ scale: 'var(--node-k, 1)' }}
      >
        <BubbleTarget
          bubble={b}
          handlers={handlers}
          onOpen={onOpen}
          lit={lit}
          className={cn(
            live && 'intro-piece',
            'board-node group flex flex-col items-center rounded-xl p-2 focus-ring transition-opacity duration-300'
          )}
          style={flight}
        >
          <BubbleDisc
            bubble={b}
            rem={style.disc}
            lit={lit}
            hit={`project:${b.slug}`}
          />
          <span
            data-hit={`project:${b.slug}`}
            className={cn(
              'mt-2 font-semibold whitespace-nowrap',
              style.label,
              lit && 'text-link'
            )}
          >
            {b.title}
          </span>
          <span
            data-hit={`project:${b.slug}`}
            className="max-w-40 text-center text-xs leading-snug text-muted-foreground"
          >
            {b.tagline}
          </span>
          {bubbleWhen(b) && (
            <span
              data-hit={`project:${b.slug}`}
              className="mt-0.5 text-[0.6875rem] leading-snug font-medium text-muted-foreground/75"
            >
              {bubbleWhen(b)}
            </span>
          )}
        </BubbleTarget>
      </div>
    </div>
  )
})

/** A star on the board: its dot and its skill's name. */
const StarNode = memo(function StarNode({
  star: s,
  lit,
  isActive,
  live,
  fly,
  open,
  close
}: {
  star: Star
  lit: boolean
  isActive: boolean
  live: boolean
  fly: Fly
  open: Open
  close: () => void
}) {
  const flight = useMemo(() => fly(s.x, s.y, s.name), [fly, s.x, s.y, s.name])
  return (
    <div
      className="absolute"
      style={{
        left: `${s.x}%`,
        top: `${s.y}%`,
        // Put the dot (0.75rem, inside 0.25rem of padding) exactly on the star.
        translate: s.above ? '-50% calc(-100% + 0.625rem)' : '-50% -0.625rem'
      }}
    >
      <div
        data-node={starId(s.name)}
        className="will-change-transform"
        // Labels stay legible: stars shrink less than everything else.
        style={{ scale: 'max(0.85, var(--node-k, 1))' }}
      >
        <button
          type="button"
          onFocus={() => open({ kind: 'skill', id: s.name })}
          onBlur={close}
          onClick={() => open({ kind: 'skill', id: s.name })}
          aria-pressed={isActive}
          data-on={lit || undefined}
          className={cn(
            live && 'intro-piece',
            'board-node group relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 focus-ring transition-opacity duration-300',
            s.above ? 'flex-col-reverse' : 'flex-col'
          )}
          style={flight}
        >
          <span
            data-hit={`skill:${s.name}`}
            data-shape="circle"
            className={cn(
              'size-3 rounded-full border-2 border-foreground transition-[background-color,border-color] duration-200',
              lit ? 'border-brand bg-brand' : ACCENT_BG[AREAS[s.area].accent]
            )}
          />
          <span
            data-hit={`skill:${s.name}`}
            className={cn(
              'text-[13px] leading-tight font-medium whitespace-nowrap',
              lit
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
})

/** A satellite on the board, orbiting the Me node. */
const SatelliteNode = memo(function SatelliteNode({
  satellite: s,
  x,
  y,
  ox,
  oy,
  isActive,
  live,
  fly,
  open,
  close
}: {
  satellite: Satellite
  /** Its spot (% of the board), and its offset from the photo (px). */
  x: number
  y: number
  ox: number
  oy: number
  isActive: boolean
  live: boolean
  fly: Fly
  open: Open
  close: () => void
}) {
  const flight = useMemo(
    () => fly(x, y, s.kind, [ox, oy]),
    [fly, x, y, s.kind, ox, oy]
  )
  return (
    <div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%`, translate: '-50% -2.25rem' }}
    >
      <div
        data-node={satId(s.kind)}
        className="will-change-transform"
        style={{ scale: 'var(--node-k, 1)' }}
      >
        <a
          href={s.href}
          data-sat={s.kind}
          {...(s.kind === 'github' || s.kind === 'press'
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
          onFocus={() => open({ kind: 'satellite', id: s.kind })}
          onBlur={close}
          aria-label={
            s.kind === 'press'
              ? `Press: ${s.title}, ${s.detail}`
              : `${s.title}: ${s.detail}`
          }
          data-on={isActive || undefined}
          className={cn(
            live && 'intro-piece',
            'board-node group flex flex-col items-center rounded-lg p-1 focus-ring transition-opacity duration-300'
          )}
          style={flight}
        >
          <SatelliteDisc
            satellite={s}
            lit={isActive}
            hit={`satellite:${s.kind}`}
            className="size-16"
          />
          <span
            data-hit={`satellite:${s.kind}`}
            className={cn(
              'mt-1 text-xs font-semibold',
              isActive && 'text-link'
            )}
          >
            {s.label}
          </span>
        </a>
      </div>
    </div>
  )
})

/** The Me node. Clicking does nothing; a tap opens the About on touch screens. */
const MeNode = memo(function MeNode({
  me,
  meOpen,
  live,
  open,
  close
}: {
  me: readonly [number, number]
  meOpen: boolean
  live: boolean
  open: Open
  close: () => void
}) {
  return (
    <div
      className="absolute z-20"
      style={{
        left: `${me[0]}%`,
        top: `${me[1]}%`,
        translate: '-50% -4.5rem'
      }}
    >
      <div data-node={ME_ID} className="will-change-transform">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={meOpen}
          aria-describedby="me-about"
          onFocus={() => open({ kind: 'me' })}
          onBlur={close}
          onPointerUp={(e) => {
            if (e.pointerType !== 'mouse')
              if (meOpen) close()
              else open({ kind: 'me' })
          }}
          className={cn(
            live && 'intro-me',
            'flex w-max cursor-default flex-col items-center rounded-2xl pb-2 text-center focus-ring'
          )}
          // Scales with the layout, around the photo's centre.
          style={{
            transform: 'scale(var(--node-k, 1))',
            transformOrigin: '50% 4.5rem'
          }}
        >
          <Portrait
            hit="me"
            className={cn(
              'size-36 transition-[border-color,box-shadow] duration-300',
              meOpen &&
                'border-brand shadow-[0_0_0_8px_color-mix(in_oklab,var(--brand)_14%,transparent)]'
            )}
          />
          <p
            data-hit="me"
            className="mt-4 text-2xl font-semibold tracking-tight whitespace-nowrap"
          >
            {PROFILE.name}
          </p>
          <p
            data-hit="me"
            className="mt-1 text-sm whitespace-nowrap text-muted-foreground"
          >
            {PROFILE.role} · {PROFILE.location.split(',')[0]}
          </p>
        </div>

        {/* The bio, always in the markup; shown only while the Me node itself is hovered. */}
        <div
          id="me-about"
          role="tooltip"
          className={cn(
            'dark ink-pop pointer-events-none absolute left-1/2 w-[34rem] -translate-x-1/2 rounded-lg bg-background p-5 text-foreground shadow-pop transition-[opacity,translate] duration-200',
            meOpen ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          )}
          // Just under your name as drawn (the block above is scaled), at full size itself.
          style={{ top: 'calc(4.5rem + (100% - 4.5rem) * var(--node-k, 1))' }}
        >
          <About />
        </div>
      </div>
    </div>
  )
})

/* ---------- the constellation ---------- */

/** The bubble a Story's address names: /projects/<slug> or /work/<slug>. */
const slugAt = (path: string) =>
  path.match(/^\/(?:projects|work)\/([\w-]+)\/?$/)?.[1] ?? null

type OpenStory = { slug: string; instant: boolean; closing: boolean }

/** From `lg` up the board shows; below it, the column. */
const WIDE = '(min-width: 64rem)'
const onWideChange = (cb: () => void) => {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/**
 * Keeps only the layout this screen shows. The server sends both the board and the column (it
 * can't know the screen, and CSS hides the other one, so nothing flashes and the page reads the
 * same without JavaScript). In the browser, the one that isn't showing is never brought to life:
 * its server markup is left alone while the page hydrates, then dropped, so a phone doesn't carry
 * the whole board (or a laptop the column) in the page and in every render. If the window later
 * crosses the breakpoint, the other layout is built then, and both stay from there on.
 *
 * `children` is told whether its layout is arriving late like that (true) or was there from the
 * start (false).
 */
function OneLayout({
  wide,
  children
}: {
  wide: boolean
  children: (late: boolean) => ReactNode
}) {
  // Whether this layout was the hidden one when the page loaded (always false on the server).
  const [skipped] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia(WIDE).matches !== wide
  )
  // null on the server and while hydrating; then whether the screen shows this layout.
  const fits = useSyncExternalStore<boolean | null>(
    onWideChange,
    () => window.matchMedia(WIDE).matches === wide,
    () => null
  )
  const [kept, setKept] = useState(false)
  if (fits && !kept) setKept(true)

  if (fits === null)
    return skipped ? (
      // Hydrating the hidden layout: claim the server's markup as is, without rendering into it.
      <div
        className="contents"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: '' }}
      />
    ) : (
      <div className="contents">{children(false)}</div>
    )
  return fits || kept ? (
    <div className="contents">{children(skipped)}</div>
  ) : null
}

export function Constellation({
  skills,
  projects,
  work,
  satellites,
  stories,
  initialStory
}: {
  skills: Skill[]
  projects: Project[]
  work: WorkNode[]
  satellites: Satellite[]
  /** Every Story that has been written, by bubble slug. */
  stories: Record<string, Story>
  /** The Story the address opened (/projects/<slug>, /work/<slug>): open from the start, no intro. */
  initialStory?: string
}) {
  const layout = LAYOUT
  // The replay button plays the intro again by remounting the board.
  const [replays, setReplays] = useState(0)
  const stars = useMemo(() => layoutStars(layout, skills), [layout, skills])
  const bubbles = useMemo(
    () =>
      placeBubbles(layout, [
        ...work.map((w) => ({ ...w, kind: 'work' as const })),
        ...projects
          .filter((p) => !OFF_BOARD.includes(p.slug))
          .map((p) => ({ ...p, kind: 'project' as const }))
      ]),
    [layout, projects, work]
  )

  // The open Story, and whether this page put its address in the history (so closing can go Back).
  const [story, setStory] = useState<OpenStory | null>(
    initialStory ? { slug: initialStory, instant: true, closing: false } : null
  )
  const pushed = useRef(false)
  const openStory = useCallback((slug: string) => {
    if (window.location.pathname !== storyPath(slug)) {
      window.history.pushState(null, '', storyPath(slug))
      pushed.current = true
    }
    setStory({ slug, instant: false, closing: false })
  }, [])
  const closeStory = useCallback(
    () => setStory((s) => s && { ...s, closing: true }),
    []
  )
  const storyClosed = useCallback(() => {
    setStory(null)
    if (!slugAt(window.location.pathname)) return
    if (pushed.current) {
      pushed.current = false
      window.history.back()
    } else window.history.replaceState(null, '', '/')
  }, [])
  // Back and Forward open and close Stories too.
  useEffect(() => {
    const onPop = () => {
      const slug = slugAt(window.location.pathname)
      pushed.current = false
      setStory((s) =>
        slug
          ? s?.slug === slug
            ? s
            : { slug, instant: false, closing: false }
          : s && { ...s, closing: true }
      )
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const storyBubble = story && bubbles.find((b) => b.slug === story.slug)
  const storySlug = story?.slug
  const storySkills = useMemo(
    () => skills.filter((s) => storySlug && s.projects.includes(storySlug)),
    [skills, storySlug]
  )
  // While a Story is open the page behind it holds still (overlay.ts); it starts moving again as
  // the Story begins to close, so the panel lands on a bubble that's already drifting.
  const covering = Boolean(story && storyBubble && !story.closing)
  useLayoutEffect(() => {
    setPageCovered(covering)
    return () => setPageCovered(false)
  }, [covering])
  useEffect(() => {
    if (!storyBubble) return
    document.title = `${storyBubble.title} · ${PROFILE.name}`
    return () => {
      // Back to the home page's title (layout.tsx), even when the page loaded on a Story.
      document.title = `${PROFILE.name} · ${PROFILE.role}`
    }
  }, [storyBubble])

  return (
    <>
      <OneLayout wide>
        {(late) => (
          <Board
            key={replays}
            layout={layout}
            intro={INTRO}
            // Settled from the start when the page opened on a Story, or when the board first
            // appears because a narrow window was widened: the supernova is for arriving.
            skipIntro={(late || Boolean(initialStory)) && replays === 0}
            stars={stars}
            bubbles={bubbles}
            satellites={satellites}
            onOpenStory={openStory}
          />
        )}
      </OneLayout>

      <OneLayout wide={false}>
        {() => (
          <Column
            stars={stars}
            bubbles={bubbles}
            satellites={satellites}
            onOpenStory={openStory}
          />
        )}
      </OneLayout>

      {story && storyBubble && (
        <StoryPanel
          key={story.slug}
          bubble={storyBubble}
          story={stories[story.slug] ?? null}
          skills={storySkills}
          instant={story.instant}
          closing={story.closing}
          onRequestClose={closeStory}
          onClosed={storyClosed}
        />
      )}

      {/* Replay the supernova: beside the light/dark switch, on the full-screen board only. */}
      {INTRO.ms > 0 && (
        <button
          type="button"
          onClick={() => setReplays((n) => n + 1)}
          aria-label="Replay the opening animation"
          title="Replay"
          className="intro-chrome chrome-rim fixed right-[4.25rem] bottom-4 z-40 hidden size-10 items-center justify-center rounded-full border-2 text-foreground shadow-card-hover focus-ring transition-colors hover:border-foreground/40 lg:flex"
        >
          <PlayIcon weight="fill" className="size-4" aria-hidden />
        </button>
      )}
    </>
  )
}

/**
 * The constellation from `lg` up: one screen, Me node at the center. Memoized (as is Column): a
 * Story opening or closing over it changes nothing in it, so it isn't rendered again for that.
 */
const Board = memo(function Board({
  layout,
  intro,
  skipIntro,
  stars,
  bubbles: placed,
  satellites,
  onOpenStory
}: {
  layout: Layout
  intro: Intro
  /** Start settled, as if the intro had played (a Story opened from its address). */
  skipIntro: boolean
  stars: Star[]
  bubbles: Bubble[]
  satellites: Satellite[]
  onOpenStory: (slug: string) => void
}) {
  const [active, setActive] = useState<Active>(null)
  const { open, close } = useHoverIntent(setActive)

  const board = useRef<HTMLDivElement>(null)
  const size = useBoardSize(board)
  const ME = layout.me
  // One scale for the whole layout (distances and node sizes), from the board's size.
  const scale = layoutScale(layout, size.w, size.h)
  const boardSize = useMemo<[number, number]>(
    () => (size.w ? [size.w, size.h] : layout.reference),
    [size.w, size.h, layout.reference]
  )
  const bubbles = useMemo(
    () =>
      placed.map((b) => {
        const [x, y] = around(layout, b.r, b.deg, scale, boardSize)
        return { ...b, x, y }
      }),
    [placed, layout, scale, boardSize]
  )
  const linked = useMemo(
    () => linksOf(active, stars, satellites),
    [active, stars, satellites]
  )
  const activeStar =
    active?.kind === 'skill'
      ? stars.find((s) => s.name === active.id)
      : undefined
  const activeBubble =
    active?.kind === 'project'
      ? bubbles.find((p) => p.slug === active.id)
      : undefined
  const activeSat =
    active?.kind === 'satellite'
      ? satellites.find((s) => s.kind === active.id)
      : undefined
  const meOpen = active?.kind === 'me'

  // The intro plays once. After it's over every intro class and effect is dropped, so nothing
  // (resizing across the breakpoint, a re-render) can ever replay it.
  // The moment it blows: after the build-up and the core's brief collapse.
  const blast = intro.buildup + intro.kick
  // The cracks that split the core during the build-up: none at first, then more and more, each
  // a jagged line from near the centre to the rim.
  const cracks = useMemo(() => {
    const n = 16
    return Array.from({ length: n }, (_, i) => {
      const r = (k: string) => hash(`crack${i}/${k}`)
      const deg = r('a') * 360
      const t = (deg * Math.PI) / 180
      // Jagged: four hops outward, each knocked off line.
      let rad = 4 + r('r0') * 14
      let ang = t
      const pts: string[] = []
      for (let step = 0; step <= 4; step++) {
        pts.push(
          `${(50 + Math.sin(ang) * rad).toFixed(1)} ${(50 - Math.cos(ang) * rad).toFixed(1)}`
        )
        rad +=
          ((52 - rad) / (4 - Math.min(step, 3))) * (0.7 + r(`s${step}`) * 0.3)
        ang = t + (r(`j${step}`) - 0.5) * 0.5
      }
      // Sparse early, a flurry at the end: the √ crowds the later ones together.
      const at = Math.round(
        intro.buildup * (0.2 + 0.78 * Math.sqrt(i / (n - 1))) +
          (r('w') - 0.5) * 40
      )
      return {
        deg: Math.round(deg),
        path: `M${pts.join('L')}`,
        at,
        width: +(1 + r('w2') ** 2 * 2.5).toFixed(1),
        color: IRI[Math.floor(r('c') * IRI.length)]
      }
    })
  }, [intro.buildup])
  // Light breaking out through the cracks: beams that fire out of the core at random angles, race
  // far out and vanish, then fire again on their own uneven beat. None at first, then more and
  // more often, until the blast.
  const beams = useMemo(() => {
    const n = 36
    return Array.from({ length: n }, (_, i) => {
      const r = (k: string) => hash(`beam${i}/${k}`)
      return {
        // Some fire straight out of a crack, the rest anywhere.
        deg: Math.round(
          i < cracks.length && r('x') < 0.6
            ? cracks[i].deg + (r('a') - 0.5) * 12
            : r('a') * 360
        ),
        at: Math.round(intro.buildup * (0.25 + 0.75 * Math.sqrt(r('w')))),
        // One firing is the first part of this; the rest is dark, so each beam is sporadic.
        cycle: Math.round(160 + r('t') ** 1.5 * 520),
        width: +(1.2 + r('b') ** 3 * 4).toFixed(1),
        length: Math.round(50 + r('h') ** 2 * 240),
        reach: Math.round(160 + r('d') * 520),
        color: IRI[Math.floor(r('c') * IRI.length)]
      }
    })
  }, [cracks, intro.buildup])
  const introTotal =
    blast + intro.spread + intro.ms * (1.1 + 0.35 * intro.chaos) + 394
  // Hover comes back as soon as the nodes are out on the board (mostly flown, still settling), long
  // before the rest of the intro is done.
  const readyAt = blast + intro.spread * 0.5 + intro.ms * 0.4
  const [played, setPlayed] = useState(skipIntro)
  const [ready, setReady] = useState(skipIntro || readyAt <= 0)
  const live = !played

  // The intro doubles as the loader. Until the page has loaded (scripts, fonts, your photo), the
  // board waits: only a small core shows, churning softly, with everything else held at its first
  // frame (globals.css, .intro-wait). Once loaded (or after a few seconds at most), the whole
  // supernova plays from the start, and its timers start with it, so the burst is never lost to a
  // busy page.
  const [waiting, setWaiting] = useState(!skipIntro)
  // How far into the intro to pick up when the wait ends (ms): the core keeps swelling while it
  // waits (globals.css, core-grow), so the intro carries on from the size it has reached instead of
  // shrinking back to the start.
  const startAt = useRef(0)
  useEffect(() => {
    if (!waiting) return
    let raf = 0
    const go = () => {
      window.removeEventListener('load', go)
      const core = board.current?.querySelector<HTMLElement>('.intro-core')
      const size = core ? parseFloat(getComputedStyle(core).scale) || 0 : 0
      startAt.current = Math.round(
        coreTimeAt(size) * (intro.buildup + intro.kick + 450)
      )
      raf = requestAnimationFrame(() => setWaiting(false))
    }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go)
    const cap = window.setTimeout(go, 6000)
    return () => {
      window.removeEventListener('load', go)
      window.clearTimeout(cap)
      cancelAnimationFrame(raf)
    }
  }, [waiting, intro.buildup, intro.kick])
  // The wait is over: every intro animation (on the board, and the page's controls) jumps to where
  // the core had got to, and the timers start from there too.
  useLayoutEffect(() => {
    if (waiting) return
    const el = board.current
    const t = startAt.current
    if (el && t > 0)
      for (const a of document.getAnimations()) {
        const target = (a.effect as KeyframeEffect | null)?.target
        if (
          a instanceof CSSAnimation &&
          target &&
          (el.contains(target) || target.classList.contains('intro-chrome'))
        )
          a.currentTime = t
      }
    const timers = [
      window.setTimeout(() => setReady(true), Math.max(0, readyAt - t)),
      window.setTimeout(() => setPlayed(true), Math.max(0, introTotal - t))
    ]
    return () => timers.forEach((x) => window.clearTimeout(x))
  }, [waiting, readyAt, introTotal])
  const on = (cls: string) => (live ? cls : '')

  // The intro: each node is thrown out from the Me node (by `burst`), nearer ones first, and with
  // `chaos` each one goes its own way: its own speed and start, a spin, a curve off the straight
  // line, a different size at the start and a harder or softer overshoot. Seeded by the node's id,
  // so it's the same on the server and in the browser.
  const delayAt = useCallback(
    (x: number, y: number) =>
      Math.round(
        (Math.hypot((x - ME[0]) * 1.6, y - ME[1]) / Math.hypot(50 * 1.6, 50)) *
          intro.spread
      ),
    [ME, intro.spread]
  )
  // `px` gives a satellite's offset from the photo in px, which (unlike its % spot) is known
  // before the board is measured, so its flight never changes mid-air.
  const fly: Fly = useCallback(
    (x, y, id, px) => {
      if (!live) return NO_FLIGHT
      const c = intro.chaos
      const r = (k: string) => hash(`${id}/${k}`) - 0.5 // -0.5 … 0.5
      const dx = px ? px[0] : (x - ME[0]) * 1.6
      const dy = px ? px[1] : y - ME[1]
      const len = Math.hypot(dx, dy) || 1
      const swirl = r('swirl') * 140 * c // px, across the line of flight
      const at: [number, number] = px ? ME : [x, y]
      const vars: Record<string, string> = {
        ...(px
          ? {
              '--gx': (-px[0] * intro.burst).toFixed(1),
              '--gy': (-px[1] * intro.burst).toFixed(1)
            }
          : {
              '--fx': ((ME[0] - x) * intro.burst).toFixed(2),
              '--fy': ((ME[1] - y) * intro.burst).toFixed(2)
            }),
        '--sx': ((-dy / len) * swirl).toFixed(1),
        '--sy': ((dx / len) * swirl).toFixed(1),
        '--spin': `${(r('spin') * 80 * c).toFixed(1)}deg`,
        '--s0': Math.min(
          0.9,
          intro.scale * (1 + (r('size') + 0.5) * 4 * c)
        ).toFixed(2),
        '--ov': (intro.overshoot * (1 + r('kick') * 1.2 * c)).toFixed(2),
        '--dur': `${Math.round(intro.ms * (1.1 + r('speed') * 0.7 * c))}ms`,
        '--intro-delay': `${Math.max(0, Math.round(blast + delayAt(at[0], at[1]) + r('start') * 123 * c))}ms`
      }
      return vars as CSSProperties
    },
    [live, intro, ME, blast, delayAt]
  )
  // An area's title starts fading in as its stars arrive and finishes as they settle.
  const titleDelay = (x: number, y: number) =>
    Math.round(blast + delayAt(x, y) + intro.ms * 0.3)
  // The page's controls fade in alongside the titles (at a typical title's moment).
  const chromeDelay = Math.round(blast + intro.spread * 0.5 + intro.ms * 0.3)

  // The debris: each spark's own direction, distance, size, colour, speed, start, how bright it
  // stays as dust and how fast it twinkles. Seeded, so it's the same everywhere.
  const sparks = useMemo(
    () =>
      Array.from({ length: intro.debris }, (_, i) => {
        const r = (k: string) => hash(`spark${i}/${k}`)
        const a = (i / intro.debris) * Math.PI * 2 + r('a') * 0.9
        const dist = 150 + r('d') ** 0.8 * 620
        return {
          id: `spark:${i}`,
          dx: Math.round(Math.cos(a) * dist),
          dy: Math.round(Math.sin(a) * dist * 0.7),
          size: Math.round((2 + r('s') * 4) * 10) / 10,
          tone: SPARK_TONES[Math.floor(r('c') * SPARK_TONES.length)],
          speed: 0.8 + r('t') * 1.0,
          wait: Math.round(r('w') * 70),
          rest: Math.round((0.18 + r('o') * 0.32) * 100) / 100,
          twinkle: Math.round(1800 + r('k') * 3200)
        }
      }),
    [intro.debris]
  )

  // A satellite's offset from the photo (px), from the layout, scaled with the board.
  const satOffset = (kind: Satellite['kind']): [number, number] => {
    const { r, deg } = layout.satellites[kind]
    return [
      r * scale * Math.cos((deg * Math.PI) / 180),
      r * scale * Math.sin((deg * Math.PI) / 180)
    ]
  }

  // Satellites and bubbles both sit a scaled distance from the photo, so the layout keeps its shape.
  const satPos = useMemo(() => {
    const m: Record<string, [number, number]> = {}
    for (const s of satellites) {
      const { r, deg } = layout.satellites[s.kind]
      m[s.kind] = around(layout, r, deg, scale, boardSize)
    }
    return m
  }, [satellites, scale, boardSize, layout])

  const motionNodes = useMemo(() => {
    const m: Record<string, MotionNode> = {}
    // The Me node leans toward the cursor too, heavier than the rest so it moves the least.
    m[ME_ID] = {
      x: ME[0],
      y: ME[1],
      weight: 0.5,
      r: 72 * scale,
      reach: REACH.me,
      pullReach: 30,
      travel: 3
    }
    for (const s of satellites) {
      const [x, y] = satPos[s.kind]
      m[satId(s.kind)] = {
        x,
        y,
        weight: 0.8,
        r: 32 * scale,
        reach: REACH.satellite,
        // The same long, soft approach as a star, moving a little less.
        pullReach: 30,
        travel: 4
      }
    }
    for (const s of stars)
      m[starId(s.name)] = {
        x: s.x,
        y: s.y,
        weight: 1,
        r: 6,
        reach: REACH.skill,
        // Stars sit close together: a shorter pull keeps neighbours from meeting.
        travel: STAR_TRAVEL
      }
    for (const n of bubbles)
      m[bubbleId(n.slug)] = {
        x: n.x,
        y: n.y,
        weight: 0.6,
        r: BUBBLE_STYLE[n.size].disc * 8 * scale,
        reach: REACH.project,
        // Heavier than a star: pulled from as far, but moving a little less.
        pullReach: 30,
        travel: 4
      }
    // Dust is light: it floats a little more than a star and the cursor pulls it from farther off.
    if (size.w)
      for (const sp of sparks)
        m[sp.id] = {
          x: ME[0] + (sp.dx / size.w) * 100,
          y: ME[1] + (sp.dy / size.h) * 100,
          weight: 1.2,
          r: 3,
          reach: 34
        }
    return m
  }, [stars, bubbles, satellites, satPos, ME, sparks, size, scale])

  const activeId = activeStar
    ? starId(activeStar.name)
    : activeBubble
      ? bubbleId(activeBubble.slug)
      : activeSat
        ? satId(activeSat.kind)
        : meOpen
          ? ME_ID
          : null
  // Only what's actually on the board: a skill can name a project kept off it (Branch).
  const linkedIds = useMemo(
    () =>
      new Set(
        [
          ...[...linked.skills].map(starId),
          ...[...linked.projects].map(bubbleId)
        ].filter((id) => id in motionNodes)
      ),
    [linked, motionNodes]
  )

  useCursorGravity(board, motionNodes, activeId, ready)
  useIntentHover(board, active, setActive, ready)
  const { w, h } = size
  const px = (id: string) => {
    const n = motionNodes[id]
    return { x: (n.x / 100) * w, y: (n.y / 100) * h }
  }

  // The lines: each area's figure always; the active node's links on hover.
  const fixedLines = useMemo<{ a: string; b: string }[]>(
    () =>
      Object.keys(AREAS).flatMap((area) => {
        const list = stars.filter((s) => s.area === area)
        return figure(list, w && h ? w / h : 1.6).map(([a, b]) => ({
          a: starId(list[a].name),
          b: starId(list[b].name)
        }))
      }),
    [stars, w, h]
  )
  const hoverLines: { a: string; b: string }[] =
    activeId && activeId in motionNodes
      ? [...linkedIds].map((id) => ({ a: activeId, b: id }))
      : []

  // The areas holding the active star, or the stars the active bubble used.
  const litAreas = new Set(
    stars
      .filter((s) => activeStar?.name === s.name || linked.skills.has(s.name))
      .map((s) => s.area as string)
  )

  const anchor = activeStar ?? activeBubble
  const satAnchor = activeSat ? satPos[activeSat.kind] : undefined

  return (
    <div
      ref={board}
      className={cn(
        'relative hidden h-dvh min-h-[46rem] w-full overflow-x-clip lg:block',
        live && intro.shake > 0 && 'intro-shake',
        // Held at its first frame until the page has loaded (see `waiting`).
        live && waiting && 'intro-wait',
        // Nothing on the board can be hovered or clicked until it has landed.
        !ready && 'intro-lock [&_*]:pointer-events-none'
      )}
      // While something is hovered, everything unrelated dims (globals.css, .board-node).
      data-hovering={active !== null || undefined}
      style={
        {
          '--node-k': scale,
          '--intro-kick': `${intro.kick}ms`,
          '--intro-build': `${intro.buildup}ms`,
          '--intro-blast': `${blast}ms`,
          '--intro-ms': `${intro.ms}ms`,
          '--intro-scale': intro.scale,
          '--intro-overshoot': intro.overshoot,
          '--shake': intro.shake
        } as CSSProperties
      }
      onClick={(e) => {
        // A click just off a satellite, while it's the one lit, follows its link.
        if (active?.kind !== 'satellite') return
        if ((e.target as Element).closest('a,button,[role=button],#me-about'))
          return
        board.current
          ?.querySelector<HTMLAnchorElement>(`a[data-sat="${active.id}"]`)
          ?.click()
      }}
    >
      {w > 0 && (
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden
          focusable="false"
        >
          <FigureLines
            lines={fixedLines}
            nodes={motionNodes}
            w={w}
            h={h}
            // Each line of a figure catches at its own moment, like a constellation lighting up.
            introAt={live ? blast + intro.lines : null}
            chaos={intro.chaos}
          />
          {hoverLines.map((l) => {
            const A = px(l.a)
            const B = px(l.b)
            return (
              <g key={`${l.a}-${l.b}`}>
                <line
                  data-a={l.a}
                  data-b={l.b}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  className="stroke-brand/35"
                  strokeWidth={2}
                />
                <line
                  data-a={l.a}
                  data-b={l.b}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  className="constellation-flow stroke-brand"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* The intro's light: a screen-wide bloom, a flash at the core, and a shockwave that runs
          off every edge of the screen. All gone in well under a second. */}
      {/* Debris: sparks thrown out by the blast that stay on as faint, twinkling dust, floating and
          pulled by the cursor like everything else. */}
      <Dust sparks={sparks} me={ME} live={live} ms={intro.ms} blast={blast} />
      {/* The build-up: a churning ball of colour where your photo will be, light gathering
          around it and specks falling into it. At the blast it bursts and your photo is there. */}
      {live && intro.buildup > 0 && (
        <>
          <span
            aria-hidden
            className="intro-core pointer-events-none absolute z-30 size-36 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ME[0]}%`, top: `${ME[1]}%` }}
          >
            {/* The light around the orb: none while it's sealed, flaring as it cracks (an opacity
                fade, so it stays smooth). */}
            <span className="core-glow absolute -inset-1/2 rounded-full" />
            {/* Light breaking out: nothing at first, then beams fire out of the core at random,
                racing far out and vanishing, more and more often toward the blast. */}
            {beams.map((b, i) => (
              <span
                key={`beam${i}`}
                // Every other beam is left out on low-end devices (.lite).
                data-extra={i % 2 === 1 || undefined}
                className="absolute top-1/2 left-1/2"
                style={{ rotate: `${b.deg}deg` }}
              >
                <span
                  className="core-beam absolute"
                  style={
                    {
                      width: `${b.width}px`,
                      height: `${b.length}px`,
                      '--ray-color': `var(--iri-${b.color})`,
                      '--reach': `${-b.reach}px`,
                      animationDuration: `${b.cycle}ms`,
                      animationDelay: `${b.at}ms`
                    } as CSSProperties
                  }
                />
              </span>
            ))}
            {/* The orb: polished chrome with blobs of light lurching around inside it. */}
            <span className="core-orb absolute inset-0 overflow-hidden rounded-full">
              {[
                // [colour, blend]: dark reflections and coloured light thrash around under bright
                // highlights, the way a chrome ball throws its surroundings back.
                [
                  'radial-gradient(circle, #23262c 0%, transparent 62%)',
                  'normal'
                ],
                [
                  'radial-gradient(circle, var(--iri-magenta) 0%, transparent 58%)',
                  'normal'
                ],
                [
                  'radial-gradient(circle, var(--iri-cyan) 0%, transparent 58%)',
                  'screen'
                ],
                [
                  'radial-gradient(circle, #fbfcfd 0%, transparent 52%)',
                  'screen'
                ],
                [
                  'radial-gradient(circle, var(--iri-violet) 0%, transparent 60%)',
                  'normal'
                ],
                [
                  'radial-gradient(circle, var(--iri-gold) 0%, transparent 55%)',
                  'screen'
                ],
                [
                  'radial-gradient(circle, #3a3f48 0%, transparent 58%)',
                  'normal'
                ],
                [
                  'radial-gradient(circle, var(--iri-mint) 0%, transparent 55%)',
                  'screen'
                ],
                [
                  'radial-gradient(circle, #fbfcfd 0%, transparent 46%)',
                  'screen'
                ]
              ].map(([bg, blend], i) => {
                const r = (k: string) => hash(`blob${i}/${k}`) - 0.5
                const j = (k: string) => `${Math.round(r(k) * 70)}%`
                return (
                  <span
                    key={i}
                    // A soft gradient, no blur filter: blurring nine moving layers is costly.
                    data-extra={i > 4 || undefined}
                    className="core-blob absolute inset-[-25%]"
                    style={
                      {
                        background: bg,
                        mixBlendMode: blend as CSSProperties['mixBlendMode'],
                        '--j1x': j('1x'),
                        '--j1y': j('1y'),
                        '--j2x': j('2x'),
                        '--j2y': j('2y'),
                        '--j3x': j('3x'),
                        '--j3y': j('3y'),
                        animationDuration: `${Math.round(201 + (r('t') + 0.5) * 228)}ms`
                      } as CSSProperties
                    }
                  />
                )
              })}
              {/* The white-hot centre, pulsing. */}
              <span className="core-heart absolute inset-[30%] rounded-full bg-[radial-gradient(circle,#fbfcfd_0%,color-mix(in_oklab,#fbfcfd_60%,transparent)_40%,transparent_70%)] blur-sm" />
              {/* The cracks themselves: jagged white-hot lines splitting the shell, each one opening
                  at its own moment. */}
              <svg
                viewBox="0 0 100 100"
                data-extra
                className="core-cracks absolute inset-0 size-full overflow-visible"
              >
                {cracks
                  .filter((_, i) => i % 2 === 0)
                  .map((c, i) => (
                    <path
                      key={i}
                      d={c.path}
                      pathLength={1}
                      className="core-crack"
                      style={
                        {
                          '--crack-color': `var(--iri-${c.color})`,
                          strokeWidth: 0.6 + c.width * 0.25,
                          animationDelay: `${c.at}ms`
                        } as CSSProperties
                      }
                    />
                  ))}
              </svg>
            </span>
          </span>
          <span
            aria-hidden
            className="intro-halo pointer-events-none absolute size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--iri-violet)_35%,white)_0%,color-mix(in_oklab,var(--iri-cyan)_26%,transparent)_30%,color-mix(in_oklab,var(--iri-magenta)_16%,transparent)_48%,transparent_68%)]"
            style={{ left: `${ME[0]}%`, top: `${ME[1]}%` }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: `${ME[0]}%`, top: `${ME[1]}%` }}
          >
            {Array.from({ length: 16 }, (_, i) => {
              const r = (k: string) => hash(`mote${i}/${k}`)
              const a = (i / 16) * Math.PI * 2 + r('a')
              const dist = 140 + r('d') * 220
              const dur = intro.buildup * (0.45 + r('t') * 0.45)
              const size = 2 + r('s') * 3
              return (
                <span
                  key={i}
                  className="intro-mote absolute rounded-full"
                  style={
                    {
                      width: size,
                      height: size,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      background: `var(--spark-${SPARK_TONES[i % SPARK_TONES.length]})`,
                      '--mx': `${Math.round(Math.cos(a) * dist)}px`,
                      '--my': `${Math.round(Math.sin(a) * dist * 0.75)}px`,
                      animationDuration: `${Math.round(dur)}ms`,
                      // Each lands in the core just before (or right at) the collapse.
                      animationDelay: `${Math.round(blast - dur - r('w') * 105)}ms`
                    } as CSSProperties
                  }
                />
              )
            })}
          </span>
        </>
      )}
      {live && intro.bloom && (
        <span
          aria-hidden
          className="intro-bloom pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${ME[0]}% ${ME[1]}%, color-mix(in oklab, var(--brand) 30%, white) 0%, color-mix(in oklab, var(--brand) 22%, transparent) 26%, color-mix(in oklab, var(--brand) 8%, transparent) 50%, transparent 78%)`
          }}
        />
      )}
      {live && intro.flash && (
        <span
          aria-hidden
          className="intro-flash pointer-events-none absolute size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fbfcfd_0%,color-mix(in_oklab,var(--iri-cyan)_45%,white)_16%,color-mix(in_oklab,var(--iri-violet)_40%,transparent)_32%,color-mix(in_oklab,var(--iri-magenta)_22%,transparent)_48%,transparent_70%)]"
          style={{ left: `${ME[0]}%`, top: `${ME[1]}%` }}
        />
      )}
      {live && intro.shockwave && (
        <>
          <span
            aria-hidden
            className="intro-shock pointer-events-none absolute size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-brand/70"
            style={{ left: `${ME[0]}%`, top: `${ME[1]}%` }}
          />
          <span
            aria-hidden
            data-extra
            className="intro-shock intro-shock-2 pointer-events-none absolute size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/40"
            style={{ left: `${ME[0]}%`, top: `${ME[1]}%` }}
          />
        </>
      )}

      {/* Area labels: plain text at each cluster's heart. An area with a lit star stays bright
          (and strengthens), so you can always see which area a skill belongs to. */}
      {Object.entries(layout.areas).map(([area, hub]) => (
        <p
          key={area}
          className={cn(
            on('intro-label'),
            'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-[opacity,color] duration-300',
            litAreas.has(area)
              ? 'text-foreground'
              : cn('text-muted-foreground', active && 'opacity-40')
          )}
          style={
            {
              left: `${hub[0]}%`,
              top: `${hub[1]}%`,
              // Fade in as the area's stars land around it.
              '--intro-label-delay': `${titleDelay(hub[0], hub[1])}ms`
            } as CSSProperties
          }
        >
          {area}
        </p>
      ))}

      {/* Bubbles: work and projects around the Me node. */}
      {bubbles.map((b) => (
        <BubbleNode
          key={b.slug}
          bubble={b}
          lit={activeBubble?.slug === b.slug || linked.projects.has(b.slug)}
          live={live}
          fly={fly}
          open={open}
          close={close}
          onOpen={onOpenStory}
        />
      ))}

      {/* Stars. */}
      {stars.map((s) => {
        const isActive = activeStar?.name === s.name
        return (
          <StarNode
            key={s.name}
            star={s}
            isActive={isActive}
            lit={isActive || linked.skills.has(s.name)}
            live={live}
            fly={fly}
            open={open}
            close={close}
          />
        )
      })}

      {/* Satellites, orbiting the Me node. */}
      {satellites.map((s) => {
        const [x, y] = satPos[s.kind]
        const [ox, oy] = satOffset(s.kind)
        return (
          <SatelliteNode
            key={s.kind}
            satellite={s}
            x={x}
            y={y}
            ox={ox}
            oy={oy}
            isActive={activeSat?.kind === s.kind}
            live={live}
            fly={fly}
            open={open}
            close={close}
          />
        )
      })}

      {/* The Me node. Clicking does nothing; a tap opens the About on touch screens. */}
      <MeNode me={ME} meOpen={meOpen} live={live} open={open} close={close} />

      {/* The ink popover beside the active star, bubble or satellite. */}
      {(anchor || satAnchor) && (
        <div
          role="tooltip"
          className={cn(
            'dark ink-pop pointer-events-none absolute z-30 w-80 rounded-lg bg-background p-4 text-foreground shadow-pop',
            (anchor?.y ?? satAnchor![1]) > 60 && '-translate-y-full',
            // Toward the middle for stars and bubbles; outward for satellites, clear of the Me node.
            (anchor ? anchor.x > 50 : satAnchor![0] < 50) && '-translate-x-full'
          )}
          style={(() => {
            const [x, y] = anchor ? [anchor.x, anchor.y] : satAnchor!
            const left = anchor ? x > 50 : x < 50
            const gap = activeBubble
              ? `${BUBBLE_STYLE[activeBubble.size].disc / 2 + 1}rem`
              : activeSat
                ? '2.5rem'
                : '1.5rem'
            return {
              left: `calc(${x}% ${left ? '-' : '+'} ${gap})`,
              top: `calc(${y}% ${y > 60 ? '- 0.5rem' : '+ 0.5rem'})`
            }
          })()}
        >
          <Explain
            star={activeStar}
            bubble={activeBubble}
            satellite={activeSat}
            bubbles={bubbles}
            stars={stars}
          />
        </div>
      )}

      {/* The page's own controls (this hint, the replay button and the theme switch, which sit
          outside the board) stay hidden through the build-up and fade in with the area titles, so
          the screen is clear while the supernova grows. Full-screen board only. */}
      {/* Without JavaScript nothing would ever end the wait, so let the intro play as it is. */}
      <noscript>
        <style>{`.intro-wait, .intro-wait *, .intro-chrome { animation-play-state: running !important; }`}</style>
      </noscript>
      {live && intro.buildup > 0 && (
        <style>{`@media (min-width: 64rem) and (prefers-reduced-motion: no-preference) { .intro-chrome { animation: intro-fade ${Math.round(intro.ms * 0.6)}ms ease-out ${chromeDelay}ms backwards; } }`}</style>
      )}
      <p className="intro-chrome pointer-events-none absolute bottom-4 left-5 text-xs text-muted-foreground/80">
        Hover anything to see how it connects.
      </p>
    </div>
  )
})

/* ---------- below lg: the column ---------- */

/** Down the page in the board's order: Jackson's own projects first. */
const ORDER = [
  'waltz',
  'anyform',
  'cratest',
  'oracle',
  'trailblaze',
  'koistream',
  'careerfoundry',
  'tedx',
  'branch'
]
const rank = (slug: string) =>
  ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length

/**
 * Where each bubble sits in the honeycomb: a 6-column grid where each bubble spans 2, in rows of
 * three and two, the rows of two shifted half a step so they nest between the rows of three.
 */
function honeycombColumn(i: number) {
  const cycle = i % 5
  return cycle < 3 ? 1 + cycle * 2 : 2 + (cycle - 3) * 2
}

type Picked = { kind: 'me' } | { kind: 'star'; name: string }

/**
 * The constellation for phones and small tablets, made to be tapped, not hovered. Your photo, name
 * and role up top with the satellites; then work and projects packed in a honeycomb; then each skill
 * area as a cluster of stars. Tap a bubble and its Story opens; tap your photo or a star and a
 * sheet rises from the bottom with what it is and what it connects to (a star's bubbles as chips
 * that open their Stories); the page behind lights up whatever's related. Gentle drift only.
 */
const Column = memo(function Column({
  stars,
  bubbles,
  satellites,
  onOpenStory
}: {
  stars: Star[]
  bubbles: Bubble[]
  satellites: Satellite[]
  onOpenStory: (slug: string) => void
}) {
  const [picked, setPicked] = useState<Picked | null>(null)
  // Stable, so the sheet's open effect (focus and the Escape key) runs once per opening.
  const closeSheet = useCallback(() => setPicked(null), [])
  const ranked = [...bubbles].sort((a, b) => rank(a.slug) - rank(b.slug))
  const pickedStar =
    picked?.kind === 'star'
      ? stars.find((s) => s.name === picked.name)
      : undefined

  // What lights up on the page behind the sheet.
  const litStars = new Set(pickedStar ? [pickedStar.name] : [])
  const litBubbles = new Set(pickedStar ? pickedStar.projects : [])

  return (
    <div className="px-5 pt-10 pb-28 lg:hidden">
      {/* You. */}
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => setPicked({ kind: 'me' })}
          aria-label={`About ${PROFILE.name}`}
          className="constellation-drift rounded-full focus-ring"
        >
          <Portrait
            className={cn(
              'size-28 border-[3px]',
              picked?.kind === 'me' && LIT_RING
            )}
          />
        </button>
        <p className="mt-3 text-2xl font-semibold tracking-tight">
          {PROFILE.name}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {PROFILE.role} · {PROFILE.location}
        </p>
        <ul className="mt-5 flex justify-center gap-5">
          {satellites.map((s) => (
            <li key={s.kind}>
              <a
                href={s.href}
                {...(s.kind === 'github' || s.kind === 'press'
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                aria-label={
                  s.kind === 'press'
                    ? `Press: ${s.title}, ${s.detail}`
                    : `${s.title}: ${s.detail}`
                }
                className="flex flex-col items-center rounded-lg p-1 focus-ring"
              >
                <SatelliteDisc satellite={s} className="size-14" />
                <span className="mt-1 text-xs font-semibold">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Tap anything to see how it connects.
        </p>
      </div>

      {/* Work and projects, packed in a honeycomb. */}
      <h2 className="mt-10 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Work & projects
      </h2>
      <ul className="mx-auto mt-4 grid max-w-sm grid-cols-6 gap-x-1 gap-y-3">
        {ranked.map((b, i) => {
          const on = litBubbles.has(b.slug)
          return (
            <li
              key={b.slug}
              className="col-span-2"
              style={{ gridColumnStart: honeycombColumn(i) }}
            >
              <a
                href={storyPath(b.slug)}
                onClick={(e) => {
                  e.preventDefault()
                  onOpenStory(b.slug)
                }}
                className={cn(
                  'flex w-full flex-col items-center rounded-xl p-1 text-center focus-ring transition-opacity duration-300',
                  picked && !on && 'opacity-45'
                )}
              >
                <BubbleDisc
                  bubble={b}
                  rem={4.5}
                  lit={on}
                  className="constellation-drift"
                />
                <span
                  className={cn(
                    'mt-1.5 text-xs leading-tight font-semibold',
                    on && 'text-link'
                  )}
                >
                  {b.title}
                </span>
                {bubbleWhen(b) && (
                  <span className="mt-0.5 text-[0.6875rem] leading-tight text-muted-foreground">
                    {bubbleWhen(b)}
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ul>

      {/* Skills: each area a cluster of stars. */}
      <div className="mt-10 space-y-7">
        {Object.entries(AREAS).map(([area, { accent }]) => {
          const list = stars.filter((s) => s.area === area)
          return (
            <section key={area}>
              <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {area}
              </h2>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {list.map((s) => {
                  const on = litStars.has(s.name)
                  return (
                    <li key={s.name}>
                      <button
                        type="button"
                        onClick={() =>
                          setPicked({ kind: 'star', name: s.name })
                        }
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium focus-ring transition-[opacity,border-color,background-color] duration-300',
                          on
                            ? 'border-brand bg-brand/10 text-link'
                            : 'border-border bg-card/70',
                          picked && !on && 'opacity-45'
                        )}
                      >
                        <span
                          className={cn(
                            'size-2.5 shrink-0 rounded-full border border-foreground/60',
                            on ? 'border-brand bg-brand' : ACCENT_BG[accent]
                          )}
                          aria-hidden
                        />
                        {s.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <Sheet
        picked={picked}
        star={pickedStar}
        bubbles={ranked}
        onOpenStory={(slug) => {
          setPicked(null)
          onOpenStory(slug)
        }}
        onClose={closeSheet}
      />
    </div>
  )
})

/**
 * The sheet that rises from the bottom on mobile: what's tapped, and its connections as chips that
 * open in place. Closes with its ✕, a swipe down, a tap above it or Escape. The page behind is
 * locked while it's up.
 */
function Sheet({
  picked,
  star,
  bubbles,
  onOpenStory,
  onClose
}: {
  picked: Picked | null
  star?: Star
  bubbles: Bubble[]
  onOpenStory: (slug: string) => void
  onClose: () => void
}) {
  const close = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const open = picked !== null
  useEffect(() => {
    if (!open) return
    close.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useBodyLock(open)
  useSwipeToClose(sheet, scrim, open, onClose)

  // A new pick starts at the top of the sheet.
  useEffect(() => {
    sheet.current?.scrollTo({ top: 0 })
  }, [picked])

  return (
    <>
      <div
        ref={scrim}
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 touch-none bg-[rgb(12_13_16/0.35)] transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label={
          star?.name ??
          (picked?.kind === 'me' ? `About ${PROFILE.name}` : 'Details')
        }
        inert={!open}
        className={cn(
          'dark ink-pop fixed inset-x-0 bottom-0 z-50 max-h-[70dvh] overflow-y-auto overscroll-contain rounded-t-2xl bg-background px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-foreground shadow-pop transition-transform duration-300 ease-out lg:hidden',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20"
          aria-hidden
        />
        <button
          ref={close}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-4 rounded-full px-2 py-1 text-lg leading-none text-muted-foreground focus-ring"
        >
          ✕
        </button>

        {picked?.kind === 'me' && <About />}

        {star && (
          <>
            <p className="pr-8 text-xs font-medium text-muted-foreground">
              {star.area}
            </p>
            <p className="text-lg font-semibold">{star.name}</p>
            <p className="mt-2 text-sm text-pretty text-foreground/85">
              {star.explanation}
            </p>
            {star.projects.length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  Used in
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {bubbles
                    .filter((b) => star.projects.includes(b.slug))
                    .map((b) => (
                      <li key={b.slug}>
                        <button
                          type="button"
                          onClick={() => onOpenStory(b.slug)}
                          className="flex items-center gap-2 rounded-full bg-foreground/10 py-1 pr-3 pl-1 text-sm font-medium focus-ring"
                        >
                          <BubbleDisc bubble={b} rem={1.75} />
                          {b.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
