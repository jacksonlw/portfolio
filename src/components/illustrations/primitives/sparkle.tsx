import { animProps, fill, n, type Fill, type Motion } from './anim'

/** A four-point sparkle centred on cx,cy with arm length r; `pinch` (0–1) fattens the waist. */
export function sparklePath(cx: number, cy: number, r: number, pinch = 0.16) {
  const k = r * pinch
  return (
    `M${n(cx)} ${n(cy - r)}` +
    `Q${n(cx + k)} ${n(cy - k)} ${n(cx + r)} ${n(cy)}` +
    `Q${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + r)}` +
    `Q${n(cx - k)} ${n(cy + k)} ${n(cx - r)} ${n(cy)}` +
    `Q${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - r)}Z`
  )
}

/** A filled sparkle (ink by default), twinkling twice when revealed. Accents, never the main event. */
export function Sparkle({
  x,
  y,
  r = 6,
  tone = 'ink',
  anim = 'twinkle',
  ...motion
}: { x: number; y: number; r?: number; tone?: Fill } & Motion) {
  return (
    <g {...animProps({ anim, ...motion })}>
      <path className={fill(tone)} d={sparklePath(x, y, r)} />
    </g>
  )
}

/** A short row (or column) of dots: motion trails, "more", loading. */
export function Dots({
  x,
  y,
  count = 3,
  gap = 8,
  r = 2,
  tone = 'ink',
  vertical = false,
  ...motion
}: {
  x: number
  y: number
  count?: number
  gap?: number
  r?: number
  tone?: Fill
  vertical?: boolean
} & Motion) {
  return (
    <g {...animProps(motion)}>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          className={fill(tone)}
          cx={vertical ? x : x + i * gap}
          cy={vertical ? y + i * gap : y}
          r={r}
        />
      ))}
    </g>
  )
}
