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
  lavender: 'bg-illo-lavender-tint'
}

/** A small chip in the accent's tint, with its deep shade for text (4.5:1 or better). */
export const TINT_CHIP: Record<Accent, string> = {
  sky: 'bg-illo-sky-tint text-illo-sky-deep',
  mint: 'bg-illo-mint-tint text-illo-mint-deep',
  sun: 'bg-illo-sun-tint text-illo-sun-deep',
  lavender: 'bg-illo-lavender-tint text-illo-lavender-deep'
}

/** A small dot or marker in the full accent. */
export const ACCENT_BG: Record<Accent, string> = {
  sky: 'bg-illo-sky',
  mint: 'bg-illo-mint',
  sun: 'bg-illo-sun',
  lavender: 'bg-illo-lavender'
}
