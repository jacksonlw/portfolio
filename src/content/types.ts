/*
 * Content shapes. Every field that Jackson hasn't supplied yet is `null` (or an empty list), and
 * the UI and the machine-readable outputs leave it out. Nothing is filled in by guesswork.
 */

export type Link = { label: string; href: string }

/** A month and year, e.g. "June 2025". `null` end means "Present". */
export type DateRange = { start: string; end: string | null }

/** One part of a project's story, written by Jackson. */
export type StorySection = {
  id: string
  heading: string
  /** Plain paragraphs, in order. */
  paragraphs: string[]
  /** The illustration drawn for this part (a key in the illustration registry), once it exists. */
  illustration: string | null
}

/** The brand's pastel accents: each project wears one (its art's swash and its tinted panels). */
export type Accent = 'sky' | 'mint' | 'sun' | 'lavender'

export type Project = {
  slug: string
  title: string
  accent: Accent
  /** One line, shown on cards and as the page lede. */
  summary: string
  status: 'live' | 'in-development' | 'archived' | null
  role: string | null
  dates: DateRange | null
  stack: string[]
  links: Link[]
  /** Short, factual points (from the resume or Jackson), shown in the facts box. */
  highlights: string[]
  /** The long-form write-up, filled in together with Jackson. */
  story: StorySection[]
  /** A screenshot in /public, until the project's illustration lands. */
  image: string | null
  imageKind: 'mobile' | 'web' | null
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

export type SkillArea = 'AI & agents' | 'Languages' | 'Frontend & mobile' | 'Backend' | 'Cloud & tools'

export type Skill = {
  name: string
  area: SkillArea
  /** Jackson's own explanation, shown on hover in the skills constellation. */
  explanation: string | null
  /** Slugs of projects where he used it. */
  projects: string[]
}
