import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { GalleryItem, Story, StoryBlock, StorySection } from './types'

/*
 * Every bubble's Story, read from src/content/stories/<slug>.md at build time.
 *
 * The file's frontmatter holds its gallery; the body is its beats, each under a `## ` heading, as
 * plain paragraphs separated by blank lines. A line that's only `![](#id)` pulls that gallery item
 * in among the paragraphs. Light **bold** markup works as it does everywhere else on the site.
 *
 * Grounding rule (as in profile.ts): every sentence comes from Jackson, his resume or the project's
 * own source. A bubble with no file yet opens to its recap alone.
 */

const DIR = path.join(process.cwd(), 'src/content/stories')

const MEDIA_LINE = /^!\[[^\]]*\]\(#([\w-]+)\)$/

function parseGallery(raw: unknown, slug: string): GalleryItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((g: Record<string, unknown>, i) => {
    const src = String(g.src ?? '')
    if (!g.id || !src || !g.caption)
      throw new Error(
        `stories/${slug}.md: gallery item ${i + 1} needs an id, a src and a caption`
      )
    const frame = (g.frame ?? 'plain') as GalleryItem['frame']
    if (!['phone', 'browser', 'plain'].includes(frame))
      throw new Error(
        `stories/${slug}.md: ${g.id}'s frame must be phone, browser or plain`
      )
    return {
      id: String(g.id),
      src,
      kind: /\.(mp4|webm)$/i.test(src) ? 'video' : 'image',
      poster: g.poster ? String(g.poster) : null,
      caption: String(g.caption),
      frame
    }
  })
}

function parseBody(body: string, gallery: GalleryItem[], slug: string) {
  const sections: StorySection[] = []
  for (const chunk of body.split(/^## /m).slice(1)) {
    const [heading, ...rest] = chunk.split('\n')
    const blocks: StoryBlock[] = rest
      .join('\n')
      .split(/\n\s*\n/)
      .map((p) => p.trim().replace(/\s*\n\s*/g, ' '))
      .filter(Boolean)
      .map((p) => {
        const media = p.match(MEDIA_LINE)
        if (!media) return { kind: 'text', text: p }
        if (!gallery.some((g) => g.id === media[1]))
          throw new Error(
            `stories/${slug}.md: ![](#${media[1]}) isn't in its gallery`
          )
        return { kind: 'media', id: media[1] }
      })
    sections.push({ heading: heading.trim(), blocks })
  }
  return sections
}

function load(slug: string): Story | null {
  const file = path.join(DIR, `${slug}.md`)
  if (!existsSync(file)) return null
  const text = readFileSync(file, 'utf8')
  const front = text.match(/^---\n([\s\S]*?)\n---\n?/)
  const meta = (front ? parse(front[1]) : {}) ?? {}
  const gallery = parseGallery(meta.gallery, slug)
  const body = front ? text.slice(front[0].length) : text
  return { gallery, sections: parseBody(body, gallery, slug) }
}

/** Every bubble's Story that has been written, by slug. */
export function loadStories(slugs: string[]): Record<string, Story> {
  const out: Record<string, Story> = {}
  for (const s of slugs) {
    const story = load(s)
    if (story) out[s] = story
  }
  return out
}
