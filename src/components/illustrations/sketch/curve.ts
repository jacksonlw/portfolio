/**
 * The geometry behind the sketch style: smooth curves through points (Catmull-Rom as cubic
 * Béziers) with a small seeded wobble, so strokes look hand-drawn but render the same every time.
 */

export type Pt = readonly [number, number]

/** A tiny seeded PRNG (mulberry32): the same seed gives the same wobble on every render. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r1 = (v: number) => Math.round(v * 10) / 10

/** Nudges every point by up to `amount` units, deterministically for a given seed. */
export function wobble(
  points: readonly Pt[],
  amount: number,
  seed: number
): Pt[] {
  if (!amount) return [...points]
  const next = rng(seed)
  return points.map(([x, y]) => [
    x + (next() - 0.5) * 2 * amount,
    y + (next() - 0.5) * 2 * amount
  ])
}

/**
 * A smooth path through the points: Catmull-Rom converted to cubic Béziers. `tension` 1 is the
 * classic curve; lower is tighter. Closed paths wrap around and end with Z.
 */
export function smoothPath(
  points: readonly Pt[],
  closed = false,
  tension = 1
): string {
  const n = points.length
  if (n < 2) return ''
  const at = (i: number) =>
    closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`
  const segments = closed ? n : n - 1
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`
  }
  return closed ? `${d}Z` : d
}

/** Points on a rounded rectangle, a few per side, so the wobble reads as a drawn box. */
export function boxPoints(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 6
): Pt[] {
  const k = r * 0.3
  return [
    [x + r, y],
    [x + w / 2, y - 0.6],
    [x + w - r, y],
    [x + w - k, y + k],
    [x + w, y + r],
    [x + w + 0.6, y + h / 2],
    [x + w, y + h - r],
    [x + w - k, y + h - k],
    [x + w - r, y + h],
    [x + w / 2, y + h + 0.6],
    [x + r, y + h],
    [x + k, y + h - k],
    [x, y + h - r],
    [x - 0.6, y + h / 2],
    [x, y + r],
    [x + k, y + k]
  ]
}

/** Points on an ellipse, `count` of them, starting at the top. */
export function ellipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count = 10
): Pt[] {
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + (i / count) * Math.PI * 2
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const
  })
}

export const shift = (points: readonly Pt[], dx: number, dy: number): Pt[] =>
  points.map(([x, y]) => [x + dx, y + dy])
