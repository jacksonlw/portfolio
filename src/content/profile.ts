/*
 * The single source of truth for everything the site says about Jackson. Pages, the
 * machine-readable outputs (llms.txt, profile.json, JSON-LD) and the chatbot all read from here.
 *
 * Grounding rule: every value comes from Jackson, his resume or the projects' own READMEs. Nothing
 * is invented. A value that hasn't been written yet is `null`, and the UI leaves it out.
 */

export type Project = {
  slug: string
  title: string
  /** One line, shown on cards. */
  summary: string
  /** Optional link to the live product or the repo. */
  url: string | null
  /** A screenshot in /public, until the project's illustration lands. */
  image: string | null
  imageKind: 'mobile' | 'web' | null
}

export const PROFILE = {
  name: 'Jackson Lawrence',
  role: 'Software Engineer',
  /** The big line at the top of the home page. Grounded in his Oracle agent work in production. */
  headline: 'I build AI agents for production.',
  location: 'San Francisco, CA',
  email: 'jlawrence1787@gmail.com',
  url: 'https://jlawrence.io',
  resume: '/resume.pdf',
  /** The intro under the name. Jackson is writing the full about; this line is from the resume. */
  intro: 'I’m Jackson Lawrence, a software engineer at Oracle based in San Francisco, CA.',
  about: null as string | null
}

export const PROJECTS: Project[] = [
  {
    slug: 'anyform',
    title: 'AnyForm',
    summary: 'See what your users saw, and fix what got in their way.',
    url: null,
    image: null,
    imageKind: null
  },
  {
    slug: 'cratest',
    title: 'The Cratest',
    summary: 'A social platform for reviewing songs, albums and artists.',
    url: null,
    image: null,
    imageKind: null
  },
  {
    slug: 'trailblaze',
    title: 'Trailblaze',
    summary: 'Job opportunities for the next generation of talent.',
    url: 'https://trailblaze.to',
    image: '/grindstone-mockup-2.png',
    imageKind: 'mobile'
  },
  {
    slug: 'koistream',
    title: 'KoiStream',
    summary:
      'Connecting students, staff, and families through community livestreams.',
    url: 'https://github.com/JacksonL1787/koistream',
    image: '/koistream-mockup.png',
    imageKind: 'web'
  },
  {
    slug: 'tedx',
    title: 'TEDx Design Tech High School',
    summary: 'Sell and manage tickets for a high school TEDx event.',
    url: 'https://github.com/JacksonL1787/ticketing-tedxdesigntech',
    image: '/tedx-mockup-2.png',
    imageKind: 'web'
  },
  {
    slug: 'branch',
    title: 'Branch',
    summary: 'Smart school prototype presented at Oracle OpenWorld 2019.',
    url: 'https://github.com/JacksonL1787/Branch',
    image: '/branch-mockup.png',
    imageKind: 'web'
  }
]
