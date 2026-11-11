import type { CSSProperties } from 'react'
import { ILLUSTRATIONS } from '@/components/illustrations/registry'

/**
 * The disc's colour: every disc is lit by a soft radial glow of its drawing's colour, on white in
 * light mode and on near-black in dark (globals.css, .node-disc), a step brighter while it's
 * hovered or lit. A Story's panel wears the same colour as it grows out of its bubble.
 */
export function discAccent(key: string): CSSProperties {
  const kept = ACCENTS.get(key)
  if (kept) return kept
  const made = makeAccent(key)
  ACCENTS.set(key, made)
  return made
}

/** As SEEDS below: the same object each time, so React has nothing to compare or reapply. */
const ACCENTS = new Map<string, CSSProperties>()

function makeAccent(key: string): CSSProperties {
  const accent = ILLUSTRATIONS[key]?.accent
  return accent
    ? ({
        '--disc-accent': `var(--af-${accent})`,
        '--disc-deep': `var(--af-${accent}-deep)`,
        ...surfaceSeed(key)
      } as CSSProperties)
    : surfaceSeed(key)
}

/**
 * How one grained gradient is laid out (globals.css, .story-surface): where its pools of colour
 * sit, how far each spreads and how far round the colour wheel the other two pools lean from
 * the drawing's own colour (one a little warmer, one a little cooler, so they always sit with it).
 * Worked out from a key, so every surface is its own but always the same one: a bubble's disc and
 * its Story share theirs (the panel grows out of the disc), a gallery and each picture get their
 * own, and the server and the browser agree. It costs nothing to draw this way: the browser
 * paints each surface once and keeps it, so there's nothing to pre-render.
 */
export function surfaceSeed(key: string): CSSProperties {
  const kept = SEEDS.get(key)
  if (kept) return kept
  const made = makeSeed(key)
  SEEDS.set(key, made)
  return made
}

/** Seeds already worked out, by key: there are only a few dozen and discs render often. */
const SEEDS = new Map<string, CSSProperties>()

function makeSeed(key: string): CSSProperties {
  let h = 2166136261
  for (let i = 0; i < key.length; i++)
    h = Math.imul(h ^ key.charCodeAt(i), 16777619) >>> 0
  // A few independent numbers in 0…1 out of the one hash.
  const next = () => {
    h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) >>> 0
    return h / 4294967296
  }
  const span = (lo: number, hi: number) => Math.round(lo + next() * (hi - lo))
  const flip = next() < 0.5
  const side = (x: number) => (flip ? 100 - x : x)
  const lean = next() < 0.5 ? 1 : -1
  return {
    '--p1': `${side(span(-10, 30))}% ${span(-10, 28)}%`,
    '--p2': `${side(span(70, 110))}% ${span(-5, 45)}%`,
    '--p3': `${span(15, 85)}% ${span(50, 95)}%`,
    '--p4': `${span(30, 90)}% ${span(15, 60)}%`,
    '--p5': `${span(5, 60)}% ${span(40, 85)}%`,
    '--p6': `${span(20, 80)}% ${span(10, 55)}%`,
    '--s1': `${span(80, 125)}% ${span(50, 90)}%`,
    '--s2': `${span(65, 110)}% ${span(55, 95)}%`,
    '--s3': `${span(55, 95)}% ${span(45, 75)}%`,
    '--s4': `${span(25, 55)}% ${span(35, 70)}%`,
    '--s5': `${span(35, 70)}% ${span(22, 45)}%`,
    '--s6': `${span(28, 60)}% ${span(25, 50)}%`,
    '--h2': lean * span(24, 48),
    '--h3': -lean * span(18, 40)
  } as CSSProperties
}
