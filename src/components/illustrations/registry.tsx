import type { CSSProperties } from 'react'
import { DRAWINGS } from './drawings'
import { DrawingSvg } from './render'

/**
 * Every illustration by key: satellites by kind, logo-less bubbles by slug. Drawn from the shape
 * data in drawings.ts.
 */
export const ILLUSTRATIONS = DRAWINGS

/** An illustration by key, labelled for screen readers unless it's decorative. */
export function Illustration({
  name,
  className,
  style,
  decorative
}: {
  name: string
  className?: string
  style?: CSSProperties
  /** Hide it from screen readers when the text beside it already says what it is. */
  decorative?: boolean
}) {
  const drawing = DRAWINGS[name]
  if (!drawing) return null
  return (
    <DrawingSvg
      drawing={drawing}
      label={decorative ? undefined : drawing.label}
      className={className}
      style={style}
    />
  )
}

export const hasIllustration = (name: string | null) =>
  !!name && name in DRAWINGS
