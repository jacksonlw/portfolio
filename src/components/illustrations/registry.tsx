import type { CSSProperties } from 'react'
import { ChromeGlyph } from './chrome'
import { DRAWINGS } from './drawings'
import { GLYPHS } from './glyphs'

/**
 * Every illustration by key: satellites by kind, logo-less bubbles by slug. Each is a chrome line
 * glyph (glyphs.ts, drawn by chrome.tsx); drawings.ts keeps each subject's label.
 */
export const ILLUSTRATIONS = DRAWINGS

/** An illustration by key, labelled for screen readers unless it's decorative. */
export function Illustration({
  name,
  light,
  className,
  style,
  decorative
}: {
  name: string
  /** Where the light comes from, in degrees on screen (from above when not given). */
  light?: number
  className?: string
  style?: CSSProperties
  /** Hide it from screen readers when the text beside it already says what it is. */
  decorative?: boolean
}) {
  const glyph = GLYPHS[name]
  if (!glyph) return null
  return (
    <ChromeGlyph
      glyph={glyph}
      name={name}
      light={light}
      label={decorative ? undefined : DRAWINGS[name]?.label}
      className={className}
      style={style}
    />
  )
}

export const hasIllustration = (name: string | null) => !!name && name in GLYPHS
