'use client'

import {
  ArrowUpRightIcon,
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PauseIcon,
  PlayIcon,
  XIcon
} from '@phosphor-icons/react/ssr'
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react'
import { Illustration } from '@/components/illustrations/registry'
import { RichText } from '@/components/site/rich-text'
import {
  prefersReducedMotion,
  useBodyLock,
  useFocusTrap,
  useReducedMotion,
  useSwipeToClose
} from '@/components/site/overlay'
import { discAccent, surfaceSeed } from '@/components/skills/disc'
import {
  bubbleWhen,
  formatDates,
  type Project,
  type Skill,
  type WorkNode
} from '@/content/profile'
import type { GalleryItem, Story } from '@/content/types'
import { cn } from '@/lib/cn'

/*
 * A bubble's Story: the long write-up it opens into. The bubble's own disc grows out from where it
 * sits into the panel (a centered card from `lg`, the whole screen below that), and shrinks back
 * into it on close. The top recaps what hovering showed (what it is, when, the summary, links and
 * the skills behind it), then the gallery, then the beats, with pictures pulled in among the
 * paragraphs. Closes with its ✕, Escape, a click outside it, Back, or (on phones) a swipe down.
 *
 * Its header and footer stay put while the write-up scrolls between them. The header names the
 * Story (its disc, title and what it was) and holds the controls, and shrinks to a slim bar once
 * you scroll; the footer steps to the previous and next Story. From `lg` the card can be opened
 * up to fill the window.
 *
 * For the keyboard and screen readers it's a modal dialog: focus moves into it and stays there
 * (Tab goes round its controls; the page behind is inert, see Constellation), the write-up is a
 * stop of its own so the arrow keys can scroll it, and focus goes back to the bubble on close.
 * On a short screen (`short:`, a phone on its side or a window zoomed far in) the header and
 * footer stop being fixed and the whole panel scrolls as one, so they never crowd out the text.
 */

export type StoryBubble = (Project | WorkNode) & { kind: 'project' | 'work' }

const OPEN_MS = 340
const CLOSE_MS = 320
/** How much of the foot of the write-up the surface is cut away from, once the card covers it (px). */
const FOOT_STRIP = 200
/** How far the card comes up over that strip before the cut is made (px). */
const FOOT_LEAD = 240
/** How long after opening a click outside the panel is ignored (ms): a double-click's worth. */
const OUTSIDE_GRACE_MS = 400
/**
 * The one curve the panel moves on, both ways: a quick spring with a slight bounce (damping 0.76,
 * about 2.5% past its mark, then settled). 0 → 1 over t in 0…1; it's most of the way there by a
 * third of the run, so the morph reads as fast, and the rest is the settle.
 */
function spring(t: number) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const z = 0.76
  const w = (2 * Math.PI) / 0.7
  const wd = w * Math.sqrt(1 - z * z)
  return (
    1 -
    Math.exp(-z * w * t) *
      (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t))
  )
}
/**
 * One frame of the panel between its resting box (p = 0) and the disc (p = 1): moved so its
 * center sits on the disc's, and clipped toward a circle `rim` wider than the disc. No stretch,
 * no spin: a rounded box becoming a circle. Past either end (the spring's bounce) the shape holds
 * (the circle is never cut smaller than the disc) and only the give shows: opening, the card
 * swells a touch past its size; closing, the circle rides a few pixels past the bubble and back.
 */
function between(
  to: DOMRect,
  radius: number,
  disc: DOMRect,
  p: number,
  rim = 0
) {
  const dx = disc.left + disc.width / 2 - (to.left + to.width / 2)
  const dy = disc.top + disc.height / 2 - (to.top + to.height / 2)
  const shape = Math.min(1, Math.max(0, p))
  const ix = ((to.width - disc.width) / 2 - rim) * shape
  const iy = ((to.height - disc.height) / 2 - rim) * shape
  const r = radius + (disc.width / 2 + rim - radius) * shape
  const swell = 1 + Math.max(0, -p) * 0.6
  return {
    transform: `translate(${dx * p}px, ${dy * p}px) scale(${swell})`,
    clipPath: `inset(${iy}px ${ix}px round ${r}px)`
  }
}
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
/** How the bloom starts out: not in the page (showBloom brings it in for the morph). */
const BLOOM_OFF: CSSProperties = { display: 'none' }

/** Every copy of the bubble's disc (the board's, the column's, a sheet chip's). */
const discEls = (slug: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-disc="${CSS.escape(slug)}"]`)
]

/** The disc on screen right now, if it can be seen: the one the panel grows from and lands in. */
function visibleDisc(slug: string) {
  let best: { el: HTMLElement; rect: DOMRect } | null = null
  for (const el of discEls(slug)) {
    const r = el.getBoundingClientRect()
    const seen =
      r.width > 0 &&
      r.bottom > 0 &&
      r.right > 0 &&
      r.top < innerHeight &&
      r.left < innerWidth
    if (seen && (!best || r.width > best.rect.width)) best = { el, rect: r }
  }
  return best
}

/**
 * While its Story is open the bubble's disc is gone from the constellation: it has become the
 * panel. It comes back when the panel lands in it.
 */
const hideDiscs = (slug: string, hidden: boolean) =>
  discEls(slug).forEach((el) => (el.style.opacity = hidden ? '0' : ''))

/**
 * Puts an exact copy of the bubble's disc (its rim, glow, lit state and drawing, at its on-screen
 * size) at the middle of the panel. Clipped down to the disc's circle, the panel then *is* the
 * disc, so the hand-off to and from the real one is seamless.
 */
function placeReplica(
  slot: HTMLElement | null,
  disc: HTMLElement,
  rect: DOMRect
) {
  if (!slot) return
  const copy = disc.cloneNode(true) as HTMLElement
  copy.removeAttribute('data-disc')
  copy.removeAttribute('data-hit')
  copy.classList.remove('constellation-drift')
  copy.style.opacity = ''
  copy.style.transition = 'none'
  copy.style.flex = 'none'
  copy.style.position = 'relative'
  // What the disc takes from where it sits on the board: which way the light falls on it and how
  // far the board has shrunk it. Without these the copy is lit from the top left, and the light
  // jumps round the disc at the hand-off.
  const from = getComputedStyle(disc)
  for (const name of ['--lx', '--ly', '--node-k', '--text-k']) {
    const value = from.getPropertyValue(name)
    if (value) copy.style.setProperty(name, value)
  }
  // The board scales its nodes to the screen; match what's actually drawn.
  copy.style.scale = String(rect.width / (disc.offsetWidth || rect.width))
  slot.replaceChildren(copy)
}

/** Keeps the copy's lit ring in step with the real disc, so nothing changes at the hand-off. */
function syncReplica(slot: HTMLElement | null, disc: HTMLElement) {
  const copy = slot?.firstElementChild as HTMLElement | null | undefined
  if (!copy) return
  const cls = disc.className.replace(/\bconstellation-drift\b/, '')
  if (copy.className !== cls) copy.className = cls
  if (disc.hasAttribute('data-lit')) copy.setAttribute('data-lit', '')
  else copy.removeAttribute('data-lit')
}

/**
 * How far past the disc the clip opens once the panel has landed on it, to let the copy's shadow
 * and lit ring back in before the real disc takes over (px).
 */
const RIM = 28
const EASE_OUT = (x: number) => 1 - (1 - x) ** 3
/** How far into the close the panel has become the disc; the rest lets the shadow back in. */
const LANDED = 0.5

/**
 * The keyframes that take the panel from the disc's spot and size to its own resting box `to`:
 * a circle exactly the disc's size, opening out into the card. Sampled along the spring, so the
 * bounce is in them and they play with a linear easing.
 */
function morph(to: DOMRect, radius: number, disc: DOMRect) {
  const N = 40
  return Array.from({ length: N + 1 }, (_, i) =>
    between(to, radius, disc, 1 - spring(i / N))
  )
}

/**
 * The bloom (the disc's colour and its copy, over the whole panel) is only in the page while the
 * panel is growing or shrinking. The rest of the time it's display: none, not merely clear.
 */
function showBloom(el: HTMLElement | null) {
  if (el) el.style.display = 'flex'
  return el
}
const hideBloom = (el: HTMLElement | null) => {
  if (el) el.style.display = 'none'
}

const radiusOf = (el: HTMLElement) =>
  parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0

export function StoryPanel({
  bubble,
  story,
  skills,
  instant,
  stepped,
  full,
  onToggleFull,
  prev,
  next,
  onStep,
  closing,
  onRequestClose,
  onClosed
}: {
  bubble: StoryBubble
  story: Story | null
  /** The skills used in it, shown as chips in the recap. */
  skills: Skill[]
  /** Opened from a link, not a click: it's simply there, with no growing out of the bubble. */
  instant: boolean
  /** Reached with previous or next from another Story: which one, so focus stays on it. */
  stepped?: 'prev' | 'next'
  /** Filling the window (from `lg`) instead of sitting as a card. */
  full: boolean
  onToggleFull: () => void
  /** The Stories either side of this one, if any. */
  prev: StoryBubble | null
  next: StoryBubble | null
  onStep: (slug: string, dir: 'prev' | 'next') => void
  /** Set once something asks it to close: it plays its way out, then calls onClosed. */
  closing: boolean
  onRequestClose: () => void
  onClosed: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const bloom = useRef<HTMLDivElement>(null)
  const replica = useRef<HTMLDivElement>(null)
  const bloomBg = useRef<HTMLDivElement>(null)
  const surface = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const controls = useRef<HTMLDivElement>(null)
  const prevBtn = useRef<HTMLButtonElement>(null)
  const nextBtn = useRef<HTMLButtonElement>(null)
  const titleId = `story-${bubble.slug}-title`

  // A click outside the panel closes it, but not one that lands in the first moments: the second
  // click of a double-click on the bubble falls on the scrim the first one just put up, and
  // would otherwise shut the Story as it opens (a blink of scrim and panel, then nothing).
  const [openedAt] = useState(() =>
    typeof performance === 'undefined' ? 0 : performance.now()
  )
  const closeFromOutside = useCallback(() => {
    if (performance.now() - openedAt > OUTSIDE_GRACE_MS) onRequestClose()
  }, [openedAt, onRequestClose])

  useBodyLock(true)
  useFocusTrap(panel, !closing)
  useSwipeToClose(panel, scrim, !closing, onRequestClose, scroller)

  // Once the write-up is scrolled the header shrinks to a slim bar. It grows back only at the
  // very top: the gap between the two marks keeps it from flickering as its own change in height
  // moves what's under it.
  const [compact, setCompact] = useState(false)
  // The write-up's end can come up off the footer for a moment: pulled past its end where the
  // browser lets it bounce, or when the header shrinks under a scroll that's already at the end.
  // Nothing covers the surface in that gap, so along the foot of the write-up the surface is cut
  // away, leaving the panel's plain card colour there.
  //
  // It's only cut once the card has come well up over that strip, where nobody can see it happen,
  // and scrolling does no more than flip between the two (cut, whole). Where the strip is and
  // when to flip are measured when the layout changes, never during a scroll: a style written on
  // every scroll event has the browser paint and commit on every frame of the scroll, and the
  // tiles coming into view wait behind that work and show blank.
  const trim = useRef({ cut: '', from: Infinity, on: '' })
  const applyTrim = useCallback(() => {
    const t = trim.current
    const want = (scroller.current?.scrollTop ?? 0) > t.from ? t.cut : ''
    if (want === t.on || !surface.current) return
    t.on = want
    surface.current.style.clipPath = want
  }, [])
  const measureTrim = useCallback(() => {
    const el = panel.current
    const area = scroller.current
    const card = content.current?.querySelector('[data-card]')
    if (!el || !area || !card) return
    const top = el.getBoundingClientRect().top
    // Where the strip starts, and where the card sits with the write-up at its top.
    const strip = area.getBoundingClientRect().bottom - top - FOOT_STRIP
    const cardTop = card.getBoundingClientRect().top + area.scrollTop - top
    trim.current.cut = `inset(0 0 ${Math.max(0, Math.round(el.clientHeight - strip))}px 0)`
    trim.current.from = cardTop - strip + FOOT_LEAD
    applyTrim()
  }, [applyTrim])
  useLayoutEffect(() => {
    measureTrim()
    const ro = new ResizeObserver(measureTrim)
    for (const el of [
      panel.current,
      content.current,
      panel.current?.querySelector('header')
    ])
      if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [measureTrim])
  const onScroll = useCallback(() => {
    const y = scroller.current?.scrollTop ?? 0
    setCompact((c) => (y > 32 ? true : y < 4 ? false : c))
    applyTrim()
  }, [applyTrim])

  // Open: grow out of the bubble, the disc's colour giving way to the page as the text fades in.
  useLayoutEffect(() => {
    const el = panel.current
    if (!el) return
    // Stepped here from another Story: focus stays on the button that was pressed, if this
    // Story has one too.
    const first =
      (stepped === 'prev' && prevBtn.current) ||
      (stepped === 'next' && nextBtn.current) ||
      closeBtn.current
    first?.focus({ preventScroll: true })
    hideDiscs(bubble.slug, true)
    if (stepped) {
      // The new write-up eases in where the last one was.
      const fade = prefersReducedMotion()
        ? undefined
        : content.current?.animate(
            { opacity: [0, 1] },
            { duration: 180, easing: 'ease-out' }
          )
      return () => {
        fade?.cancel()
        hideDiscs(bubble.slug, false)
      }
    }
    if (instant) return
    const found = prefersReducedMotion() ? null : visibleDisc(bubble.slug)
    const disc = found?.rect
    if (found) placeReplica(replica.current, found.el, found.rect)
    let bloomFade: Animation | undefined
    const anims: (Animation | undefined)[] = [
      scrim.current?.animate(
        { opacity: [0, 1] },
        { duration: OPEN_MS * 0.6, easing: 'ease-out' }
      )
    ]
    if (!disc)
      anims.push(
        el.animate({ opacity: [0, 1] }, { duration: 200, easing: 'ease-out' })
      )
    else
      anims.push(
        el.animate(morph(el.getBoundingClientRect(), radiusOf(el), disc), {
          duration: OPEN_MS,
          easing: 'linear'
        }),
        // The bubble's drawing is gone almost at once; the panel is what you watch.
        (bloomFade = showBloom(bloom.current)?.animate(
          { opacity: [1, 0] },
          { duration: 100, easing: 'ease-out' }
        )),
        content.current?.animate(
          { opacity: [0, 1] },
          { duration: 200, delay: 70, easing: EASE, fill: 'backwards' }
        )
      )
    // Once it has faded, the bloom is taken out altogether (until the close): left in place at
    // no opacity it would still be two more panel-sized layers for the browser to carry.
    const bloomEl = bloom.current
    if (bloomFade) bloomFade.onfinish = () => hideBloom(bloomEl)
    // Measured from where things sit at rest, so a second run (React's dev double-mount) starts clean.
    return () => {
      anims.forEach((a) => a?.cancel())
      hideBloom(bloomEl)
      hideDiscs(bubble.slug, false)
    }
    // Only the first opening of this panel grows; a re-render never replays it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close: shrink back into the bubble (or fade, under reduced motion or with it off screen).
  useEffect(() => {
    if (!closing) return
    const el = panel.current
    if (!el) return onClosed()
    const found = prefersReducedMotion() ? null : visibleDisc(bubble.slug)
    // Everything leaves from where it is, not from where it would have been at rest. Closed
    // while it's still opening (a quick second click, Escape straight after), the panel is a
    // small circle near its bubble, the scrim half there and the text not yet in: starting the
    // way out from "fully open" would flash the whole Story up for a frame first.
    const opacityNow = (node: Element | null) =>
      node ? Number(getComputedStyle(node).opacity) : 1
    const opening = el
      .getAnimations()
      .find((a) => a.playState === 'running' && !(a instanceof CSSTransition))
    // How far toward the disc the panel still is (0 at rest, 1 the disc itself).
    const p0 = opening
      ? Math.min(
          1,
          Math.max(0, 1 - spring(Number(opening.currentTime ?? 0) / OPEN_MS))
        )
      : 0
    // The less there is left to shrink, the less time it takes.
    const ms = CLOSE_MS * Math.max(0.4, 1 - p0)
    scrim.current?.animate(
      { opacity: [opacityNow(scrim.current), 0] },
      { duration: ms * 0.6, easing: 'ease-out', fill: 'forwards' }
    )
    let raf = 0
    let fallback = 0
    let done = false
    const finish = () => {
      if (done) return
      done = true
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
      // The real disc is back and the panel gone in the same frame: React takes a moment to
      // remove it, and until then the copy would sit on top of the disc, doubling its glow.
      hideDiscs(bubble.slug, false)
      if (el.parentElement) el.parentElement.style.visibility = 'hidden'
      onClosed()
    }
    if (found) {
      const textNow = opacityNow(content.current)
      const bloomNow =
        bloom.current?.style.display === 'none' ? 0 : opacityNow(bloom.current)
      // The opening, if it's still under way, is dropped (the loop below carries on from where
      // it had got to, p0), and the panel is measured where it rests. Only the opening is
      // dropped, not a change of size still easing along (to or from filling the window):
      // cancelling that would jump the panel to the size it was heading for.
      for (const a of el.getAnimations())
        if (!(a instanceof CSSTransition)) a.cancel()
      // (On a short screen the panel itself scrolls: back to its top, where the copy is drawn.)
      el.scrollTop = 0
      const to = el.getBoundingClientRect()
      const radius = radiusOf(el)
      // Instead it stops at the size it has right now: the clip below is worked out against
      // this box, and a box still changing under it would land a circle that isn't the disc's.
      Object.assign(el.style, {
        transition: 'none',
        flex: 'none',
        width: `${to.width}px`,
        maxWidth: 'none',
        height: `${to.height}px`,
        borderRadius: `${radius}px`
      })
      placeReplica(replica.current, found.el, found.rect)
      // (If it was still fading out from the opening, that's dropped, and with it the hiding
      // that was to follow.)
      bloom.current?.getAnimations().forEach((a) => a.cancel())
      // The disc's colour and drawing come up fast, so it's the bubble that comes home.
      showBloom(bloom.current)?.animate(
        { opacity: [bloomNow, 1] },
        { duration: ms * 0.3, easing: 'ease-out', fill: 'forwards' }
      )
      // Driven frame by frame rather than as fixed keyframes: the disc keeps drifting (and leaning
      // toward the cursor) while hidden, so each frame aims at where it is now, and the panel ends
      // exactly on top of the real disc.
      // The text goes at once (the disc's colour is coming up over it anyway).
      content.current?.animate(
        { opacity: [textNow, 0] },
        { duration: ms * 0.25, fill: 'forwards' }
      )
      if (controls.current) controls.current.style.visibility = 'hidden'
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / ms))
        // First the panel becomes the disc: it stays solid the whole way down, ending as a circle
        // exactly the disc's size with the copy filling it, so there is never a ring of panel
        // round the bubble. Only then, with nothing of the panel left to see, is its fill dropped
        // and the clip eased open a little, letting the copy's shadow back in softly. By the time
        // the real disc takes over, the two look the same.
        const landed = t >= LANDED
        const rim = landed ? RIM * EASE_OUT((t - LANDED) / (1 - LANDED)) : 0
        Object.assign(
          el.style,
          between(
            to,
            radius,
            found.el.getBoundingClientRect(),
            p0 + (1 - p0) * spring(t),
            rim
          )
        )
        el.style.backgroundColor = landed ? 'transparent' : ''
        el.style.borderColor = 'transparent'
        el.style.boxShadow = 'none'
        if (bloomBg.current) bloomBg.current.style.opacity = landed ? '0' : ''
        if (surface.current) surface.current.style.opacity = landed ? '0' : ''
        syncReplica(replica.current, found.el)
        if (t >= 1) finish()
        else raf = requestAnimationFrame(step)
      }
      // The first step is taken here and now, not on the next frame: the opening was dropped
      // just above, and a frame drawn before the loop's first would show the panel at rest.
      step(start)
    } else {
      const fade = el.animate(
        { opacity: [opacityNow(el), 0] },
        { duration: 180, easing: 'ease-in', fill: 'forwards' }
      )
      fade.onfinish = finish
    }
    // Never left stuck if frames stop coming (a background tab): it simply closes.
    fallback = window.setTimeout(finish, ms + 400)
    return () => {
      done = true
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
    }
  }, [closing, bubble.slug, onClosed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onRequestClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onRequestClose])

  const stepper = (
    to: StoryBubble | null,
    dir: 'prev' | 'next',
    ref: React.RefObject<HTMLButtonElement | null>
  ) =>
    to ? (
      <button
        ref={ref}
        type="button"
        onClick={() => onStep(to.slug, dir)}
        className={cn(
          'flex min-w-0 items-center gap-2 rounded-full py-1.5 focus-ring transition-colors hover:bg-muted',
          dir === 'prev'
            ? 'pr-4 pl-2 text-left'
            : 'flex-row-reverse pr-2 pl-4 text-right'
        )}
      >
        {dir === 'prev' ? (
          <CaretLeftIcon
            weight="bold"
            className="size-4 shrink-0"
            aria-hidden
          />
        ) : (
          <CaretRightIcon
            weight="bold"
            className="size-4 shrink-0"
            aria-hidden
          />
        )}
        <span className="min-w-0">
          <span className="block text-xs leading-tight font-medium text-muted-foreground">
            {dir === 'prev' ? 'Previous' : 'Next'}
          </span>
          <span className="block truncate text-sm leading-tight font-semibold">
            {to.title}
          </span>
        </span>
      </button>
    ) : (
      <span />
    )

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 motion-reduce:transition-none lg:flex lg:items-center lg:justify-center lg:transition-[padding] lg:duration-300',
        full ? 'lg:p-0' : 'lg:p-4'
      )}
      onClick={(e) => e.target === e.currentTarget && closeFromOutside()}
    >
      <div
        ref={scrim}
        aria-hidden
        onClick={closeFromOutside}
        // Blurred only where the page shows around the card: from `lg`, and not while the Story
        // fills the window. Otherwise the panel covers the whole screen, and a blur nobody can
        // see would still be worked out on every frame.
        className={cn(
          'absolute inset-0 bg-[rgb(12_13_16/0.45)]',
          !full && 'lg:backdrop-blur-[2px]'
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-compact={compact || undefined}
        className={cn(
          'group/panel relative flex h-full w-full flex-col overflow-hidden bg-card text-card-foreground shadow-pop will-change-transform motion-reduce:transition-none lg:border lg:transition-[max-width,height,border-radius] lg:duration-300 short:block short:overflow-x-hidden short:overflow-y-auto short:overscroll-contain',
          // A little larger than the write-up alone needs: the header and footer are always there.
          full
            ? 'lg:h-[100dvh] lg:max-w-[100vw] lg:rounded-none lg:border-transparent'
            : 'lg:h-[min(62rem,calc(100dvh-2rem))] lg:max-w-4xl lg:rounded-[2rem] lg:border-border'
        )}
        style={discAccent(bubble.slug)}
      >
        {/* The grained gradient the bubble's disc wears, grown to the panel's size. It stays put:
            the header, the summary and the gallery all sit straight on this one layer, so they're
            always the same picture (scrolled, or pulled past the top), and the write-up's card
            scrolls up over it. */}
        <div
          ref={surface}
          aria-hidden
          className="story-surface pointer-events-none absolute inset-0 -z-10"
        />
        {/* The controls: fixed in the panel's corner, so they never move as the header shrinks. */}
        <div
          ref={controls}
          className="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-3 z-30 flex gap-1.5 short:sticky short:h-0 short:justify-end short:pr-3"
        >
          <button
            type="button"
            onClick={onToggleFull}
            // The name stays put and aria-pressed carries the state (not both changing at once).
            aria-label="Full screen"
            title={full ? 'Exit full screen' : 'Full screen'}
            aria-pressed={full}
            className="round-btn hidden size-10 items-center justify-center rounded-full bg-card/80 text-foreground focus-ring backdrop-blur hover:bg-muted lg:flex"
          >
            {full ? (
              <ArrowsInSimpleIcon
                weight="bold"
                className="size-4"
                aria-hidden
              />
            ) : (
              <ArrowsOutSimpleIcon
                weight="bold"
                className="size-4"
                aria-hidden
              />
            )}
          </button>
          <button
            ref={closeBtn}
            type="button"
            onClick={onRequestClose}
            aria-label="Close"
            title="Close"
            className="round-btn flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground focus-ring backdrop-blur hover:bg-muted"
          >
            <XIcon weight="bold" className="size-4" aria-hidden />
          </button>
        </div>

        <Heading bubble={bubble} titleId={titleId} />

        <div
          ref={scroller}
          onScroll={onScroll}
          // A stop for the keyboard, so the arrow keys, Page Up/Down and Space scroll the write-up
          // (the page behind is locked, and the controls above aren't inside what scrolls).
          tabIndex={0}
          role="region"
          aria-label={`${bubble.title}: the story`}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring short:overflow-visible'
          )}
        >
          {/* At least as tall as the area it scrolls in, with the card taking up the slack, so a
              short write-up's card runs down to the footer. */}
          <div ref={content} className="flex min-h-full flex-col">
            <Body
              bubble={bubble}
              story={story}
              skills={skills}
              // Clips wait for the panel to finish growing before they start.
              settleMs={instant ? 0 : OPEN_MS}
            />
          </div>
        </div>

        {(prev || next) && (
          <footer className="relative z-20 shrink-0 border-t border-border bg-card px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-8">
            <nav
              aria-label="Stories"
              className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3"
            >
              {stepper(prev, 'prev', prevBtn)}
              {stepper(next, 'next', nextBtn)}
            </nav>
          </footer>
        )}

        {/* The disc's colour and drawing, filling the panel as it grows, then fading away. */}
        <div
          ref={bloom}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40 items-center justify-center opacity-0"
          style={BLOOM_OFF}
        >
          <div ref={bloomBg} className="story-surface absolute inset-0" />
          {/* An exact copy of the bubble's disc goes here (placeReplica). */}
          <div ref={replica} className="contents" />
        </div>
      </div>
    </div>
  )
}

/** What a Story is, in a line: its kind, the role or tagline, when, and where it stands. */
function factsOf(b: StoryBubble) {
  const role = 'role' in b && b.role ? b.role : null
  const status =
    b.kind === 'project' && 'status' in b && b.status
      ? {
          live: 'Live',
          archived: 'Archived'
        }[b.status]
      : null
  return [
    b.kind === 'work' ? 'Work' : 'Project',
    role ?? b.tagline,
    b.dates ? formatDates(b.dates) : bubbleWhen(b),
    status
  ].filter(Boolean)
}

/**
 * The panel's header: the Story's disc, title and what it was. Full size at the top of the
 * write-up; once it's scrolled (data-compact on the panel) everything in it eases down to a slim
 * bar that stays over the text.
 */
const Heading = memo(function Heading({
  bubble: b,
  titleId
}: {
  bubble: StoryBubble
  titleId: string
}) {
  return (
    <header className="relative z-20 shrink-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 transition-[padding,box-shadow] duration-200 ease-out group-data-[compact]/panel:pt-[max(0.5rem,env(safe-area-inset-top))] group-data-[compact]/panel:pb-2 group-data-[compact]/panel:shadow-[0_1px_0_var(--border),0_10px_18px_-14px_rgb(12_13_16/0.5)] motion-reduce:transition-none sm:px-10">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 sm:gap-4">
        <span
          // The Story's own disc keeps its full chrome rim (globals.css, .node-disc[data-rim]).
          data-rim
          className="node-disc flex size-14 shrink-0 items-center justify-center rounded-full border-2 transition-[width,height] duration-200 ease-out group-data-[compact]/panel:size-10 motion-reduce:transition-none sm:size-[4.5rem] sm:group-data-[compact]/panel:size-10"
          style={discAccent(b.slug)}
        >
          <Illustration name={b.slug} decorative className="h-auto w-[76%]" />
        </span>
        {/* Room on the right for the controls in the panel's corner. */}
        <div className="min-w-0 flex-1 pr-12 lg:pr-24">
          <h2
            id={titleId}
            // Wraps at full size (a long title on a narrow or zoomed screen is never cut short);
            // one line only in the slim bar.
            className="text-[1.75rem] leading-tight font-semibold tracking-tight text-balance break-words transition-[font-size] duration-200 ease-out group-data-[compact]/panel:truncate group-data-[compact]/panel:text-lg motion-reduce:transition-none sm:text-[2.25rem] sm:group-data-[compact]/panel:text-lg"
          >
            {b.title}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-foreground/70 transition-[font-size] duration-200 ease-out group-data-[compact]/panel:mt-0 group-data-[compact]/panel:truncate group-data-[compact]/panel:text-xs motion-reduce:transition-none">
            {factsOf(b).join(' · ')}
          </p>
        </div>
      </div>
    </header>
  )
})

/**
 * Everything the panel scrolls: the recap, the gallery and the beats. Memoized, so the panel
 * starting to close doesn't render the whole write-up again on the first frame of its way out.
 */
const Body = memo(function Body({
  bubble,
  story,
  skills,
  settleMs
}: {
  bubble: StoryBubble
  story: Story | null
  skills: Skill[]
  /** How long the panel takes to open (ms): nothing plays until then. */
  settleMs: number
}) {
  const media = new Map(story?.gallery.map((g) => [g.id, g]))
  return (
    <>
      <Recap bubble={bubble} skills={skills} />
      {story && story.gallery.length > 0 && (
        <Gallery items={story.gallery} settleMs={settleMs} />
      )}
      {/* The card is a layer of its own, and a solid one (will-change, on plain bg-card). When
          the write-up is flung faster than the browser can draw it, the part not drawn yet is
          then filled with the card's colour, and the text simply arrives a moment late.
          Otherwise that part is see-through, and the coloured surface behind flashes up
          through the text. */}
      <div data-card className="flex-1 bg-card will-change-transform">
        <div className="mx-auto w-full max-w-4xl space-y-12 px-5 pt-10 pb-12 sm:px-10">
          {story && story.sections.length > 0 ? (
            story.sections.map((s) => (
              <section key={s.heading}>
                <h3 className="text-title">{s.heading}</h3>
                <div className="mt-4 space-y-4 text-[1.125rem] leading-relaxed text-pretty text-foreground/90">
                  {s.blocks.map((b, i) =>
                    b.kind === 'text' ? (
                      <p key={i}>
                        <RichText text={b.text} />
                      </p>
                    ) : media.get(b.id) ? (
                      <InlineMedia key={i} item={media.get(b.id)!} />
                    ) : null
                  )}
                </div>
              </section>
            ))
          ) : (
            <p className="text-muted-foreground">
              The full story is still being written.
            </p>
          )}
        </div>
      </div>
    </>
  )
})

/** The top of the write-up, under the header: the summary, its links and the skills behind it. */
function Recap({
  bubble: b,
  skills
}: {
  bubble: StoryBubble
  skills: Skill[]
}) {
  return (
    <div className="px-5 pt-2 pb-8 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-lg text-pretty text-foreground/90 sm:text-lede">
          {b.summary}
        </p>
        {b.links.length > 0 && (
          <ul role="list" className="mt-5 flex flex-wrap gap-2">
            {b.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground focus-ring transition-colors hover:bg-brand hover:text-brand-foreground"
                >
                  {l.label}
                  <ArrowUpRightIcon
                    weight="bold"
                    className="size-3.5"
                    aria-hidden
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {skills.length > 0 && (
          <>
            <p className="mt-6 text-xs font-medium text-foreground/70">
              Built with
            </p>
            <ul role="list" className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <li
                  key={s.name}
                  className="rounded-full border border-foreground/15 bg-card/60 px-3 py-1 text-sm font-medium"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- media ---------- */

/**
 * A clip: muted and looping, playing only while `playing`. Under reduced motion it waits for a
 * tap. Once it's going, a small button in its corner pauses it and starts it again: anything
 * that moves by itself for more than a few seconds needs a way to be stopped.
 */
function Clip({
  item,
  playing,
  className,
  style
}: {
  item: GalleryItem
  playing: boolean
  className?: string
  style?: CSSProperties
}) {
  const video = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [started, setStarted] = useState(false)
  const [stopped, setStopped] = useState(false)
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing && !stopped && (!reduce || started)) v.play().catch(() => {})
    else v.pause()
  }, [playing, reduce, started, stopped])
  // When the Story closes, the clip lets go of what it had loaded and its decoder straight away,
  // not whenever the browser next tidies up: open enough Stories in a row and those add up.
  useEffect(() => {
    const v = video.current
    return () => {
      // (Only once it has really left the page: in development React runs this once on a clip
      // that's staying, to check that effects clean up.)
      queueMicrotask(() => {
        if (!v || v.isConnected) return
        v.pause()
        v.removeAttribute('src')
        v.load()
      })
    }
  }, [])
  return (
    <span className="relative block w-fit max-w-full">
      <video
        ref={video}
        src={item.src}
        poster={item.poster ?? undefined}
        muted
        loop
        playsInline
        // With a poster to show, nothing of the clip is fetched until it first plays.
        preload={item.poster ? 'none' : 'metadata'}
        aria-label={item.caption}
        className={className}
        style={style}
      />
      {reduce && !started && (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label={`Play: ${item.caption}`}
          className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-background/85 text-foreground shadow-pop focus-ring"
        >
          <PlayIcon weight="fill" className="size-5" aria-hidden />
        </button>
      )}
      {(!reduce || started) && (
        <button
          type="button"
          onClick={() => setStopped((s) => !s)}
          aria-label={`${stopped ? 'Play' : 'Pause'}: ${item.caption}`}
          title={stopped ? 'Play' : 'Pause'}
          className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-background/85 text-foreground shadow-pop focus-ring"
        >
          {stopped ? (
            <PlayIcon weight="fill" className="size-3.5" aria-hidden />
          ) : (
            <PauseIcon weight="fill" className="size-3.5" aria-hidden />
          )}
        </button>
      )}
    </span>
  )
}

/** One gallery item at its own shape: in a phone's screen, a browser window, or as it is. */
function Framed({
  item,
  playing,
  fit
}: {
  item: GalleryItem
  playing: boolean
  /** In the gallery every slide fits inside its slide; inline, it's sized by width. */
  fit: 'height' | 'width'
}) {
  // In the gallery the picture is as large as fits its slide, whatever its shape, and its frame
  // hugs it. The slide is a size container (Gallery), so the limits are the slide's own width and
  // height less the frame's chrome: a wide screenshot on a phone is bounded by width, a phone
  // screenshot by height, and neither is stretched or letterboxed inside its frame.
  const chrome =
    item.frame === 'phone'
      ? ['10px', '10px']
      : item.frame === 'browser'
        ? ['2px', 'calc(1.5rem + 2px)']
        : ['0px', '0px']
  const sized = fit === 'height' ? 'block h-auto w-auto' : 'block h-auto w-full'
  const limits =
    fit === 'height'
      ? {
          maxWidth: `calc(100cqw - ${chrome[0]})`,
          maxHeight: `calc(100cqh - ${chrome[1]})`
        }
      : undefined
  const inner =
    item.kind === 'video' ? (
      <Clip item={item} playing={playing} className={sized} style={limits} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.src}
        alt={item.caption}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={sized}
        style={limits}
      />
    )
  if (item.frame === 'phone')
    return (
      <span
        className={cn(
          'block overflow-hidden rounded-[1.75rem] border-[5px] border-foreground/85 bg-foreground shadow-pop',
          fit === 'height' ? 'w-fit' : 'mx-auto w-full max-w-[13rem]'
        )}
      >
        {inner}
      </span>
    )
  if (item.frame === 'browser')
    return (
      <span
        className={cn(
          'flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-pop',
          fit === 'height' && 'w-fit'
        )}
      >
        <span
          aria-hidden
          className="flex h-6 shrink-0 items-center gap-1.5 bg-muted px-3"
        >
          <span className="size-2 rounded-full bg-foreground/20" />
          <span className="size-2 rounded-full bg-foreground/20" />
          <span className="size-2 rounded-full bg-foreground/20" />
        </span>
        <span className="block">{inner}</span>
      </span>
    )
  return inner
}

/** A gallery item pulled in among a beat's paragraphs, playing while it's on screen. */
function InlineMedia({ item }: { item: GalleryItem }) {
  const el = useRef<HTMLElement>(null)
  const seen = useInView(el)
  return (
    <figure ref={el} className="!mt-8 !mb-8">
      <div
        className={cn(
          'story-surface relative flex justify-center rounded-xl px-6 py-8',
          item.frame === 'browser' && 'px-4 sm:px-8'
        )}
        // Painted straight into the write-up as it scrolls (globals.css): no layers of its own.
        data-flat
        style={surfaceSeed(`picture:${item.id}`)}
      >
        <Framed item={item} playing={seen} fit="width" />
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {item.caption}
      </figcaption>
    </figure>
  )
}

function useInView(el: React.RefObject<Element | null>) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (!el.current) return
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), {
      threshold: 0.4
    })
    io.observe(el.current)
    return () => io.disconnect()
  }, [el])
  return seen
}

/**
 * The gallery: a slideshow of the Story's pictures and clips. It never moves on by itself: arrows,
 * a swipe, or ← and → move it, and a clip plays only while its slide is showing (and on screen).
 */
function Gallery({
  items,
  settleMs
}: {
  items: GalleryItem[]
  /** How long the panel takes to open (ms): the first clip starts once it has. */
  settleMs: number
}) {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  // Phone screenshots need the height. A gallery of only wide pictures is shorter on a narrow
  // screen, where they're bounded by width and a tall slide would be mostly empty.
  const tall = items.some((g) => g.frame === 'phone')
  // A clip plays only once the panel has opened (decoding video while it grows costs frames), and
  // only while the gallery is on screen, not while you're reading further down.
  const seen = useInView(track)
  const [settled, setSettled] = useState(settleMs === 0)
  useEffect(() => {
    if (settled) return
    const t = window.setTimeout(() => setSettled(true), settleMs)
    return () => window.clearTimeout(t)
  }, [settled, settleMs])

  const go = useCallback(
    (i: number) => {
      const t = track.current
      if (!t) return
      const n = Math.max(0, Math.min(items.length - 1, i))
      t.scrollTo({
        left: n * t.clientWidth,
        behavior: prefersReducedMotion() ? 'instant' : 'smooth'
      })
    },
    [items.length]
  )

  useEffect(() => {
    const t = track.current
    if (!t) return
    const onScroll = () => setIndex(Math.round(t.scrollLeft / t.clientWidth))
    t.addEventListener('scroll', onScroll, { passive: true })
    return () => t.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if ((e.target as Element).closest('input,textarea,[contenteditable]'))
        return
      e.preventDefault()
      go(index + (e.key === 'ArrowRight' ? 1 : -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  // An arrow disappears at its end of the gallery. If it was the one being pressed, focus moves
  // to the other arrow instead of being dropped.
  const prevArrow = useRef<HTMLButtonElement>(null)
  const nextArrow = useRef<HTMLButtonElement>(null)
  const pressed = useRef<-1 | 1 | 0>(0)
  useEffect(() => {
    const dir = pressed.current
    if (!dir) return
    const ended = dir < 0 ? index === 0 : index === items.length - 1
    if (!ended) return
    pressed.current = 0
    ;(dir < 0 ? nextArrow : prevArrow).current?.focus({ preventScroll: true })
  }, [index, items.length])

  const arrow = (dir: -1 | 1, label: string, icon: ReactNode) => (
    <button
      ref={dir < 0 ? prevArrow : nextArrow}
      type="button"
      onClick={() => {
        pressed.current = dir
        go(index + dir)
      }}
      onBlur={() => (pressed.current = 0)}
      aria-label={label}
      disabled={dir < 0 ? index === 0 : index === items.length - 1}
      className={cn(
        'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-pop focus-ring transition-opacity disabled:pointer-events-none disabled:opacity-0 sm:flex',
        dir < 0 ? 'left-3' : 'right-3'
      )}
    >
      {icon}
    </button>
  )

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Gallery"
      className="relative"
    >
      <div
        ref={track}
        data-swipe-x
        className={cn(
          'flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden',
          tall
            ? 'h-[min(30rem,62dvh)]'
            : 'h-[min(17rem,62dvh)] sm:h-[min(30rem,62dvh)]'
        )}
      >
        {items.map((g, i) => (
          <div
            key={g.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4 py-5 sm:px-14 sm:py-6"
          >
            <div className="[container-type:size] flex size-full items-center justify-center">
              <Framed
                item={g}
                playing={settled && seen && i === index}
                fit="height"
              />
            </div>
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          {arrow(
            -1,
            'Previous',
            <CaretLeftIcon weight="bold" className="size-4" aria-hidden />
          )}
          {arrow(
            1,
            'Next',
            <CaretRightIcon weight="bold" className="size-4" aria-hidden />
          )}
        </>
      )}
      <div className="flex flex-col gap-1 bg-card px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10">
        <p
          className="min-w-0 text-sm text-pretty text-muted-foreground"
          aria-live="polite"
        >
          {items[index]?.caption}
        </p>
        {items.length > 1 && (
          // Each dot sits in a 24px button: the dot is what you see, the button what you hit.
          <div className="-mx-2 flex shrink-0 flex-wrap sm:mx-0">
            {items.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${i + 1} of ${items.length}`}
                aria-current={i === index || undefined}
                className="flex h-6 min-w-6 items-center justify-center rounded-full px-0.5 focus-ring"
              >
                <span
                  className={cn(
                    // The clear border shows up as a real one in forced-colours mode, where
                    // background colours are dropped.
                    'h-2 rounded-full border border-transparent transition-[width,background-color] duration-300 motion-reduce:transition-none',
                    i === index
                      ? 'w-5 bg-foreground forced-colors:bg-[Highlight]'
                      : 'w-2 bg-foreground/50'
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
