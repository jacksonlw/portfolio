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

/**
 * The core's size over its run: [share of the run, scale], from the keyframes of intro-core in
 * globals.css. Capped before the collapse, so the burst always plays.
 */
export const CORE_KEYS: readonly (readonly [number, number])[] = [
  [0, 0.12],
  [0.08, 0.16],
  [0.31, 0.55],
  [0.455, 1]
]

/**
 * Where in the core's intro animation (0–1 of its run) it reaches `size` (its scale), so the
 * intro can carry on from a core that grew while waiting.
 */
export function coreTimeAt(size: number) {
  if (size <= CORE_KEYS[0][1]) return 0
  for (let k = 1; k < CORE_KEYS.length; k++) {
    const [t0, s0] = CORE_KEYS[k - 1]
    const [t1, s1] = CORE_KEYS[k]
    if (size <= s1) return t0 + ((size - s0) / (s1 - s0)) * (t1 - t0)
  }
  return CORE_KEYS[CORE_KEYS.length - 1][0]
}

/** The longest the opening will wait for anything, from the moment the page was asked for (ms). */
export const INTRO_CAP = 2500

/** When the opening was started, and how far into it it began (both ms). */
export type IntroStart = { at: number; t: number }

declare global {
  interface Window {
    __intro?: IntroStart
  }
}

/**
 * Starts the opening. Inline in the page's <head> (app/layout.tsx), so it needs nothing from the
 * network and runs before any of the site's JavaScript has arrived: the supernova is CSS, and it
 * mustn't sit waiting on a script bundle.
 *
 * It waits only for what the opening shows, the photo and the fonts, and only until INTRO_CAP
 * after the page was asked for, whatever the network is doing. Usually both are there at once, so
 * it starts straight away. Then it puts .intro-go on <html> (which lets the held animations run:
 * globals.css, .intro-wait), carries every animation on from the size the core swelled to while
 * it waited, and leaves a note of when it started (window.__intro, and an intro-go event) for the
 * board to pick up once React is running (constellation.tsx).
 */
export const INTRO_START_SCRIPT = `(function(){try{var w=window,d=document,h=d.documentElement,K=${JSON.stringify(CORE_KEYS)},done=0;function at(s){if(s<=K[0][1])return 0;for(var k=1;k<K.length;k++){var a=K[k-1],b=K[k];if(s<=b[1])return a[0]+(s-a[1])/(b[1]-a[1])*(b[0]-a[0])}return K[K.length-1][0]}function go(){if(done)return;done=1;var t=0;try{var b=d.querySelector('.intro-wait');if(b){var c=b.querySelector('.intro-core'),s=c?parseFloat(getComputedStyle(c).scale)||0:0;t=Math.round(at(s)*(+b.getAttribute('data-intro-run')||0));h.classList.add('intro-go');if(t>0&&d.getAnimations){b.getBoundingClientRect();var A=d.getAnimations();for(var i=0;i<A.length;i++){var e=A[i].effect&&A[i].effect.target;if(A[i].animationName&&e&&(b.contains(e)||e.classList.contains('intro-chrome')))A[i].currentTime=t}}}}catch(_){}h.classList.add('intro-go');w.__intro={at:performance.now(),t:t};d.dispatchEvent(new Event('intro-go'))}function ready(){var n=1;function one(){if(--n<=0)go()}try{var m=d.querySelector('.intro-wait .portrait-photo');if(m&&!m.complete){n++;m.addEventListener('load',one);m.addEventListener('error',one)}}catch(_){}try{d.fonts.ready.then(one,one)}catch(_){one()}}if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',ready);else ready();setTimeout(go,Math.max(0,${INTRO_CAP}-performance.now()))}catch(_){}})()`
