/*
 * Machine-readable views of src/content/profile.ts: Markdown for llms.txt and the per-page .md
 * routes, JSON for /profile.json, and schema.org JSON-LD for the HTML pages. They are derived from
 * the same content as the pages, so agents, the chatbot and people always read the same facts.
 */

import {
  EDUCATION,
  EXPERIENCE,
  PRESS,
  PROFILE,
  PROJECTS,
  SKILLS,
  WORK,
  formatDates,
  storyPath,
  usedInTitle,
  type Project,
  type WorkNode
} from '@/content/profile'
import { loadStories } from '@/content/stories'

/**
 * Every written Story, by bubble slug. Read from disk on each call (they're plain files, not
 * modules), so an edit shows up without restarting the dev server; pages are static in production.
 */
export const stories = () =>
  loadStories([...PROJECTS, ...WORK].map((b) => b.slug))

const abs = (path: string) => new URL(path, PROFILE.url).toString()

/** The About's light markup with its site links made absolute, for the Markdown views. */
const mdAbs = (text: string) =>
  text.replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${abs(path)})`)

const STATUS_LABEL: Record<NonNullable<Project['status']>, string> = {
  live: 'Live',
  archived: 'Archived'
}

export const statusLabel = (s: Project['status']) =>
  s ? STATUS_LABEL[s] : null

/** One bubble (a project or a job) as Markdown: the facts, then its Story's beats in order. */
export function bubbleMarkdown(b: Project | WorkNode, level = 1): string {
  const h = '#'.repeat(level)
  const story = stories()[b.slug]
  const lines = [`${h} ${b.title}`, '', b.summary, '']
  const facts = [
    'role' in b && b.role && `- Role: ${b.role}`,
    b.dates && `- Dates: ${formatDates(b.dates)}`,
    'status' in b && b.status && `- Status: ${statusLabel(b.status)}`,
    'stack' in b && b.stack.length > 0 && `- Stack: ${b.stack.join(', ')}`,
    ...b.links.map((l) => `- ${l.label}: ${l.href}`),
    `- Page: ${abs(storyPath(b.slug))}`
  ].filter(Boolean)
  lines.push(...(facts as string[]), '')
  if ('highlights' in b && b.highlights.length > 0) {
    lines.push(`${h}# Highlights`, '', ...b.highlights.map((x) => `- ${x}`), '')
  }
  const media = new Map(story?.gallery.map((g) => [g.id, g]))
  for (const s of story?.sections ?? []) {
    lines.push(`${h}# ${s.heading}`, '')
    for (const block of s.blocks) {
      if (block.kind === 'text') lines.push(mdAbs(block.text), '')
      else {
        const g = media.get(block.id)
        if (g) lines.push(`![${g.caption}](${abs(g.poster ?? g.src)})`, '')
      }
    }
  }
  return lines.join('\n').trimEnd() + '\n'
}

/** /llms.txt: the llmstxt.org shape. A title, a summary, then links to the detailed views. */
export function llmsTxt(): string {
  return [
    `# ${PROFILE.name}`,
    '',
    `> ${PROFILE.description}`,
    '',
    'Everything on this site comes from one content file, so these views and the HTML pages say the same thing.',
    '',
    '## Profile',
    '',
    `- [Full profile](${abs('/llms-full.txt')}): about, experience, education, skills and every project in one Markdown file`,
    `- [Structured profile](${abs('/profile.json')}): the same content as JSON`,
    `- [Resume](${abs(PROFILE.resume)}): PDF`,
    '',
    '## Projects',
    '',
    ...PROJECTS.map(
      (p) => `- [${p.title}](${abs(`${storyPath(p.slug)}.md`)}): ${p.summary}`
    ),
    '',
    '## Work',
    '',
    ...WORK.map(
      (w) => `- [${w.title}](${abs(`${storyPath(w.slug)}.md`)}): ${w.summary}`
    ),
    '',
    '## Press',
    '',
    ...PRESS.map((a) => `- [${a.title}](${a.url}): ${a.publisher}, ${a.date}`),
    '',
    '## Contact',
    '',
    `- Email: ${PROFILE.email}`,
    ...PROFILE.links.map((l) => `- ${l.label}: ${l.href}`),
    ''
  ].join('\n')
}

/** /llms-full.txt: the whole profile in one Markdown file. Also the chatbot's grounding source. */
export function llmsFullTxt(): string {
  const out: string[] = [
    `# ${PROFILE.name}`,
    '',
    `${PROFILE.role} · ${PROFILE.location} · ${PROFILE.email} · ${PROFILE.url}`,
    '',
    PROFILE.intro,
    ''
  ]
  out.push(
    '## About',
    '',
    ...[...PROFILE.about.lead, ...PROFILE.about.more].flatMap((p) => [
      mdAbs(p),
      ''
    ])
  )

  out.push('## Experience', '')
  for (const e of EXPERIENCE) {
    out.push(
      `### ${e.title}, ${e.company}`,
      '',
      [formatDates(e.dates), e.location].filter(Boolean).join(' · '),
      '',
      ...e.bullets.map((b) => `- ${b}`),
      ''
    )
  }

  out.push('## Education', '')
  for (const ed of EDUCATION) {
    out.push(
      `### ${ed.school}`,
      '',
      `${ed.degree} · ${ed.location} · ${ed.graduated}`,
      '',
      ...ed.details.map((d) => `- ${d}`),
      ''
    )
  }

  out.push('## Press', '')
  for (const a of PRESS) {
    out.push(
      `### ${a.title}`,
      '',
      `${a.publisher} · ${a.date} · ${a.url}`,
      '',
      a.summary,
      ''
    )
  }

  out.push('## Skills', '')
  for (const area of [...new Set(SKILLS.map((s) => s.area))]) {
    out.push(`### ${area}`, '')
    for (const s of SKILLS.filter((x) => x.area === area)) {
      const used = s.projects.map(usedInTitle)
      const usedIn = used.length > 0 ? ` (used in ${used.join(', ')})` : ''
      out.push(
        `- ${s.name}${usedIn}${s.explanation ? `: ${s.explanation}` : ''}`
      )
    }
    out.push('')
  }

  out.push('## Projects', '')
  for (const p of PROJECTS) out.push(bubbleMarkdown(p, 3))

  out.push('## Work', '')
  for (const w of WORK) out.push(bubbleMarkdown(w, 3))

  return out.join('\n').trimEnd() + '\n'
}

/** /profile.json: the content as-is, plus absolute URLs. Unwritten fields stay null. */
export function profileJson() {
  const written = stories()
  return {
    profile: { ...PROFILE, resume: abs(PROFILE.resume) },
    experience: EXPERIENCE,
    education: EDUCATION,
    skills: SKILLS,
    press: PRESS,
    ...Object.fromEntries(
      (
        [
          ['work', WORK],
          ['projects', PROJECTS]
        ] as const
      ).map(([key, list]) => [
        key,
        list.map((b) => ({
          ...b,
          url: abs(storyPath(b.slug)),
          markdown: abs(`${storyPath(b.slug)}.md`),
          story: written[b.slug] ?? null
        }))
      ])
    )
  }
}

/** schema.org Person, for the home page. */
/** schema.org ProfilePage around the Person, as search engines expect for a personal site. */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: PROFILE.url,
    name: `${PROFILE.name} · ${PROFILE.role}`,
    mainEntity: person()
  }
}

function person() {
  const current = EXPERIENCE.find((e) => e.dates.end === null)
  return {
    '@type': 'Person',
    '@id': abs('/#person'),
    name: PROFILE.name,
    url: PROFILE.url,
    image: abs(PROFILE.photo),
    email: `mailto:${PROFILE.email}`,
    jobTitle: PROFILE.role,
    description: PROFILE.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      addressCountry: 'US'
    },
    worksFor: current && { '@type': 'Organization', name: current.company },
    hasOccupation: current && {
      '@type': 'Occupation',
      name: current.title,
      occupationLocation: {
        '@type': 'City',
        name: current.location ?? PROFILE.location
      }
    },
    alumniOf: EDUCATION.map((e) => ({
      '@type': 'CollegeOrUniversity',
      name: e.school
    })),
    knowsAbout: SKILLS.map((s) => s.name),
    sameAs: PROFILE.links.map((l) => l.href),
    subjectOf: PRESS.map((a) => ({
      '@type': 'Article',
      headline: a.title,
      url: a.url,
      datePublished: a.date,
      publisher: { '@type': 'Organization', name: a.publisher }
    }))
  }
}

/** schema.org CreativeWork, for a bubble's Story page. */
export function storyJsonLd(b: Project | WorkNode) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: b.title,
    description: b.summary,
    url: abs(storyPath(b.slug)),
    creator: { '@id': abs('/#person') },
    keywords:
      'stack' in b && b.stack.length > 0 ? b.stack.join(', ') : undefined,
    sameAs: b.links.length > 0 ? b.links.map((l) => l.href) : undefined
  }
}
