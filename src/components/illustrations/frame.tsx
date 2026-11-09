import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";
import "./illustrations.css";

export type IllustrationKind = "badge" | "scene";
export type Surface = "page" | "card" | "ink";

/** The viewBox of each kind: badges on a 160 square (4-unit grid), scenes 640×400 (8-unit grid). */
export const VIEWBOX: Record<IllustrationKind, readonly [number, number]> = { badge: [160, 160], scene: [640, 400] };

/** What every illustration component takes (and passes to its frame). */
export type IllustrationProps = {
  /** Rendered width: px as a number (thickens the outline for small renders), or any CSS length. */
  size?: number | string;
  /** An accessible name. With one (and `decorative` not set) the illustration is `role="img"`. */
  label?: string;
  /** Hide from assistive tech even with a label. Defaults to true without a label. */
  decorative?: boolean;
  /** What it sits on: the page (default), a white card, or an ink band (blue shadow). */
  surface?: Surface;
  /** Play the entry motion when it scrolls into view (wraps it in <Reveal>). */
  autoplay?: boolean;
  /** HTML laid over the drawing, positioned in viewBox percentages (e.g. <MarkSlot>). */
  overlays?: ReactNode;
  className?: string;
};

/**
 * The outline width in viewBox units for a render `size` px wide: 2 at the base size, thicker when
 * a badge is drawn small so the outline stays about a pixel or more (56 px → 3.5).
 */
export function strokeFor(kind: IllustrationKind, size: number | string | undefined): number {
  if (typeof size !== "number") return 2;
  const sw = kind === "badge" ? 192 / size : 800 / size;
  return Math.round(Math.min(kind === "badge" ? 3.5 : 4, Math.max(2, sw)) * 4) / 4;
}

/**
 * The shared frame: one `<svg class="ill">` with the kind's viewBox, `focusable="false"`, decorative
 * by default, in an `.ill-box` that sizes it and holds any overlays.
 */
export function IllustrationFrame({
  kind,
  size,
  label,
  decorative,
  surface = "page",
  autoplay = false,
  overlays,
  className,
  children,
}: IllustrationProps & { kind: IllustrationKind; children: ReactNode }) {
  const [w, h] = VIEWBOX[kind];
  const hidden = decorative ?? !label;
  const sw = strokeFor(kind, size);
  const svg = (
    <svg
      className={`ill ill-${kind}`}
      viewBox={`0 0 ${w} ${h}`}
      focusable="false"
      data-surface={surface}
      data-autoplay={autoplay ? "" : undefined}
      style={sw === 2 ? undefined : ({ "--ill-sw": sw } as CSSProperties)}
      {...(hidden ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
    >
      {children}
    </svg>
  );
  const box = cn("ill-box", className);
  const style = size === undefined ? undefined : { width: size };
  if (autoplay)
    return (
      <Reveal className={box} style={style}>
        {svg}
        {overlays}
      </Reveal>
    );
  return (
    <span className={box} style={style}>
      {svg}
      {overlays}
    </span>
  );
}
