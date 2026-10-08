import { animProps, fill, n, type Fill, type Motion, type SwashTone } from "./anim";
import { SWASH, type MeltShape, type SwashShape } from "./melt-paths";

/**
 * The Melt swash: the liquid brand material behind an object, from the mark's own capsule geometry
 * (melt-paths.ts). Filled blue or one accent, never outlined. `x`, `y` are its top-left corner, `w`
 * its width; the height follows the shape (`swashHeight`). Spills in from `origin` by default.
 * Also draws the mark's own outlines (`MELT_SHAPE`, `UI_SHAPES`) when given one as `shape`.
 */
export function Swash({
  shape = "wide",
  accent = "blue",
  x,
  y,
  w,
  rotate = 0,
  flip = false,
  anim = "spill",
  ...motion
}: {
  shape?: SwashShape | MeltShape;
  accent?: SwashTone | Extract<Fill, "ink" | "paper" | "fog">;
  x: number;
  y: number;
  w: number;
  /** Degrees, about the swash's centre. */
  rotate?: number;
  /** Mirror left to right. */
  flip?: boolean;
} & Motion) {
  const s: MeltShape = typeof shape === "string" ? SWASH[shape] : shape;
  const k = w / s.w;
  const h = s.h * k;
  const t = [
    `translate(${n(x)} ${n(y)})`,
    rotate ? `rotate(${n(rotate)} ${n(w / 2)} ${n(h / 2)})` : "",
    flip ? `translate(${n(w)} 0) scale(-1 1)` : "",
    `scale(${+k.toFixed(4)})`,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <g {...animProps({ anim, ...motion })}>
      <path className={fill(accent)} fillRule={s.evenOdd ? "evenodd" : undefined} transform={t} d={s.d} />
    </g>
  );
}

/** The height a swash of this shape takes at width `w`. */
export const swashHeight = (shape: SwashShape | MeltShape, w: number) => {
  const s: MeltShape = typeof shape === "string" ? SWASH[shape] : shape;
  return n((s.h * w) / s.w);
};
