/**
 * The crisp objects: flat fills, the ink outline (`ill-s`), small corner radii. Coordinates are in
 * the frame's viewBox units; keep them on the grid (multiples of 4 in badges, 8 in scenes).
 */
import { animProps, fill, n, type Fill, type Motion } from './anim'
import { checkPath } from './status'

const OBJ = 'ill-s'
const cls = (f: Fill) => `${fill(f)} ${OBJ}`

type Box = { x: number; y: number; w: number; h: number }

/** A card or window: a rounded rectangle. */
export function Card({
  x,
  y,
  w,
  h,
  r = 4,
  tone = 'paper',
  ...motion
}: Box & { r?: number; tone?: Fill } & Motion) {
  return (
    <rect
      {...animProps(motion)}
      className={cls(tone)}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
    />
  )
}

/**
 * Lines of text: ink strokes (`line`) or soft filled bars (`bar`, fog by default). `widths` are
 * fractions of `w`, one per line, each rounded to a whole unit so the ends land on the pixel grid;
 * keep them falling (1, 0.8, 0.6) or two (1, 0.6) so a block of text reads as one ragged edge.
 * `onLight`: the lines sit on a light fill, so they stay ink in the dark.
 */
export function Lines({
  x,
  y,
  w,
  widths = [1, 0.8, 0.55],
  gap = 8,
  variant = 'line',
  tone = 'fog',
  onLight = false,
  ...motion
}: {
  x: number
  y: number
  w: number
  widths?: number[]
  gap?: number
  variant?: 'line' | 'bar'
  tone?: Fill
  onLight?: boolean
} & Motion) {
  return (
    <g {...animProps(motion)}>
      {variant === 'line' ? (
        <path
          className={`ill-f-none ill-s${onLight ? 'ill-s-ink-fixed' : ''}`}
          d={widths
            .map(
              (f, i) => `M${n(x)} ${n(y + i * gap)}H${n(x + Math.round(f * w))}`
            )
            .join('')}
        />
      ) : (
        widths.map((f, i) => (
          <rect
            key={i}
            className={fill(tone)}
            x={x}
            y={y + i * gap - 2}
            width={Math.round(f * w)}
            height={4}
            rx={2}
          />
        ))
      )}
    </g>
  )
}

/** A square tile (an app, a field, a key on a board). */
export function Tile({
  x,
  y,
  s,
  r = 4,
  tone = 'paper',
  ...motion
}: { x: number; y: number; s: number; r?: number; tone?: Fill } & Motion) {
  return (
    <rect
      {...animProps(motion)}
      className={cls(tone)}
      x={x}
      y={y}
      width={s}
      height={s}
      rx={r}
    />
  )
}

/** A coin: a disc with an inner rim (a whole-unit radius, about two thirds of the coin's). */
export function Coin({
  cx,
  cy,
  r,
  tone = 'sun',
  ...motion
}: { cx: number; cy: number; r: number; tone?: Fill } & Motion) {
  return (
    <g {...animProps(motion)}>
      <circle className={cls(tone)} cx={cx} cy={cy} r={r} />
      <circle
        className="ill-f-none ill-s ill-s-ink-fixed"
        cx={cx}
        cy={cy}
        r={Math.round(r * 0.66)}
      />
    </g>
  )
}

/** A document with a folded corner (`fold` units). */
export function Doc({
  x,
  y,
  w,
  h,
  fold = 12,
  tone = 'paper',
  ...motion
}: Box & { fold?: number; tone?: Fill } & Motion) {
  const r = x + w
  return (
    <g {...animProps(motion)}>
      <path
        className={cls(tone)}
        d={`M${x} ${y}H${r - fold}L${r} ${y + fold}V${y + h}H${x}Z`}
      />
      <path
        className="ill-f-fog ill-s"
        d={`M${r - fold} ${y}V${y + fold}H${r}Z`}
      />
    </g>
  )
}

/** A database: a cylinder with `bands` seams. */
export function Cylinder({
  x,
  y,
  w,
  h,
  bands = 1,
  tone = 'paper',
  ...motion
}: Box & { bands?: number; tone?: Fill } & Motion) {
  const rx = w / 2
  const ry = n(w * 0.16)
  const cx = x + rx
  const body = `M${x} ${n(y + ry)}V${n(y + h - ry)}A${rx} ${ry} 0 0 0 ${x + w} ${n(y + h - ry)}V${n(y + ry)}Z`
  const seam = (i: number) => {
    const sy = n(y + ry + ((h - 2 * ry) * i) / (bands + 1))
    return `M${x} ${sy}A${rx} ${ry} 0 0 0 ${x + w} ${sy}`
  }
  return (
    <g {...animProps(motion)}>
      <path className={cls(tone)} d={body} />
      {bands > 0 && (
        <path
          className={`ill-f-none ill-s${tone === 'paper' ? '' : 'ill-s-ink-fixed'}`}
          d={Array.from({ length: bands }, (_, i) => seam(i + 1)).join('')}
        />
      )}
      <ellipse className={cls(tone)} cx={cx} cy={n(y + ry)} rx={rx} ry={ry} />
    </g>
  )
}

/**
 * A padlock `w` wide (about 1.1·w tall): an outlined shackle over a body in `tone`. The shackle's
 * legs, the body's top and its height snap to whole units (the body to an even height, so a lock
 * centred on an edge sits exactly on it): the outlines stay crisp at any `w`.
 */
export function Lock({
  x,
  y,
  w,
  tone = 'sun',
  ...motion
}: { x: number; y: number; w: number; tone?: Fill } & Motion) {
  const by = Math.round(y + 0.46 * w)
  const bh = Math.round(0.32 * w) * 2
  const lo = Math.round(0.18 * w)
  const li = Math.round(0.34 * w)
  const ro = n(w / 2 - lo)
  const ri = n(w / 2 - li)
  const top = n(y + ro)
  const shackle =
    `M${x + lo} ${by}V${top}A${ro} ${ro} 0 0 1 ${x + w - lo} ${top}V${by}` +
    `H${x + w - li}V${top}A${ri} ${ri} 0 0 0 ${x + li} ${top}V${by}Z`
  return (
    <g {...animProps(motion)}>
      <path className={cls('paper')} d={shackle} />
      <rect className={cls(tone)} x={x} y={by} width={w} height={bh} rx={4} />
      <circle
        className="ill-f-ink-fixed"
        cx={n(x + w / 2)}
        cy={n(by + 0.26 * w)}
        r={n(0.08 * w)}
      />
      <rect
        className="ill-f-ink-fixed"
        x={n(x + w / 2 - 0.035 * w)}
        y={n(by + 0.26 * w)}
        width={n(0.07 * w)}
        height={n(0.18 * w)}
        rx={1}
      />
    </g>
  )
}

/** A key lying flat, bow on the left, `w` long. */
export function Key({
  x,
  y,
  w,
  tone = 'sun',
  ...motion
}: { x: number; y: number; w: number; tone?: Fill } & Motion) {
  const r = n(w * 0.22)
  const cy = y + r
  const sh = n(w * 0.1)
  const bit = `M${n(x + 1.8 * r)} ${n(cy - sh / 2)}H${x + w}V${n(cy + sh / 2)}H${n(x + w - 0.08 * w)}V${n(cy + sh / 2 + 0.12 * w)}H${n(x + w - 0.2 * w)}V${n(cy + sh / 2 + 0.08 * w)}H${n(x + w - 0.3 * w)}V${n(cy + sh / 2)}H${n(x + 1.8 * r)}Z`
  return (
    <g {...animProps(motion)}>
      <path className={cls(tone)} d={bit} />
      <circle className={cls(tone)} cx={n(x + r)} cy={n(cy)} r={r} />
      <circle
        className={cls('paper')}
        cx={n(x + r * 0.8)}
        cy={n(cy)}
        r={n(r * 0.36)}
      />
    </g>
  )
}

/**
 * A person: a disc in `tone` with a head and shoulders in `figure`, the shoulders meeting the disc's
 * edge (no clipping needed). The figure defaults to ink, kept ink in the dark on a light disc.
 */
export function Avatar({
  cx,
  cy,
  r,
  tone = 'paper',
  figure = tone === 'paper' ? 'ink' : 'ink-fixed',
  ...motion
}: { cx: number; cy: number; r: number; tone?: Fill; figure?: Fill } & Motion) {
  // Shoulders: a half circle of a whole-unit radius (about 0.62r) sitting on the chord where it
  // meets the disc, that chord's height worked out so its ends lie exactly on the disc's edge.
  const px = Math.round(0.62 * r)
  const py = n(cy + Math.sqrt(r * r - px * px))
  // An ink-fixed figure keeps an ink outline too, or the dark theme rings it in white.
  const fig =
    figure === 'ink-fixed' ? `${cls(figure)} ill-s-ink-fixed` : cls(figure)
  return (
    <g {...animProps(motion)}>
      <circle className={cls(tone)} cx={cx} cy={cy} r={r} />
      <path
        className={fig}
        d={`M${cx - px} ${py}A${px} ${px} 0 0 1 ${cx + px} ${py}A${r} ${r} 0 0 1 ${cx - px} ${py}Z`}
      />
      {/* The head rests on the disc's centre line, about 4 units clear of the shoulders (never touching by a hair). */}
      <circle
        className={fig}
        cx={cx}
        cy={cy - Math.round(0.26 * r)}
        r={Math.round(0.26 * r)}
      />
    </g>
  )
}

/** A half-dial gauge (flat side down) with the share `value` (0–1) filled in `tone` and a needle. */
export function Gauge({
  cx,
  cy,
  r,
  value = 0.66,
  tone = 'mint',
  ...motion
}: {
  cx: number
  cy: number
  r: number
  value?: number
  tone?: Fill
} & Motion) {
  const a = Math.PI * (1 - Math.min(1, Math.max(0, value)))
  const px = n(cx + r * Math.cos(a))
  const py = n(cy - r * Math.sin(a))
  const nx = n(cx + 0.72 * r * Math.cos(a))
  const ny = n(cy - 0.72 * r * Math.sin(a))
  return (
    <g {...animProps(motion)}>
      <path
        className={cls('paper')}
        d={`M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z`}
      />
      <path
        className={cls(tone)}
        d={`M${cx} ${cy}H${cx - r}A${r} ${r} 0 0 1 ${px} ${py}Z`}
      />
      <path
        className="ill-f-none ill-s ill-s-bold"
        d={`M${cx} ${cy}L${nx} ${ny}`}
      />
      <circle
        className="ill-f-ink"
        cx={cx}
        cy={cy}
        r={n(Math.max(2, r * 0.1))}
      />
    </g>
  )
}

/**
 * A seal: a stamp in `tone`, a disc with an inner ring and a check (sealed, on the record). It reads
 * at r 12 and up; below that the ring drops out. `points` is accepted for older callers and ignored
 * (the scalloped rosette it shaped read as a cog).
 */
export function Seal({
  cx,
  cy,
  r,
  tone = 'lavender',
  ...motion
}: {
  cx: number
  cy: number
  r: number
  points?: number
  tone?: Fill
} & Motion) {
  // Marks on a light stamp stay ink in the dark; on a paper one they follow the line colour.
  const mark =
    tone === 'paper' ? 'ill-f-none ill-s' : 'ill-f-none ill-s ill-s-ink-fixed'
  const ring = r >= 12
  return (
    <g {...animProps(motion)}>
      <circle className={cls(tone)} cx={cx} cy={cy} r={r} />
      {ring && (
        <circle className={mark} cx={cx} cy={cy} r={Math.round(r * 0.68)} />
      )}
      <path
        className={`${mark} ill-s-bold`}
        d={checkPath(cx, cy, Math.max(2, Math.round(r / (ring ? 5 : 4))))}
      />
    </g>
  )
}

/** A straight arrow from x1,y1 to x2,y2 with an open head `head` units long. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  head = 6,
  ...motion
}: { x1: number; y1: number; x2: number; y2: number; head?: number } & Motion) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const h = (s: number) =>
    `${n(x2 - head * Math.cos(a + s))} ${n(y2 - head * Math.sin(a + s))}`
  return (
    <path
      {...animProps(motion)}
      className="ill-f-none ill-s"
      pathLength={motion.anim === 'draw' ? 1 : undefined}
      d={`M${x1} ${y1}L${x2} ${y2}M${h(0.6)}L${x2} ${y2}L${h(-0.6)}`}
    />
  )
}
