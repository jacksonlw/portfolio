/**
 * The badge family: the places every badge shares, so the twelve read as one set (README.md,
 * "Composition budget"), and the few local shapes the badges draw on the 4-unit grid.
 *
 * - The swash is always the same streak, same size, same angle, behind the lower half.
 * - The main object sits in the middle left (about x 20–116, y 44–128) with the hard shadow.
 * - A status pops out of the main object's top right corner at STATUS.
 * - At most two sparkles, from the four SPARKLE slots (a large one, a small one).
 */
import { animProps, fill, type Accent, type Fill, type Motion } from "../primitives/anim";
import { Sparkle, sparklePath } from "../primitives/sparkle";
import { Swash } from "../primitives/swash";

/** Where the status (check, wait, cross, seal) pops out: the main object's top right corner. */
export const STATUS = { cx: 112, cy: 52, r: 16 } as const;

/** The sparkle slots: large (r 8) at the top, small (r 5) at the bottom, left or right. */
const SPARKLE = {
  topLeft: { x: 28, y: 32, r: 8 },
  topRight: { x: 136, y: 32, r: 8 },
  bottomLeft: { x: 24, y: 136, r: 5 },
  bottomRight: { x: 140, y: 132, r: 5 },
} as const;
type Slot = keyof typeof SPARKLE;

/** The family swash: the streak behind the lower half, spilling in from its lower left. */
export function FamilySwash({ accent }: { accent: Accent }) {
  return <Swash shape="streak" accent={accent} x={12} y={76} w={140} rotate={-16} origin="10% 90%" />;
}

/** The badge's sparkles: a large one (twinkles at 700 ms) and an optional small one (900 ms). */
export function FamilySparkles({ big, small }: { big: Slot; small?: Slot }) {
  return (
    <>
      <Sparkle {...SPARKLE[big]} r={8} delay={700} />
      {small && <Sparkle {...SPARKLE[small]} r={5} delay={900} />}
    </>
  );
}

/** The agent's status: a disc (sky by default) with an ink sparkle (a proposal). */
export function AgentBadge({
  cx = STATUS.cx,
  cy = STATUS.cy,
  r = STATUS.r,
  tone = "sky",
  ...motion
}: { cx?: number; cy?: number; r?: number; tone?: Accent } & Motion) {
  return (
    <g {...animProps({ anim: "pop", ...motion })}>
      <circle className={`${fill(tone)} ill-s`} cx={cx} cy={cy} r={r} />
      <path className="ill-f-ink-fixed" d={sparklePath(cx, cy, Math.round(r * 0.6))} />
    </g>
  );
}

/** A seal on a record: a lavender disc with an ink check. */
export function SealBadge({ cx, cy, r = 16, ...motion }: { cx: number; cy: number; r?: number } & Motion) {
  return (
    <g {...animProps({ anim: "pop", ...motion })}>
      <circle className="ill-f-lavender ill-s" cx={cx} cy={cy} r={r} />
      <path className="ill-f-none ill-s ill-s-bold ill-s-ink-fixed" d={`M${cx - 6} ${cy}L${cx - 2} ${cy + 4}L${cx + 6} ${cy - 4}`} />
    </g>
  );
}

/**
 * A padlock on the grid: a body `w`×`h` at x,y in `tone`, a paper shackle whose legs stand `inset`
 * in from the body's sides, `t` thick, its arc centred `rise` above the body (legs run 8 into the
 * body, hidden behind it), and an ink keyhole (`hole` radius; none when 0).
 */
export function GridLock({
  x,
  y,
  w,
  h,
  inset,
  t,
  rise,
  hole = 0,
  tone = "sun",
  ...motion
}: { x: number; y: number; w: number; h: number; inset: number; t: number; rise: number; hole?: number; tone?: Fill } & Motion) {
  const [l, r, cy, ro] = [x + inset, x + w - inset, y - rise, (w - 2 * inset) / 2];
  const ri = ro - t;
  const shackle = `M${l} ${y + 8}V${cy}A${ro} ${ro} 0 0 1 ${r} ${cy}V${y + 8}H${r - t}V${cy}A${ri} ${ri} 0 0 0 ${l + t} ${cy}V${y + 8}Z`;
  const kx = x + w / 2;
  const ky = y + Math.round((h * 0.4) / 4) * 4;
  return (
    <g {...animProps(motion)}>
      <path className="ill-f-paper ill-s" d={shackle} />
      <rect className={`${fill(tone)} ill-s`} x={x} y={y} width={w} height={h} rx={4} />
      {hole > 0 && (
        <>
          <circle className="ill-f-ink-fixed" cx={kx} cy={ky} r={hole} />
          <rect className="ill-f-ink-fixed" x={kx - hole / 2} y={ky} width={hole} height={hole * 2.5} rx={1} />
        </>
      )}
    </g>
  );
}

/**
 * A key standing upright: a bow of radius `r` centred cx,cy with a ring, an 8-wide shaft `len` long
 * below it and two bits facing left.
 */
export function UprightKey({ cx, cy, r, len, tone = "paper", ...motion }: { cx: number; cy: number; r: number; len: number; tone?: Fill } & Motion) {
  const [x0, x1, top] = [cx - 4, cx + 4, cy + r - 4];
  const b = top + len;
  return (
    <g {...animProps(motion)}>
      <path className={`${fill(tone)} ill-s`} d={`M${x0} ${top}H${x1}V${b}H${x0 - 8}V${b - 12}H${x0}V${b - 20}H${x0 - 8}V${b - 28}H${x0}Z`} />
      <circle className={`${fill(tone)} ill-s`} cx={cx} cy={cy} r={r} />
      <circle className="ill-f-none ill-s" cx={cx} cy={cy} r={Math.round(r * 0.4)} />
    </g>
  );
}

/**
 * A database on the grid: a cylinder `w` wide whose caps are ellipses `ry` tall, with seams at the
 * given `seams` (the y of each seam's ends).
 */
export function GridCylinder({ x, y, w, h, ry, seams = [], ...motion }: { x: number; y: number; w: number; h: number; ry: number; seams?: number[] } & Motion) {
  const rx = w / 2;
  const [top, bottom] = [y + ry, y + h - ry];
  return (
    <g {...animProps(motion)}>
      <path className="ill-f-paper ill-s" d={`M${x} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${x + w} ${bottom}V${top}Z`} />
      {seams.length > 0 && <path className="ill-f-none ill-s" d={seams.map((sy) => `M${x} ${sy}A${rx} ${ry} 0 0 0 ${x + w} ${sy}`).join("")} />}
      <ellipse className="ill-f-paper ill-s" cx={x + rx} cy={top} rx={rx} ry={ry} />
    </g>
  );
}

/** A plug: a 20×32 body at x,y with two prongs to the right and the cable entering on the left. */
export function Plug({ x, y, ...motion }: { x: number; y: number } & Motion) {
  return (
    <g {...animProps(motion)}>
      <path className="ill-f-none ill-s ill-s-bold" d={`M${x + 20} ${y + 8}H${x + 32}M${x + 20} ${y + 24}H${x + 32}`} />
      <rect className="ill-f-paper ill-s" x={x} y={y} width={20} height={32} rx={4} />
    </g>
  );
}
