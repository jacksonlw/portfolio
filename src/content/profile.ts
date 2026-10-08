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
  /** The search and share description: what a scanner should take away in one sentence. */
  description:
    'Software engineer in San Francisco building AI agents in production at Oracle (multi-agent orchestration, RAG, full-stack), plus AnyForm and The Cratest.',
  photo: '/profile-picture.jpg',
  /**
   * The About, in Jackson's direction: a short lead that's always shown and a longer part behind
   * "Read more". Every claim maps to his own words, his resume or a project in PROJECTS.
   * Light markup: **bold** (components/site/rich-text.tsx).
   */
  about: {
    lead: [
      'I’m a **software engineer** who builds products people actually want to use. I picked up design thinking in high school and it’s shaped how I work ever since: I start with the people I’m building for, put something real in front of them early, and keep refining until it works for them.'
    ],
    more: [
      'That approach has carried me from a smart school prototype I presented at Oracle OpenWorld and a livestream platform for my school’s community, to co-founding Trailblaze and growing our app past 10,000 users in its first year, to teaching new developers at CareerFoundry. Today I build AI agents at Oracle, and on my own time I’m working on AnyForm and The Cratest.',
      'I keep a close eye on markets and emerging tech, because the best products come from knowing both what people need and what is possible.'
    ]
  },
  links: [{ label: 'Code', href: 'https://github.com/JacksonL1787' }] as Link[]
}

export const EXPERIENCE: Experience[] = [
  // Matches resume/resume.html.
  {
    company: 'Oracle',
    title: 'Software Engineer',
    location: 'Redwood Shores, CA',
    dates: { start: 'June 2025', end: null },
    bullets: [
      'Architected an agentic workflow builder adopted by multiple customers, handling thousands of Gen AI chats daily',
      'Developed and deployed an OCR + RAG pipeline that ingested over 2 million documents in less than a month',
      'Partnered with multiple teams to deliver AI agent to human agent handoff for production support chat',
      'Own full-stack projects end to end on a small R&D team, from design through production deployment'
    ]
  },
  {
    company: 'Oracle',
    title: 'Software Engineer Intern (x2)',
    location: 'Redwood City, CA',
    dates: { start: 'Summers 2023', end: '2024' },
    bullets: [
      'Developed and deployed a Helidon MP microservice featuring CRUD endpoints to upload documents for RAG',
      'Designed a type-safe way for an existing Oracle JET Knockout project to manage global state with 30+ variables',
      'Automated testing for over 90% of scenarios in a REST microservice that supports LLM queries and file uploads',
      'Developed new features for internal and consumer-facing applications used in the Oracle Health LOB'
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
  },
  {
    company: 'KoiStream',
    title: 'Director & Full-Stack Developer',
    location: 'Redwood City, CA',
    dates: { start: 'March 2020', end: 'June 2021' },
    bullets: [
      'Developed a live streaming platform with viewing, chatting, and moderation capabilities',
      'Delivered HD video stream through the use of FFmpeg, AWS MediaLive, and Amazon CloudFront',
      'Constructed a full-fledged broadcasting studio on campus with high-grade production equipment'
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
    'Getting agents to hand work to each other and to people. At Oracle I architected an agentic workflow builder that handles thousands of Gen AI chats a day in production, and helped deliver the handoff from AI agents to human agents.',
    ['oracle']
  ),
  skill(
    'RAG',
    'AI & agents',
    'Grounding models in real documents. At Oracle I built and deployed an OCR + RAG pipeline that ingested over 2 million documents in under a month; as an intern I built the microservice that uploads documents for RAG.',
    ['oracle']
  ),
  skill(
    'Prompt Engineering',
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
    'Where embeddings live and get searched: the storage layer under the RAG pipelines I build at Oracle.',
    ['oracle']
  ),
  skill(
    'LangGraph',
    'AI & agents',
    'Agent workflows as graphs, with state, branches and loops: the shape of the agentic workflows I build at Oracle.',
    ['oracle']
  ),
  skill(
    'LangChain',
    'AI & agents',
    'Building blocks for LLM apps: chaining model calls, tools and retrieval together, part of my AI work at Oracle.',
    ['oracle']
  ),
  skill(
    'Claude Code',
    'AI & agents',
    'One of my daily drivers for writing software, on AnyForm, The Cratest and this site.',
    ['anyform', 'cratest']
  ),
  skill(
    'Codex',
    'AI & agents',
    'One of the coding agents I use at Oracle. Trying the newest tools as they land is part of staying current.',
    ['oracle']
  ),

  // Languages
  skill(
    'TypeScript',
    'Languages',
    'My default since KoiStream: Trailblaze, AnyForm, The Cratest, this site, and my work at Oracle.',
    ['oracle', 'koistream', 'trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'Go',
    'Languages',
    'My backend language of choice: Trailblaze’s services and the APIs behind AnyForm and The Cratest.',
    ['trailblaze', 'anyform', 'cratest']
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
    'Scripting and AI tooling at Oracle, where new AI libraries usually land first.',
    ['oracle']
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
    'The language under everything I’ve built, from Branch and KoiStream to Trailblaze, my teaching at CareerFoundry and my work at Oracle.',
    [
      'oracle',
      'careerfoundry',
      'anyform',
      'cratest',
      'trailblaze',
      'koistream',
      'tedx',
      'branch'
    ]
  ),
  skill(
    'GraphQL',
    'Languages',
    'The API layer behind Trailblaze, so the app asks for exactly the data it needs.',
    ['trailblaze']
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
    'I built Trailblaze’s job-recruiting app in React Native, screens to services to database, and grew it past 10,000 users in under a year. The Cratest uses it too.',
    ['trailblaze', 'cratest']
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
    'The foundation under my web and mobile work: Trailblaze, AnyForm, The Cratest, my teaching at CareerFoundry and my work at Oracle.',
    ['oracle', 'careerfoundry', 'trailblaze', 'anyform', 'cratest']
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
    'How I style the web: AnyForm, The Cratest, Trailblaze and this site.',
    ['anyform', 'cratest', 'trailblaze']
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
    'The backbone of nearly everything I’ve built: from a microservice for LLM queries and file uploads at Oracle, where I automated testing for over 90% of scenarios, to the APIs behind every one of my projects.',
    [
      'oracle',
      'anyform',
      'cratest',
      'trailblaze',
      'koistream',
      'tedx',
      'branch'
    ]
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
    'JavaScript on the server, behind Branch, the TEDx ticketing site and KoiStream.',
    ['branch', 'tedx', 'koistream']
  ),
  skill(
    'Express',
    'Backend & data',
    'HTTP APIs on Node.js for Branch, the TEDx ticketing site and KoiStream.',
    ['branch', 'tedx', 'koistream']
  ),

  // Cloud & tools
  skill(
    'AWS',
    'Cloud & tools',
    'KoiStream delivered HD live video through AWS MediaLive and Amazon CloudFront, and Trailblaze, AnyForm and The Cratest run on AWS too.',
    ['koistream', 'trailblaze', 'anyform', 'cratest']
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
    'Browser automation at Oracle, and the engine behind AnyForm’s Scouts, AI users that rehearse your app before real users do.',
    ['oracle', 'anyform']
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
    'Infrastructure as code at Oracle and for AnyForm and The Cratest: cloud setups that are written down, reviewed and repeatable.',
    ['oracle', 'anyform', 'cratest']
  ),
  skill(
    'Kubernetes',
    'Cloud & tools',
    'Running and scaling containerised services at Oracle.',
    ['oracle']
  ),
  skill(
    'Figma',
    'Cloud & tools',
    'Where I design before I build: Trailblaze, KoiStream and the lessons I taught at CareerFoundry.',
    ['trailblaze', 'koistream', 'careerfoundry']
  ),
  skill(
    'Git',
    'Cloud & tools',
    'Version control for everything I build, including the public source for KoiStream, TEDx Design Tech and Branch.',
    ['koistream', 'tedx', 'branch']
  ),
  skill('Jira', 'Cloud & tools', 'Tracking work at Oracle and at Trailblaze.', [
    'oracle',
    'trailblaze'
  ]),

  // How I work
  skill(
    'Root cause analysis',
    'How I work',
    'Following a problem all the way to its cause, not just its symptom. Full RCA, start to finish.'
  ),
  skill(
    'Design Thinking',
    'How I work',
    'Design thinking has shaped how I build since high school at Design Tech. It taught me to start with the people I’m building for, then prototype, test and refine until it works for them. Every product I’ve designed since has started with the user.',
    [
      'oracle',
      'careerfoundry',
      'anyform',
      'cratest',
      'trailblaze',
      'koistream',
      'tedx',
      'branch'
    ]
  ),
  skill(
    'Agile',
    'How I work',
    'Scrum meetings, code reviews and production releases with Oracle teams since my first internship, and the same rhythm running engineering at Trailblaze.',
    ['oracle', 'trailblaze']
  ),
  skill(
    'UI/UX',
    'How I work',
    'Designing for the people using it, in my work at Oracle and in every project I’ve built: Trailblaze’s website was mine end to end, and AnyForm exists to find what gets in users’ way.',
    [
      'oracle',
      'anyform',
      'cratest',
      'trailblaze',
      'koistream',
      'tedx',
      'branch'
    ]
  ),
  skill(
    'Teaching',
    'How I work',
    'As a CareerFoundry instructor I taught new developers to build full-stack web apps, with feedback on every project within 24 hours.',
    ['careerfoundry']
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
    tagline: 'AI-reviewed session replays',
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
    tagline: 'Social music reviews',
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
    accent: 'ocean',
    title: 'Trailblaze',
    tagline: 'Jobs for new talent',
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
    tagline: 'Community livestreams',
    summary:
      'Connecting students, staff, and families through community livestreams.',
    status: 'archived',
    role: 'Director & Full-Stack Developer',
    dates: { start: 'March 2020', end: 'June 2021' },
    stack: ['FFmpeg', 'AWS MediaLive', 'Amazon CloudFront'],
    links: [
      {
        label: 'Source code',
        href: 'https://github.com/JacksonL1787/koistream'
      }
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
    accent: 'rose',
    title: 'TEDx Design Tech',
    tagline: 'Event ticketing',
    summary: 'Sell and manage tickets for a high school TEDx event.',
    status: 'archived',
    role: null,
    dates: null,
    stack: [],
    links: [
      {
        label: 'Source code',
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
    tagline: 'Smart school prototype',
    summary: 'Smart school prototype presented at Oracle OpenWorld 2019.',
    status: 'archived',
    role: null,
    dates: null,
    stack: [],
    links: [
      { label: 'Source code', href: 'https://github.com/JacksonL1787/Branch' }
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
    tagline: 'Software Engineer',
    accent: 'rose',
    summary:
      'Software Engineer on a small R&D team since June 2025, after two internships. Full-stack ownership of AI agents in production, handling thousands of Gen AI chats a day, plus OCR and RAG ingestion and AI-to-human handoff.'
  },
  {
    slug: 'careerfoundry',
    title: 'CareerFoundry',
    tagline: 'Web Development Instructor',
    accent: 'peach',
    summary:
      'Web Development Instructor, July 2022 to May 2023. Taught new developers to build full-stack web apps, with feedback on every project within 24 hours.'
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
