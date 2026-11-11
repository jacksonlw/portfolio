/*
 * The constellation's opening animation. Tune it in INTRO below. Everything is
 * short on purpose: people come to read, so the whole thing is over in a little over a second, and
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
  /**
   * The extra delay for the farthest node; nearer ones leave sooner (ms). Kept small: everything
   * leaves the core nearly together, as the shockwave does, so the far stars aren't left trailing.
   */
  spread: number
  /** How much a node's start can differ from its neighbours' (ms, either way, scaled by chaos). */
  jitter: number
  /**
   * The stars' flight time as a share of a node's (ms): under 1, because they have the farthest
   * to go and would otherwise be the last things still moving.
   */
  stars: number
  /** How far each node starts toward the Me node: 1 = from its center, 0 = from its own spot. */
  burst: number
  /** The size each node starts at (1 = full size). */
  scale: number
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
   * start, spin and size. Every node still flies dead straight out from the centre.
   */
  chaos: number
  /** Sparks of debris thrown out from the core (how many; 0 = none). */
  debris: number
  /**
   * How far through its flight (0 to 1) a star is when the lines to it start to fade in. Stars
   * slow down hard, so at 0.6 one is within a few px of its spot.
   */
  lines: number
}

/** The opening animation the site uses: a supernova. */
export const INTRO: Intro = {
  buildup: 480,
  kick: 79,
  ms: 560,
  spread: 60,
  jitter: 80,
  stars: 0.78,
  burst: 1,
  scale: 0.1,
  flash: true,
  bloom: true,
  shockwave: true,
  shake: 9,
  chaos: 1,
  debris: 32,
  lines: 0.6
}
