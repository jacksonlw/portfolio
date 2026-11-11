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
  if (!accent) return surfaceSeed(key)
  const [h2, h3] = comboFor(key, accent)
  return {
    '--disc-accent': `var(--af-${accent})`,
    '--disc-deep': `var(--af-${accent}-deep)`,
    '--h2': h2,
    '--h3': h3,
    ...surfaceSeed(key)
  } as CSSProperties
}

/** Hues (oklch, degrees) the pools are drawn in: the palette's own, plus teal and pink. */
const HUE = {
  rose: 25,
  peach: 65,
  gold: 93,
  mint: 165,
  teal: 205,
  ocean: 240,
  sky: 268,
  violet: 300,
  pink: 345
} as const

/**
 * The two colours that go with each of the palette's, chosen by eye, not by rule: a rule (the
 * complement, say) pairs red with green, which fight. So each colour has a few pairs that sit
 * well with it, and none puts a red beside a green. Several discs share a colour (three are
 * rose): each takes the next pair in turn, so no two discs of one colour look the same.
 */
const COMBOS: Record<string, readonly (readonly [number, number])[]> = {
  rose: [
    [HUE.gold, HUE.violet],
    [HUE.peach, HUE.sky],
    [HUE.pink, HUE.ocean],
    [HUE.violet, HUE.peach]
  ],
  peach: [
    [HUE.pink, HUE.violet],
    [HUE.gold, HUE.sky],
    [HUE.rose, HUE.ocean]
  ],
  sun: [
    [HUE.peach, HUE.sky],
    [HUE.violet, HUE.pink],
    [HUE.mint, HUE.ocean]
  ],
  mint: [
    [HUE.ocean, HUE.gold],
    [HUE.teal, HUE.violet],
    [HUE.sky, HUE.gold]
  ],
  ocean: [
    [HUE.violet, HUE.mint],
    [HUE.teal, HUE.pink],
    [HUE.sky, HUE.peach]
  ],
  sky: [
    [HUE.violet, HUE.peach],
    [HUE.teal, HUE.pink],
    [HUE.mint, HUE.violet]
  ],
  lavender: [
    [HUE.pink, HUE.ocean],
    [HUE.sky, HUE.peach],
    [HUE.teal, HUE.pink]
  ]
}

/** This key's pair: its turn among the drawings that share its colour, in the registry's order. */
function comboFor(key: string, accent: string): readonly [number, number] {
  const pairs = COMBOS[accent] ?? COMBOS.sky
  const turn = Object.keys(ILLUSTRATIONS)
    .filter((k) => ILLUSTRATIONS[k].accent === accent)
    .indexOf(key)
  return pairs[Math.max(0, turn) % pairs.length]
}

/**
 * How one grained gradient is laid out (globals.css, .story-surface): where its pools of colour
 * sit and how far each spreads. (Which two colours go with the drawing's own is chosen with the
 * drawing: COMBOS above. A surface with no drawing of its own, a picture in a Story, takes its
 * Story's.)
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
    '--s6': `${span(28, 60)}% ${span(25, 50)}%`
  } as CSSProperties
}
