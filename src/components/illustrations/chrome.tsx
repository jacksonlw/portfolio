import { useId, type CSSProperties } from 'react'
import type { Glyph } from './glyphs'

/*
 * A glyph drawn in polished chrome. The light comes from one direction (on the board: from the Me
 * node at the centre), so the bright side of every glyph faces you, and the glints of colour across
 * the chrome are picked by where the glyph sits around you, at spots seeded by its name, so no two
 * catch the light the same way.
 */

const IRI = ['#4fd8ff', '#9b6bff', '#ff5fd2', '#ffe169', '#5cf2c0', '#ff9476']

/** A stable number in [0, 1) for a string. */
function seed(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10000) / 10000
}

const round = (v: number) => Math.round(v * 1000) / 1000

export function ChromeGlyph({
  glyph,
  name,
  light = -90,
  label,
  className,
  style
}: {
  glyph: Glyph
  /** Seeds where the glints fall. */
  name: string
  /** Where the light comes from, in degrees on screen (0 = from the right, -90 = from above). */
  light?: number
  label?: string
  className?: string
  style?: CSSProperties
}) {
  const id = useId().replace(/:/g, '')
  const r = (k: string) => seed(`${name}/${k}`)
  // Chrome is drawn lit from above; turn it so the top faces the light.
  const turn = `rotate(${round(light + 90)} 24 24)`
  // Glint colours: the hue for the glyph's place around the light, and its neighbour, each
  // knocked a little at random.
  const at = (((light % 360) + 360) % 360) / 360
  const hue = (k: number) =>
    IRI[Math.floor((at * IRI.length + k + r(`h${k}`) * 1.4) % IRI.length)]
  // Two or three thin glints at random spots and strengths, never in the same place twice.
  const glints = Array.from({ length: 2 + Math.round(r('n')) }, (_, i) => ({
    at: round(0.12 + ((i + r(`p${i}`)) / 3) * 0.76),
    width: round(0.04 + r(`w${i}`) * 0.06),
    color: hue(i),
    strength: round(0.3 + r(`s${i}`) * 0.3)
  }))
  const lines = (stroke: string, width: number, dy = 0) => (
    <g
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={dy ? `translate(0 ${dy})` : undefined}
    >
      {glyph.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {glyph.dots?.map(([cx, cy, rr], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r={rr} />
      ))}
    </g>
  )

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      style={{ overflow: 'visible', ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient
          id={`${id}c`}
          x1="24"
          y1="6"
          x2="24"
          y2="42"
          gradientUnits="userSpaceOnUse"
          gradientTransform={turn}
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#d4d8de" />
          <stop offset="0.47" stopColor="#7d838d" />
          <stop offset="0.53" stopColor="#4a505a" />
          <stop offset="0.68" stopColor="#a7adb6" />
          <stop offset="0.88" stopColor="#eef0f3" />
          <stop offset="1" stopColor="#b9bfc8" />
        </linearGradient>
        <linearGradient
          id={`${id}g`}
          x1="24"
          y1="6"
          x2="24"
          y2="42"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`rotate(${round(light + 90 + (r('tilt') - 0.5) * 70)} 24 24)`}
        >
          {glints.flatMap((g, i) => [
            <stop
              key={`${i}a`}
              offset={Math.max(0, g.at - g.width)}
              stopColor={g.color}
              stopOpacity="0"
            />,
            <stop
              key={`${i}b`}
              offset={g.at}
              stopColor={g.color}
              stopOpacity={g.strength}
            />,
            <stop
              key={`${i}c`}
              offset={Math.min(1, g.at + g.width)}
              stopColor={g.color}
              stopOpacity="0"
            />
          ])}
        </linearGradient>
      </defs>
      {lines('rgb(10 11 14 / 0.35)', 3.4, 0.8)}
      {lines(`url(#${id}c)`, 2.6)}
      {lines(`url(#${id}g)`, 2.6)}
    </svg>
  )
}
