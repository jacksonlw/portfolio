'use client'

import { useId, type ReactNode } from 'react'
import type { Glyph } from '@/components/illustrations/glyphs'

/*
 * Ways to finish a glyph from glyphs.ts, each matching the site's chrome, iridescent and starlight
 * look in its own way. Colours come from the disc around it: --disc-accent (pastel) and --disc-deep.
 */

type Paint = { glyph: Glyph; id: string }

const IRI = ['#4fd8ff', '#9b6bff', '#ff5fd2', '#ffe169', '#5cf2c0']

/** Polished chrome: bright top, a dark horizon line across the middle, light again below. */
function ChromeStops() {
  return (
    <>
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.3" stopColor="#d4d8de" />
      <stop offset="0.47" stopColor="#7d838d" />
      <stop offset="0.53" stopColor="#4a505a" />
      <stop offset="0.68" stopColor="#a7adb6" />
      <stop offset="0.88" stopColor="#eef0f3" />
      <stop offset="1" stopColor="#b9bfc8" />
    </>
  )
}

/** Thin glints of colour across the chrome: mostly clear, a few bands of light. */
function GlintStops() {
  return (
    <>
      <stop offset="0" stopColor="#4fd8ff" stopOpacity="0" />
      <stop offset="0.2" stopColor="#4fd8ff" stopOpacity="0.7" />
      <stop offset="0.3" stopColor="#9b6bff" stopOpacity="0" />
      <stop offset="0.58" stopColor="#ff5fd2" stopOpacity="0" />
      <stop offset="0.66" stopColor="#ff5fd2" stopOpacity="0.5" />
      <stop offset="0.74" stopColor="#ffe169" stopOpacity="0.55" />
      <stop offset="0.84" stopColor="#5cf2c0" stopOpacity="0" />
    </>
  )
}

const strokeProps = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
} as const

function Lines({
  glyph,
  stroke,
  width,
  opacity,
  dx = 0,
  dy = 0
}: {
  glyph: Glyph
  stroke: string
  width: number
  opacity?: number
  dx?: number
  dy?: number
}) {
  return (
    <g
      {...strokeProps}
      stroke={stroke}
      strokeWidth={width}
      opacity={opacity}
      transform={dx || dy ? `translate(${dx} ${dy})` : undefined}
    >
      {glyph.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {glyph.dots?.map(([cx, cy, r], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  )
}

/** Chrome line: the glyph drawn in polished chrome, with glints of colour. */
function ChromeLine({ glyph, id }: Paint) {
  return (
    <>
      <defs>
        <linearGradient
          id={`${id}c`}
          x1="0"
          y1="6"
          x2="0"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <ChromeStops />
        </linearGradient>
        <linearGradient
          id={`${id}g`}
          x1="6"
          y1="8"
          x2="42"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <GlintStops />
        </linearGradient>
      </defs>
      <Lines glyph={glyph} stroke="rgb(10 11 14 / 0.35)" width={3.4} dy={0.8} />
      <Lines glyph={glyph} stroke={`url(#${id}c)`} width={2.6} />
      <Lines glyph={glyph} stroke={`url(#${id}g)`} width={2.6} />
    </>
  )
}

/** Silverpoint: a fine silver line, one point lit in colour. */
function Silverpoint({ glyph, id }: Paint) {
  const [lx, ly] = glyph.stars[glyph.stars.length - 1]
  return (
    <>
      <defs>
        <linearGradient
          id={`${id}c`}
          x1="0"
          y1="6"
          x2="0"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <ChromeStops />
        </linearGradient>
        <radialGradient id={`${id}s`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#4fd8ff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#9b6bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Lines glyph={glyph} stroke="rgb(10 11 14 / 0.3)" width={1.6} dy={0.6} />
      <Lines glyph={glyph} stroke={`url(#${id}c)`} width={1.25} />
      <circle cx={lx} cy={ly} r={4} fill={`url(#${id}s)`} />
    </>
  )
}

/** Constellation: faint figure lines, with a star at every key point. */
function Constellation({ glyph, id }: Paint) {
  return (
    <>
      <defs>
        {IRI.map((c, i) => (
          <radialGradient key={i} id={`${id}s${i}`}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor={c} stopOpacity="0.85" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <Lines
        glyph={glyph}
        stroke="color-mix(in oklab, var(--disc-deep, #1f19d9) 70%, #0c0d10)"
        width={0.9}
        opacity={0.55}
      />
      {glyph.stars.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={3.6}
            fill={`url(#${id}s${i % IRI.length})`}
          />
          <circle cx={x} cy={y} r={1} fill="#ffffff" />
        </g>
      ))}
    </>
  )
}

/** Engraved: the glyph cut into the disc, a groove with a lit lower edge. */
function Engraved({ glyph }: Paint) {
  return (
    <>
      <Lines
        glyph={glyph}
        stroke="rgb(255 255 255 / 0.85)"
        width={2.2}
        dx={0.35}
        dy={0.7}
      />
      <Lines
        glyph={glyph}
        stroke="color-mix(in oklab, var(--disc-deep, #1f19d9) 80%, #0c0d10)"
        width={2.2}
      />
    </>
  )
}

/** Liquid chrome: the solid parts cast in chrome, details pressed into them. */
function LiquidChrome({ glyph, id }: Paint) {
  const solids = glyph.solids ?? []
  return (
    <>
      <defs>
        <linearGradient
          id={`${id}c`}
          x1="0"
          y1="6"
          x2="0"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <ChromeStops />
        </linearGradient>
        <linearGradient
          id={`${id}g`}
          x1="6"
          y1="8"
          x2="42"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <GlintStops />
        </linearGradient>
      </defs>
      {solids.map((d, i) => (
        <path
          key={`sh${i}`}
          d={d}
          fill="rgb(10 11 14 / 0.3)"
          transform="translate(0 1.2)"
        />
      ))}
      {solids.map((d, i) => (
        <g key={`s${i}`}>
          <path d={d} fill={`url(#${id}c)`} />
          <path d={d} fill={`url(#${id}g)`} />
          <path
            d={d}
            {...strokeProps}
            stroke="rgb(40 44 52 / 0.55)"
            strokeWidth={0.7}
          />
        </g>
      ))}
      <Lines glyph={glyph} stroke="rgb(30 33 40 / 0.75)" width={1.3} />
      {!solids.length && (
        <>
          <Lines glyph={glyph} stroke={`url(#${id}c)`} width={3.2} />
          <Lines glyph={glyph} stroke={`url(#${id}g)`} width={3.2} />
        </>
      )}
    </>
  )
}

/** Glass: frosted panes with bright edges, the disc's colour showing through. */
function Glass({ glyph, id }: Paint) {
  const solids = glyph.solids ?? []
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      {solids.map((d, i) => (
        <path key={i} d={d} fill={`url(#${id}f)`} />
      ))}
      <Lines
        glyph={glyph}
        stroke="color-mix(in oklab, var(--disc-deep, #1f19d9) 55%, transparent)"
        width={2}
        dy={0.6}
        opacity={0.5}
      />
      <Lines glyph={glyph} stroke="rgb(255 255 255 / 0.95)" width={1.3} />
    </>
  )
}

/** Holo foil: the line as an oil-slick ribbon of colour, a hairline of light down its middle. */
function HoloFoil({ glyph, id }: Paint) {
  return (
    <>
      <defs>
        <linearGradient
          id={`${id}h`}
          x1="6"
          y1="6"
          x2="42"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          {[
            '#4fd8ff',
            '#9b6bff',
            '#ff5fd2',
            '#ffe169',
            '#5cf2c0',
            '#4fd8ff'
          ].map((c, i, a) => (
            <stop key={i} offset={i / (a.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <Lines glyph={glyph} stroke="rgb(10 11 14 / 0.4)" width={3} dy={0.7} />
      <Lines glyph={glyph} stroke={`url(#${id}h)`} width={2.4} />
      <Lines glyph={glyph} stroke="rgb(255 255 255 / 0.75)" width={0.55} />
    </>
  )
}

export const TREATMENTS = {
  chromeLine: {
    title: 'Chrome line',
    note: 'New glyphs drawn in polished chrome with glints of colour, like the favicon.',
    Paint: ChromeLine
  },
  silverpoint: {
    title: 'Silverpoint',
    note: 'A fine silver line, quieter, with one point lit in colour.',
    Paint: Silverpoint
  },
  constellation: {
    title: 'Constellation',
    note: 'Faint figure lines with a star at each key point, echoing the skill stars.',
    Paint: Constellation
  },
  engraved: {
    title: 'Engraved',
    note: 'Cut into the disc like a coin: a groove in the node colour with a lit edge.',
    Paint: Engraved
  },
  liquidChrome: {
    title: 'Liquid chrome',
    note: 'Solid pieces cast in chrome, details pressed in. The boldest of the set.',
    Paint: LiquidChrome
  },
  glass: {
    title: 'Glass',
    note: 'Frosted panes with bright edges, the disc colour showing through.',
    Paint: Glass
  },
  holoFoil: {
    title: 'Holo foil',
    note: 'An oil-slick ribbon with a hairline of light, the most colourful.',
    Paint: HoloFoil
  }
} satisfies Record<
  string,
  { title: string; note: string; Paint: (p: Paint) => ReactNode }
>

export type TreatmentName = keyof typeof TREATMENTS

/** A glyph in a treatment, as an SVG filling its box. */
export function GlyphSvg({
  glyph,
  treatment
}: {
  glyph: Glyph
  treatment: TreatmentName
}) {
  const id = useId().replace(/:/g, '')
  const { Paint } = TREATMENTS[treatment]
  return (
    <svg
      viewBox="0 0 48 48"
      className="block h-auto w-full overflow-visible"
      aria-hidden
    >
      <Paint glyph={glyph} id={id} />
    </svg>
  )
}
