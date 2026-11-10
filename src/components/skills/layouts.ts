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
    // About a quarter turn apart, each angled into a gap between the bubbles around you. Press,
    // below you, sits a little further out to clear your name.
    email: { r: 235, deg: 35 },
    press: { r: 229, deg: 110 },
    resume: { r: 194, deg: 185 },
    github: { r: 175, deg: 302 }
  },
  areas: {
    'AI & agents': [13, 24],
    'Product & frontend': [14, 72],
    'Backend & data': [86, 24],
    Cloud: [85, 73]
  },
  ring: 1,
  // Spread evenly around you, roughly every 45°, each at its own distance so it reads as a loose
  // scatter, not a ring. Balanced on you, and well clear of the screen's edges.
  bubbles: {
    waltz: { r: 319, deg: -100, size: 'lg' },
    cratest: { r: 363, deg: -52, size: 'lg' },
    oracle: { r: 310, deg: -5, size: 'lg' },
    tedx: { r: 370, deg: 44, size: 'sm' },
    careerfoundry: { r: 352, deg: 75, size: 'md' },
    koistream: { r: 350, deg: 128, size: 'md' },
    trailblaze: { r: 332, deg: 170, size: 'lg' },
    anyform: { r: 363, deg: -145, size: 'lg' }
  }
}

/** Projects left off the constellation (they stay in the content and the machine-readable views). */
export const OFF_BOARD = ['branch']
