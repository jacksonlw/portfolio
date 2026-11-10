import type { CSSProperties } from 'react'
import { ILLUSTRATIONS } from '@/components/illustrations/registry'

/**
 * The disc's colour: every disc is lit by a soft radial glow of its drawing's colour, on white in
 * light mode and on near-black in dark (globals.css, .node-disc), a step brighter while it's
 * hovered or lit. A Story's panel wears the same colour as it grows out of its bubble.
 */
export function discAccent(key: string): CSSProperties {
  const accent = ILLUSTRATIONS[key]?.accent
  return accent
    ? ({
        '--disc-accent': `var(--af-${accent})`,
        '--disc-deep': `var(--af-${accent}-deep)`
      } as CSSProperties)
    : {}
}
