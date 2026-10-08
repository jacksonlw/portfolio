/**
 * The sketch style's building blocks (README.md beside this file): wobbly ink, off-register
 * colour, a hand, and the small extras. Everything is deterministic for a given seed.
 */
import { animProps, fill, type Fill, type Motion } from '../primitives/anim'
import { shift, smoothPath, wobble, type Pt } from './curve'

/** How far colour sits off its ink line by default: a sliver of paper on one side. */
export const OFFSET: Pt = [5, 4]

/** An ink stroke through the points, smoothed and wobbled. `thin` is for creases and stripes. */
export function Ink({
  points,
  closed = false,
  jitter = 1,
  seed = 1,
  thin = false,
  tension = 1,
  ...motion
}: {
  points: readonly Pt[]
  closed?: boolean
  jitter?: number
  seed?: number
  thin?: boolean
  tension?: number
} & Motion) {
  return (
    <path
      {...animProps(motion)}
      className={`ill-f-none ill-s${thin ? 'ill-s-thin' : ''}`}
      pathLength={motion.anim === 'draw' ? 1 : undefined}
      d={smoothPath(wobble(points, jitter, seed), closed, tension)}
    />
  )
}

/** A flat colour shape through the points, offset off register, with no outline. */
export function Fill({
  points,
  tone,
  offset = OFFSET,
  jitter = 1.5,
  seed = 7,
  ...motion
}: {
  points: readonly Pt[]
  tone: Fill
  offset?: Pt
  jitter?: number
  seed?: number
} & Motion) {
  return (
    <path
      {...animProps(motion)}
      className={fill(tone)}
      d={smoothPath(
        wobble(shift(points, offset[0], offset[1]), jitter, seed),
        true
      )}
    />
  )
}

/**
 * The common case: a colour shape and its ink outline from the same points. `paper` puts a paper
 * fill exactly under the ink as well, so the shape hides what's behind it.
 */
export function Shape({
  points,
  tone,
  paper = false,
  offset,
  seed = 1,
  jitter = 1,
  tension = 1
}: {
  points: readonly Pt[]
  tone?: Fill
  paper?: boolean
  offset?: Pt
  seed?: number
  jitter?: number
  /** 1 is a smooth curve; lower keeps corners (spikes, tails). */
  tension?: number
}) {
  const d = smoothPath(wobble(points, jitter, seed), true, tension)
  return (
    <g>
      {paper && <path className="ill-f-paper" d={d} />}
      {tone && (
        <Fill points={points} tone={tone} offset={offset} seed={seed + 11} />
      )}
      <path className="ill-f-none ill-s" d={d} />
    </g>
  )
}

/**
 * A hand on a short, floating sleeve, gripping something about 18 units past the wrist. Placed by
 * its wrist point and the angle it points at (degrees, 0 = right). The sleeve is 30 units with a
 * rounded far end, so the whole hand stays inside the frame. `stripes` draws bands on the sleeve.
 */
export function Hand({
  x,
  y,
  angle = 0,
  sleeve,
  stripes = false,
  seed = 3,
  flip = false
}: {
  x: number
  y: number
  angle?: number
  sleeve: Fill
  stripes?: boolean
  seed?: number
  /** Mirror top to bottom, for a hand gripping from the other side. */
  flip?: boolean
}) {
  const sleevePts: Pt[] = [
    [-30, -14],
    [-14, -15],
    [0, -14],
    [3, 0],
    [0, 14],
    [-14, 15],
    [-30, 14],
    [-34, 0]
  ]
  // The fist, with three finger tips scalloped along its gripping edge.
  const fist: Pt[] = [
    [2, -12],
    [10, -17.5],
    [22, -17],
    [30, -12],
    [33.5, -7],
    [31, -3.5],
    [34.5, 0.5],
    [32, 4.5],
    [34, 8],
    [30, 13],
    [20, 16],
    [8, 15],
    [2, 11]
  ]
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle})${flip ? ' scale(1 -1)' : ''}`}
    >
      <Shape points={sleevePts} tone={sleeve} paper seed={seed} />
      {stripes &&
        [-23, -12].map((sx, i) => (
          <Ink
            key={sx}
            thin
            seed={seed + i}
            jitter={0.5}
            points={[
              [sx, -14],
              [sx + 1.5, 0],
              [sx, 14]
            ]}
          />
        ))}
      <Shape points={fist} paper seed={seed + 7} jitter={0.5} />
      {/* The thumb wrapping over the grip. */}
      <Ink
        seed={seed + 9}
        jitter={0.4}
        points={[
          [9, -15],
          [16, -8],
          [25, -7]
        ]}
      />
    </g>
  )
}

/** A loose looping squiggle `w` wide, `loops` loops, turned by `rotate` degrees about its start. */
export function Squiggle({
  x,
  y,
  w,
  loops = 3,
  rotate = 0,
  seed = 21,
  ...motion
}: {
  x: number
  y: number
  w: number
  loops?: number
  rotate?: number
  seed?: number
} & Motion) {
  const a = w / (loops * Math.PI * 2)
  const b = a * 2.1
  const pts: Pt[] = []
  const steps = loops * 10
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * loops * Math.PI * 2
    pts.push([a * t - b * Math.sin(t), -(a - b * Math.cos(t)) + (a - b)])
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <Ink points={pts} jitter={0.5} seed={seed} {...motion} />
    </g>
  )
}

/**
 * Three short motion dashes beside x,y, pointing along `angle` (degrees), spaced side by side
 * and staggered, like the lines drawn next to something that just moved.
 */
export function Ticks({
  x,
  y,
  angle = -45,
  length = 10,
  gap = 7,
  seed = 31
}: {
  x: number
  y: number
  angle?: number
  length?: number
  gap?: number
  seed?: number
}) {
  const a = (angle * Math.PI) / 180
  const [dx, dy] = [Math.cos(a), Math.sin(a)]
  const [px, py] = [-dy, dx]
  return (
    <g>
      {[-1, 0, 1].map((k, i) => {
        const start = 2 + Math.abs(k) * 3
        const sx = x + px * k * gap + dx * start
        const sy = y + py * k * gap + dy * start
        const len = length - Math.abs(k) * 2
        return (
          <Ink
            key={k}
            seed={seed + i}
            jitter={0.3}
            points={[
              [sx, sy],
              [sx + dx * len, sy + dy * len]
            ]}
          />
        )
      })}
    </g>
  )
}

/** A small spiky burst centred on cx,cy, filled in `tone` and outlined in ink. */
export function Burst({
  cx,
  cy,
  r = 14,
  spikes = 9,
  tone,
  seed = 41
}: {
  cx: number
  cy: number
  r?: number
  spikes?: number
  tone: Fill
  seed?: number
}) {
  const pts: Pt[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2
    const rr = i % 2 === 0 ? r : r * 0.62
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
  }
  return (
    <Shape points={pts} tone={tone} seed={seed} jitter={0.6} tension={0.2} />
  )
}
