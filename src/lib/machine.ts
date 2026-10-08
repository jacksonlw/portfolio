/*
 * Machine-readable views of src/content/profile.ts: Markdown for llms.txt and the per-page .md
 * routes, JSON for /profile.json, and schema.org JSON-LD for the HTML pages. They are derived from
 * the same content as the pages, so agents, the chatbot and people always read the same facts.
 */

import {
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROJECTS,
  SKILLS,
  WORK,
  formatDates,
  usedInTitle,
  type Project
} from '@/content/profile'

const abs = (path: string) => new URL(path, PROFILE.url).toString()

/** The About's light markup with its site links made absolute, for the Markdown views. */
const mdAbs = (text: string) =>
  text.replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${abs(path)})`)

export const projectPath = (slug: string) => `/projects/${slug}`

const STATUS_LABEL: Record<NonNullable<Project['status']>, string> = {
  live: 'Live',
  'in-development': 'In development',
  archived: 'Archived'
}

export const statusLabel = (s: Project['status']) =>
  s ? STATUS_LABEL[s] : null

/** One project as Markdown: the facts, then the story sections in order. */
export function projectMarkdown(p: Project, level = 1): string {
  const h = '#'.repeat(level)
  const lines = [`${h} ${p.title}`, '', p.summary, '']
  const facts = [
    p.role && `- Role: ${p.role}`,
    p.dates && `- Dates: ${formatDates(p.dates)}`,
    p.status && `- Status: ${statusLabel(p.status)}`,
    p.stack.length > 0 && `- Stack: ${p.stack.join(', ')}`,
    ...p.links.map((l) => `- ${l.label}: ${l.href}`),
    `- Page: ${abs(projectPath(p.slug))}`
  ].filter(Boolean)
  lines.push(...(facts as string[]), '')
  if (p.highlights.length > 0) {
    lines.push(`${h}# Highlights`, '', ...p.highlights.map((x) => `- ${x}`), '')
  }
  for (const s of p.story) {
    lines.push(
      `${h}# ${s.heading}`,
      '',
      ...s.paragraphs.flatMap((x) => [x, ''])
    )
  }
  return lines.join('\n').trimEnd() + '\n'
}

/** /llms.txt: the llmstxt.org shape. A title, a summary, then links to the detailed views. */
export function llmsTxt(): string {
  return [
    `# ${PROFILE.name}`,
    '',
    `> ${PROFILE.role} at Oracle, based in ${PROFILE.location}. ${mdAbs(PROFILE.about.lead[0])}`,
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
      (p) => `- [${p.title}](${abs(`${projectPath(p.slug)}.md`)}): ${p.summary}`
    ),
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
  for (const p of PROJECTS) out.push(projectMarkdown(p, 3))

  return out.join('\n').trimEnd() + '\n'
}

/** /profile.json: the content as-is, plus absolute URLs. Unwritten fields stay null. */
export function profileJson() {
  return {
    profile: { ...PROFILE, resume: abs(PROFILE.resume) },
    experience: EXPERIENCE,
    education: EDUCATION,
    skills: SKILLS,
    work: WORK,
    projects: PROJECTS.map((p) => ({
      ...p,
      url: abs(projectPath(p.slug)),
      markdown: abs(`${projectPath(p.slug)}.md`),
      image: p.image && abs(p.image)
    }))
  }
}

/** schema.org Person, for the home page. */
export function personJsonLd() {
  const current = EXPERIENCE.find((e) => e.dates.end === null)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': abs('/#person'),
    name: PROFILE.name,
    url: PROFILE.url,
    email: `mailto:${PROFILE.email}`,
    jobTitle: PROFILE.role,
    description: PROFILE.intro,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      addressCountry: 'US'
    },
    worksFor: current && { '@type': 'Organization', name: current.company },
    alumniOf: EDUCATION.map((e) => ({
      '@type': 'CollegeOrUniversity',
      name: e.school
    })),
    knowsAbout: SKILLS.map((s) => s.name),
    sameAs: PROFILE.links.map((l) => l.href)
  }
}

/** schema.org CreativeWork, for a project page. */
export function projectJsonLd(p: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary,
    url: abs(projectPath(p.slug)),
    creator: { '@id': abs('/#person') },
    keywords: p.stack.length > 0 ? p.stack.join(', ') : undefined,
    sameAs: p.links.map((l) => l.href)
  }
}
