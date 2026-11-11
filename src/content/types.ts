/*
 * Content shapes. Every field that Jackson hasn't supplied yet is `null` (or an empty list), and
 * the UI and the machine-readable outputs leave it out. Nothing is filled in by guesswork.
 */

export type Link = { label: string; href: string }

/** A month and year, e.g. "June 2025". `null` end means "Present". */
export type DateRange = {
  start: string
  end: string | null
  /** How to show it when start–end would mislead (e.g. two separate summers). */
  label?: string
}

/**
 * One picture or clip in a Story's gallery. `frame` says what it was taken from, so it can be
 * shown at its own shape: a phone screen, a browser window, or a plain image (a logo, a mockup).
 */
export type GalleryItem = {
  /** How the Story's text pulls it in among the paragraphs: `![](#id)`. */
  id: string
  /** A file in /public. A .mp4 or .webm is a clip: muted, looping, playing while it's in view. */
  src: string
  kind: 'image' | 'video'
  /** A clip's still, shown before it plays and under reduced motion. */
  poster: string | null
  /** One line on what it shows. */
  caption: string
  frame: 'phone' | 'browser' | 'plain'
}

/** A run of a Story's text: a paragraph (light **bold** markup) or one of its gallery items. */
export type StoryBlock =
  { kind: 'text'; text: string } | { kind: 'media'; id: string }

/** One beat of a Story: why it exists, what Jackson built, how it went, what he took from it. */
export type StorySection = { heading: string; blocks: StoryBlock[] }

/**
 * A bubble's Story: the long write-up it opens into (src/content/stories/<slug>.md), its gallery
 * first, then its beats. A bubble with no file yet opens to its recap alone.
 */
export type Story = { gallery: GalleryItem[]; sections: StorySection[] }

/** The brand's pastel accents: each project wears one (its art's swash and its tinted panels). */
export type Accent =
  'sky' | 'mint' | 'sun' | 'lavender' | 'rose' | 'ocean' | 'peach'

export type Project = {
  slug: string
  title: string
  accent: Accent
  /** A few words under the project's bubble in the constellation. */
  tagline: string
  /** One line, shown on cards and as the page lede. */
  summary: string
  status: 'live' | 'archived' | null
  role: string | null
  dates: DateRange | null
  stack: string[]
  links: Link[]
  /** Short, factual points (from the resume or Jackson), shown in the facts box. */
  highlights: string[]
}

export type Experience = {
  company: string
  title: string
  location: string | null
  dates: DateRange
  bullets: string[]
}

export type Education = {
  school: string
  degree: string
  location: string
  graduated: string
  details: string[]
}

export type SkillArea =
  'AI & agents' | 'Product & frontend' | 'Backend & data' | 'Cloud'

export type Skill = {
  name: string
  area: SkillArea
  /** What it is to Jackson and where he used it, shown on hover in the skills constellation. */
  explanation: string
  /** Where he used it: project slugs, or a work bubble's slug (WORK, e.g. 'oracle'). */
  projects: string[]
}

/** A job, shown beside the projects in the constellation. */
export type WorkNode = {
  slug: string
  title: string
  accent: Accent
  /** A few words under the bubble: the role. */
  tagline: string
  /** When the role ran, from the resume. */
  dates: DateRange
  /** The role, as the Story's recap shows it. */
  role: string
  summary: string
  links: Link[]
}

/** Something written about Jackson by someone else: an article, a profile, an interview. */
export type Press = {
  title: string
  publisher: string
  /** ISO date, e.g. "2026-09-28". */
  date: string
  url: string
  /** What the piece covers, kept to what it actually says. */
  summary: string
  /** The bubbles it covers (project or work slugs): lit with its satellite on hover. */
  covers: string[]
}

/** A small body orbiting the Me node that takes the visitor somewhere. */
export type Satellite = {
  kind: 'resume' | 'email' | 'github' | 'linkedin' | 'press'
  /** Its short name under the drawing. */
  label: string
  href: string
  /** What its popover says. */
  title: string
  detail: string
  /** The bubbles it covers (project or work slugs), lit with it on hover. */
  covers: string[]
}
