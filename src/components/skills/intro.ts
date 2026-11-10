/*
 * The constellation's opening animation. Tune it in INTRO below. Everything is
 * short on purpose: people come to read, so the whole thing is over in about a second and a third, and
 * nothing waits on it (it's CSS only, and under reduced motion there's none at all).
 */

export type Intro = {
  /**
   * The build-up before anything blows (ms): the core swells and trembles, light gathers around it,
   * specks fall into it and the screen starts to rumble. Calm at first, tighter toward the end.
   */
  buildup: number
  /** The core collapsing before it blows: a beat where your photo shrinks before the blast (ms). */
  kick: number
  /** How long each node takes to arrive (ms). */
  ms: number
  /** The extra delay for the farthest node; nearer ones arrive sooner (ms). */
  spread: number
  /** How far each node starts toward the Me node: 1 = from its center, 0 = from its own spot. */
  burst: number
  /** The size each node starts at (1 = full size). */
  scale: number
  /** How far nodes overshoot their spot before settling back (0 = none, 1 = a lot). */
  overshoot: number
  /** A burst of light from the Me node as the nodes fly out. */
  flash: boolean
  /** A screen-wide bloom of light at the moment of the blast. */
  bloom: boolean
  /** A ring racing outward from the Me node until it's off the screen. */
  shockwave: boolean
  /** How hard the screen shakes at the blast (px; 0 = still). */
  shake: number
  /**
   * How differently each node behaves (0 = all in lockstep, 1 = full chaos): its own speed,
   * start, spin, curve, size and how hard it overshoots.
   */
  chaos: number
  /** Sparks of debris thrown out from the core (how many; 0 = none). */
  debris: number
  /** When the lines between stars fade in, after the blast (ms). */
  lines: number
}

/** The opening animation the site uses: a supernova. */
export const INTRO: Intro = {
  buildup: 525,
  kick: 79,
  ms: 420,
  spread: 123,
  burst: 1,
  scale: 0.1,
  overshoot: 1,
  flash: true,
  bloom: true,
  shockwave: true,
  shake: 9,
  chaos: 1,
  debris: 32,
  lines: 298
}
