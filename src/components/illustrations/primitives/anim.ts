import type { CSSProperties } from "react";

/** The motions illustrations.css defines; an element opts in with `data-anim`. */
export const ANIMS = ["draw", "spill", "float", "pulse", "pop", "twinkle", "rise"] as const;
export type Anim = (typeof ANIMS)[number];

/** What an accent means in an illustration (README.md). Blocked has no colour: it's an ink cross. */
export const ACCENTS = ["sky", "mint", "sun", "lavender", "rose", "ocean", "peach"] as const;
export type Accent = (typeof ACCENTS)[number];
/** The swash is blue or one accent. */
export type SwashTone = "blue" | Accent;
/** Every fill class in illustrations.css (`ill-f-<fill>`). */
export type Fill =
  | "none"
  | "paper"
  | "ink"
  | "ink-fixed"
  | "disc"
  | "blue"
  | "fog"
  | Accent
  | `${Accent}-tint`
  | "mint-deep"
  | "sun-deep"
  | "lavender-deep"
  | "rose-deep"
  | "ocean-deep"
  | "peach-deep";

export const fill = (f: Fill) => `ill-f-${f}`;

/** Numbers in path data: two decimals at most. */
export const n = (v: number) => +v.toFixed(2);

/** Motion props shared by the primitives. */
export type Motion = {
  anim?: Anim;
  /** Delay in ms (`--ill-delay`). */
  delay?: number;
  /** Stagger index for `rise` (`--ill-i`, 90ms apart). */
  index?: number;
  /** transform-origin for `spill`, relative to the element's own box, e.g. "20% 80%". */
  origin?: string;
};

/**
 * The attributes that put an element in motion. An element with `data-anim` must not carry a
 * `transform` attribute (CSS transforms replace it): wrap the transformed shape in a `<g>`.
 */
export function animProps({ anim, delay, index, origin }: Motion): { "data-anim"?: Anim; style?: CSSProperties } {
  if (!anim) return {};
  const style: Record<string, string | number> = {};
  if (delay) style["--ill-delay"] = `${delay}ms`;
  if (index) style["--ill-i"] = index;
  if (origin) style["--ill-origin"] = origin;
  return { "data-anim": anim, ...(Object.keys(style).length ? { style: style as CSSProperties } : {}) };
}
