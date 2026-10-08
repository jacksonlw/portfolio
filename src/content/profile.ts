/*
 * The single source of truth for everything the site says about Jackson. Pages, the
 * machine-readable outputs (llms.txt, profile.json, JSON-LD) and the chatbot all read from here.
 *
 * Grounding rule: every value comes from Jackson, his resume or the projects' own READMEs. Nothing
 * is invented. A value that hasn't been written yet is `null` (or an empty list), and the UI and
 * the outputs leave it out.
 */

import type { Education, Experience, Link, Project, Skill } from './types'

export type { Education, Experience, Link, Project, Skill } from './types'

export const PROFILE = {
  name: 'Jackson Lawrence',
  role: 'Software Engineer',
  /** The big line at the top of the home page. Grounded in his Oracle agent work in production. */
  headline: 'I build AI agents for production.',
  location: 'San Francisco, CA',
  email: 'jlawrence1787@gmail.com',
  url: 'https://jlawrence.io',
  resume: '/resume.pdf',
  /** The intro under the headline. Jackson is writing the full about; this line is from the resume. */
  intro: 'I’m Jackson Lawrence, a software engineer at Oracle based in San Francisco, CA.',
  about: null as string | null,
  links: [{ label: 'GitHub', href: 'https://github.com/JacksonL1787' }] as Link[]
}

export const EXPERIENCE: Experience[] = [
  {
    company: 'Oracle',
    title: 'Software Engineer',
    location: null,
    dates: { start: 'June 2025', end: null },
    // Draft wording from Jackson; to be strengthened with his facts before the resume rebuild.
    bullets: [
      'Architected an agentic workflow builder, adopted by multiple customers and deployed in production for support chat use cases',
      'Developed and deployed an OCR + RAG pipeline that ingested more than 2 million documents in less than a month',
      'Collaborated across multiple teams to deliver AI agent to human agent handoff'
    ]
  },
  {
    company: 'Oracle',
    title: 'Software Engineer Intern',
    location: 'Redwood City, CA',
    dates: { start: 'June 2024', end: 'September 2024' },
    bullets: [
      'Developed and deployed a Helidon MP microservice featuring CRUD endpoints to upload documents for RAG',
      'Designed a type-safe way for an existing Oracle JET Knockout project to manage global state with 30+ variables',
      'Automated testing for over 90% of scenarios in a REST microservice that supports LLM queries and file uploads'
    ]
  },
  {
    company: 'Oracle',
    title: 'Software Engineer Intern',
    location: 'Redwood City, CA',
    dates: { start: 'June 2023', end: 'September 2023' },
    bullets: [
      'Developed new features for internal and consumer-facing applications used in the Oracle Health LOB',
      'Collaborated with full-time developers to facilitate scrum meetings, code reviews, and production releases',
      'Expanded my technical and professional skillset by scheduling frequent meetings with leaders at Oracle'
    ]
  },
  {
    company: 'Trailblaze',
    title: 'Co-Founder & CTO',
    location: 'Boston, MA',
    dates: { start: 'January 2021', end: 'April 2024' },
    bullets: [
      'Developed screens, services, and database architecture for a job-recruiting mobile app in React Native',
      'Launched and grew the mobile app to over 10,000 users in less than one year',
      'Designed and developed the company’s public-facing website using Next.js'
    ]
  },
  {
    company: 'CareerFoundry',
    title: 'Web Development Instructor',
    location: 'Remote, US',
    dates: { start: 'July 2022', end: 'May 2023' },
    bullets: [
      'Taught new students in the industry to develop full-stack web applications',
      'Provided groups of students with feedback on projects within 24 hours of submission',
      'Collaborated with course mentors to provide students with careers in the web development industry'
    ]
  }
]

export const EDUCATION: Education[] = [
  {
    school: 'Northeastern University',
    degree: 'BS Computer Science and Business (Fintech concentration)',
    location: 'Boston, MA',
    graduated: 'June 2025',
    details: [
      'Khoury College of Computer Sciences',
      'Related courses: Object-Oriented Design, Algorithms and Data, Fundamentals of Computer Science 1 & 2, Intro to Web Development, Discrete Structures, Foundations of Cybersecurity'
    ]
  }
]

const skill = (name: string, area: Skill['area'], projects: string[] = []): Skill => ({
  name,
  area,
  explanation: null,
  projects
})

/** From the resume plus the skills Jackson added. Project links only where a README or the resume shows it. */
export const SKILLS: Skill[] = [
  skill('Prompting', 'AI & agents'),
  skill('Multi-Agent Orchestration', 'AI & agents'),
  skill('Claude Code', 'AI & agents'),
  skill('Codex', 'AI & agents'),
  skill('LangChain', 'AI & agents'),
  skill('LangGraph', 'AI & agents'),
  skill('RAG', 'AI & agents'),
  skill('Embeddings', 'AI & agents'),
  skill('Vector DBs', 'AI & agents'),
  skill('TypeScript', 'Languages', ['anyform']),
  skill('JavaScript', 'Languages'),
  skill('Go', 'Languages', ['anyform', 'cratest']),
  skill('Java', 'Languages'),
  skill('Python', 'Languages'),
  skill('SQL', 'Languages', ['anyform', 'cratest']),
  skill('GraphQL', 'Languages'),
  skill('React', 'Frontend & mobile'),
  skill('Next.js', 'Frontend & mobile', ['anyform', 'cratest', 'trailblaze']),
  skill('React Native', 'Frontend & mobile', ['trailblaze']),
  skill('SwiftUI', 'Frontend & mobile', ['cratest']),
  skill('Tailwind CSS', 'Frontend & mobile'),
  skill('Node.js', 'Backend'),
  skill('Express', 'Backend'),
  skill('Helidon', 'Backend'),
  skill('PostgreSQL', 'Backend', ['anyform', 'cratest']),
  skill('Oracle 26ai Database', 'Backend'),
  skill('REST APIs', 'Backend'),
  skill('OCI', 'Cloud & tools'),
  skill('AWS', 'Cloud & tools', ['koistream']),
  skill('Terraform', 'Cloud & tools'),
  skill('Kubernetes', 'Cloud & tools'),
  skill('Playwright', 'Cloud & tools', ['anyform']),
  skill('Figma', 'Cloud & tools'),
  skill('GitHub', 'Cloud & tools'),
  skill('Jira', 'Cloud & tools')
]

export const PROJECTS: Project[] = [
  {
    slug: 'anyform',
    title: 'AnyForm',
    summary: 'See what your users saw, and fix what got in their way.',
    status: 'in-development',
    role: null,
    dates: null,
    stack: ['Go', 'Next.js', 'TypeScript', 'PostgreSQL', 'Playwright'],
    links: [],
    highlights: [],
    story: [],
    image: null,
    imageKind: null
  },
  {
    slug: 'cratest',
    title: 'The Cratest',
    summary: 'A social platform for reviewing songs, albums and artists.',
    status: 'in-development',
    role: null,
    dates: null,
    stack: ['Go', 'PostgreSQL', 'SwiftUI', 'UIKit', 'Next.js'],
    links: [],
    highlights: [],
    story: [],
    image: null,
    imageKind: null
  },
  {
    slug: 'trailblaze',
    title: 'Trailblaze',
    summary: 'Job opportunities for the next generation of talent.',
    status: null,
    role: 'Co-Founder & CTO',
    dates: { start: 'January 2021', end: 'April 2024' },
    stack: ['React Native', 'Next.js'],
    links: [{ label: 'trailblaze.to', href: 'https://trailblaze.to' }],
    highlights: [
      'Grew the mobile app to over 10,000 users in less than one year',
      'Built the screens, services and database architecture of the React Native app',
      'Designed and built the public website in Next.js'
    ],
    story: [],
    image: '/grindstone-mockup-2.png',
    imageKind: 'mobile'
  },
  {
    slug: 'koistream',
    title: 'KoiStream',
    summary: 'Connecting students, staff, and families through community livestreams.',
    status: 'archived',
    role: 'Director & Full-Stack Developer',
    dates: { start: 'March 2020', end: 'June 2021' },
    stack: ['FFmpeg', 'AWS MediaLive', 'Amazon CloudFront'],
    links: [{ label: 'GitHub', href: 'https://github.com/JacksonL1787/koistream' }],
    highlights: [
      'Built a live streaming platform with viewing, chatting and moderation',
      'Delivered HD video through FFmpeg, AWS MediaLive and Amazon CloudFront',
      'Built a full broadcasting studio on campus with high-grade production equipment'
    ],
    story: [],
    image: '/koistream-mockup.png',
    imageKind: 'web'
  },
  {
    slug: 'tedx',
    title: 'TEDx Design Tech High School',
    summary: 'Sell and manage tickets for a high school TEDx event.',
    status: 'archived',
    role: null,
    dates: null,
    stack: [],
    links: [
      { label: 'GitHub', href: 'https://github.com/JacksonL1787/ticketing-tedxdesigntech' }
    ],
    highlights: [],
    story: [],
    image: '/tedx-mockup-2.png',
    imageKind: 'web'
  },
  {
    slug: 'branch',
    title: 'Branch',
    summary: 'Smart school prototype presented at Oracle OpenWorld 2019.',
    status: 'archived',
    role: null,
    dates: null,
    stack: [],
    links: [{ label: 'GitHub', href: 'https://github.com/JacksonL1787/Branch' }],
    highlights: ['Presented at Oracle OpenWorld 2019'],
    story: [],
    image: '/branch-mockup.png',
    imageKind: 'web'
  }
]

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug)

export const formatDates = (d: { start: string; end: string | null }) =>
  `${d.start} – ${d.end ?? 'Present'}`
