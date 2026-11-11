import type { Accent } from '@/content/profile'

/*
 * The brand's pastel accents as Tailwind classes (src/styles/brand-palette.css). Written out in
 * full so Tailwind sees every class. Tints fill large panels; the full accent marks small things.
 */

/** A large panel behind a project's art. */
export const TINT_BG: Record<Accent, string> = {
  sky: 'bg-illo-sky-tint',
  mint: 'bg-illo-mint-tint',
  sun: 'bg-illo-sun-tint',
  lavender: 'bg-illo-lavender-tint',
  rose: 'bg-illo-rose-tint',
  ocean: 'bg-illo-ocean-tint',
  peach: 'bg-illo-peach-tint'
}

/** A small chip in the accent's tint, with its deep shade for text (4.5:1 or better). */
export const TINT_CHIP: Record<Accent, string> = {
  sky: 'bg-illo-sky-tint text-illo-sky-deep',
  mint: 'bg-illo-mint-tint text-illo-mint-deep',
  sun: 'bg-illo-sun-tint text-illo-sun-deep',
  lavender: 'bg-illo-lavender-tint text-illo-lavender-deep',
  rose: 'bg-illo-rose-tint text-illo-rose-deep',
  ocean: 'bg-illo-ocean-tint text-illo-ocean-deep',
  peach: 'bg-illo-peach-tint text-illo-peach-deep'
}

/** A small dot or marker in the full accent. */
export const ACCENT_BG: Record<Accent, string> = {
  sky: 'bg-illo-sky',
  mint: 'bg-illo-mint',
  sun: 'bg-illo-sun',
  lavender: 'bg-illo-lavender',
  rose: 'bg-illo-rose',
  ocean: 'bg-illo-ocean',
  peach: 'bg-illo-peach'
}

/** Small text in the accent: its deep shade on the light page, the pastel itself on the dark one. */
export const ACCENT_TEXT: Record<Accent, string> = {
  sky: 'text-illo-sky-deep dark:text-illo-sky',
  mint: 'text-illo-mint-deep dark:text-illo-mint',
  sun: 'text-illo-sun-deep dark:text-illo-sun',
  lavender: 'text-illo-lavender-deep dark:text-illo-lavender',
  rose: 'text-illo-rose-deep dark:text-illo-rose',
  ocean: 'text-illo-ocean-deep dark:text-illo-ocean',
  peach: 'text-illo-peach-deep dark:text-illo-peach'
}

/**
 * A constellation's figure line: it hands its area's colour to the line as `--tone` (the deep
 * shade on the light page, the pastel on the dark one). The line itself is drawn nearly neutral
 * with only a trace of it (globals.css, .board-line).
 */
export const ACCENT_STROKE: Record<Accent, string> = {
  sky: '[--tone:var(--af-sky-deep)] dark:[--tone:var(--af-sky)]',
  mint: '[--tone:var(--af-mint-deep)] dark:[--tone:var(--af-mint)]',
  sun: '[--tone:var(--af-sun-deep)] dark:[--tone:var(--af-sun)]',
  lavender: '[--tone:var(--af-lavender-deep)] dark:[--tone:var(--af-lavender)]',
  rose: '[--tone:var(--af-rose-deep)] dark:[--tone:var(--af-rose)]',
  ocean: '[--tone:var(--af-ocean-deep)] dark:[--tone:var(--af-ocean)]',
  peach: '[--tone:var(--af-peach-deep)] dark:[--tone:var(--af-peach)]'
}
