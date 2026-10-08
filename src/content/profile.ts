/*
 * The single source of truth for everything the site says about Jackson. Pages, the
 * machine-readable outputs (llms.txt, profile.json, JSON-LD) and the chatbot all read from here.
 *
 * Grounding rule: every value comes from Jackson, his resume or the projects' own READMEs. Nothing
 * is invented. A value that hasn't been written yet is `null` (or an empty list), and the UI and
 * the outputs leave it out.
 */

import type {
  Education,
  Experience,
  Link,
  Project,
  Skill,
  WorkNode
} from './types'

export type {
  Accent,
  Education,
  Experience,
  Link,
  Project,
  Skill,
  WorkNode
} from './types'

export const PROFILE = {
  name: 'Jackson Lawrence',
  role: 'Software Engineer',
  location: 'San Francisco, CA',
  email: 'jlawrence1787@gmail.com',
  url: 'https://jlawrence.io',
  resume: '/resume.pdf',
  /** A one-line description, for metadata and the machine-readable views. */
  intro:
    'I’m Jackson Lawrence, a software engineer at Oracle based in San Francisco, CA.',
  /**
   * The About, in Jackson's direction: a short lead that's always shown and a longer part behind
   * "Read more". Every claim maps to his own words, his resume or a project in PROJECTS.
   * Light markup: **bold** and [links](/path) (components/site/rich-text.tsx).
   */
  about: {
    lead: [
      'I’m a **software engineer** at Oracle, building the AI agents our customers run in production. I started writing software in high school and never really stopped. Outside of work, I’m building [AnyForm](/projects/anyform) and [The Cratest](/projects/cratest).'
    ],
    more: [
      'At Oracle I architected the agentic workflow builder customers use for support chat, built OCR and RAG ingestion at the scale of millions of documents, and worked across teams to hand conversations from AI agents to human ones. When something breaks in production, I own the root cause analysis from start to finish.',
      'Before Oracle, I co-founded [Trailblaze](/projects/trailblaze) and ran engineering as CTO, taking our app past 10,000 users in its first year. I’ve also taught full-stack development at CareerFoundry, and I’ve shipped on the web, on mobile and natively on iOS, for startups, for enterprise teams and for the fun of it.'
    ]
  },
  links: [
    { label: 'GitHub', href: 'https://github.com/JacksonL1787' }
  ] as Link[]
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

const skill = (
  name: string,
  area: Skill['area'],
  explanation: string,
  projects: string[] = []
): Skill => ({ name, area, explanation, projects })

/**
 * Every skill, with an explanation tied to the resume or a project. Drafted for Jackson to edit;
 * the generic ones (no project or role behind them yet) are the first to sharpen.
 */
export const SKILLS: Skill[] = [
  // AI & agents
  skill(
    'Multi-Agent Orchestration',
    'AI & agents',
    'Getting agents to hand work to each other and to people. At Oracle I architected an agentic workflow builder that runs in production for support chat, and helped deliver the handoff from AI agents to human agents.',
    ['oracle']
  ),
  skill(
    'RAG',
    'AI & agents',
    'Grounding models in real documents. At Oracle I built and deployed an OCR + RAG pipeline that ingested over 2 million documents in under a month; as an intern I built the microservice that uploads documents for RAG.',
    ['oracle']
  ),
  skill(
    'Prompting',
    'AI & agents',
    'The everyday craft behind every agent I ship, and behind AnyForm, where models write findings from session traces and Scouts act as AI users.',
    ['anyform', 'oracle']
  ),
  skill(
    'Embeddings',
    'AI & agents',
    'Turning documents into vectors so retrieval finds meaning, not just matching words: the core of the RAG systems I build.'
  ),
  skill(
    'Vector DBs',
    'AI & agents',
    'Where embeddings live and get searched: the storage layer under a RAG pipeline.'
  ),
  skill(
    'LangGraph',
    'AI & agents',
    'Agent workflows as graphs, with state, branches and loops: the same shape as the agentic workflows I build.'
  ),
  skill(
    'LangChain',
    'AI & agents',
    'Building blocks for LLM apps: chaining model calls, tools and retrieval together.'
  ),
  skill(
    'Claude Code',
    'AI & agents',
    'One of my daily drivers for writing software. This site was built with it.'
  ),
  skill(
    'Codex',
    'AI & agents',
    'Another coding agent in my toolbox. Trying the newest tools as they land is part of staying current.'
  ),

  // Languages
  skill(
    'TypeScript',
    'Languages',
    'My default for anything on the web: AnyForm’s dashboard and site, The Cratest’s admin console and this portfolio.',
    ['anyform', 'cratest']
  ),
  skill(
    'Go',
    'Languages',
    'The backend language of my current projects: both AnyForm’s and The Cratest’s APIs are written in Go.',
    ['anyform', 'cratest']
  ),
  skill(
    'Java',
    'Languages',
    'Enterprise backends at Oracle, including a Helidon MP microservice with CRUD endpoints for RAG document uploads.',
    ['oracle']
  ),
  skill(
    'Python',
    'Languages',
    'Scripting and AI tooling, where new AI libraries usually land first.'
  ),
  skill(
    'SQL',
    'Languages',
    'Designing data models, from Trailblaze’s database architecture to the PostgreSQL schemas behind AnyForm and The Cratest.',
    ['trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'JavaScript',
    'Languages',
    'The language I learned the web on, and the base of everything I build with React and Node.js.'
  ),
  skill(
    'GraphQL',
    'Languages',
    'APIs queried by shape, so a client asks for exactly the data it needs.'
  ),

  // Frontend & mobile
  skill(
    'Next.js',
    'Frontend & mobile',
    'Trailblaze’s public website, AnyForm’s dashboard and site, The Cratest’s admin console, and this site.',
    ['trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'React Native',
    'Frontend & mobile',
    'I built Trailblaze’s job-recruiting app in React Native, screens to services to database, and grew it past 10,000 users in under a year.',
    ['trailblaze']
  ),
  skill(
    'SwiftUI',
    'Frontend & mobile',
    'The Cratest’s native iOS app is SwiftUI with UIKit, music games like Crate Digger and Cover Story included.',
    ['cratest']
  ),
  skill(
    'React',
    'Frontend & mobile',
    'The foundation under my web and mobile work, from React Native apps to Next.js sites.',
    ['trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'Oracle JET',
    'Frontend & mobile',
    'Oracle’s JavaScript toolkit. As an intern I designed a type-safe way for a Knockout-based JET project to manage global state with 30+ variables.',
    ['oracle']
  ),
  skill(
    'Tailwind CSS',
    'Frontend & mobile',
    'How I style most things, this site included.'
  ),

  // Backend & data
  skill(
    'PostgreSQL',
    'Backend & data',
    'The database under both AnyForm and The Cratest.',
    ['anyform', 'cratest']
  ),
  skill(
    'REST APIs',
    'Backend & data',
    'From a microservice for LLM queries and file uploads, where I automated testing for over 90% of scenarios, to the Go APIs behind my projects.',
    ['anyform', 'cratest', 'oracle']
  ),
  skill(
    'Helidon',
    'Backend & data',
    'Oracle’s Java microservice framework. I built and deployed a Helidon MP service with CRUD endpoints for RAG uploads.',
    ['oracle']
  ),
  skill(
    'Oracle 26ai Database',
    'Backend & data',
    'Oracle’s AI database, with vector search built in.'
  ),
  skill(
    'Node.js',
    'Backend & data',
    'JavaScript on the server, for APIs and tooling.'
  ),
  skill('Express', 'Backend & data', 'Lightweight HTTP APIs on Node.js.'),

  // Cloud & tools
  skill(
    'AWS',
    'Cloud & tools',
    'KoiStream delivered HD live video to our school community through AWS MediaLive and Amazon CloudFront.',
    ['koistream']
  ),
  skill(
    'FFmpeg',
    'Cloud & tools',
    'The video workhorse behind KoiStream’s HD live streams.',
    ['koistream']
  ),
  skill(
    'Playwright',
    'Cloud & tools',
    'AnyForm’s Scouts, AI users that rehearse your app before real users do, run on Playwright.',
    ['anyform']
  ),
  skill(
    'OCI',
    'Cloud & tools',
    'Oracle Cloud Infrastructure, home to my enterprise work at Oracle.',
    ['oracle']
  ),
  skill(
    'Terraform',
    'Cloud & tools',
    'Infrastructure as code: cloud setups that are written down, reviewed and repeatable.'
  ),
  skill(
    'Kubernetes',
    'Cloud & tools',
    'Running and scaling containerised services.'
  ),
  skill('Figma', 'Cloud & tools', 'Where I design before I build.'),
  skill(
    'GitHub',
    'Cloud & tools',
    'Where my code lives, KoiStream, TEDx and Branch included.',
    ['koistream', 'tedx', 'branch']
  ),
  skill('Jira', 'Cloud & tools', 'Tracking work on enterprise teams.'),

  // How I work
  skill(
    'Root cause analysis',
    'How I work',
    'Following a problem all the way to its cause, not just its symptom. Full RCA, start to finish.'
  ),
  skill(
    'Design Thinking',
    'How I work',
    'Design thinking has shaped how I build since high school at Design Tech. It taught me to start with the people I’m building for, then prototype, test and refine until it works for them. Every product I’ve designed since has started with the user.'
  ),
  skill(
    'Agile',
    'How I work',
    'Scrum meetings, code reviews and production releases alongside full-time developers since my first Oracle internship.',
    ['oracle']
  ),
  skill(
    'UI/UX',
    'How I work',
    'Designing for the people using it. Trailblaze’s website was mine end to end, and AnyForm exists to find what gets in users’ way.',
    ['trailblaze', 'anyform']
  ),
  skill(
    'Teaching',
    'How I work',
    'As a CareerFoundry instructor I taught new developers to build full-stack web apps, with feedback on every project within 24 hours.'
  ),
  skill(
    'Startups',
    'How I work',
    'Co-founder and CTO of Trailblaze for over three years, from the first screen to 10,000+ users.',
    ['trailblaze']
  )
]

export const PROJECTS: Project[] = [
  {
    slug: 'anyform',
    accent: 'sky',
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
    accent: 'sun',
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
    accent: 'mint',
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
    accent: 'lavender',
    title: 'KoiStream',
    summary:
      'Connecting students, staff, and families through community livestreams.',
    status: 'archived',
    role: 'Director & Full-Stack Developer',
    dates: { start: 'March 2020', end: 'June 2021' },
    stack: ['FFmpeg', 'AWS MediaLive', 'Amazon CloudFront'],
    links: [
      { label: 'GitHub', href: 'https://github.com/JacksonL1787/koistream' }
    ],
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
    accent: 'sky',
    title: 'TEDx Design Tech',
    summary: 'Sell and manage tickets for a high school TEDx event.',
    status: 'archived',
    role: null,
    dates: null,
    stack: [],
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/JacksonL1787/ticketing-tedxdesigntech'
      }
    ],
    highlights: [],
    story: [],
    image: '/tedx-mockup-2.png',
    imageKind: 'web'
  },
  {
    slug: 'branch',
    accent: 'mint',
    title: 'Branch',
    summary: 'Smart school prototype presented at Oracle OpenWorld 2019.',
    status: 'archived',
    role: null,
    dates: null,
    stack: [],
    links: [
      { label: 'GitHub', href: 'https://github.com/JacksonL1787/Branch' }
    ],
    highlights: ['Presented at Oracle OpenWorld 2019'],
    story: [],
    image: '/branch-mockup.png',
    imageKind: 'web'
  }
]

/**
 * Work that sits beside the projects in the skills constellation without a page of its own. Kept
 * to the resume's facts.
 */
export const WORK: WorkNode[] = [
  {
    slug: 'oracle',
    title: 'Oracle',
    accent: 'sky',
    summary:
      'Software Engineer since June 2025, after two internships. AI agents in production for support chat, OCR and RAG ingestion, and AI-to-human handoff.'
  }
]

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug)

/** The display name of anything a skill can be used in: a project or a work bubble. */
export const usedInTitle = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug)?.title ??
  WORK.find((w) => w.slug === slug)?.title

export const formatDates = (d: { start: string; end: string | null }) =>
  `${d.start} – ${d.end ?? 'Present'}`
