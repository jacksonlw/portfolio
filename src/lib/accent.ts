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

/** A thin line in the accent, at the strength of the constellation's figure lines. */
export const ACCENT_STROKE: Record<Accent, string> = {
  sky: 'stroke-illo-sky-deep/45 dark:stroke-illo-sky/40',
  mint: 'stroke-illo-mint-deep/45 dark:stroke-illo-mint/40',
  sun: 'stroke-illo-sun-deep/45 dark:stroke-illo-sun/40',
  lavender: 'stroke-illo-lavender-deep/45 dark:stroke-illo-lavender/40',
  rose: 'stroke-illo-rose-deep/45 dark:stroke-illo-rose/40',
  ocean: 'stroke-illo-ocean-deep/45 dark:stroke-illo-ocean/40',
  peach: 'stroke-illo-peach-deep/45 dark:stroke-illo-peach/40'
}
