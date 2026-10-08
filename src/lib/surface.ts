/*
 * The hairline surface grammar from the AnyForm brand (web/src/catalog/surface.ts): one flat
 * frame per component, no boxes in boxes, no shadow-lifted cards, no uppercase or tracked labels.
 */

/** The one outer frame: a white (dark: #141416) card with a hairline, flat. */
export const SURFACE =
  'rounded-lg border border-border bg-card text-card-foreground shadow-card'

/** Add to a SURFACE that is a link: the hairline darkens and the card lifts on hover. */
export const SURFACE_HOVER =
  'transition-[border-color,box-shadow] hover:border-foreground/25 hover:shadow-card-hover'

/** An inner group inside a SURFACE: a quiet fill instead of a framed box. */
export const INSET = 'rounded-md bg-muted'

/** A small label: plain sentence case, medium and muted. Never a kicker above a heading. */
export const EYEBROW = 'text-xs font-medium text-muted-foreground'
