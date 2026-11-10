import type { Satellite, Skill } from '@/content/profile'

/*
 * Where everything sits on the full-page constellation, as percentages of the board (satellites
 * in px from the photo). Chosen in the layout review: you in the middle of the screen, bubbles
 * scattered unevenly around you, skills in the four corners.
 */

export type BubbleSize = 'lg' | 'md' | 'sm'

export type Layout = {
  /** The Me node's photo center (% of the board). */
  me: [number, number]
  /**
   * The screen the distances below are measured on (px). On any other screen the whole layout
   * scales by one factor (the smaller of width/1440 and height/900, within limits), so it keeps its
   * shape: nothing drifts toward anything else when the screen is narrower or shorter.
   */
  reference: [number, number]
  /**
   * Each satellite's place around the photo: its distance (px) and its angle (degrees, 0 = right,
   * 90 = down).
   */
  satellites: Record<Satellite['kind'], { r: number; deg: number }>
  /** Each skill area's center. */
  areas: Record<Skill['area'], [number, number]>
  /** How far an area's stars spread from its center (1 = the usual spread). */
  ring: number
  /**
   * Each bubble's place around the photo, like the satellites: its distance (px, on the reference
   * screen), its angle (degrees, 0 = right, 90 = down) and its size. A bubble missing here is placed
   * on a spiral.
   */
  bubbles: Record<string, { r: number; deg: number; size: BubbleSize }>
}

export const LAYOUT: Layout = {
  // The photo sits a little above the middle so the photo, name and role together are centered.
  me: [50, 46],
  reference: [1440, 900],
  satellites: {
    // By importance: the resume and the press piece above you, LinkedIn, GitHub and email below, each
    // angled into a gap between the bubbles around you.
    // Deliberately uneven (no two at the same height or distance), so they read as orbiting.
    resume: { r: 185, deg: -152 },
    press: { r: 190, deg: -42 },
    github: { r: 215, deg: 158 },
    linkedin: { r: 215, deg: 100 },
    email: { r: 250, deg: 42 }
  },
  areas: {
    'AI & agents': [13, 24],
    'Product & frontend': [14, 72],
    'Backend & data': [86, 24],
    Cloud: [85, 73]
  },
  ring: 1,
  // By time: what I'm working on now across the top, then down the sides, with the oldest work
  // along the bottom. Each at its own distance so it reads as a loose scatter, not a ring.
  bubbles: {
    anyform: { r: 363, deg: -145, size: 'lg' },
    waltz: { r: 325, deg: -105, size: 'lg' },
    cratest: { r: 365, deg: -62, size: 'lg' },
    oracle: { r: 330, deg: -22, size: 'lg' },
    trailblaze: { r: 335, deg: 172, size: 'lg' },
    careerfoundry: { r: 330, deg: 12, size: 'md' },
    koistream: { r: 350, deg: 128, size: 'md' },
    branch: { r: 365, deg: 94, size: 'sm' },
    tedx: { r: 350, deg: 60, size: 'sm' }
  }
}

/** Projects left off the constellation (they stay in the content and the machine-readable views). */
export const OFF_BOARD: string[] = []
