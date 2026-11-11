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
import { discAccent } from '@/components/skills/disc'
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

const OPEN_MS = 460
const CLOSE_MS = 360
/**
 * A damped spring (about 4% overshoot) for the opening, so the panel lands with some weight and
 * settles instead of gliding to a stop. Sampled from a spring with damping 0.72.
 */
const SPRING =
  'linear(0, 0.0284, 0.1001, 0.198, 0.3089, 0.4228, 0.5328, 0.6342, 0.7241, 0.8014, 0.8656, 0.9174, 0.9578, 0.9881, 1.0097, 1.0243, 1.033, 1.0374, 1.0384, 1.037, 1.0341, 1.0303, 1.026, 1.0216, 1.0174, 1.0136, 1.0102, 1.0073, 1.0049, 1.0029, 1.0014, 1.0003, 0.9995, 0.999, 0.9987, 0.9986, 0.9985, 0.9986, 0.9987, 0.9989, 1)'
/**
 * A firmer spring for closing (damping 0.82, about 1% overshoot): the panel snaps back toward the
 * bubble and settles into the disc with only a hint of give. 0 → 1 over t in 0…1.
 */
function springBack(t: number) {
  if (t >= 1) return 1
  const z = 0.82
  const w = (2 * Math.PI) / 0.55
  const wd = w * Math.sqrt(1 - z * z)
  return (
    1 -
    Math.exp(-z * w * t) *
      (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t))
  )
}

/** One frame of the panel between its resting box (p = 0) and the disc (p = 1). */
function between(to: DOMRect, radius: number, disc: DOMRect, p: number) {
  const dx = disc.left + disc.width / 2 - (to.left + to.width / 2)
  const dy = disc.top + disc.height / 2 - (to.top + to.height / 2)
  // It lands on a circle a little wider than the disc, with the panel's own fill faded out by then,
  // so the copy's rim and ring are never cut and only the disc is left showing.
  const ix = ((to.width - disc.width) / 2 - RIM) * p
  const iy = ((to.height - disc.height) / 2 - RIM) * p
  const r = radius + (disc.width / 2 + RIM - radius) * p
  return {
    transform: `translate(${dx * p}px, ${dy * p}px)`,
    clipPath: `inset(${iy}px ${ix}px round ${r}px)`
  }
}
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

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

/** Room around the disc for its rim and lit ring, so the clip never shaves them (px). */
const RIM = 10

/**
 * The keyframes that take the panel from the disc's spot and size to its own resting box `to`:
 * it's moved so its center sits on the disc's, and clipped down to a circle the disc's size.
 */
function morph(to: DOMRect, radius: number, disc: DOMRect) {
  const dx = disc.left + disc.width / 2 - (to.left + to.width / 2)
  const dy = disc.top + disc.height / 2 - (to.top + to.height / 2)
  const ix = (to.width - disc.width) / 2
  const iy = (to.height - disc.height) / 2
  return [
    {
      transform: `translate(${dx}px, ${dy}px)`,
      clipPath: `inset(${iy}px ${ix}px round ${disc.width / 2}px)`
    },
    {
      transform: 'translate(0px, 0px)',
      clipPath: `inset(0px 0px round ${radius}px)`
    }
  ]
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
  const content = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const controls = useRef<HTMLDivElement>(null)
  const prevBtn = useRef<HTMLButtonElement>(null)
  const nextBtn = useRef<HTMLButtonElement>(null)
  const titleId = `story-${bubble.slug}-title`

  useBodyLock(true)
  useFocusTrap(panel, !closing)
  useSwipeToClose(panel, scrim, !closing, onRequestClose, scroller)

  // Once the write-up is scrolled the header shrinks to a slim bar. It grows back only at the
  // very top: the gap between the two marks keeps it from flickering as its own change in height
  // moves what's under it.
  // Once the panel has opened, the scrolling area gets a backdrop in the header's own colour
  // (story-under). Pulled down past the top, as a trackpad or a phone lets you, the write-up
  // leaves a gap under the header, and the gap shows whatever is behind: it has to be the same
  // wash, not the card. Held back while the panel opens or closes, when the write-up itself is
  // see-through for a moment.
  const [opened, setOpened] = useState(instant)
  useEffect(() => {
    if (opened) return
    const t = window.setTimeout(() => setOpened(true), OPEN_MS)
    return () => window.clearTimeout(t)
  }, [opened])
  const [compact, setCompact] = useState(false)
  const onScroll = useCallback(() => {
    const y = scroller.current?.scrollTop ?? 0
    setCompact((c) => (y > 32 ? true : y < 4 ? false : c))
  }, [])

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
          easing: SPRING
        }),
        // The bubble's drawing is gone almost at once; the panel is what you watch.
        bloom.current?.animate(
          { opacity: [1, 0] },
          { duration: 120, easing: 'ease-out', fill: 'forwards' }
        ),
        content.current?.animate(
          { opacity: [0, 1], transform: ['translateY(0.75rem)', 'none'] },
          { duration: 260, delay: 70, easing: EASE, fill: 'backwards' }
        )
      )
    // Measured from where things sit at rest, so a second run (React's dev double-mount) starts clean.
    return () => {
      anims.forEach((a) => a?.cancel())
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
    scrim.current?.animate(
      { opacity: [1, 0] },
      { duration: CLOSE_MS * 0.6, easing: 'ease-out', fill: 'forwards' }
    )
    let raf = 0
    let fallback = 0
    let done = false
    const finish = () => {
      if (done) return
      done = true
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
      hideDiscs(bubble.slug, false)
      onClosed()
    }
    if (found) {
      // From where the panel rests (an opening still under way is dropped).
      el.getAnimations().forEach((a) => a.cancel())
      // (On a short screen the panel itself scrolls: back to its top, where the copy is drawn.)
      el.scrollTop = 0
      const to = el.getBoundingClientRect()
      const radius = radiusOf(el)
      placeReplica(replica.current, found.el, found.rect)
      // The disc's colour and drawing come up fast, so it's the bubble that springs home.
      bloom.current?.animate(
        { opacity: [0, 1] },
        { duration: CLOSE_MS * 0.3, easing: 'ease-out', fill: 'forwards' }
      )
      // Driven frame by frame rather than as fixed keyframes: the disc keeps drifting (and leaning
      // toward the cursor) while hidden, so each frame aims at where it is now, and the panel ends
      // exactly on top of the real disc.
      // The text goes at once (the disc's colour is coming up over it anyway).
      content.current?.animate(
        { opacity: [1, 0] },
        { duration: CLOSE_MS * 0.25, fill: 'forwards' }
      )
      if (controls.current) controls.current.style.visibility = 'hidden'
      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / CLOSE_MS)
        Object.assign(
          el.style,
          between(to, radius, found.el.getBoundingClientRect(), springBack(t))
        )
        // Over the last stretch the panel's fill, border and the glow behind the copy fade away.
        const f = Math.min(1, Math.max(0, (t - 0.45) / 0.35))
        el.style.backgroundColor = `color-mix(in oklab, var(--card) ${100 - f * 100}%, transparent)`
        el.style.borderColor = 'transparent'
        el.style.boxShadow = f > 0 ? 'none' : ''
        if (bloomBg.current) bloomBg.current.style.opacity = String(1 - f)
        syncReplica(replica.current, found.el)
        if (t >= 1) finish()
        else raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    } else {
      const fade = el.animate(
        { opacity: [1, 0] },
        { duration: 180, easing: 'ease-in', fill: 'forwards' }
      )
      fade.onfinish = finish
    }
    // Never left stuck if frames stop coming (a background tab): it simply closes.
    fallback = window.setTimeout(finish, CLOSE_MS + 400)
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
          <span className="block text-[0.6875rem] leading-tight font-medium text-muted-foreground">
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
      onClick={(e) => e.target === e.currentTarget && onRequestClose()}
    >
      <div
        ref={scrim}
        aria-hidden
        onClick={onRequestClose}
        // Blurred only from `lg`, where the page shows around the card. Below that the panel
        // covers the whole screen, and a blur nobody can see would still be worked out.
        className="absolute inset-0 bg-[rgb(12_13_16/0.45)] lg:backdrop-blur-[2px]"
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
            : 'lg:h-[min(62rem,calc(100dvh-2rem))] lg:max-w-4xl lg:rounded-3xl lg:border-border'
        )}
        style={discAccent(bubble.slug)}
      >
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
            'min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring short:overflow-visible',
            opened && !closing && 'story-under'
          )}
        >
          <div ref={content} className="bg-card">
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
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center opacity-0"
        >
          <div ref={bloomBg} className="story-bloom absolute inset-0" />
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
          'in-development': 'In development',
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
    <header className="story-wash relative z-20 shrink-0 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 transition-[padding,box-shadow] duration-200 ease-out group-data-[compact]/panel:pt-[max(0.5rem,env(safe-area-inset-top))] group-data-[compact]/panel:pb-2 group-data-[compact]/panel:shadow-[0_1px_0_var(--border),0_10px_18px_-14px_rgb(12_13_16/0.5)] motion-reduce:transition-none sm:px-10">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 sm:gap-4">
        <span
          className="node-disc flex size-14 shrink-0 items-center justify-center rounded-full border-2 transition-[width,height] duration-200 ease-out group-data-[compact]/panel:size-10 motion-reduce:transition-none sm:size-[4.5rem] sm:group-data-[compact]/panel:size-10"
          style={discAccent(b.slug)}
        >
          <Illustration name={b.slug} decorative className="h-auto w-[60%]" />
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
      <div className="mx-auto w-full max-w-4xl space-y-12 px-5 pt-10 pb-12 sm:px-10">
        {story && story.sections.length > 0 ? (
          story.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="text-title">{s.heading}</h3>
              <div className="mt-4 space-y-4 text-[1.0625rem] leading-relaxed text-pretty text-foreground/90">
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
    <div className="story-wash px-5 pt-2 pb-8 sm:px-10">
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
          'story-wash flex justify-center rounded-xl px-6 py-8',
          item.frame === 'browser' && 'px-4 sm:px-8'
        )}
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
      className="story-wash relative"
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
