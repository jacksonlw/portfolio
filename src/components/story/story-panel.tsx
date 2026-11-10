'use client'

import {
  ArrowUpRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
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
  const titleId = `story-${bubble.slug}-title`

  useBodyLock(true)
  useSwipeToClose(panel, scrim, !closing, onRequestClose, scroller)

  // Open: grow out of the bubble, the disc's colour giving way to the page as the text fades in.
  useLayoutEffect(() => {
    const el = panel.current
    if (!el) return
    closeBtn.current?.focus({ preventScroll: true })
    hideDiscs(bubble.slug, true)
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
      if (closeBtn.current) closeBtn.current.style.visibility = 'hidden'
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

  return (
    <div
      className="fixed inset-0 z-50 lg:flex lg:items-center lg:justify-center lg:p-6"
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
        className="relative flex h-full w-full flex-col overflow-hidden bg-card text-card-foreground shadow-pop will-change-transform lg:h-[min(56rem,calc(100dvh-3rem))] lg:max-w-3xl lg:rounded-3xl lg:border lg:border-border"
        style={discAccent(bubble.slug)}
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onRequestClose}
          aria-label="Close"
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20 flex size-10 items-center justify-center rounded-full bg-card/80 text-foreground focus-ring backdrop-blur transition-colors hover:bg-muted"
        >
          <XIcon weight="bold" className="size-4" aria-hidden />
        </button>

        <div
          ref={scroller}
          className="h-full overflow-y-auto overscroll-contain"
        >
          <div ref={content}>
            <Body
              bubble={bubble}
              story={story}
              skills={skills}
              titleId={titleId}
              // Clips wait for the panel to finish growing before they start.
              settleMs={instant ? 0 : OPEN_MS}
            />
          </div>
        </div>

        {/* The disc's colour and drawing, filling the panel as it grows, then fading away. */}
        <div
          ref={bloom}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0"
        >
          <div ref={bloomBg} className="story-bloom absolute inset-0" />
          {/* An exact copy of the bubble's disc goes here (placeReplica). */}
          <div ref={replica} className="contents" />
        </div>
      </div>
    </div>
  )
}

/**
 * Everything the panel scrolls: the recap, the gallery and the beats. Memoized, so the panel
 * starting to close doesn't render the whole write-up again on the first frame of its way out.
 */
const Body = memo(function Body({
  bubble,
  story,
  skills,
  titleId,
  settleMs
}: {
  bubble: StoryBubble
  story: Story | null
  skills: Skill[]
  titleId: string
  /** How long the panel takes to open (ms): nothing plays until then. */
  settleMs: number
}) {
  const media = new Map(story?.gallery.map((g) => [g.id, g]))
  return (
    <>
      <Recap bubble={bubble} skills={skills} titleId={titleId} />
      {story && story.gallery.length > 0 && (
        <Gallery items={story.gallery} settleMs={settleMs} />
      )}
      <div className="space-y-12 px-5 pt-10 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-10">
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

/** The top of a Story: what hovering showed, a little fuller. */
function Recap({
  bubble: b,
  skills,
  titleId
}: {
  bubble: StoryBubble
  skills: Skill[]
  titleId: string
}) {
  const role = 'role' in b && b.role ? b.role : null
  const status =
    b.kind === 'project' && 'status' in b && b.status
      ? {
          live: 'Live',
          'in-development': 'In development',
          archived: 'Archived'
        }[b.status]
      : null
  const facts = [
    b.kind === 'work' ? 'Work' : 'Project',
    role ?? b.tagline,
    b.dates ? formatDates(b.dates) : bubbleWhen(b),
    status
  ].filter(Boolean)
  return (
    <header className="story-wash px-5 pt-14 pb-8 sm:px-10 sm:pt-12">
      <div className="flex items-center gap-4">
        <span
          className="node-disc flex size-16 shrink-0 items-center justify-center rounded-full border-2 sm:size-20"
          style={discAccent(b.slug)}
        >
          <Illustration name={b.slug} decorative className="h-auto w-[60%]" />
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="text-title sm:text-headline">
            {b.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-foreground/70">
            {facts.join(' · ')}
          </p>
        </div>
      </div>
      <p className="mt-6 text-lg text-pretty text-foreground/90 sm:text-lede">
        {b.summary}
      </p>
      {b.links.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
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
              </a>
            </li>
          ))}
        </ul>
      )}
      {skills.length > 0 && (
        <>
          <p className="mt-6 text-xs font-medium text-foreground/60">
            Built with
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
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
    </header>
  )
}

/* ---------- media ---------- */

/** A clip: muted and looping, playing only while `playing`. Under reduced motion it waits for a tap. */
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
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing && (!reduce || started)) v.play().catch(() => {})
    else v.pause()
  }, [playing, reduce, started])
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

  const arrow = (dir: -1 | 1, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => go(index + dir)}
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
      <div className="flex items-center justify-between gap-4 bg-card px-5 py-3 sm:px-10">
        <p
          className="min-w-0 text-sm text-pretty text-muted-foreground"
          aria-live="polite"
        >
          {items[index]?.caption}
        </p>
        {items.length > 1 && (
          <div className="flex shrink-0 gap-1.5">
            {items.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${i + 1} of ${items.length}`}
                aria-current={i === index || undefined}
                className={cn(
                  'h-2 rounded-full focus-ring transition-[width,background-color] duration-300',
                  i === index ? 'w-5 bg-foreground' : 'w-2 bg-foreground/25'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
