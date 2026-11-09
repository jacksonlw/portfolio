import { animProps, type Motion } from './anim'

type StatusProps = { cx: number; cy: number; r?: number } & Motion

/**
 * The glyphs' step: a whole unit, a quarter of the radius (3 at r 12, 4 at r 14–17, 8 at r 32). The
 * clock hands (straight runs, which must stay crisp) are whole units long; only the 45° strokes of
 * the check and the cross may end on a half unit, at an odd step.
 */
const unit = (r: number) => Math.max(2, Math.round(r / 4))

/** The check every status uses: two 45° strokes, centred on cx,cy (also the seal's, in the badge kit). */
export const checkPath = (cx: number, cy: number, u: number) =>
  `M${cx - 1.5 * u} ${cy}L${cx - 0.5 * u} ${cy + u}L${cx + 1.5 * u} ${cy - u}`

/** Goes through: a mint disc with an ink check. Pops in by default. */
export function CheckBadge({
  cx,
  cy,
  r = 14,
  anim = 'pop',
  ...motion
}: StatusProps) {
  return (
    <g {...animProps({ anim, ...motion })}>
      <circle className="ill-f-mint ill-s" cx={cx} cy={cy} r={r} />
      <path
        className="ill-f-none ill-s ill-s-bold ill-s-ink-fixed"
        d={checkPath(cx, cy, unit(r))}
      />
    </g>
  )
}

/** Waits for a person: a sun disc with clock hands (the long one up, the short one right). */
export function WaitBadge({
  cx,
  cy,
  r = 14,
  anim = 'pop',
  ...motion
}: StatusProps) {
  const u = unit(r)
  return (
    <g {...animProps({ anim, ...motion })}>
      <circle className="ill-f-sun ill-s" cx={cx} cy={cy} r={r} />
      <path
        className="ill-f-none ill-s ill-s-bold ill-s-ink-fixed"
        d={`M${cx} ${cy - 2 * u}V${cy}H${cx + Math.round(1.5 * u)}`}
      />
    </g>
  )
}

/** Blocked: an ink disc with a paper cross. No red, ever. */
export function BlockBadge({
  cx,
  cy,
  r = 14,
  anim = 'pop',
  ...motion
}: StatusProps) {
  const a = 1.5 * unit(r)
  return (
    <g {...animProps({ anim, ...motion })}>
      <circle className="ill-f-ink ill-s" cx={cx} cy={cy} r={r} />
      <path
        className="ill-f-none ill-s ill-s-bold ill-s-paper"
        d={`M${cx - a} ${cy - a}L${cx + a} ${cy + a}M${cx + a} ${cy - a}L${cx - a} ${cy + a}`}
      />
    </g>
  )
}
