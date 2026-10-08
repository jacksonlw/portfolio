import type { ComponentType } from 'react'

/**
 * Every illustration by key. Project badges are keyed by project slug; story scenes by
 * `<slug>/<section id>`. Illustrations are inline SVGs with a viewBox, role="img" and a <title>,
 * drawn in the AnyForm style (crisp ink-outlined objects, a hard +4 shadow, a melt swash behind).
 */
export const ILLUSTRATIONS: Record<string, ComponentType<{ className?: string }>> = {}

export function Illustration({ name, className }: { name: string; className?: string }) {
  const Art = ILLUSTRATIONS[name]
  return Art ? <Art className={className} /> : null
}

export const hasIllustration = (name: string | null) => !!name && name in ILLUSTRATIONS
