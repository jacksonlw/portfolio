import { fill, type Fill } from "./anim";

/**
 * The soft round backdrop a badge may sit on: no outline, `disc` by default (white on the page, fog
 * on a card, a lifted ink on ink).
 */
export function BadgeDisc({ cx = 80, cy = 80, r = 72, tone = "disc" }: { cx?: number; cy?: number; r?: number; tone?: Fill }) {
  return <circle className={fill(tone)} cx={cx} cy={cy} r={r} />;
}
