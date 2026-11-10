/*
 * The single source of truth for everything the site says about Jackson. Pages, the
 * machine-readable outputs (llms.txt, profile.json, JSON-LD) and the chatbot all read from here.
 *
 * Grounding rule: every value comes from Jackson, his resume or the projects' own READMEs. Nothing
 * is invented. A value that hasn't been written yet is `null` (or an empty list), and the UI and
 * the outputs leave it out.
 */

import type {
  DateRange,
  Education,
  Experience,
  Link,
  Press,
  Project,
  Satellite,
  Skill,
  WorkNode
} from './types'

export type {
  Accent,
  Education,
  Experience,
  Link,
  Press,
  Project,
  Satellite,
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
    'I’m Jackson Lawrence, a software engineer based in San Francisco, CA.',
  /** The search and share description: what a scanner should take away in one sentence. */
  description:
    'Jackson Lawrence is a software engineer in San Francisco who builds AI agents and full-stack apps. He’s working on AnyForm, The Cratest and Waltz.',
  photo: '/profile-picture.jpg',
  /**
   * The About, in Jackson's direction: a short lead that's always shown and a longer part behind
   * "Read more". Every claim maps to his own words, his resume or a project in PROJECTS.
   * Light markup: **bold** (components/site/rich-text.tsx).
   */
  about: {
    lead: [
      'I’m a **software engineer** in San Francisco. At work I build AI agents that run in production, such as a workflow builder that handles thousands of Gen AI chats a day and a RAG pipeline that took in over 2 million documents in under a month.'
    ],
    more: [
      'On my own time I’m building AnyForm, The Cratest and Waltz. I learned design thinking in high school at Design Tech, and I still work that way, getting a prototype in front of the people I’m building for early and changing it until it works for them.',
      'Before that I co-founded Trailblaze, growing it past 10,000 users in its first year, and taught developers at CareerFoundry.'
    ]
  },
  links: [
    { label: 'Code', href: 'https://github.com/jacksonlw' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jackson-lawrence' }
  ] as Link[]
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
    location: 'Redwood Shores, CA',
    dates: {
      start: 'June 2023',
      end: 'September 2024',
      label: 'Summers 2023 & 2024'
    },
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
    title: 'Web Dev Instructor',
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
    location: 'Redwood Shores, CA',
    dates: { start: 'March 2020', end: 'June 2021' },
    bullets: [
      'Developed a live streaming platform with viewing, chatting, and moderation capabilities',
      'Delivered HD video stream through the use of FFmpeg, AWS MediaLive, and Amazon CloudFront',
      'Constructed a full-fledged broadcasting studio on campus with high-grade production equipment'
    ]
  }
]

/** Written about Jackson by others. Summaries stick to what each piece says. */
export const PRESS: Press[] = [
  {
    title:
      'From d.tech to Oracle: Jackson Lawrence and his full-circle journey',
    publisher: 'Oracle Social Impact',
    date: '2026-09-28',
    url: 'https://blogs.oracle.com/socialimpact/from-d-tech-to-oracle-jackson-lawrence-and-his-full-circle-journey',
    summary:
      'An interview about Jackson’s path from Design Tech High School (d.tech), on Oracle’s Redwood Shores campus, to a software engineer role at Oracle working on emerging AI capabilities and Oracle’s chatbots. It covers building KoiStream and the school’s broadcast studio during COVID, presenting projects at Oracle OpenWorld twice as a student, taking Oracle Education Foundation classes and later coaching d.tech students as a volunteer, and how he uses design thinking in AI work today.',
    covers: ['oracle', 'koistream']
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
      'Related courses: Software Engineering, Algorithmic Trading, Data Science Fundamentals, Object-Oriented Design, Algorithms and Data, Fundamentals of Computer Science 1 & 2, Intro to Web Development, Discrete Structures, Foundations of Cybersecurity'
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
    'Getting agents to hand work to each other and to people. At Oracle I architected an agentic workflow builder that handles thousands of Gen AI chats a day, and I helped build the handoff from AI agents to human agents in production support chat. Those workflows run on LangGraph and LangChain. Waltz is built on the same idea, where a team of agents does the work and a human steers the why.',
    ['oracle', 'waltz']
  ),
  skill(
    'RAG',
    'AI & agents',
    'Grounding models in real documents. At Oracle I built and deployed an OCR + RAG pipeline that ingested over 2 million documents in under a month. As an intern I built the microservice that uploads documents for it. The pipeline runs on embeddings and a vector database.',
    ['oracle']
  ),
  skill(
    'Prompt Engineering',
    'AI & agents',
    'Part of every agent I ship. In AnyForm, prompts are how models write findings from session traces and how Scouts act as AI users, and Waltz’s agents run on them too.',
    ['anyform', 'oracle', 'waltz']
  ),
  skill(
    'AI Coding Tools',
    'AI & agents',
    'I use Claude Code every day on AnyForm, The Cratest, Waltz and this site, and Codex at Oracle.',
    ['oracle', 'anyform', 'cratest', 'waltz']
  ),

  // Product & frontend
  skill(
    'TypeScript',
    'Product & frontend',
    'My default language since KoiStream. Trailblaze, AnyForm, The Cratest, Waltz and this site are all TypeScript, and I use it at Oracle. Before that I wrote plain JavaScript, for Branch and the TEDx ticketing site, and JavaScript is what I taught at CareerFoundry.',
    ['oracle', 'anyform', 'cratest', 'waltz', 'trailblaze', 'koistream']
  ),
  skill(
    'React / Next.js',
    'Product & frontend',
    'I’ve built Trailblaze, AnyForm, The Cratest and Waltz with React, taught it at CareerFoundry, and use it at Oracle. Next.js runs Trailblaze’s public website, AnyForm’s dashboard and site, The Cratest’s admin console and this site.',
    ['oracle', 'careerfoundry', 'trailblaze', 'anyform', 'cratest', 'waltz']
  ),
  skill(
    'React Native',
    'Product & frontend',
    'I built Trailblaze’s job-recruiting app in React Native, database included, and it passed 10,000 users in under a year. The Cratest uses it too.',
    ['trailblaze', 'cratest']
  ),
  skill(
    'SwiftUI',
    'Product & frontend',
    'The Cratest’s iOS app is SwiftUI with UIKit, and so are its music games, Crate Digger and Cover Story.',
    ['cratest']
  ),
  skill(
    'Oracle JET',
    'Product & frontend',
    'Oracle’s JavaScript toolkit. As an intern I designed a type-safe way for a Knockout-based JET project to manage global state with 30+ variables.',
    ['oracle']
  ),
  skill(
    'UI/UX & Figma',
    'Product & frontend',
    'I design what I build, at Oracle and on my own projects. Trailblaze’s website was mine to design and build, and AnyForm exists to find what gets in users’ way. I work things out in Figma first, as I did for Trailblaze and KoiStream, and I used it in my CareerFoundry lessons.',
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
    'Design Thinking',
    'Product & frontend',
    'I learned design thinking in high school at Design Tech and I still work that way. I start with the people I’m building for and get a prototype in front of them early, then change it until it works for them.',
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

  // Backend & data
  skill(
    'Go',
    'Backend & data',
    'My usual backend language. Trailblaze’s services are Go, and so are the APIs behind AnyForm and The Cratest.',
    ['trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'Rust',
    'Backend & data',
    'Waltz’s backend is Rust, with its own client for the Anthropic API, and it runs inside a Tauri desktop app.',
    ['waltz']
  ),
  skill(
    'Java / Helidon',
    'Backend & data',
    'Enterprise backends at Oracle. As an intern I built and deployed a Helidon MP microservice with CRUD endpoints for RAG document uploads.',
    ['oracle']
  ),
  skill(
    'Python',
    'Backend & data',
    'I use it at Oracle for scripts and AI tooling.',
    ['oracle']
  ),
  skill(
    'Node.js / Express',
    'Backend & data',
    'The servers behind Branch, the TEDx ticketing site and KoiStream, with Express for the HTTP APIs.',
    ['branch', 'tedx', 'koistream']
  ),
  skill(
    'PostgreSQL / SQL',
    'Backend & data',
    'I designed Trailblaze’s database, and the PostgreSQL schemas behind AnyForm and The Cratest.',
    ['trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'Oracle 26ai Database',
    'Backend & data',
    'Oracle’s AI database, with vector search built in.'
  ),
  skill(
    'REST & GraphQL',
    'Backend & data',
    'Almost everything I’ve built talks over REST. At Oracle I automated testing for over 90% of scenarios in a REST microservice that handles LLM queries and file uploads. Trailblaze’s app used GraphQL.',
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

  // Cloud
  skill(
    'AWS',
    'Cloud',
    'KoiStream delivered HD live video through AWS MediaLive and Amazon CloudFront, and Trailblaze, AnyForm and The Cratest run on AWS too.',
    ['koistream', 'trailblaze', 'anyform', 'cratest']
  ),
  skill(
    'OCI',
    'Cloud',
    'Oracle Cloud Infrastructure, where my work at Oracle runs.',
    ['oracle']
  ),
  skill(
    'Kubernetes / Terraform',
    'Cloud',
    'I use Terraform at Oracle and for AnyForm and The Cratest, so the cloud setup lives in code and gets reviewed like code. At Oracle our services run on Kubernetes.',
    ['oracle', 'anyform', 'cratest']
  ),
  skill(
    'FFmpeg',
    'Cloud',
    'KoiStream ran its HD live streams through FFmpeg.',
    ['koistream']
  ),
  skill(
    'Playwright',
    'Cloud',
    'I use it for browser automation at Oracle. In AnyForm it drives the Scouts, AI users that try your app before real users do, and Waltz’s end-to-end tests run on it.',
    ['oracle', 'anyform', 'waltz']
  )
]

export const PROJECTS: Project[] = [
  {
    slug: 'anyform',
    accent: 'sky',
    title: 'AnyForm',
    tagline: 'AI session replays',
    summary:
      'AnyForm shows you where people get stuck in your app. It records every visit and finds the trouble spots for you, and it can send AI users through the app before real ones arrive.',
    status: 'in-development',
    role: null,
    dates: { start: 'October 2026', end: null },
    stack: ['Go', 'Next.js', 'TypeScript', 'PostgreSQL', 'Playwright'],
    links: [],
    highlights: []
  },
  {
    slug: 'cratest',
    accent: 'sun',
    title: 'The Cratest',
    tagline: 'Music reviews',
    summary:
      'A Letterboxd for music. It’s an iPhone app where you rate songs and albums, keep them in your Crate and see what your friends think, with four daily music games to come back for.',
    status: 'in-development',
    role: null,
    dates: { start: 'September 2026', end: null },
    stack: ['Go', 'PostgreSQL', 'SwiftUI', 'UIKit', 'Next.js'],
    links: [],
    highlights: []
  },
  {
    slug: 'waltz',
    accent: 'lavender',
    title: 'Waltz',
    tagline: 'Agent software factory',
    summary:
      'A desktop app that runs a team of coding agents for you. The agents do the work and decide how, and you set the why. It has landed about 60 changes to its own code.',
    status: 'in-development',
    role: null,
    dates: { start: 'October 2026', end: null },
    stack: ['Rust', 'Tauri', 'React', 'TypeScript', 'Anthropic API', 'MCP'],
    links: [],
    highlights: []
  },
  {
    slug: 'koistream',
    accent: 'lavender',
    title: 'KoiStream',
    tagline: 'Livestreaming',
    summary:
      'A livestream platform that kept my high school’s community meetings going through COVID. Each weekly broadcast reached 300 to 500 viewers, essentially the whole school.',
    status: 'archived',
    role: 'Director & Full-Stack Developer',
    dates: { start: 'March 2020', end: 'June 2021' },
    stack: ['FFmpeg', 'AWS MediaLive', 'Amazon CloudFront'],
    links: [],
    highlights: [
      'Built a live streaming platform with viewing, chatting and moderation',
      'Delivered HD video through FFmpeg, AWS MediaLive and Amazon CloudFront',
      'Built a full broadcasting studio on campus with high-grade production equipment'
    ]
  },
  {
    slug: 'tedx',
    accent: 'rose',
    title: 'TEDx Design Tech',
    tagline: 'Event ticketing',
    summary:
      'A ticketing site built for my high school’s TEDx event, with a seat map of the 360-seat hall for buyers and a dashboard for the organizers.',
    status: 'archived',
    role: null,
    dates: { start: '2019', end: '2019', label: '2019' },
    stack: [],
    links: [],
    highlights: []
  },
  {
    slug: 'branch',
    accent: 'mint',
    title: 'Branch',
    tagline: 'Smart school',
    summary:
      'A smart school prototype that made a classroom safer in an emergency and easier to run day to day. We presented it at Oracle OpenWorld 2019.',
    status: 'archived',
    role: null,
    dates: { start: '2019', end: '2019', label: '2019' },
    stack: [],
    links: [],
    highlights: ['Presented at Oracle OpenWorld 2019']
  }
]

/** Jobs, beside the projects in the constellation. Kept to the resume's facts. */
export const WORK: WorkNode[] = [
  {
    slug: 'oracle',
    title: 'Oracle',
    tagline: 'Software Engineer',
    role: 'Software Engineer',
    dates: { start: 'June 2025', end: null },
    accent: 'rose',
    summary:
      'I build AI agents that run in production, on a small R&D team. The largest is a workflow builder that handles thousands of Gen AI chats a day.',
    links: []
  },
  {
    slug: 'careerfoundry',
    title: 'CareerFoundry',
    tagline: 'Web Dev Instructor',
    role: 'Web Dev Instructor',
    dates: { start: 'July 2022', end: 'May 2023' },
    accent: 'peach',
    summary:
      'I taught people new to the industry to build full-stack web apps, and got feedback on their projects back to them within 24 hours.',
    links: []
  },
  {
    slug: 'trailblaze',
    title: 'Trailblaze',
    tagline: 'Co-Founder & CTO',
    role: 'Co-Founder & CTO',
    dates: { start: 'January 2021', end: 'April 2024' },
    accent: 'ocean',
    summary:
      'A job app that helped students and young adults land their first jobs. I co-founded it and led the engineering, and it grew past 10,000 users in under a year.',
    links: []
  }
]

export const getProject = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug)

export const getWork = (slug: string) => WORK.find((w) => w.slug === slug)

/** Where a bubble's Story lives: /projects/<slug> for a project, /work/<slug> for a job. */
export const storyPath = (slug: string) =>
  WORK.some((w) => w.slug === slug) ? `/work/${slug}` : `/projects/${slug}`

/** The display name of anything a skill can be used in: a project or a work bubble. */
export const usedInTitle = (slug: string) =>
  PROJECTS.find((p) => p.slug === slug)?.title ??
  WORK.find((w) => w.slug === slug)?.title

/**
 * When a bubble's work happened, short enough to sit under it: the years ("2020–2021",
 * "2025–now"). `null` when nothing is known.
 */
export const bubbleWhen = (b: { dates: DateRange | null }) => {
  if (!b.dates) return null
  const year = (m: string) => m.slice(-4)
  const start = year(b.dates.start)
  const end = b.dates.end ? year(b.dates.end) : 'now'
  return start === end ? start : `${start}–${end}`
}

export const formatDates = (d: DateRange) =>
  d.label ?? `${d.start} – ${d.end ?? 'Present'}`

const github = PROFILE.links.find((l) => l.href.includes('github.com'))
const linkedin = PROFILE.links.find((l) => l.href.includes('linkedin.com'))

const pressDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })

/** The satellites around the Me node, most important first: resume, press, LinkedIn, GitHub, email. */
export const SATELLITES: Satellite[] = [
  {
    kind: 'resume',
    label: 'Resume',
    href: PROFILE.resume,
    title: 'Resume',
    detail: 'Open as a PDF',
    covers: []
  },
  ...PRESS.map((a) => ({
    kind: 'press' as const,
    label: 'Press',
    href: a.url,
    title: a.title,
    detail: `${a.publisher} · ${pressDate(a.date)}`,
    covers: a.covers
  })),
  ...(linkedin
    ? [
        {
          kind: 'linkedin' as const,
          label: 'LinkedIn',
          href: linkedin.href,
          title: 'LinkedIn',
          detail: linkedin.href.replace(/^https:\/\/www\.linkedin\.com\//, ''),
          covers: []
        }
      ]
    : []),
  ...(github
    ? [
        {
          kind: 'github' as const,
          label: 'GitHub',
          href: github.href,
          title: 'GitHub',
          detail: github.href.replace(/^https:\/\/github\.com\//, ''),
          covers: []
        }
      ]
    : []),
  {
    kind: 'email',
    label: 'Email',
    href: `mailto:${PROFILE.email}`,
    title: 'Email',
    detail: PROFILE.email,
    covers: []
  }
]
