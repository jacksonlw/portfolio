import type { ComponentType } from 'react'
import type { IllustrationProps } from './frame'
import {
  AgentsBadge,
  BackendBadge,
  CloudBadge,
  FrontendBadge,
  LanguagesBadge,
  WorkBadge
} from './badges/areas'
import {
  AnyFormBadge,
  BranchBadge,
  CratestBadge,
  KoiStreamBadge,
  OracleBadge,
  TedxBadge,
  TrailblazeBadge
} from './badges/projects'

/**
 * Every illustration by key. Project badges are keyed by project slug, skill areas by
 * `area/<slug>`, story scenes by `<slug>/<section id>`. Drawn in the AnyForm style (crisp ink-outlined objects, a hard +4
 * shadow, a melt swash behind); colours come only from illustrations.css.
 */
export const ILLUSTRATIONS: Record<string, { component: ComponentType<IllustrationProps>; label: string }> = {
  anyform: { component: AnyFormBadge, label: 'A session replay window with a cursor and a magnifier' },
  cratest: { component: CratestBadge, label: 'A vinyl record rising out of a crate' },
  trailblaze: { component: TrailblazeBadge, label: 'A phone showing job cards' },
  koistream: { component: KoiStreamBadge, label: 'A broadcast camera on a tripod' },
  tedx: { component: TedxBadge, label: 'An event ticket' },
  branch: { component: BranchBadge, label: 'A school building with a tree beside it' },
  oracle: { component: OracleBadge, label: 'A work briefcase with an AI sparkle' },
  // Skill areas, keyed `area/<slug>`.
  'area/ai': { component: AgentsBadge, label: 'A chat window with an AI agent answering' },
  'area/languages': { component: LanguagesBadge, label: 'A code editor' },
  'area/frontend': { component: FrontendBadge, label: 'A browser window and a phone' },
  'area/backend': { component: BackendBadge, label: 'A database' },
  'area/cloud': { component: CloudBadge, label: 'A cloud with a terminal' },
  'area/work': { component: WorkBadge, label: 'A task board' }
}

/** An illustration by key, labelled for screen readers and playing its motion when seen. */
export function Illustration({
  name,
  className,
  size,
  decorative
}: {
  name: string
  className?: string
  size?: number | string
  /** Hide it from screen readers when the text beside it already says what it is. */
  decorative?: boolean
}) {
  const entry = ILLUSTRATIONS[name]
  if (!entry) return null
  const Art = entry.component
  return <Art label={entry.label} decorative={decorative} autoplay className={className} size={size} />
}

export const hasIllustration = (name: string | null) => !!name && name in ILLUSTRATIONS
